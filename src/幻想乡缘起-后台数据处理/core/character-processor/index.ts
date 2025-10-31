import _ from 'lodash';
import { ChangeLogEntry, Stat } from '../../schema';
import { Runtime } from '../../schema/runtime';
import { applyCacheToStat, getCache } from '../../utils/cache';
import { Logger } from '../../utils/log';
import { setPartitions } from './accessors';
import { aggregateResults } from './aggregator';
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
 * @param {Stat} params.stat - 完整的持久层数据。
 * @param {Runtime} params.runtime - 完整的易失层数据。
 * @returns {Promise<{ stat: Stat; runtime: Runtime; changes: ChangeLogEntry[] }>} - 返回一个包含更新后 stat 和 runtime 的对象。
 */
export async function processCharacterDecisions({
  stat,
  runtime,
}: {
  stat: Stat;
  runtime: Runtime;
}): Promise<{ stat: Stat; runtime: Runtime; changes: ChangeLogEntry[] }> {
  const funcName = 'processCharacterDecisions';
  logger.debug(funcName, '开始处理角色决策...');

  try {
    // 0. 准备数据：克隆 stat 和 runtime，提取 cache
    const newStat = _.cloneDeep(stat);
    const newRuntime = _.cloneDeep(runtime);
    const cache = getCache(newStat);

    // 1. 预处理：就地修改 newRuntime 和 cache
    preprocess({ runtime: newRuntime, stat: newStat, cache });

    // 2. 角色分组
    const { coLocatedChars, remoteChars } = partitionCharacters({ stat: newStat });
    setPartitions(newRuntime, { coLocated: coLocatedChars, remote: remoteChars });

    // 3. 决策制定
    const {
      companionDecisions,
      nonCompanionDecisions,
      newCache: decidedCache,
    } = makeDecisions({
      runtime: newRuntime,
      stat: newStat,
      cache,
      coLocatedChars,
      remoteChars,
    });

    // 4. 结果聚合
    // 注意：aggregator 内部会再次克隆，以隔离其内部的修改。
    const {
      stat: finalStat,
      runtime: finalRuntime,
      cache: finalCache,
      changes: aggregateChanges,
    } = aggregateResults({
      stat: newStat,
      runtime: newRuntime,
      cache: decidedCache,
      companionDecisions,
      nonCompanionDecisions,
    });

    // 5. 将最终的缓存应用回 stat
    applyCacheToStat(finalStat, finalCache);

    logger.debug(funcName, '角色决策处理完毕。');

    return { stat: finalStat, runtime: finalRuntime, changes: aggregateChanges };
  } catch (e) {
    logger.error(funcName, '处理角色决策时发生意外错误:', e);
    // 发生严重错误时，返回原始数据以确保主流程稳定
    return { stat, runtime, changes: [] };
  }
}
