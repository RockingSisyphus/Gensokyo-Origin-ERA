import _ from 'lodash';
import { Logger } from '../../utils/log';
import { getCache, applyCacheToStat, Cache } from '../../utils/cache';
import { processIncident } from './processor';
import { ChangeLogEntry } from '../../utils/constants';

const logger = new Logger();

/**
 * 异变处理器主函数。
 *
 * @param {object} params - 参数对象。
 * @param {any} params.stat - 完整的持久层数据。
 * @param {any} params.runtime - 完整的易失层数据。
 * @returns {Promise<any>} - 返回一个包含更新后 stat 和 runtime 的对象。
 */
export async function processIncidentDecisions({
  stat,
  runtime,
}: {
  stat: any;
  runtime: any;
}): Promise<{ stat: any; runtime: any; changes: ChangeLogEntry[] }> {
  const funcName = 'processIncidentDecisions';
  logger.debug(funcName, '开始处理异变决策...');

  try {
    // 0. 提取缓存
    const cache: Cache = getCache(stat);

    // 1. 核心处理
    const {
      runtime: finalRuntime,
      stat: newStat,
      changes,
      cache: finalCache,
    } = processIncident({ runtime, stat, cache });

    // 2. 将最终的缓存应用回 stat
    applyCacheToStat(newStat, finalCache);

    logger.debug(funcName, '异变决策处理完毕。');

    return { stat: newStat, runtime: finalRuntime, changes };
  } catch (e) {
    logger.error(funcName, '处理异变决策时发生意外错误:', e);
    // 发生严重错误时，返回原始数据以确保主流程稳定
    return { stat, runtime, changes: [] };
  }
}
