import _ from 'lodash';
import { ChangeLogEntry } from '../../schema/change-log-entry';
import { Stat } from '../../schema/stat';
import { Logger } from '../../utils/log';
import { normalizeLocationData } from './location';

const logger = new Logger();

/**
 * @description 数据规范化处理器的主入口函数。
 *              它会按顺序调用所有数据规范化模块。
 * @param {Stat} originalStat - 原始的、经过 Zod 验证的 stat 对象。
 * @returns {{processedStat: Stat, changes: ChangeLogEntry[]}} 一个包含处理后 stat 和所有变更日志的对象。
 */
export function processNormalization({ originalStat }: { originalStat: Stat }): {
  processedStat: Stat;
  changes: ChangeLogEntry[];
} {
  const funcName = 'processNormalization';
  logger.debug(funcName, '开始执行所有数据规范化流程...');

  // 使用深拷贝，确保所有 normalizer 操作都发生在一个独立的副本上
  let stat = _.cloneDeep(originalStat);
  let allChanges: ChangeLogEntry[] = [];

  // 1. 地点规范化
  const locationResult = normalizeLocationData(stat);
  stat = locationResult.stat;
  allChanges = allChanges.concat(locationResult.changes);
  logger.debug(funcName, 'normalizeLocationData 处理完成。');

  // 未来可以加入更多的 normalizer

  logger.debug(funcName, '所有数据规范化流程执行完毕。');
  return { processedStat: stat, changes: allChanges };
}
