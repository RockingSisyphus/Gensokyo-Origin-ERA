/**
 * @file 变更日志（ChangeLog）相关的工具函数
 */
import { ChangeLogEntry, ChangeLogEntrySchema } from '../schema/change-log';

/**
 * @description 创建一个经过验证的标准格式的变更日志条目。
 * @param {string} module - 触发变更的模块名。
 * @param {string} path - 被修改的数据路径。
 * @param {any} oldValue - 修改前的值。
 * @param {any} newValue - 修改后的值。
 * @param {string} reason - 变更原因的简短描述。
 * @returns {ChangeLogEntry} 一个经过 Zod 验证的日志条目对象。
 */
export const createChangeLogEntry = (
  module: string,
  path: string,
  oldValue: any,
  newValue: any,
  reason: string,
): ChangeLogEntry => {
  const entry = {
    module,
    path,
    oldValue,
    newValue,
    reason,
  };
  // 在创建时进行验证，确保所有日志条目都符合 schema
  return ChangeLogEntrySchema.parse(entry);
};
