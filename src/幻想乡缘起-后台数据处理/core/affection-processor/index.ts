import _ from 'lodash';
import { ChangeLogEntry, Stat } from '../../schema';
import { Logger } from '../../utils/log';
import { processAffection } from './processor';

const logger = new Logger();

/**
 * 好感度处理器主函数。
 * 这是一个包装器，用于将来可能的扩展，并保持与其他核心模块一致的接口。
 *
 * @param {object} params - 参数对象。
 * @param {Stat} params.stat - 完整的持久层数据。
 * @param {any} params.editLog - 当前消息的 editLog。
 * @returns {{ stat: Stat; changes: ChangeLogEntry[] }} - 返回一个包含更新后 stat 和变更日志的对象。
 */
export function processAffectionDecisions({ stat, editLog }: { stat: Stat; editLog: any }): {
  stat: Stat;
  changes: ChangeLogEntry[];
} {
  const funcName = 'processAffectionDecisions';
  logger.debug(funcName, '开始处理好感度...');

  try {
    // 直接调用核心处理器
    const result = processAffection({ stat, editLog });
    logger.debug(funcName, '好感度处理完毕。');
    return result;
  } catch (e) {
    logger.error(funcName, '处理好感度时发生意外错误:', e);
    // 发生严重错误时，返回原始数据以确保主流程稳定
    return { stat, changes: [] };
  }
}
