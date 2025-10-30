import _ from 'lodash';
import { Logger } from '../../utils/log';
import { getCache, applyCacheToStat, setCacheValue, getCacheValue } from '../../utils/cache';
import { processTime as processor } from './processor';

const logger = new Logger();
const CLOCK_ACK_CACHE_PATH = 'time.clockAck';

/**
 * 时间处理器主函数。
 *
 * @param {object} params - 参数对象。
 * @param {any} params.stat - 完整的持久层数据。
 * @param {any} params.runtime - 完整的易失层数据。
 * @returns {Promise<any>} - 返回一个包含更新后 stat 和 runtime 的对象。
 */
export async function processTime({
  stat,
  runtime,
}: {
  stat: any;
  runtime: any;
}): Promise<{ stat: any; runtime: any }> {
  const funcName = 'processTime';
  logger.debug(funcName, '开始处理时间...');

  try {
    // 1. 提取缓存
    const cache = getCache(stat);

    // 2. 从缓存中读取上一轮的 clockAck
    const prevClockAck = getCacheValue(cache, CLOCK_ACK_CACHE_PATH, null);

    // 3. 调用核心处理器
    const timeResult = processor({ stat, prevClockAck });

    // 4. 将新的 clockAck 写入缓存
    if (timeResult.clock.clockAck) {
      setCacheValue(cache, CLOCK_ACK_CACHE_PATH, timeResult.clock.clockAck);
    }

    // 5. 将时间计算结果合并到 runtime
    _.merge(runtime, timeResult);

    // 6. 将最终的缓存应用回 stat
    applyCacheToStat(stat, cache);

    logger.debug(funcName, '时间处理完毕。');

    return { stat, runtime };
  } catch (e) {
    logger.error(funcName, '处理时间时发生意外错误:', e);
    // 发生严重错误时，返回原始数据以确保主流程稳定
    return { stat, runtime };
  }
}
