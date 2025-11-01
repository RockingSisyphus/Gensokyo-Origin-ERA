import { Cache } from '../../schema/cache';
import { ChangeLogEntry } from '../../schema/change-log-entry';
import { Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { applyCacheToStat, getCache } from '../../utils/cache';
import { Logger } from '../../utils/log';
import { processIncident } from './processor';

const logger = new Logger();

/**
 * 异变处理器主函数。
 *
 * @param {object} params - 参数对象。
 * @param {Stat} params.stat - 完整的持久层数据。
 * @param {Runtime} params.runtime - 完整的易失层数据。
 * @returns {Promise<{ stat: Stat; runtime: Runtime; changes: ChangeLogEntry[] }>} - 返回一个包含更新后 stat, runtime 和变更日志的对象。
 */
export async function processIncidentDecisions({
  stat,
  runtime,
}: {
  stat: Stat;
  runtime: Runtime;
}): Promise<{ stat: Stat; runtime: Runtime; changes: ChangeLogEntry[] }> {
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
