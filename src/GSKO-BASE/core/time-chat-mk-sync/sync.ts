import _ from 'lodash';
import { BY_PERIOD_KEYS, BY_SEASON_KEYS } from '../../schema/clock';
import { Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { TimeChatMkAnchorsSchema, type TimeChatMkAnchors } from '../../schema/time-chat-mk-sync';
import { applyCacheToStat, getCache } from '../../utils/cache';
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
    return { stat, runtime };
  }

  const { clock } = runtime;
  if (!clock) {
    logger.warn(funcName, 'runtime.clock 不存在，无法同步时间锚点。');
    return { stat, runtime };
  }

  const { flags } = clock;
  if (!flags) {
    logger.debug(funcName, 'runtime.clock.flags 不存在，跳过同步。');
    return { stat, runtime };
  }

  logger.debug(funcName, '当前时间标志', { flags: _.cloneDeep(flags), now: _.cloneDeep(clock.now) });

  const cache = getCache(stat);
  const cacheSync = cache.timeChatMkSync ?? {};

  logger.debug(funcName, '读取缓存中的时间锚点', cacheSync);

  const currentAnchors: TimeChatMkAnchors = TimeChatMkAnchorsSchema.parse(cacheSync.anchors ?? {});
  const nextAnchors: TimeChatMkAnchors = _.cloneDeep(currentAnchors);

  let changed = false;

  const ensureAnchor = (key: keyof TimeChatMkAnchors) => {
    if (nextAnchors[key] == null) {
      nextAnchors[key] = currentMk;
      changed = true;
      logger.debug(funcName, '锚点缺失，补齐默认值', { key, mk: currentMk });
    }
  };

  const setAnchorWhenFlagged = (key: keyof TimeChatMkAnchors, flag: boolean) => {
    if (flag && nextAnchors[key] !== currentMk) {
      nextAnchors[key] = currentMk;
      changed = true;
      logger.debug(funcName, '检测到标志位 -> 更新锚点', { key, mk: currentMk });
    }
    ensureAnchor(key);
  };

  setAnchorWhenFlagged('newPeriod', flags.newPeriod);
  setAnchorWhenFlagged('newDay', flags.newDay);
  setAnchorWhenFlagged('newWeek', flags.newWeek);
  setAnchorWhenFlagged('newMonth', flags.newMonth);
  setAnchorWhenFlagged('newSeason', flags.newSeason);
  setAnchorWhenFlagged('newYear', flags.newYear);

  if (flags.byPeriod) {
    nextAnchors.period = nextAnchors.period ?? {};
    for (const key of BY_PERIOD_KEYS) {
      if (flags.byPeriod[key] && nextAnchors.period[key] !== currentMk) {
        nextAnchors.period[key] = currentMk;
        changed = true;
        logger.debug(funcName, '时段标志触发 -> 更新锚点', { periodKey: key, mk: currentMk });
      }
    }
    const currentPeriodKey = BY_PERIOD_KEYS[clock.now?.periodIdx ?? -1];
    if (currentPeriodKey && nextAnchors.period[currentPeriodKey] == null) {
      nextAnchors.period[currentPeriodKey] = currentMk;
      changed = true;
      logger.debug(funcName, '当前时段缺失锚点，补齐', { periodKey: currentPeriodKey, mk: currentMk });
    }
  }

  if (flags.bySeason) {
    nextAnchors.season = nextAnchors.season ?? {};
    for (const key of BY_SEASON_KEYS) {
      if (flags.bySeason[key] && nextAnchors.season[key] !== currentMk) {
        nextAnchors.season[key] = currentMk;
        changed = true;
        logger.debug(funcName, '季节标志触发 -> 更新锚点', { seasonKey: key, mk: currentMk });
      }
    }
    const currentSeasonKey = BY_SEASON_KEYS[clock.now?.seasonIdx ?? -1];
    if (currentSeasonKey && nextAnchors.season[currentSeasonKey] == null) {
      nextAnchors.season[currentSeasonKey] = currentMk;
      changed = true;
      logger.debug(funcName, '当前季节缺失锚点，补齐', { seasonKey: currentSeasonKey, mk: currentMk });
    }
  }

  clock.previousMkAnchors = _.cloneDeep(currentAnchors);
  clock.mkAnchors = nextAnchors;

  if (!changed) {
    logger.debug(funcName, '锚点未发生变化。', { previousAnchors: currentAnchors });
    return { stat, runtime };
  }

  cache.timeChatMkSync = {
    ...cacheSync,
    anchors: nextAnchors,
  };
  applyCacheToStat(stat, cache);

  logger.debug(funcName, '已同步时间锚点。', { previousAnchors: currentAnchors, nextAnchors });
  return { stat, runtime };
}

