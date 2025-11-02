import _ from 'lodash';
import { BY_PERIOD_KEYS, BY_SEASON_KEYS } from '../../schema/clock';
import { TimeChatMkAnchorsSchema, type TimeChatMkAnchors } from '../../schema/time-chat-mk-sync';
import { Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { applyCacheToStat, getCache } from '../../utils/cache';
import { Logger } from '../../utils/log';

const logger = new Logger();

interface SyncParams {
  stat: Stat;
  runtime: Runtime;
  mk: string | null | undefined;
}

/**
 * 在时间处理器之后同步聊天 MK 锚点。
 * 针对时间 flags 记录每个时间段起始消息的 MK。
 */
export function syncTimeChatMkAnchors({ stat, runtime, mk }: SyncParams): { stat: Stat; runtime: Runtime } {
  const funcName = 'syncTimeChatMkAnchors';

  if (!mk) {
    logger.debug(funcName, '缺少有效 mk，跳过同步。');
    return { stat, runtime };
  }

  const clock = runtime.clock;
  if (!clock) {
    logger.warn(funcName, 'runtime.clock 不存在，无法同步时间锚点。');
    return { stat, runtime };
  }

  const { flags } = clock;
  if (!flags) {
    logger.debug(funcName, 'runtime.clock.flags 不存在，跳过同步。');
    return { stat, runtime };
  }

  const cache = getCache(stat);
  const cacheSync = cache.timeChatMkSync ?? {};

  // 解析并克隆当前锚点，以确保格式合规。
  const currentAnchors: TimeChatMkAnchors = TimeChatMkAnchorsSchema.parse(cacheSync.anchors ?? {});
  const nextAnchors: TimeChatMkAnchors = _.cloneDeep(currentAnchors);

  let changed = false;

  const ensureAnchor = (key: keyof TimeChatMkAnchors) => {
    if (nextAnchors[key] == null) {
      nextAnchors[key] = mk;
      changed = true;
    }
  };

  const setAnchorWhenFlagged = (key: keyof TimeChatMkAnchors, flag: boolean) => {
    if (flag && nextAnchors[key] !== mk) {
      nextAnchors[key] = mk;
      changed = true;
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
      if (flags.byPeriod[key] && nextAnchors.period[key] !== mk) {
        nextAnchors.period[key] = mk;
        changed = true;
      }
    }
    const currentPeriodKey = BY_PERIOD_KEYS[clock.now?.periodIdx ?? -1];
    if (currentPeriodKey && nextAnchors.period[currentPeriodKey] == null) {
      nextAnchors.period[currentPeriodKey] = mk;
      changed = true;
    }
  }

  if (flags.bySeason) {
    nextAnchors.season = nextAnchors.season ?? {};
    for (const key of BY_SEASON_KEYS) {
      if (flags.bySeason[key] && nextAnchors.season[key] !== mk) {
        nextAnchors.season[key] = mk;
        changed = true;
      }
    }
    const currentSeasonKey = BY_SEASON_KEYS[clock.now?.seasonIdx ?? -1];
    if (currentSeasonKey && nextAnchors.season[currentSeasonKey] == null) {
      nextAnchors.season[currentSeasonKey] = mk;
      changed = true;
    }
  }

  clock.mkAnchors = nextAnchors;

  if (!changed) {
    logger.debug(funcName, '锚点未发生变化。');
    return { stat, runtime };
  }

  cache.timeChatMkSync = {
    ...cacheSync,
    anchors: nextAnchors,
  };
  applyCacheToStat(stat, cache);

  logger.debug(funcName, '已同步时间锚点。', nextAnchors);
  return { stat, runtime };
}
