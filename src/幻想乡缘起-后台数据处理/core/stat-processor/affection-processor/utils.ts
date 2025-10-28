/**
 * @file 好感度处理器 - 工具函数
 */

import { PATH_RE } from './constants';

/**
 * 检查给定路径是否是好感度目标路径。
 * @param path - 要检查的路径字符串。
 * @returns {boolean} - 如果是目标路径则返回 true。
 */
export const isTarget = (path: string): boolean => PATH_RE.test(String(path || ''));
