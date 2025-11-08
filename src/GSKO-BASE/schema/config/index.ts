/**
 * @file 定义了 stat.config 对象的 Zod Schema
 */
import { z } from 'zod';
import { PreprocessStringifiedObject } from '../../utils/zod';
import { AffectionStageWithForgetSchema, EntryListPreprocessSchema } from '../character-settings';
import { UiConfigSchema } from '../ui';

// --- Incident Config ---
const IncidentPoolItemSchema = z.object({
  name: z.string(),
  detail: z.string(),
  mainLoc: z.union([z.string(), z.array(z.string())]),
});

export const IncidentConfigSchema = z.object({
  cooldownMinutes: z.number(),
  forceTrigger: z.boolean(),
  isRandomPool: z.boolean(),
  pool: z.array(PreprocessStringifiedObject(IncidentPoolItemSchema)),
  randomCore: z.array(z.string()),
  randomType: z.array(z.string()),
});
export type IncidentConfig = z.infer<typeof IncidentConfigSchema>;

// --- Time Config ---
// 单个 flag 所允许回溯的最大消息数量，单位为“条”（基于 selectedMks 的索引距离）
const FlagHistoryLimitSchema = z.number().int().min(0);

// 细分到“时段”级别的历史限制，每个键对应 ClockFlags.byPeriod 下的具体标志
const PeriodFlagHistoryLimitSchema = z
  .object({
    newDawn: FlagHistoryLimitSchema,
    newMorning: FlagHistoryLimitSchema,
    newNoon: FlagHistoryLimitSchema,
    newAfternoon: FlagHistoryLimitSchema,
    newDusk: FlagHistoryLimitSchema,
    newNight: FlagHistoryLimitSchema,
    newFirstHalfNight: FlagHistoryLimitSchema,
    newSecondHalfNight: FlagHistoryLimitSchema,
  })
  .partial()
  .default({});

// 细分到“季节”级别的历史限制，对应 ClockFlags.bySeason 下的四个季节标志
const SeasonFlagHistoryLimitSchema = z
  .object({
    newSpring: FlagHistoryLimitSchema,
    newSummer: FlagHistoryLimitSchema,
    newAutumn: FlagHistoryLimitSchema,
    newWinter: FlagHistoryLimitSchema,
  })
  .partial()
  .default({});

/**
 * 针对时间相关的所有 flag（包括根节点和细分节点）的历史跨度配置。
 * - newPeriod/newDay/...：根节点 flag 的最大回溯长度
 * - period：时段级别的精细限制，可选
 * - season：季节级别的精细限制，可选
 * 这些配置会被 time-chat-mk-sync 模块读取，用于在运行态对锚点进行兜底修正。
 */
export const TimeFlagHistoryLimitsSchema = z
  .object({
    newPeriod: FlagHistoryLimitSchema.optional(),
    newDay: FlagHistoryLimitSchema.optional(),
    newWeek: FlagHistoryLimitSchema.optional(),
    newMonth: FlagHistoryLimitSchema.optional(),
    newSeason: FlagHistoryLimitSchema.optional(),
    newYear: FlagHistoryLimitSchema.optional(),
    period: PeriodFlagHistoryLimitSchema.optional(),
    season: SeasonFlagHistoryLimitSchema.optional(),
  })
  .default({});
export type TimeFlagHistoryLimits = z.infer<typeof TimeFlagHistoryLimitsSchema>;

/**
 * 时间配置：
 * - epochISO 等基础时间定义用于时间处理器
 * - flagHistoryLimits 用于聊天锚点校验模块，确保历史跨度不超标
 */
export const TimeConfigSchema = z
  .object({
    epochISO: z.string().datetime({ message: '无效的 ISO 8601 日期时间格式' }),
    flagHistoryLimits: TimeFlagHistoryLimitsSchema,
  })
  .passthrough();
export type TimeConfig = z.infer<typeof TimeConfigSchema>;

export const DEFAULT_TIME_CONFIG: TimeConfig = {
  epochISO: '2025-10-24T06:00:00+09:00',
  flagHistoryLimits: {},
};

// --- Affection Config ---
export const AffectionConfigSchema = z.object({
  affectionStages: z.array(PreprocessStringifiedObject(AffectionStageWithForgetSchema)),
  loveThreshold: z.number().optional(),
  hateThreshold: z.number().optional(),
});
export type AffectionConfig = z.infer<typeof AffectionConfigSchema>;

// --- Aggregated Config Schema ---
export const ConfigSchema = z
  .object({
    affection: AffectionConfigSchema,
    specials: EntryListPreprocessSchema.default([]),
    routine: EntryListPreprocessSchema.default([]),
    time: TimeConfigSchema.default(DEFAULT_TIME_CONFIG),
    incident: IncidentConfigSchema.optional(),
    ui: UiConfigSchema,
    mainBodyTags: z.array(z.string()).optional(),
    excludeBodyTags: z.array(z.string()).optional(),
  })
  .passthrough();
export type Config = z.infer<typeof ConfigSchema>;
