import _ from 'lodash';
import { applyCacheToStat, getCache } from '../../utils/cache';
import { Logger } from '../../utils/log';
import { aggregateResults } from './aggregator';
import {
  CO_LOCATED_CHARS_IN_RUNTIME_PATH,
  REMOTE_CHARS_IN_RUNTIME_PATH,
} from './constants';
import { makeDecisions } from './decision-makers';
import { partitionCharacters } from './partitioner';
import { preprocess } from './preprocessor';

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
export async function processCharacterDecisions({
  stat,
  runtime,
}: {
  stat: any;
  runtime: any;
}): Promise<{ stat: any; runtime: any; changes: any[] }> {
  const funcName = 'processCharacterDecisions';
  logger.debug(funcName, '开始处理角色决策...');

  try {
    // 0. 提取缓存
    const cache = getCache(stat);

    // 1. 预处理
    const {
      runtime: processedRuntime,
      cache: preprocessedCache,
      changes: preprocessChanges,
    } = preprocess({ runtime, stat, cache });

    // 2. 角色分组
    const { coLocatedChars, remoteChars } = partitionCharacters({ stat });
    _.set(processedRuntime, CO_LOCATED_CHARS_IN_RUNTIME_PATH, coLocatedChars);
    _.set(processedRuntime, REMOTE_CHARS_IN_RUNTIME_PATH, remoteChars);

    // 3. 决策制定
    const { companionDecisions, nonCompanionDecisions } = makeDecisions({
      runtime: processedRuntime,
      stat,
      cache: preprocessedCache,
      coLocatedChars,
      remoteChars,
    });

    // 4. 结果聚合
    const {
      stat: finalStat,
      runtime: finalRuntime,
      cache: finalCache,
      changes: aggregateChanges,
    } = aggregateResults({
      stat,
      runtime: processedRuntime,
      cache: preprocessedCache,
      companionDecisions,
      nonCompanionDecisions,
    });

    // 5. 将最终的缓存应用回 stat
    applyCacheToStat(finalStat, finalCache);

    const allChanges = preprocessChanges.concat(aggregateChanges);

    logger.debug(funcName, '角色决策处理完毕。');

    return { stat: finalStat, runtime: finalRuntime, changes: allChanges };
  } catch (e) {
    logger.error(funcName, '处理角色决策时发生意外错误:', e);
    // 发生严重错误时，返回原始数据以确保主流程稳定
    return { stat, runtime, changes: [] };
  }
}
