import _ from 'lodash';
import { ChangeLogEntry } from '../schema/change-log';
import { Stat } from '../schema/stat';
import { Logger } from '../utils/log';

const logger = new Logger('IOModule');

/**
 * @description 将变更日志（ChangeLog）中的每一项通过 ERA API 写入。
 * @param {ChangeLogEntry[]} changes - 包含所有数据变更的日志数组。
 * @param {Stat} stat - 初始的 stat 对象。
 */
export async function writeChangesToEra({ changes, stat }: { changes: ChangeLogEntry[]; stat: Stat }) {
  const funcName = 'writeChangesToEra';
  logger.debug(funcName, `开始将 ${changes.length} 条变更写入 ERA...`, { stat });

  if (!changes || changes.length === 0) {
    logger.debug(funcName, '变更日志为空，无需写入。');
    return;
  }

  for (const entry of changes) {
    // 检查路径是否存在于 stat 对象中
    if (_.has(stat, entry.path)) {
      // 如果路径存在，则调用 era:updateByPath
      eventEmit('era:updateByPath', {
        path: entry.path,
        value: entry.newValue,
      });
    }
    else {
      // 如果路径不存在，则调用 era:insertByPath
      eventEmit('era:insertByPath', {
        path: entry.path,
        value: entry.newValue,
      });
    }
  }

  logger.debug(funcName, '所有变更已提交至 ERA。');
}
