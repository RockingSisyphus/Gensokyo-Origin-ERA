import _ from 'lodash';
import { Stat } from '../../schema';
import { Runtime } from '../../schema/runtime';
import { applyCacheToStat, getCache } from '../../utils/cache';
import { Logger } from '../../utils/log';
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

    // 2. 从缓存中直接读取上一轮的 clockAck
    const prevClockAck = cache.time?.clockAck ?? null;

    // 3. 调用核心处理器
    const timeResult = processor({ stat, prevClockAck });

    // 4. 将新的 clockAck 写入缓存
    if (timeResult.newClockAck) {
      // 使用新对象替换旧的 cache.time，以保证结构的原子性和类型安全
      // 如果 cache.time 已有其他属性，此操作会保留它们
      cache.time = {
        ...cache.time,
        clockAck: timeResult.newClockAck,
      };
    }

    // 5. 将时间计算结果合并到 runtime
    _.merge(runtime, { clock: timeResult.clock });

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
