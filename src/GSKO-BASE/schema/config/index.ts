/**
 * @file 定义了 stat.config 对象的 Zod Schema
 */
import { z } from 'zod';
import { PreprocessStringifiedObject } from '../../utils/zod';
import { AffectionStageWithForgetSchema } from '../character-settings';
import { BY_PERIOD_KEYS, BY_SEASON_KEYS } from '../clock';

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
const FlagHistoryLimitSchema = z.number().int().min(0);

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

const SeasonFlagHistoryLimitSchema = z
  .object({
    newSpring: FlagHistoryLimitSchema,
    newSummer: FlagHistoryLimitSchema,
    newAutumn: FlagHistoryLimitSchema,
    newWinter: FlagHistoryLimitSchema,
  })
  .partial()
  .default({});

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

export const TimeConfigSchema = z.object({
  epochISO: z.string().datetime({ message: '无效的 ISO 8601 日期时间格式' }),
  periodNames: z.array(z.string()).length(8, { message: 'periodNames 必须有 8 个元素' }),
  periodKeys: z.array(z.string()).length(8, { message: 'periodKeys 必须有 8 个元素' }),
  seasonNames: z.array(z.string()).length(4, { message: 'seasonNames 必须有 4 个元素' }),
  seasonKeys: z.array(z.string()).length(4, { message: 'seasonKeys 必须有 4 个元素' }),
  weekNames: z.array(z.string()).length(7, { message: 'weekNames 必须有 7 个元素' }),
  flagHistoryLimits: TimeFlagHistoryLimitsSchema,
});
export type TimeConfig = z.infer<typeof TimeConfigSchema>;

export const DEFAULT_TIME_CONFIG: TimeConfig = {
  epochISO: '2025-10-24T06:00:00+09:00',
  periodNames: ['清晨', '上午', '中午', '下午', '黄昏', '夜晚', '上半夜', '下半夜'],
  periodKeys: [...BY_PERIOD_KEYS],
  seasonNames: ['春', '夏', '秋', '冬'],
  seasonKeys: [...BY_SEASON_KEYS],
  weekNames: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  flagHistoryLimits: {},
};

// --- Affection Config ---
export const AffectionConfigSchema = z.object({
  affectionStages: z.array(PreprocessStringifiedObject(AffectionStageWithForgetSchema)),
});
export type AffectionConfig = z.infer<typeof AffectionConfigSchema>;

// --- Aggregated Config Schema ---
export const ConfigSchema = z
  .object({
    affection: AffectionConfigSchema,
    time: TimeConfigSchema.default(DEFAULT_TIME_CONFIG),
    incident: IncidentConfigSchema.optional(),
  })
  .passthrough();
export type Config = z.infer<typeof ConfigSchema>;
