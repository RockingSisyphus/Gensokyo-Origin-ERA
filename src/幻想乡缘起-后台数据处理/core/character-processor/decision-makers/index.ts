import _ from 'lodash';
import { Action, Cache, Stat } from '../../../schema';
import { Runtime } from '../../../schema/runtime';
import { Logger } from '../../../utils/log';
import { makeActionDecisions } from './action-processor';
import { makeCompanionDecisions } from './companion-processor';
import { makeVisitDecisions } from './visit-processor';

const logger = new Logger();

/**
 * 决策制定模块主函数。
 *
 * 1. 对异区角色运行“来访”决策。
 * 2. 对同区角色运行“相伴”决策。
 * 3. 对所有剩余角色运行“常规行动”决策。
 * 4. 合并所有决策结果。
 *
 * @returns 返回一个包含“相伴角色”和“其他角色”决策的对象。
 */
export function makeDecisions({
  runtime,
  stat,
  cache,
  coLocatedChars,
  remoteChars,
}: {
  runtime: Runtime;
  stat: Stat;
  cache: Cache;
  coLocatedChars: string[];
  remoteChars: string[];
}): {
  companionDecisions: Record<string, Action>;
  nonCompanionDecisions: Record<string, Action>;
  newCache: Cache;
} {
  const funcName = 'makeDecisions';
  logger.debug(funcName, '开始为所有角色制定决策...');

  try {
    // 1. 异区角色决策
    logger.debug(funcName, `开始为 ${remoteChars.length} 个异区角色进行“来访”决策...`);
    const {
      decisions: visitDecisions,
      decidedChars: visitingChars,
      newCache,
    } = makeVisitDecisions({
      runtime,
      stat,
      cache,
      remoteChars,
    });
    logger.debug(funcName, `“来访”决策完毕，${visitingChars.length} 人决定来访: [${visitingChars.join(', ')}]`);

    // 2. 同区角色决策
    logger.debug(funcName, `开始为 ${coLocatedChars.length} 个同区角色进行“相伴”检定...`);
    const { companionChars } = makeCompanionDecisions({ runtime, coLocatedChars });
    logger.debug(funcName, `“相伴”检定完毕，${companionChars.length} 人被标记为“相伴”: [${companionChars.join(', ')}]`);

    // 3. 剩余角色决策
    const allCharIds = _.union(coLocatedChars, remoteChars);
    // 真正剩余的、需要做常规决策且非相伴的角色
    const remainingChars = _.difference(allCharIds, visitingChars, companionChars);
    logger.debug(funcName, `开始为 ${remainingChars.length} 个“常规”角色进行行动决策: [${remainingChars.join(', ')}]`);
    const { decisions: normalActionDecisions } = makeActionDecisions({ runtime, stat, remainingChars });
    logger.debug(funcName, '“常规”角色行动决策完毕。');

    // 4. 相伴角色的常规行动决策
    logger.debug(
      funcName,
      `开始为 ${companionChars.length} 个“相伴”角色进行常规行动决策: [${companionChars.join(', ')}]`,
    );
    const { decisions: companionActionDecisions } = makeActionDecisions({
      runtime,
      stat,
      remainingChars: companionChars,
    });
    logger.debug(funcName, '“相伴”角色常规行动决策完毕。');

    // 5. 组合返回结果
    const nonCompanionDecisions = _.merge({}, normalActionDecisions, visitDecisions);

    logger.debug(
      funcName,
      `决策制定完毕。${_.size(nonCompanionDecisions)} 个“其他角色”的决策将由 aggregator 更新到 stat，${_.size(
        companionActionDecisions,
      )} 个“相伴角色”的决策将由 aggregator 更新到 runtime。`,
    );

    return {
      companionDecisions: companionActionDecisions,
      nonCompanionDecisions,
      newCache,
    };
  } catch (e) {
    logger.error(funcName, '执行决策制定时发生错误:', e);
    // 发生错误时，返回一个空决策表，以防止流程中断
    return { companionDecisions: {}, nonCompanionDecisions: {}, newCache: cache };
  }
}
