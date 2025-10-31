/**
 * @file Runtime 对象的 Zod Schema 定义
 */
import { z } from 'zod';

// --- 从 schema.ts 复制的共享 Schema 定义 ---

const TimeUnitSchema = z.enum(['period', 'day', 'week', 'month', 'season', 'year']);
export type TimeUnit = z.infer<typeof TimeUnitSchema>;

export const ForgettingRuleSchema = z.object({
  triggerFlag: z.string(),
  decrease: z.number(),
});
export type ForgettingRule = z.infer<typeof ForgettingRuleSchema>;

export const AffectionStageWithForgetSchema = z
  .object({
    threshold: z.number(),
    name: z.string(),
    patienceUnit: TimeUnitSchema.optional(),
    visit: z
      .object({
        enabled: z.boolean().optional(),
        probBase: z.number().optional(),
        probK: z.number().optional(),
        coolUnit: TimeUnitSchema.optional(),
      })
      .optional(),
    forgettingSpeed: z.array(ForgettingRuleSchema).optional(),
  })
  .passthrough();
export type AffectionStageWithForget = z.infer<typeof AffectionStageWithForgetSchema>;

export const CharacterForgettingInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  affectionStages: z.array(AffectionStageWithForgetSchema),
});
export type CharacterForgettingInfo = z.infer<typeof CharacterForgettingInfoSchema>;

const ClockAckSchema = z.object({
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

export const IncidentDetailSchema = z.object({
  异变细节: z.string(),
  主要地区: z.array(z.string()),
  异变退治者: z.union([z.string(), z.array(z.string())]).optional(),
  异变已结束: z.boolean(),
});
export type IncidentDetail = z.infer<typeof IncidentDetailSchema>;

const ActionSchema = z.object({
  do: z.string(),
  to: z.string().optional(),
  source: z.string().optional(),
});
export type Action = z.infer<typeof ActionSchema>;

// --- Runtime Schema 定义 ---

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

const ClockFlagsSchema = z.object({
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

const ClockSchema = z.object({
  now: NowSchema,
  flags: ClockFlagsSchema,
});

export const TimeProcessorResultSchema = z.object({
  clock: ClockSchema,
  newClockAck: ClockAckSchema.nullable(),
});
export type TimeProcessorResult = z.infer<typeof TimeProcessorResultSchema>;

export const EMPTY_NOW: z.infer<typeof NowSchema> = {
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

const IncidentRuntimeInfoSchema = z.object({
  name: z.string(),
  detail: z.string(),
  solver: z.array(z.string()),
  mainLoc: z.array(z.string()),
  isFinished: z.boolean(),
  raw: IncidentDetailSchema,
});
export type IncidentRuntimeInfo = z.infer<typeof IncidentRuntimeInfoSchema>;

const IncidentSchema = z.object({
  decision: z.enum(['continue', 'start_new', 'daily']),
  current: IncidentRuntimeInfoSchema.optional(),
  spawn: IncidentRuntimeInfoSchema.optional(),
  remainingCooldown: z.number().optional(),
  isIncidentActive: z.boolean(),
});

const CurrentFestivalInfoSchema = z.object({
  name: z.string(),
  host: z.string(),
  customs: z.array(z.string()),
  month: z.number(),
  start_day: z.number(),
  end_day: z.number(),
});

const NextFestivalInfoSchema = CurrentFestivalInfoSchema.extend({
  days_until: z.number(),
});

export const FestivalSchema = z.object({
  ongoing: z.boolean(),
  upcoming: z.boolean(),
  current: CurrentFestivalInfoSchema.nullable(),
  next: NextFestivalInfoSchema.nullable(),
});

export const CharacterRuntimeSchema = z.object({
  affectionStage: AffectionStageWithForgetSchema.optional(),
  decision: ActionSchema.optional(),
  companionDecision: ActionSchema.optional(),
});
export type CharacterRuntime = z.infer<typeof CharacterRuntimeSchema>;

const CharacterLogSchema = z
  .object({
    forgettingInfo: z.array(CharacterForgettingInfoSchema),
  })
  .passthrough();

const BfsPathSchema = z.object({
  hops: z.number(),
  steps: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
    }),
  ),
});
export type BfsPath = z.infer<typeof BfsPathSchema>;

const RouteSchema = z.object({
  destination: z.string(),
  path: BfsPathSchema,
});
export type Route = z.infer<typeof RouteSchema>;

const RouteInfoSchema = z.object({
  candidates: z.array(z.string()),
  routes: z.array(RouteSchema),
});
export type RouteInfo = z.infer<typeof RouteInfoSchema>;

// 最终的 Runtime Schema
export const RuntimeSchema = z.object({
  incident: IncidentSchema.optional(),
  clock: ClockSchema.optional(),
  graph: z.record(z.string(), z.record(z.string(), z.boolean())).optional(),
  legal_locations: z.array(z.string()).optional(),
  neighbors: z.array(z.string()).optional(),
  loadArea: z.array(z.string()).optional(),
  route: RouteInfoSchema.optional(),
  festival: FestivalSchema.optional(),
  character: z
    .object({
      chars: z.record(z.string(), CharacterRuntimeSchema),
      partitions: z.object({
        coLocated: z.array(z.string()),
        remote: z.array(z.string()),
      }),
    })
    .optional(),
  characterLog: CharacterLogSchema.optional(),
});

// 从 Schema 推断出 TypeScript 类型
export type Runtime = z.infer<typeof RuntimeSchema>;
