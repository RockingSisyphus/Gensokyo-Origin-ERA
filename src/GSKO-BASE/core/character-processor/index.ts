import _ from 'lodash';
import { ChangeLogEntry } from '../../schema/change-log';
import { Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { applyCacheToStat, getCache } from '../../utils/cache';
import { Logger } from '../../utils/log';
import { aggregateResults } from './aggregator';
import { makeDecisions } from './decision-makers';
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
    // 如果当前有异变，则跳过所有角色决策，但仍需通过 aggregator 返回一个结构完整的 runtime
    if (runtime.incident?.isIncidentActive) {
      logger.debug(funcName, '检测到异变正在发生，跳过所有角色决策。');
      const {
        stat: finalStat,
        runtime: finalRuntime,
        cache: finalCache,
        changes: aggregateChanges,
      } = aggregateResults({
        stat,
        runtime,
        cache: getCache(stat),
        companionDecisions: {},
        nonCompanionDecisions: {},
        partitions: { coLocated: [], remote: [] },
      });
      applyCacheToStat(finalStat, finalCache);
      return { stat: finalStat, runtime: finalRuntime, changes: aggregateChanges };
    }
    // 准备数据：cache 是从 stat 中提取的，不需要克隆
    const initialCache = getCache(stat);

    // 1. 预处理：计算好感度阶段、重置冷却，并返回更新后的 runtime 和 cache。
    const {
      runtime: processedRuntime,
      cache: processedCache,
      changes: preprocessChanges,
    } = preprocess({ runtime, stat, cache: initialCache });

    // 2. 角色分组：直接从 processedRuntime.characterDistribution 计算分区
    const playerLocation = processedRuntime.characterDistribution?.playerLocation;
    const coLocatedChars = playerLocation
      ? (processedRuntime.characterDistribution?.npcByLocation[playerLocation] ?? [])
      : [];
    const allNpcIds = _.keys(stat.chars);
    const remoteChars = _.difference(allNpcIds, coLocatedChars);
    const partitions = { coLocated: coLocatedChars, remote: remoteChars };

    // 3. 决策制定 (只读)
    const {
      companionDecisions,
      nonCompanionDecisions,
      newCache: decidedCache,
      changeLog: decisionChangeLog,
    } = makeDecisions({
      runtime: processedRuntime,
      stat,
      cache: processedCache,
      coLocatedChars,
      remoteChars,
    });

    // 4. 结果聚合 (写入)
    // aggregator 内部会克隆 stat 和 runtime，以隔离副作用。
    const {
      stat: finalStat,
      runtime: finalRuntime,
      cache: finalCache,
      changes: aggregateChanges,
    } = aggregateResults({
      stat,
      runtime: processedRuntime,
      cache: decidedCache,
      companionDecisions,
      nonCompanionDecisions,
      partitions,
    });

    // 5. 将最终的缓存应用回 stat
    applyCacheToStat(finalStat, finalCache);

    logger.debug(funcName, '角色决策处理完毕。');

    const allChanges = [...preprocessChanges, ...decisionChangeLog, ...aggregateChanges];

    return { stat: finalStat, runtime: finalRuntime, changes: allChanges };
  } catch (e) {
    logger.error(funcName, '处理角色决策时发生意外错误:', e);
    // 发生严重错误时，返回原始数据以确保主流程稳定
    return { stat, runtime, changes: [] };
  }
}
