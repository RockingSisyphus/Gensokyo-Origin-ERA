import _ from 'lodash';
import { BY_PERIOD_KEYS, BY_SEASON_KEYS, CLOCK_ROOT_FLAG_KEYS, type ClockRootFlagKey } from '../../schema/clock';
import { ChangeLogEntry } from '../../schema/change-log';
import { Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { TimeChatMkAnchorsSchema, type TimeChatMkAnchors } from '../../schema/time-chat-mk-sync';
import { applyCacheToStat, getCache } from '../../utils/cache';
import { createChangeLogEntry } from '../../utils/changeLog';
import { Logger } from '../../utils/log';

const logger = new Logger();

export interface SyncParams {
  stat: Stat;
  runtime: Runtime;
  mk: string | null | undefined;
}

export interface SyncResult {
  stat: Stat;
  runtime: Runtime;
  changeLog: ChangeLogEntry[];
}

/**
 * 在时间处理器之后同步聊天 MK 锚点。
 * 针对时间 flags 记录每个时间段起始消息的 MK。
 */
export function syncTimeChatMkAnchors({ stat, runtime, mk }: SyncParams): SyncResult {
  const funcName = 'syncTimeChatMkAnchors';

  const currentMk = mk;
  logger.debug(funcName, '开始同步流程', { mk: currentMk });

  if (!currentMk) {
    logger.debug(funcName, '缺少有效 mk，跳过同步。');
    return { stat, runtime, changeLog: [] };
  }

  const { clock } = runtime;
  if (!clock) {
    logger.warn(funcName, 'runtime.clock 不存在，无法同步时间锚点。');
    return { stat, runtime, changeLog: [] };
  }

  const { flags } = clock;
  if (!flags) {
    logger.debug(funcName, 'runtime.clock.flags 不存在，跳过同步。');
    return { stat, runtime, changeLog: [] };
  }

  logger.debug(funcName, '当前时间标志', { flags: _.cloneDeep(flags), now: _.cloneDeep(clock.now) });

  const cache = getCache(stat);
  const cacheSync = cache.timeChatMkSync ?? {};

  logger.debug(funcName, '读取缓存中的时间锚点', cacheSync);

  const currentAnchors: TimeChatMkAnchors = TimeChatMkAnchorsSchema.parse(cacheSync.anchors ?? {});
  const nextAnchors: TimeChatMkAnchors = _.cloneDeep(currentAnchors);

  const changeLog: ChangeLogEntry[] = [];

  let changed = false;

  const appendAnchorChange = (pathSuffix: string, previousValue: string | null | undefined, reason: string) => {
    changeLog.push(
      createChangeLogEntry(
        'time-chat-mk-sync',
        `cache.timeChatMkSync.anchors.${pathSuffix}`,
        previousValue ?? null,
        currentMk,
        reason,
      ),
    );
    changed = true;
  };

  type SimpleAnchorKey = ClockRootFlagKey;

  const ensureAnchor = (key: SimpleAnchorKey) => {
    if (nextAnchors[key] == null) {
      appendAnchorChange(key, currentAnchors[key], `backfill ${key} anchor with current MK`);
      nextAnchors[key] = currentMk;
      logger.debug(funcName, '锚点缺失，补齐默认值', { key, mk: currentMk });
    }
  };

  const setAnchorWhenFlagged = (key: SimpleAnchorKey, flag: boolean) => {
    if (flag && nextAnchors[key] !== currentMk) {
      appendAnchorChange(key, currentAnchors[key], `flag ${key} triggered anchor update`);
      nextAnchors[key] = currentMk;
      logger.debug(funcName, '检测到标志位 -> 更新锚点', { key, mk: currentMk });
    }
    ensureAnchor(key);
  };

  for (const key of CLOCK_ROOT_FLAG_KEYS) {
    setAnchorWhenFlagged(key, flags[key]);
  }

  if (flags.byPeriod) {
    const nextPeriodAnchors = (nextAnchors.period = nextAnchors.period ?? {});
    for (const key of BY_PERIOD_KEYS) {
      if (flags.byPeriod[key] && nextPeriodAnchors[key] !== currentMk) {
        appendAnchorChange(`period.${key}`, currentAnchors.period?.[key], `flag byPeriod.${key} triggered anchor update`);
        nextPeriodAnchors[key] = currentMk;
        logger.debug(funcName, '时段标志触发 -> 更新锚点', { periodKey: key, mk: currentMk });
      }
    }
    const currentPeriodKey = BY_PERIOD_KEYS[clock.now?.periodIdx ?? -1];
    if (currentPeriodKey && nextPeriodAnchors[currentPeriodKey] == null) {
      appendAnchorChange(
        `period.${currentPeriodKey}`,
        currentAnchors.period?.[currentPeriodKey],
        `backfill current period anchor ${currentPeriodKey} with current MK`,
      );
      nextPeriodAnchors[currentPeriodKey] = currentMk;
      logger.debug(funcName, '当前时段缺失锚点，补齐', { periodKey: currentPeriodKey, mk: currentMk });
    }
  }

  if (flags.bySeason) {
    const nextSeasonAnchors = (nextAnchors.season = nextAnchors.season ?? {});
    for (const key of BY_SEASON_KEYS) {
      if (flags.bySeason[key] && nextSeasonAnchors[key] !== currentMk) {
        appendAnchorChange(
          `season.${key}`,
          currentAnchors.season?.[key],
          `flag bySeason.${key} triggered anchor update`,
        );
        nextSeasonAnchors[key] = currentMk;
        logger.debug(funcName, '季节标志触发 -> 更新锚点', { seasonKey: key, mk: currentMk });
      }
    }
    const currentSeasonKey = BY_SEASON_KEYS[clock.now?.seasonIdx ?? -1];
    if (currentSeasonKey && nextSeasonAnchors[currentSeasonKey] == null) {
      appendAnchorChange(
        `season.${currentSeasonKey}`,
        currentAnchors.season?.[currentSeasonKey],
        `backfill current season anchor ${currentSeasonKey} with current MK`,
      );
      nextSeasonAnchors[currentSeasonKey] = currentMk;
      logger.debug(funcName, '当前季节缺失锚点，补齐', { seasonKey: currentSeasonKey, mk: currentMk });
    }
  }

  clock.previousMkAnchors = _.cloneDeep(currentAnchors);
  clock.mkAnchors = nextAnchors;

  if (!changed) {
    logger.debug(funcName, '锚点未发生变化。', { previousAnchors: currentAnchors });
    return { stat, runtime, changeLog };
  }

  cache.timeChatMkSync = {
    ...cacheSync,
    anchors: nextAnchors,
  };
  applyCacheToStat(stat, cache);

  logger.debug(funcName, '已同步时间锚点。', { previousAnchors: currentAnchors, nextAnchors });
  return { stat, runtime, changeLog };
}
