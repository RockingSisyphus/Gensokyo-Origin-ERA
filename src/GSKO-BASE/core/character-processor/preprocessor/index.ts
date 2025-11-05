import _ from 'lodash';
import { Cache } from '../../../schema/cache';
import { ChangeLogEntry } from '../../../schema/change-log';
import { TimeUnit } from '../../../schema/character-settings';
import { ClockFlags } from '../../../schema/clock';
import { Runtime } from '../../../schema/runtime';
import { Stat } from '../../../schema/stat';
import { Logger } from '../../../utils/log';
import {
  getChar,
  getCharAffectionStages,
  getChars,
  isVisitCooling,
  setAffectionStageInRuntime,
  setVisitCooling,
} from '../accessors';
import { getAffectionStage } from '../utils';

const logger = new Logger();

/**
 * 检查给定的冷却单位是否在当前时间拍点被触发。
 */
function isCooldownResetTriggered(coolUnit: TimeUnit | undefined, flags: ClockFlags | undefined): boolean {
  if (!coolUnit || !flags) return false;
  switch (coolUnit) {
    case 'period':
      return flags.newPeriod === true || Object.values(flags.byPeriod || {}).some(v => v === true);
    case 'day':
      return flags.newDay === true;
    case 'week':
      return flags.newWeek === true;
    case 'month':
      return flags.newMonth === true;
    case 'season':
      return flags.newSeason === true;
    case 'year':
      return flags.newYear === true;
    default:
      return false;
  }
}

/**
 * 预处理模块，负责解析好感度等级和重置来访冷却。
 */
export function preprocess({ runtime, stat, cache }: { runtime: Runtime; stat: Stat; cache: Cache }): {
  runtime: Runtime;
  cache: Cache;
  changes: ChangeLogEntry[];
} {
  const funcName = 'preprocess';
  logger.debug(funcName, '开始执行预处理...');

  try {
    const newRuntime = _.cloneDeep(runtime);
    const newCache = _.cloneDeep(cache);
    const changes: ChangeLogEntry[] = [];

    const charIds = Object.keys(getChars(stat));

    for (const charId of charIds) {
      const char = getChar(stat, charId);
      if (!char) continue;

      // 1. 解析好感度等级并存入 runtime
      // character-processor 只信任 runtime.characterSettings 中的数据
      const charAffectionStages = getCharAffectionStages(newRuntime, charId);

      // 如果角色没有好感度等级表，则无法处理，直接跳过
      if (!charAffectionStages || charAffectionStages.length === 0) {
        logger.debug(funcName, `角色 ${charId} 在 runtime.characterSettings 中没有找到好感度等级表，跳过处理。`);
        continue;
      }

      const affectionStage = getAffectionStage(char, charAffectionStages);

      if (affectionStage) {
        setAffectionStageInRuntime(newRuntime, charId, affectionStage);
        logger.debug(funcName, `角色 ${charId} (好感度: ${char.好感度}) 解析到好感度等级: [${affectionStage.name}]`);
      } else {
        logger.debug(funcName, `角色 ${charId} (好感度: ${char.好感度}) 未解析到任何好感度等级。`);
        continue;
      }

      // 2. 重置来访冷却
      const coolUnit = affectionStage.visit?.coolUnit;
      const cooling = isVisitCooling(newCache, charId);
      const triggered = isCooldownResetTriggered(coolUnit, newRuntime.clock?.flags);

      if (cooling && triggered) {
        setVisitCooling(newCache, charId, false);
        logger.debug(funcName, `角色 ${charId} 的来访冷却已在 ${coolUnit} 拍点重置。`);
      } else if (cooling) {
        logger.debug(funcName, `角色 ${charId} 处于来访冷却中，但未命中重置拍点 (coolUnit: ${coolUnit || '无'})。`);
      }
    }

    logger.debug(funcName, '预处理执行完毕。');

    return {
      runtime: newRuntime,
      cache: newCache,
      changes: changes,
    };
  } catch (e) {
    logger.error(funcName, '执行预处理时发生错误:', e);
    // 发生错误时，返回原始数据以防止流程中断
    return {
      runtime: runtime,
      cache: cache,
      changes: [],
    };
  }
}
