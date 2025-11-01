/**
 * @file Runtime 对象的 Zod Schema 定义
 */
import { z } from 'zod';
import { AffectionStageWithForgetSchema, CharacterSettingsMapSchema, type Action } from './character-settings';
import { ClockSchema, type Clock } from './clock';
import { IncidentDetailSchema } from './incident';
export { ClockSchema };

const IncidentRuntimeInfoSchema = z.object({
  name: z.string(),
  detail: z.string(),
  solver: z.array(z.string()),
  mainLoc: z.array(z.string()),
  isFinished: z.boolean(),
  raw: IncidentDetailSchema,
});
export type IncidentRuntimeInfo = z.infer<typeof IncidentRuntimeInfoSchema>;

const ActionSchema = z.object({
  do: z.string(),
  to: z.string().optional(),
  source: z.string().optional(),
});

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
  characterLog: z.object({}).passthrough().optional(),
  characterSettings: CharacterSettingsMapSchema.optional(),
});

// 从 Schema 推断出 TypeScript 类型
export type Runtime = z.infer<typeof RuntimeSchema>;
export { type Action, type Clock };
