/**
 * @file editLog 解析器工具集
 * @description 提供一系列模块化函数，用于解析和查询 editLog。
 */

import _ from 'lodash';
import { Logger } from './log';

const logger = new Logger();

// --- 类型定义 ---

export interface EditLogOp {
  op: 'insert' | 'update' | 'delete';
  path: string;
  value_new?: any;
  value_old?: any;
  value?: any; // 某些insert操作可能用value
}

export interface AtomicChange {
  path: string;
  oldVal: any;
  newVal: any;
}

// --- 工具 1: 字符串到 JSON ---

/**
 * 将 editLog JSON 字符串安全地解析为对象数组。
 * @param logString - 原始的 editLog 字符串。
 * @returns {EditLogOp[] | null} - 解析后的操作对象数组，或在失败时返回 null。
 */
export function parseEditLogString(logString: string): EditLogOp[] | null {
  try {
    const parsed = JSON.parse(logString);
    if (_.isArray(parsed)) {
      return parsed as EditLogOp[];
    }
    logger.warn('parseEditLogString', '解析结果不是一个数组。', { parsed });
    return null;
  } catch (error: any) {
    logger.error('parseEditLogString', '解析 editLog 字符串失败。', {
      error: error.message,
    });
    return null;
  }
}

// --- 工具 2, 3, 4: 按操作类型过滤 ---

/**
 * 从 editLog 对象数组中筛选出所有 'update' 操作。
 * @param logJson - editLog 对象数组。
 * @returns {EditLogOp[]} - 只包含 'update' 操作的数组。
 */
export function getUpdateOps(logJson: EditLogOp[]): EditLogOp[] {
  return logJson.filter(op => op.op === 'update');
}

/**
 * 从 editLog 对象数组中筛选出所有 'insert' 操作。
 * @param logJson - editLog 对象数组。
 * @returns {EditLogOp[]} - 只包含 'insert' 操作的数组。
 */
export function getInsertOps(logJson: EditLogOp[]): EditLogOp[] {
  return logJson.filter(op => op.op === 'insert');
}

/**
 * 从 editLog 对象数组中筛选出所有 'delete' 操作。
 * @param logJson - editLog 对象数组。
 * @returns {EditLogOp[]} - 只包含 'delete' 操作的数组。
 */
export function getDeleteOps(logJson: EditLogOp[]): EditLogOp[] {
  return logJson.filter(op => op.op === 'delete');
}

// --- 工具 5: 解析原子变更 ---

/**
 * 递归地将对象扁平化为原子路径和值的映射。
 * @param obj - 要扁平化的对象。
 * @param path - 基础路径。
 * @returns {Map<string, any>} - 从原子路径到其值的映射。
 */
function flattenObject(obj: any, path: string = ''): Map<string, any> {
  const flatMap = new Map<string, any>();
  if (!_.isObject(obj) || _.isArray(obj)) {
    if (path) flatMap.set(path, obj);
    return flatMap;
  }

  const recordObj = obj as Record<string, any>;
  for (const key of Object.keys(recordObj)) {
    const newPath = path ? `${path}.${key}` : key;
    const nested = flattenObject(recordObj[key], newPath);
    nested.forEach((value, p) => flatMap.set(p, value));
  }
  return flatMap;
}

/**
 * 从单个 'update' 操作中提取所有原子层面的变更。
 * @param updateOp - 一个 'update' 操作对象。
 * @returns {AtomicChange[]} - 原子变更的数组。
 */
export function getAtomicChangesFromUpdate(updateOp: EditLogOp): AtomicChange[] {
  if (updateOp.op !== 'update') return [];

  const basePath = updateOp.path;
  const oldVal = updateOp.value_old;
  const newVal = updateOp.value_new;

  // 如果 value_old 或 value_new 不是对象，则这是一个顶层原子变更
  if (!_.isObject(oldVal) && !_.isObject(newVal)) {
    return [{ path: basePath, oldVal: oldVal ?? null, newVal: newVal ?? null }];
  }

  const oldMap = flattenObject(oldVal);
  const newMap = flattenObject(newVal);
  const allKeys = _.union([...oldMap.keys()], [...newMap.keys()]);
  const changes: AtomicChange[] = [];

  for (const key of allKeys) {
    const fullPath = `${basePath}.${key}`;
    const vOld = oldMap.has(key) ? oldMap.get(key) : null;
    const vNew = newMap.has(key) ? newMap.get(key) : null;

    if (!_.isEqual(vOld, vNew)) {
      changes.push({ path: fullPath, oldVal: vOld, newVal: vNew });
    }
  }
  return changes;
}

// --- 工具 6: 组合与查询 ---

/**
 * 从整个 editLog 对象数组中获取所有原子变更。
 * @param logJson - editLog 对象数组。
 * @returns {AtomicChange[]} - 所有操作产生的原子变更的扁平列表。
 */
export function getAllAtomicChanges(logJson: EditLogOp[]): AtomicChange[] {
  const allChanges: AtomicChange[] = [];

  // 处理 Update
  getUpdateOps(logJson).forEach(op => {
    allChanges.push(...getAtomicChangesFromUpdate(op));
  });

  // 处理 Insert
  getInsertOps(logJson).forEach(op => {
    const valueToInsert = op.value_new;
    if (valueToInsert === undefined) return;

    if (!_.isObject(valueToInsert)) {
      // 原子插入
      allChanges.push({ path: op.path, oldVal: null, newVal: valueToInsert });
    } else {
      // 对象插入
      const newMap = flattenObject(valueToInsert);
      if (newMap.size === 0 && _.isObject(valueToInsert)) {
        // 插入空对象
        allChanges.push({ path: op.path, oldVal: null, newVal: valueToInsert });
      } else {
        newMap.forEach((vNew, key) => {
          allChanges.push({
            path: `${op.path}.${key}`,
            oldVal: null,
            newVal: vNew,
          });
        });
      }
    }
  });

  // 处理 Delete
  getDeleteOps(logJson).forEach(op => {
    const valueToDelete = op.value_old;
    if (valueToDelete === undefined) return;

    if (!_.isObject(valueToDelete)) {
      // 原子删除
      allChanges.push({ path: op.path, oldVal: valueToDelete, newVal: null });
    } else {
      // 对象删除
      const oldMap = flattenObject(valueToDelete);
      if (oldMap.size === 0 && _.isObject(valueToDelete)) {
        // 删除空对象
        allChanges.push({ path: op.path, oldVal: valueToDelete, newVal: null });
      } else {
        oldMap.forEach((vOld, key) => {
          allChanges.push({
            path: `${op.path}.${key}`,
            oldVal: vOld,
            newVal: null,
          });
        });
      }
    }
  });

  return allChanges;
}

/**
 * 在 editLog 中查找指定路径的最终变更结果。
 * @param logJson - editLog 对象数组。
 * @param targetPath - 要查询的完整原子路径。
 * @returns {AtomicChange | null} - 匹配的最后一条原子变更，或 null。
 */
export function findChangeByPath(logJson: EditLogOp[], targetPath: string): AtomicChange | null {
  const allChanges = getAllAtomicChanges(logJson);
  // 从后往前找，找到的第一个就是最新的
  for (let i = allChanges.length - 1; i >= 0; i--) {
    if (allChanges[i].path === targetPath) {
      return allChanges[i];
    }
  }
  return null;
}
