import _ from 'lodash';
import { Logger } from '../../utils/log';
import { preprocess } from './preprocessor';
import { partitionCharacters } from './partitioner';
import { makeDecisions } from './decision-makers';
import { aggregateResults } from './aggregator';

const logger = new Logger();

/**
 * 角色决策处理器主函数。
 * 
 * 依次执行预处理、角色分组、决策制定和结果聚合。
 * 
 * @param {object} params - 参数对象。
 * @param {any} params.stat - 完整的持久层数据。
 * @param {any} params.runtime - 完整的易失层数据。
 * @returns {Promise<any>} - 返回一个包含更新后 stat 和 runtime 的对象。
 */
export async function processCharacterDecisions({ stat, runtime }: { stat: any; runtime: any }): Promise<{ stat: any; runtime: any }> {
  const funcName = 'processCharacterDecisions';
  logger.log(funcName, '开始处理角色决策...');

  try {
    // 1. 预处理
  const processedRuntime = preprocess({ runtime, stat });

  // 2. 角色分组
  const { coLocatedChars, remoteChars } = partitionCharacters({ stat });

  // 3. 决策制定
  const decisions = makeDecisions({ runtime: processedRuntime, stat, coLocatedChars, remoteChars });

  // 4. 结果聚合
  const { stat: finalStat, runtime: finalRuntime } = aggregateResults({ stat, runtime: processedRuntime, decisions });

  logger.log(funcName, '角色决策处理完毕。');

    return { stat: finalStat, runtime: finalRuntime };
  } catch (e) {
    logger.error(funcName, '处理角色决策时发生意外错误:', e);
    // 发生严重错误时，返回原始数据以确保主流程稳定
    return { stat, runtime };
  }
}
