import _ from 'lodash';
import { ChangeLogEntry } from '../../utils/constants';
import { Logger } from '../../utils/log';
import { processAffection } from './affection-processor';
import { normalizeLocationData } from './normalizer/location';

const logger = new Logger();

/**
 * @description Stat 处理器的主入口函数。
 *              它会按顺序调用所有数据修正模块，并返回一个经过所有修正的、全新的 stat 对象。
 * @param {any} originalStat - 原始的、未经修改的 `statWithoutMeta` 对象。
 * @param {any} editLog - 当前 mk 对应的 editLog。
 * @returns {{processedStat: any, changes: ChangeLogEntry[]}} 一个包含处理后 stat 和所有变更日志的对象。
 */
export function processStat(originalStat: any, editLog: any): { processedStat: any; changes: ChangeLogEntry[] } {
  const funcName = 'processStat';
  logger.log(funcName, '开始执行所有数据修正流程...', { editLog });

  // 使用深拷贝，确保所有 normalizer 操作都发生在一个独立的副本上
  let stat = _.cloneDeep(originalStat);
  let allChanges: ChangeLogEntry[] = [];

  // 按顺序调用各个 normalizer 函数
  // 每个函数都接收上一个函数处理过的 stat，并返回处理后的新 stat
  const locationResult = normalizeLocationData(stat);
  stat = locationResult.stat;
  allChanges = allChanges.concat(locationResult.changes);

  // 好感度折算处理器
  const affectionResult = processAffection(stat, editLog);
  stat = affectionResult.stat;
  allChanges = allChanges.concat(affectionResult.changes);

  // 未来可以加入更多的 normalizer，例如：
  // const someResult = someNormalizer(stat, editLog);
  // stat = someResult.stat;
  // allChanges = allChanges.concat(someResult.changes);

  // const characterResult = normalizeCharacterStatus(stat);
  // stat = characterResult.stat;
  // allChanges = allChanges.concat(characterResult.changes);

  logger.log(funcName, '所有数据修正流程执行完毕。');
  return { processedStat: stat, changes: allChanges };
}
