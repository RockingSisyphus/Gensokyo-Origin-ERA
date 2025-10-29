import _ from 'lodash';
import { Logger } from '../../../utils/log';
import { 
  setVisitCooling, 
  PREDEFINED_ACTIONS, 
  Action, 
  setCharLocationInStat, 
  setCharGoalInStat,
  getUserLocation
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
 * 将决策应用到 stat 和 runtime。
 */
function applyDecisions({ stat, runtime, decisions }: {
  stat: any;
  runtime: any;
  decisions: Record<string, Action>;
}): void {
  const funcName = 'applyDecisions';

  _.forEach(decisions, (decision, charId) => {
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
export function aggregateResults({ stat, runtime, decisions }: {
  stat: any;
  runtime: any;
  decisions: Record<string, Action>;
}): { stat: any; runtime: any } {
  const funcName = 'aggregateResults';
  logger.log(funcName, '开始聚合角色决策结果...');

  try {
    // 创建副本以避免直接修改输入对象
  const newStat = _.cloneDeep(stat);
  const newRuntime = _.cloneDeep(runtime);

  applyDecisions({ stat: newStat, runtime: newRuntime, decisions });
  
  // TODO: 在此添加其他聚合逻辑，如生成 changelog。

  logger.log(funcName, '结果聚合完毕。', { finalStat: newStat, finalRuntime: newRuntime });
    return { stat: newStat, runtime: newRuntime };
  } catch (e) {
    logger.error(funcName, '执行结果聚合时发生错误:', e);
    // 发生错误时，返回原始数据以防止流程中断
    return { stat, runtime };
  }
}
