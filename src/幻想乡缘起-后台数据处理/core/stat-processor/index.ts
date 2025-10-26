import _ from 'lodash';
import { Logger } from '../../utils/log';
import { normalizeLocationData } from './normalizer/location';

const logger = new Logger();

/**
 * @description Stat 处理器的主入口函数。
 *              它会按顺序调用所有数据修正模块，并返回一个经过所有修正的、全新的 stat 对象。
 * @param {any} originalStat - 原始的、未经修改的 `statWithoutMeta` 对象。
 * @returns {any} 一个经过所有标准化处理的、全新的 stat 对象。
 */
export function processStat(originalStat: any): any {
  const funcName = 'processStat';
  logger.log(funcName, '开始执行所有数据修正流程...');

  // 使用深拷贝，确保所有 normalizer 操作都发生在一个独立的副本上
  let stat = _.cloneDeep(originalStat);

  // 按顺序调用各个 normalizer 函数
  // 每个函数都接收上一个函数处理过的 stat，并返回处理后的新 stat
  stat = normalizeLocationData(stat);
  // 未来可以加入更多的 normalizer，例如：
  // stat = normalizeCharacterStatus(stat);
  // stat = normalizeItemData(stat);

  logger.log(funcName, '所有数据修正流程执行完毕。');
  return stat;
}
