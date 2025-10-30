import _ from 'lodash';
import { ChangeLogEntry } from '../../../utils/constants';
import { Logger } from '../../../utils/log';
import { getAffectionStage } from '../utils';
import {
  getChar,
  getGlobalAffectionStages,
  isVisitCooling,
  setAffectionStageInContext,
  setVisitCooling,
} from '../accessors';
import { MODULE_CACHE_ROOT, VISIT_COOLING_PATH } from '../constants';

const logger = new Logger();

/**
 * 检查给定的冷却单位是否在当前时间拍点被触发。
 */
function isCooldownResetTriggered(coolUnit: string, flags: any): boolean {
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
export function preprocess({ runtime, stat, cache }: { runtime: any; stat: any; cache: any }): {
  runtime: any;
  cache: any;
  changes: ChangeLogEntry[];
} {
  const funcName = 'preprocess';
  logger.debug(funcName, '开始执行预处理...');

  try {
    const newRuntime = _.cloneDeep(runtime);
    const changes: ChangeLogEntry[] = [];

    const charIds = Object.keys(stat.chars);
    const globalAffectionStages = getGlobalAffectionStages(stat);

    for (const charId of charIds) {
      const char = getChar(stat, charId);
      if (!char) continue;

      // 1. 解析好感度等级并存入 runtime
      const affectionStage = getAffectionStage(char, globalAffectionStages);
      setAffectionStageInContext(newRuntime, charId, affectionStage);

      if (affectionStage) {
        logger.debug(funcName, `角色 ${charId} (好感度: ${char.好感度}) 解析到好感度等级: [${affectionStage.name}]`);
      } else {
        logger.debug(funcName, `角色 ${charId} (好感度: ${char.好感度}) 未解析到任何好感度等级。`);
        continue;
      }

      // 2. 重置来访冷却
      const coolUnit = _.get(affectionStage, 'visit.coolUnit');
      const cooling = isVisitCooling(newRuntime, charId);
      const triggered = isCooldownResetTriggered(coolUnit, newRuntime.clock.flags);

      if (cooling && triggered) {
        setVisitCooling(newRuntime, charId, false);
        logger.log(funcName, `角色 ${charId} 的来访冷却已在 ${coolUnit} 拍点重置。`);
        const change: ChangeLogEntry = {
          module: funcName,
          path: VISIT_COOLING_IN_STATE_PATH(charId),
          oldValue: true,
          newValue: false,
          reason: `角色 ${charId} 的来访冷却已在 ${coolUnit} 拍点重置。`,
        };
        changes.push(change);
      } else if (cooling) {
        logger.debug(funcName, `角色 ${charId} 处于来访冷却中，但未命中重置拍点 (coolUnit: ${coolUnit || '无'})。`);
      }
    }

    logger.debug(funcName, '预处理执行完毕。');

    return {
      runtime: newRuntime,
      cache: cache,
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
