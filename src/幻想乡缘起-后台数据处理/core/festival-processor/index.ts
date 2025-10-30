import _ from 'lodash';
import { Logger } from '../../utils/log';
import { processFestival as processor } from './processor';

const logger = new Logger();

/**
 * 节日处理器主函数。
 *
 * @param {object} params - 参数对象。
 * @param {any} params.stat - 完整的持久层数据。
 * @param {any} params.runtime - 完整的易失层数据。
 * @returns {Promise<{ stat: any; runtime: any }>} - 返回一个包含更新后 stat 和 runtime 的对象。
 */
export async function processFestival({
  stat,
  runtime,
}: {
  stat: any;
  runtime: any;
}): Promise<{ stat: any; runtime: any }> {
  const funcName = 'processFestival';
  logger.debug(funcName, '开始处理节日...');

  try {
    // 调用核心处理器
    const festivalResult = processor({ stat, runtime });

    // 将计算结果合并到 runtime
    _.merge(runtime, festivalResult);

    logger.debug(funcName, '节日处理完毕。');

    return { stat, runtime };
  } catch (e) {
    logger.error(funcName, '处理节日时发生意外错误:', e);
    // 发生严重错误时，返回原始数据以确保主流程稳定
    return { stat, runtime };
  }
}
