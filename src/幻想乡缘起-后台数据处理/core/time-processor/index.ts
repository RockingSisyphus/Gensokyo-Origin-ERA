import { Stat } from '../../schema/stat';
import { Runtime } from '../../schema/runtime';
import { applyCacheToStat, getCache } from '../../utils/cache';
import { Logger } from '../../utils/log';
import { getClockAck, writeTimeProcessorResult } from './accessors';
import { processTime as processor } from './processor';

const logger = new Logger();

/**
 * 时间处理器主函数。
 *
 * @param {object} params - 参数对象。
 * @param {Stat} params.stat - 完整的持久层数据。
 * @param {Runtime} params.runtime - 完整的易失层数据。
 * @returns {Promise<{ stat: Stat; runtime: Runtime }>} - 返回一个包含更新后 stat 和 runtime 的对象。
 */
export async function processTime({
  stat,
  runtime,
}: {
  stat: Stat;
  runtime: Runtime;
}): Promise<{ stat: Stat; runtime: Runtime }> {
  const funcName = 'processTime';
  logger.debug(funcName, '开始处理时间...');

  try {
    // 1. 提取缓存
    const cache = getCache(stat);

    // 2. 使用 accessor 读取上一轮的 clockAck
    const prevClockAck = getClockAck(cache);

    // 3. 调用核心处理器
    const timeResult = processor({ stat, prevClockAck: prevClockAck ?? null });

    // 4. 使用 accessor 将结果写入 runtime 和 cache
    writeTimeProcessorResult({ runtime, cache, result: timeResult });

    // 5. 将最终的缓存应用回 stat
    applyCacheToStat(stat, cache);

    logger.debug(funcName, '时间处理完毕。');

    return { stat, runtime };
  } catch (e) {
    logger.error(funcName, '处理时间时发生意外错误:', e);
    // 发生严重错误时，返回原始数据以确保主流程稳定
    return { stat, runtime };
  }
}
