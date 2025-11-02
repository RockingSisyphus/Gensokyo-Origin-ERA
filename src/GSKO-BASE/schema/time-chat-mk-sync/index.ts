import { z } from 'zod';

const mkValueSchema = z.string().nullable();

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

const SeasonAnchorSchema = z
  .object({
    newSpring: mkValueSchema,
    newSummer: mkValueSchema,
    newAutumn: mkValueSchema,
    newWinter: mkValueSchema,
  })
  .partial()
  .default({});

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
