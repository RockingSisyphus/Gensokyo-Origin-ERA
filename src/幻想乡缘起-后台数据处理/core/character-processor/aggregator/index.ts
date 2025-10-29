import _ from 'lodash';
import { Logger } from '../../../utils/log';
import {
  Action,
  getUserLocation,
  PREDEFINED_ACTIONS,
  setCharGoalInStat,
  setCharLocationInStat,
  setVisitCooling,
} from '../constants';

const logger = new Logger();

/**
 * 解析决策中的目标地点。
 * @param to - 目标地点的语法字符串。
 * @param stat - The stat object.
 * @returns 解析后的实际地点名称。
 */
function resolveTargetLocation(to: string, stat: any): string {
  if (to === 'HERO') {
    return getUserLocation(stat) || 'UNKNOWN';
  }
  // TODO: 实现 FIXED, NEIGHBOR, FROM, ANY 等更复杂的地点解析逻辑
  return to;
}

/**
 * 将“其他角色”的决策应用到 stat 和 runtime。
 * 这些决策会直接影响角色的持久化状态。
 */
function applyOtherDecisions({
  stat,
  runtime,
  otherDecisions,
}: {
  stat: any;
  runtime: any;
  otherDecisions: Record<string, Action>;
}): void {
  const funcName = 'applyOtherDecisions';

  _.forEach(otherDecisions, (decision, charId) => {
    logger.debug(funcName, `开始应用角色 ${charId} 的决策: [${decision.do}]`);

    // 1. 更新 stat
    const newLocation = resolveTargetLocation(decision.to, stat);
    setCharLocationInStat(stat, charId, newLocation);
    setCharGoalInStat(stat, charId, decision.do);
    logger.log(funcName, `[STAT] 角色 ${charId}: 位置 -> [${newLocation}], 目标 -> [${decision.do}]`);

    // 2. 更新 runtime (副作用)
    _.set(runtime, `chars.${charId}.decision`, decision);
    logger.debug(funcName, `[RUNTIME] 角色 ${charId}: 已记录决策。`);

    if (decision.source === PREDEFINED_ACTIONS.VISIT_HERO.source) {
      setVisitCooling(runtime, charId, true);
      logger.log(funcName, `[RUNTIME] 角色 ${charId}: 已设置来访冷却。`);
    }
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
  companionDecisions,
  otherDecisions,
}: {
  stat: any;
  runtime: any;
  companionDecisions: Record<string, Action>;
  otherDecisions: Record<string, Action>;
}): { stat: any; runtime: any } {
  const funcName = 'aggregateResults';
  logger.log(funcName, '开始聚合角色决策结果...');

  try {
    logger.log(funcName, '聚合前（原始）的 stat 和 runtime:', { stat, runtime });

    // 1. 将“相伴角色”的决策存入 runtime
    // 这些决策仅用于当轮的逻辑判断，不直接写入 stat
    _.set(runtime, 'companionDecisions', companionDecisions);
    logger.log(
      funcName,
      `[RUNTIME] 已将 ${_.size(companionDecisions)} 个“相伴角色”的决策存入 runtime.companionDecisions。`,
    );

    // 2. 将“其他角色”的决策应用到 stat
    // 创建 stat 的副本以安全修改
    const newStat = _.cloneDeep(stat);

    // 直接修改传入的 runtime 对象，不创建副本，以保留上游模块的修改
    applyOtherDecisions({ stat: newStat, runtime: runtime, otherDecisions });

    // TODO: 在此添加其他聚合逻辑，如生成 changelog。

    logger.log(funcName, '结果聚合完毕。', { finalStat: newStat, finalRuntime: runtime });
    return { stat: newStat, runtime: runtime };
  } catch (e) {
    logger.error(funcName, '执行结果聚合时发生错误:', e);
    // 发生错误时，返回原始数据以防止流程中断
    return { stat, runtime };
  }
}
