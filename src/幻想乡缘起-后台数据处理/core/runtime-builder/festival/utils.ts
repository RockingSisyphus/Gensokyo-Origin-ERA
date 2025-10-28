/**
 * @file 节日计算的小工具函数
 */

'use strict';

/**
 * 月份天数（非闰年）
 */
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * 计算给定月、日是一年中的第几天。
 * @param month - 月份 (1-12)
 * @param day - 日 (1-31)
 * @returns {number} - 一年中的第几天 (1-365)
 */
export function dayOfYear(month: number, day: number): number {
  let dayIndex = 0;
  for (let i = 0; i < month - 1; i++) {
    dayIndex += MONTH_DAYS[i];
  }
  return dayIndex + day;
}

/**
 * 安全地将值转换为数字。
 * @param value - 任何值
 * @param fallback - 如果转换失败的默认值
 * @returns {number}
 */
export function toNumber(value: any, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
