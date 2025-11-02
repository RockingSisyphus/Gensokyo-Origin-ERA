import { BY_PERIOD_KEYS, BY_SEASON_KEYS, CLOCK_ROOT_FLAG_KEYS, type ClockRootFlagKey } from '../../schema/clock';
import { type TimeFlagHistoryLimits } from '../../schema/config';
import { Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { TimeChatMkAnchors } from '../../schema/time-chat-mk-sync';
import { Logger } from '../../utils/log';

const logger = new Logger();

/**
 * 将外部传入的上下文整理成统一的参数类型，方便在函数内部使用。
 * runtime/stat 用于读取和写入运行态数据，selectedMks/mk 则用于计算历史消息的跨度。
 */
interface ClampParams {
  runtime: Runtime;
  stat: Stat;
  selectedMks: (string | null)[];
  mk: string | null | undefined;
}

/**
 * 将配置里的限制值转换为整数，并保证不会出现负数。
 * 配置可能来自外部 JSON，需要做一次兜底校验，避免出现 NaN 等异常值。
 */
const toNumberLimit = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  const normalized = Math.max(0, Math.floor(value));
  return normalized;
};

/**
 * 将 selectedMks 过滤成有效的字符串数组，剔除 null 或空串。
 * 之后所有的索引计算都依赖这个列表，因此需要保证其内容合法。
 */
const collectMkList = (selectedMks: (string | null)[]): string[] =>
  selectedMks.filter((value): value is string => typeof value === 'string' && value.length > 0);

/**
 * 从 flagHistoryLimits 中读取指定 flag 的限制值。
 * 若配置缺失，则返回 null，表示无需限制，后续逻辑会使用历史锚点兜底。
 */
const resolveLimit = (limits: TimeFlagHistoryLimits | undefined, key: ClockRootFlagKey): number | null => {
  if (!limits) {
    return null;
  }
  return toNumberLimit(limits[key]);
};

/**
 * clampTimeChatMkAnchors
 * ---------------------
 * 该函数负责在同步锚点后“收紧”历史跨度，避免读取超出限制的消息数量。
 * 核心流程：
 *   1. 校验 runtime/stat 中是否存在时间数据、运行时配置、限额。
 *   2. 解析 selectedMks，定位当前 MK 在历史链上的位置。
 *   3. 针对所有触发的时间 flag，比较“历史锚点”与“当前 mk”的距离。
 *   4. 若距离超限，则回退到限制值允许的最远消息；若无历史锚点，则根据限制兜底。
 *   5. 将所有调整后的锚点写回 runtime，仅影响运行态，不触碰缓存。
 */
export function clampTimeChatMkAnchors({ runtime, stat, selectedMks, mk }: ClampParams): Runtime {
  const funcName = 'clampTimeChatMkAnchors';

  // 1. 运行态必须已经有 clock，否则无法进行任何判断。
  const { clock } = runtime;
  if (!clock) {
    logger.debug(funcName, 'runtime.clock 不存在，跳过锚点限制。');
    return runtime;
  }

  // flags 表示本次时间推进时触发的状态，mkAnchors 为同步后的锚点数据。
  const { flags, mkAnchors } = clock;
  if (!flags || !mkAnchors) {
    logger.debug(funcName, '缺少 clock.flags 或 mkAnchors，跳过锚点限制。', {
      hasFlags: Boolean(flags),
      hasAnchors: Boolean(mkAnchors),
    });
    return runtime;
  }

  // 2. 读取 stat.config.time.flagHistoryLimits，若未配置则无需进一步处理。
  const { config } = stat;
  const timeConfig = config?.time;
  const limits = timeConfig?.flagHistoryLimits;
  if (!limits || Object.keys(limits).length === 0) {
    logger.debug(funcName, '配置中未定义 flagHistoryLimits，跳过锚点限制。');
    return runtime;
  }
  logger.debug(funcName, '已加载 flagHistoryLimits 配置。', {
    limits,
  });

  // 3. 将 selectedMks 归一化，并确认当前 mk 在其中的位置。
  const mkList = collectMkList(selectedMks);
  if (mkList.length === 0) {
    logger.debug(funcName, 'selectedMks 为空或没有有效 MK，跳过锚点限制。');
    return runtime;
  }
  logger.debug(funcName, '已解析有效 selectedMks。', {
    mkList,
  });

  // 如果调用者没有传当前 mk，则默认使用 selectedMks 的最后一个，代表最新消息。
  const initialMk = typeof mk === 'string' && mk.length > 0 ? mk : mkList[mkList.length - 1];
  let currentIndex = mkList.lastIndexOf(initialMk);
  if (currentIndex < 0) {
    // 如果当前 mk 不在 selectedMks 中，说明 selectedMks 未更新到最新消息，兜底使用最后一条。
    currentIndex = mkList.length - 1;
    logger.debug(funcName, '当前 MK 不在 selectedMks 中，使用最新一条作为当前索引。', {
      originalMk: initialMk,
      resolvedMk: mkList[currentIndex],
    });
  }
  const currentMk = mkList[currentIndex];

  // currentAnchors 是同步后的锚点；previousAnchors 则是同步前的历史锚点。
  // 如果本次同步产生了变化，我们期望以 previousAnchors 作为“历史参照”。
  const anchors = mkAnchors as TimeChatMkAnchors;
  const previousAnchors = (clock.previousMkAnchors as TimeChatMkAnchors | undefined) ?? {};
  let changed = false;

  /**
   * 核心收紧逻辑：
   * - baseAnchorGetter：获取历史锚点（优先 previous，再兜底 current）。
   * - currentAnchorGetter：获取当前写回的锚点值，便于对比与更新。
   * - limit：配置中的最大跨度，单位是“消息数量”（即 selectedMks 的索引差）。
   * - flagActive：本次是否触发对应 flag，未触发则无需处理。
   */
  const clampAnchor = (options: {
    baseAnchorGetter: () => string | null | undefined;
    currentAnchorGetter: () => string | null | undefined;
    anchorSetter: (value: string | null) => void;
    limit: number | null;
    flagActive: boolean;
    logKey: string;
  }) => {
    const { baseAnchorGetter, currentAnchorGetter, anchorSetter, limit, flagActive, logKey } = options;

    if (!flagActive) {
      // flag 未触发时无需理会，表示这次时间推进与该锚点无关。
      logger.debug(funcName, '标志未激活，跳过限制。', { logKey });
      return;
    }

    // baseAnchor：历史锚点；currentAnchor：同步后的锚点（可能已更新为当前 MK）。
    const baseAnchor = baseAnchorGetter() ?? null;
    const currentAnchor = currentAnchorGetter() ?? null;

    // 封装一个统一的写入函数，方便带上调试信息。
    const applyAnchor = (value: string | null, reason: string) => {
      if (currentAnchor !== value) {
        anchorSetter(value);
        changed = true;
        logger.debug(funcName, reason, {
          logKey,
          value,
          previous: currentAnchor,
        });
      }
    };

    // 若配置中未给出限制，说明只需要沿用历史锚点，保证一致性即可。
    if (limit == null) {
      if (baseAnchor && baseAnchor !== currentAnchor) {
        applyAnchor(baseAnchor, '未配置限制，恢复历史锚点。');
      } else {
        logger.debug(funcName, '未找到对应的限制值，跳过限制。', { logKey });
      }
      return;
    }

    // 计算历史锚点距离当前消息的跨度（索引差），正数越大表示越久远。
    const anchorIndex = baseAnchor ? mkList.lastIndexOf(baseAnchor) : -1;
    const distance = anchorIndex >= 0 ? currentIndex - anchorIndex : Number.POSITIVE_INFINITY;

    // 若历史锚点存在且距离未超出限制，则直接回写历史锚点，避免误判。
    if (baseAnchor && anchorIndex >= 0 && distance <= limit) {
      if (baseAnchor !== currentAnchor) {
        applyAnchor(baseAnchor, '锚点距离在限制范围内，恢复历史锚点。');
      } else {
        logger.debug(funcName, '锚点距离在限制范围内，无需调整。', {
          logKey,
          limit,
          anchorMk: baseAnchor,
          anchorIndex,
          currentMk,
          currentIndex,
          distance,
        });
      }
      return;
    }

    // 否则根据限制值回溯，取“当前索引 - 限制”位置的 MK 作为新的历史锚点。
    const targetIndex = Math.max(currentIndex - limit, 0);
    const targetMk = mkList[targetIndex] ?? mkList[0] ?? null;

    if (!targetMk) {
      // 极端场景：selectedMks 被截断到 0 条，此时只能放弃调整。
      logger.warn(funcName, '无法找到目标 MK，保持原始锚点。', { logKey, limit, targetIndex, baseAnchor });
      return;
    }

    applyAnchor(
      targetMk,
      baseAnchor && anchorIndex >= 0 ? '锚点根据限制被重新定位。' : '历史锚点缺失，根据限制选择兜底锚点。'
    );

    logger.debug(funcName, '锚点限制调整详情', {
      logKey,
      limit,
      baseAnchor,
      anchorIndex,
      targetMk,
      targetIndex,
      currentMk,
      currentIndex,
      originalDistance: distance,
    });
  };

  // 4. 对六个根节点 flag（newDay/newWeek 等）执行限制判断。
  for (const key of CLOCK_ROOT_FLAG_KEYS) {
    clampAnchor({
      baseAnchorGetter: () => previousAnchors[key] ?? anchors[key],
      currentAnchorGetter: () => anchors[key],
      anchorSetter: value => {
        if (anchors[key] !== value) {
          anchors[key] = value;
        }
      },
      limit: resolveLimit(limits, key),
      flagActive: flags[key],
      logKey: key,
    });
  }

  // 5. 针对时段（period.*）和季节（season.*）的细分 flag 同样进行限制。
  if (flags.byPeriod) {
    anchors.period = anchors.period ?? {};
    const periodLimits = limits.period;
    for (const key of BY_PERIOD_KEYS) {
      const limit = periodLimits ? toNumberLimit(periodLimits[key]) : null;
      clampAnchor({
        baseAnchorGetter: () => previousAnchors.period?.[key] ?? anchors.period?.[key],
        currentAnchorGetter: () => anchors.period?.[key],
        anchorSetter: value => {
          anchors.period = anchors.period ?? {};
          if (anchors.period[key] !== value) {
            anchors.period[key] = value;
          }
        },
        limit,
        flagActive: Boolean(flags.byPeriod[key]),
        logKey: `period.${key}`,
      });
    }
  }

  if (flags.bySeason) {
    anchors.season = anchors.season ?? {};
    const seasonLimits = limits.season;
    for (const key of BY_SEASON_KEYS) {
      const limit = seasonLimits ? toNumberLimit(seasonLimits[key]) : null;
      clampAnchor({
        baseAnchorGetter: () => previousAnchors.season?.[key] ?? anchors.season?.[key],
        currentAnchorGetter: () => anchors.season?.[key],
        anchorSetter: value => {
          anchors.season = anchors.season ?? {};
          if (anchors.season[key] !== value) {
            anchors.season[key] = value;
          }
        },
        limit,
        flagActive: Boolean(flags.bySeason[key]),
        logKey: `season.${key}`,
      });
    }
  }

  // 6. 统一在最后输出一次日志，说明本轮是否实际修改了任何锚点。
  if (changed) {
    logger.debug(funcName, '时间锚点限制已应用。');
  } else {
    logger.debug(funcName, '时间锚点限制未造成变动。');
  }

  return runtime;
}
