import _ from 'lodash';
import { Cache } from '../../../schema/cache';
import { ChangeLogEntry } from '../../../schema/change-log-entry';
import { Action } from '../../../schema/runtime';
import { Stat } from '../../../schema/stat';
import { Runtime } from '../../../schema/runtime';
import { Logger } from '../../../utils/log';
import {
  getUserLocation,
  setCharGoalInStat,
  setCharLocationInStat,
  setCompanionDecisionInRuntime,
  setDecisionInRuntime,
  setVisitCooling,
} from '../accessors';
import { PREDEFINED_ACTIONS } from '../constants';

const logger = new Logger('Aggregator');

/**
 * 解析决策中的目标地点。
 * @param to - 目标地点的语法字符串。
 * @param stat - The stat object.
 * @returns 解析后的实际地点名称。
 */
function resolveTargetLocation(to: string | undefined, stat: Stat): string {
  if (!to || to === 'HERO') {
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
}): void {
  const funcName = 'applyNonCompanionDecisions';

  _.forEach(nonCompanionDecisions, (decision, charId) => {
    logger.debug(funcName, `开始应用角色 ${charId} 的决策: [${decision.do}]`);

    // 1. 更新 stat
    const newLocation = resolveTargetLocation(decision.to, stat);
    setCharLocationInStat(stat, charId, newLocation);
    setCharGoalInStat(stat, charId, decision.do);
    logger.debug(funcName, `[STAT] 角色 ${charId}: 位置 -> [${newLocation}], 目标 -> [${decision.do}]`);

    // 2. 更新 runtime (副作用)
    setDecisionInRuntime(runtime, charId, decision);
    logger.debug(funcName, `[RUNTIME] 角色 ${charId}: 已记录决策。`);

    if (decision.source === PREDEFINED_ACTIONS.VISIT_HERO.source) {
      setVisitCooling(cache, charId, true);
      logger.debug(funcName, `[CACHE] 角色 ${charId}: 已设置来访冷却。`);
    }
  });
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
}: {
  stat: Stat;
  runtime: Runtime;
  cache: Cache;
  companionDecisions: Record<string, Action>;
  nonCompanionDecisions: Record<string, Action>;
}): { stat: Stat; runtime: Runtime; cache: Cache; changes: ChangeLogEntry[] } {
  const funcName = 'aggregateResults';
  logger.debug(funcName, '开始聚合角色决策结果...');

  const newStat = _.cloneDeep(stat);
  const newRuntime = _.cloneDeep(runtime);
  const newCache = _.cloneDeep(cache);
  const changes: ChangeLogEntry[] = [];

  try {
    // 1. 应用“相伴角色”的决策
    applyCompanionDecisions({ runtime: newRuntime, companionDecisions });

    // 2. 应用“非同伴角色”的决策
    applyNonCompanionDecisions({ stat: newStat, runtime: newRuntime, cache: newCache, nonCompanionDecisions });

    // TODO: 在此添加其他聚合逻辑，如生成 changelog。

    logger.debug(funcName, '结果聚合完毕。');
    return { stat: newStat, runtime: newRuntime, cache: newCache, changes };
  } catch (e) {
    logger.error(funcName, '执行结果聚合时发生错误:', e);
    // 发生错误时，返回原始数据以防止流程中断
    return { stat, runtime, cache, changes: [] };
  }
}
