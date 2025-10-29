import _ from 'lodash';
import { Logger } from '../../../utils/log';
import { makeVisitDecisions } from './visit-processor';
import { makeCompanionDecisions } from './companion-processor';
import { makeActionDecisions } from './action-processor';

const logger = new Logger();

/**
 * 决策制定模块主函数。
 * 
 * 1. 对异区角色运行“来访”决策。
 * 2. 对同区角色运行“相伴”决策。
 * 3. 对所有剩余角色运行“常规行动”决策。
 * 4. 合并所有决策结果。
 * 
 * @returns 返回一个包含所有角色决策的对象。
 */
export function makeDecisions({ runtime, stat, coLocatedChars, remoteChars }: {
  runtime: any;
  stat: any;
  coLocatedChars: string[];
  remoteChars: string[];
}): Record<string, any> {
  const funcName = 'makeDecisions';
  logger.log(funcName, '开始为所有角色制定决策...');

  try {
    // 1. 异区角色决策
  logger.debug(funcName, `开始为 ${remoteChars.length} 个异区角色进行“来访”决策...`);
  const { decisions: visitDecisions, decidedChars: visitingChars } = makeVisitDecisions({ runtime, stat, remoteChars });
  logger.debug(funcName, `“来访”决策完毕，${visitingChars.length} 人决定来访: [${visitingChars.join(', ')}]`);

  // 2. 同区角色决策
  logger.debug(funcName, `开始为 ${coLocatedChars.length} 个同区角色进行“相伴”决策...`);
  const { decisions: companionDecisions, decidedChars: stayingChars } = makeCompanionDecisions({ runtime, coLocatedChars });
  logger.debug(funcName, `“相伴”决策完毕，${stayingChars.length} 人决定相伴: [${stayingChars.join(', ')}]`);

  // 3. 剩余角色决策
  const allCharIds = _.union(coLocatedChars, remoteChars);
  const decidedCharIds = _.union(visitingChars, stayingChars);
  const remainingChars = _.difference(allCharIds, decidedCharIds);
  logger.debug(funcName, `开始为 ${remainingChars.length} 个剩余角色进行“常规行动”决策: [${remainingChars.join(', ')}]`);
  const { decisions: actionDecisions } = makeActionDecisions({ runtime, stat, remainingChars });
  logger.debug(funcName, '“常规行动”决策完毕。');

  // 4. 合并所有决策
  const allDecisions = _.merge({}, visitDecisions, companionDecisions, actionDecisions);

  logger.log(funcName, `决策制定完毕。共 ${_.size(allDecisions)} 个角色做出了决定。`, allDecisions);

    return allDecisions;
  } catch (e) {
    logger.error(funcName, '执行决策制定时发生错误:', e);
    // 发生错误时，返回一个空决策表，以防止流程中断
    return {};
  }
}
