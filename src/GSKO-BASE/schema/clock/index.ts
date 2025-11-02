import { z } from 'zod';
import { TimeChatMkAnchorsSchema } from '../time-chat-mk-sync';
import { TIME_PERIOD_KEYS, TIME_SEASON_KEYS } from '../time/constants';

// --- Constants ---
export const BY_PERIOD_KEYS = TIME_PERIOD_KEYS;

export const BY_SEASON_KEYS = TIME_SEASON_KEYS;

// --- Schemas ---

export const ClockAckSchema = z.object({
  dayID: z.number(),
  weekID: z.number(),
  monthID: z.number(),
  yearID: z.number(),
  periodID: z.number(),
  periodIdx: z.number(),
  seasonID: z.number(),
  seasonIdx: z.number(),
});
export type ClockAck = z.infer<typeof ClockAckSchema>;

export const NowSchema = z.object({
  iso: z.string(),
  year: z.number(),
  month: z.number(),
  day: z.number(),
  weekdayIndex: z.number(),
  weekdayName: z.string(),
  periodName: z.string(),
  periodIdx: z.number(),
  minutesSinceMidnight: z.number(),
  seasonName: z.string(),
  seasonIdx: z.number(),
  hour: z.number(),
  minute: z.number(),
  hm: z.string(),
});
export type Now = z.infer<typeof NowSchema>;

export const ClockFlagsSchema = z.object({
  newPeriod: z.boolean(),
  byPeriod: z.object({
    newDawn: z.boolean(),
    newMorning: z.boolean(),
    newNoon: z.boolean(),
    newAfternoon: z.boolean(),
    newDusk: z.boolean(),
    newNight: z.boolean(),
    newFirstHalfNight: z.boolean(),
    newSecondHalfNight: z.boolean(),
  }),
  newDay: z.boolean(),
  newWeek: z.boolean(),
  newMonth: z.boolean(),
  newSeason: z.boolean(),
  bySeason: z.object({
    newSpring: z.boolean(),
    newSummer: z.boolean(),
    newAutumn: z.boolean(),
    newWinter: z.boolean(),
  }),
  newYear: z.boolean(),
});
export type ClockFlags = z.infer<typeof ClockFlagsSchema>;

// 时间推进的六个根节点 flag，代表“新时段/新日/新周/新月/新季节/新年”
export const CLOCK_ROOT_FLAG_KEYS = ['newPeriod', 'newDay', 'newWeek', 'newMonth', 'newSeason', 'newYear'] as const;
export type ClockRootFlagKey = (typeof CLOCK_ROOT_FLAG_KEYS)[number];

export const ClockSchema = z.object({
  now: NowSchema,
  flags: ClockFlagsSchema,
  mkAnchors: TimeChatMkAnchorsSchema.optional(),
  previousMkAnchors: TimeChatMkAnchorsSchema.optional(),
});
export type Clock = z.infer<typeof ClockSchema>;

// --- Empty/Default Values ---

export const EMPTY_NOW: Now = {
  iso: '',
  year: 0,
  month: 0,
  day: 0,
  weekdayIndex: 0,
  weekdayName: '',
  periodName: '',
  periodIdx: 0,
  minutesSinceMidnight: 0,
  seasonName: '',
  seasonIdx: 0,
  hour: 0,
  minute: 0,
  hm: '',
};

export const EMPTY_FLAGS: ClockFlags = {
  newPeriod: false,
  byPeriod: {
    newDawn: false,
    newMorning: false,
    newNoon: false,
    newAfternoon: false,
    newDusk: false,
    newNight: false,
    newFirstHalfNight: false,
    newSecondHalfNight: false,
  },
  newDay: false,
  newWeek: false,
  newMonth: false,
  newSeason: false,
  bySeason: {
    newSpring: false,
    newSummer: false,
    newAutumn: false,
    newWinter: false,
  },
  newYear: false,
};
