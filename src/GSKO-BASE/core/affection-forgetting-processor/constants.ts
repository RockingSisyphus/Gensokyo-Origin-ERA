/**
 * @file affection-forgetting-processor 的常量
 */
import { ClockFlagsSchema } from '../../schema/clock';

export const MODULE_NAME = 'affection-forgetting-processor';

// 从 Zod Schema 中动态获取键名，避免硬编码
const clockFlagKeys = ClockFlagsSchema.keyof().enum;

/**
 * 用于检查 triggerFlag 前缀的键名。
 * 完全从 schema 派生，确保类型安全。
 */
export const TRIGGER_FLAG_PREFIX_KEYS = {
  BY_PERIOD: clockFlagKeys.byPeriod,
  BY_SEASON: clockFlagKeys.bySeason,
};

/**
 * 用于拼接 triggerFlag 的前缀字符串
 */
export const FLAG_PREFIX = {
  BY_PERIOD: `${TRIGGER_FLAG_PREFIX_KEYS.BY_PERIOD}.`,
  BY_SEASON: `${TRIGGER_FLAG_PREFIX_KEYS.BY_SEASON}.`,
};
