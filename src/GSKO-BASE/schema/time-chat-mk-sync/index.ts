import { z } from 'zod';

// 每个锚点保存的 MK，可以为字符串或 null（尚未同步）
const mkValueSchema = z.string().nullable();

// 时段锚点集合：对应 ClockFlags.byPeriod 内的八个时段
const PeriodAnchorSchema = z
  .object({
    newDawn: mkValueSchema,
    newMorning: mkValueSchema,
    newNoon: mkValueSchema,
    newAfternoon: mkValueSchema,
    newDusk: mkValueSchema,
    newNight: mkValueSchema,
    newFirstHalfNight: mkValueSchema,
    newSecondHalfNight: mkValueSchema,
  })
  .partial()
  .default({});

// 季节锚点集合：对应 ClockFlags.bySeason 内的四个季节
const SeasonAnchorSchema = z
  .object({
    newSpring: mkValueSchema,
    newSummer: mkValueSchema,
    newAutumn: mkValueSchema,
    newWinter: mkValueSchema,
  })
  .partial()
  .default({});

/**
 * 聊天时间锚点结构：
 * - newPeriod/newDay/...：记录最近一次触发对应 flag 时的消息 MK
 * - period/season：进一步记录细分时段、季节对应的 MK
 * 该结构同时用于缓存与运行态，保证锚点状态可持久化与校验。
 */
export const TimeChatMkAnchorsSchema = z
  .object({
    newPeriod: mkValueSchema,
    period: PeriodAnchorSchema,
    newDay: mkValueSchema,
    newWeek: mkValueSchema,
    newMonth: mkValueSchema,
    newSeason: mkValueSchema,
    season: SeasonAnchorSchema,
    newYear: mkValueSchema,
  })
  .partial()
  .default({});

export type TimeChatMkAnchors = z.infer<typeof TimeChatMkAnchorsSchema>;

const createEmptyAnchors = (): TimeChatMkAnchors => ({});

export const TimeChatMkSyncCacheSchema = z
  .object({
    anchors: TimeChatMkAnchorsSchema.optional(),
  })
  .optional()
  .default(() => ({ anchors: createEmptyAnchors() }));

export type TimeChatMkSyncCache = z.infer<typeof TimeChatMkSyncCacheSchema>;

export const TimeChatMkSyncRuntimeSchema = z
  .object({
    anchors: TimeChatMkAnchorsSchema.optional(),
  })
  .optional()
  .default(() => ({ anchors: createEmptyAnchors() }));

export type TimeChatMkSyncRuntime = z.infer<typeof TimeChatMkSyncRuntimeSchema>;
