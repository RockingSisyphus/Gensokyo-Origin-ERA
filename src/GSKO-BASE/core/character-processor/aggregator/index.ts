import _ from 'lodash';
import { Cache } from '../../../schema/cache';
import { ChangeLogEntry } from '../../../schema/change-log';
import { CHARACTER_FIELDS } from '../../../schema/character';
import { Action, Runtime } from '../../../schema/runtime';
import { Stat } from '../../../schema/stat';
import { Logger } from '../../../utils/log';
import {
  getChar,
  getCharGoal,
  getCharGoalPath,
  getCharLocation,
  getCharLocationPath,
  getUserLocation,
  setCharGoalInStat,
  setCharLocationInStat,
  setCompanionDecisionInRuntime,
  setDecisionInRuntime,
  setPartitions,
  setVisitCooling,
} from '../accessors';
import { PREDEFINED_ACTIONS } from '../constants';

const logger = new Logger();

/**
 * 解析决策中的目标地点。
 * @param to - 目标地点的语法字符串。
 * @param stat - The stat object.
 * @param runtime - The runtime object.
 * @returns 解析后的实际地点名称。
 */
function getCharHomeOrFallback(stat: Stat, charId: string): string {
  const char = getChar(stat, charId);
  const homeLocation = char?.[CHARACTER_FIELDS.home];
  if (typeof homeLocation === 'string' && homeLocation.trim() !== '') {
    return homeLocation;
  }
  return getUserLocation(stat);
}

function resolveTargetLocation(charId: string, to: string | undefined, stat: Stat, runtime: Runtime): string {
  if (to === 'RANDOM') {
    const legalLocations = runtime.area?.legal_locations;
    if (legalLocations && legalLocations.length > 0) {
      const sampled = _.sample(legalLocations);
      if (typeof sampled === 'string') {
        return sampled;
      }
    }
    // 如果没有合法地点列表或采样结果不是字符串，则退回到角色的居住地区
    return getCharHomeOrFallback(stat, charId);
  }

  if (to === '$HOME') {
    return getCharHomeOrFallback(stat, charId);
  }

  if (!to) {
    return getCharHomeOrFallback(stat, charId);
  }

  if (to === 'HERO') {
    return getUserLocation(stat);
  }
  // TODO: 实现 FIXED, NEIGHBOR, FROM, ANY 等更复杂的地点解析逻辑
  return to;
}

/**
 * 将“非同伴角色”的决策应用到 stat 和 runtime。
 * 这些决策会直接影响角色的持久化状态。
 */
function applyNonCompanionDecisions({
  stat,
  runtime,
  cache,
  nonCompanionDecisions,
}: {
  stat: Stat;
  runtime: Runtime;
  cache: Cache;
  nonCompanionDecisions: Record<string, Action>;
}): ChangeLogEntry[] {
  const funcName = 'applyNonCompanionDecisions';
  const changes: ChangeLogEntry[] = [];
  const moduleName = 'character-processor';

  _.forEach(nonCompanionDecisions, (decision, charId) => {
    logger.debug(funcName, `开始应用角色 ${charId} 的决策: [${decision.do}]`);

    // 1. 更新 stat 并记录变更
    // 1.1 更新位置
    const oldLocation = getCharLocation(stat, charId);
    const newLocation = resolveTargetLocation(charId, decision.to, stat, runtime);
    if (oldLocation !== newLocation) {
      setCharLocationInStat(stat, charId, newLocation);
      changes.push({
        module: moduleName,
        path: getCharLocationPath(charId),
        oldValue: oldLocation,
        newValue: newLocation,
        reason: `角色 ${charId} 根据决策 "${decision.do}" 移动位置。`,
      });
      logger.debug(funcName, `[STAT] 角色 ${charId}: 位置 -> [${newLocation}]`);
    }

    // 1.2 更新目标
    const oldGoal = getCharGoal(stat, charId);
    const newGoal = decision.do;
    if (oldGoal !== newGoal) {
      setCharGoalInStat(stat, charId, newGoal);
      changes.push({
        module: moduleName,
        path: getCharGoalPath(charId),
        oldValue: oldGoal,
        newValue: newGoal,
        reason: `角色 ${charId} 根据决策更新目标。`,
      });
      logger.debug(funcName, `[STAT] 角色 ${charId}: 目标 -> [${newGoal}]`);
    }

    // 2. 更新 runtime (副作用)
    setDecisionInRuntime(runtime, charId, decision);
    logger.debug(funcName, `[RUNTIME] 角色 ${charId}: 已记录决策。`);

    if (decision.source === PREDEFINED_ACTIONS.VISIT_HERO.source) {
      setVisitCooling(cache, charId, true);
      logger.debug(funcName, `[CACHE] 角色 ${charId}: 已设置来访冷却。`);
    }
  });

  return changes;
}

/**
 * 将“同伴角色”的决策应用到 runtime。
 * 这些决策仅用于当轮的逻辑判断，不直接写入 stat。
 */
function applyCompanionDecisions({
  runtime,
  companionDecisions,
}: {
  runtime: Runtime;
  companionDecisions: Record<string, Action>;
}): void {
  const funcName = 'applyCompanionDecisions';

  _.forEach(companionDecisions, (decision, charId) => {
    logger.debug(funcName, `开始应用角色 ${charId} 的相伴决策: [${decision.do}]`);
    setCompanionDecisionInRuntime(runtime, charId, decision);
    logger.debug(funcName, `[RUNTIME] 角色 ${charId}: 已记录相伴决策。`);
  });
}

/**
 * 结果聚合器主函数。
 *
 * 1. 遍历所有决策。
 * 2. 更新 stat 中的角色位置和目标。
 * 3. 更新 runtime 中的决策记录和副作用（如冷却）。
 *
 * @returns 更新后的 stat 和 runtime 对象。
 */
export function aggregateResults({
  stat,
  runtime,
  cache,
  companionDecisions,
  nonCompanionDecisions,
  partitions,
}: {
  stat: Stat;
  runtime: Runtime;
  cache: Cache;
  companionDecisions: Record<string, Action>;
  nonCompanionDecisions: Record<string, Action>;
  partitions: { coLocated: string[]; remote: string[] };
}): { stat: Stat; runtime: Runtime; cache: Cache; changes: ChangeLogEntry[] } {
  const funcName = 'aggregateResults';
  logger.debug(funcName, '开始聚合角色决策结果...');

  const newStat = _.cloneDeep(stat);
  const newRuntime = _.cloneDeep(runtime);
  const newCache = _.cloneDeep(cache);
  const changes: ChangeLogEntry[] = [];

  try {
    // 1. 写入分区信息
    setPartitions(newRuntime, partitions);

    // 2. 应用“相伴角色”的决策
    applyCompanionDecisions({ runtime: newRuntime, companionDecisions });

    // 3. 应用“非同伴角色”的决策
    const nonCompanionChanges = applyNonCompanionDecisions({
      stat: newStat,
      runtime: newRuntime,
      cache: newCache,
      nonCompanionDecisions,
    });
    changes.push(...nonCompanionChanges);

    // TODO: 在此添加其他聚合逻辑，如生成 changelog。

    logger.debug(funcName, '结果聚合完毕。');
    return { stat: newStat, runtime: newRuntime, cache: newCache, changes };
  } catch (e) {
    logger.error(funcName, '执行结果聚合时发生错误:', e);
    // 发生错误时，返回原始数据以防止流程中断
    return { stat, runtime, cache, changes: [] };
  }
}
