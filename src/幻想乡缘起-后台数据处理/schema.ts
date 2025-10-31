/**
 * @file 全局 Stat 和 Runtime 对象的 Zod Schema 定义
 */
import { z } from 'zod';

// --- 通用/共享 Schema 定义 ---

// 定义好感度阶段中的“忘记速度”规则
export const ForgettingRuleSchema = z.object({
  /**
   * 触发忘记的 flag，对应 runtime.clock.flags 中的键或路径。
   * 例如: 'newDay', 'newWeek', 'byPeriod.newMorning'
   */
  triggerFlag: z.string(),
  /**
   * 好感度下降的值。
   */
  decrease: z.number(),
});
export type ForgettingRule = z.infer<typeof ForgettingRuleSchema>;

const TimeUnitSchema = z.enum(['period', 'day', 'week', 'month', 'season', 'year']);
export type TimeUnit = z.infer<typeof TimeUnitSchema>;

// 继承并扩展基础的好感度阶段定义，加入 forgettingSpeed
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
    // 允许其他未知属性
  })
  .passthrough();
export type AffectionStageWithForget = z.infer<typeof AffectionStageWithForgetSchema>;

// 单个角色最终确定的忘性信息
export const CharacterForgettingInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  affectionStages: z.array(AffectionStageWithForgetSchema),
});
export type CharacterForgettingInfo = z.infer<typeof CharacterForgettingInfoSchema>;

/**
 * @description 描述一次数据变更的日志条目的 Zod Schema。
 */
export const ChangeLogEntrySchema = z.object({
  /** 触发变更的模块名 */
  module: z.string(),
  /** 被修改的数据路径 */
  path: z.string(),
  /** 修改前的值 */
  oldValue: z.any(),
  /** 修改后的值 */
  newValue: z.any(),
  /** 变更原因的简短描述 */
  reason: z.string(),
});

/**
 * @description 从 Schema 推断出的变更日志条目类型。
 */
export type ChangeLogEntry = z.infer<typeof ChangeLogEntrySchema>;

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

const FestivalDefinitionSchema = z.object({
  name: z.string(),
  month: z.number(),
  start_day: z.number(),
  end_day: z.number(),
  host: z.string().optional(),
  customs: z.array(z.string()).optional(),
});

export const CharacterCacheSchema = z.object({
  visit: z
    .object({
      cooling: z.boolean().optional(),
    })
    .optional(),
});
export type CharacterCache = z.infer<typeof CharacterCacheSchema>;

const ActionSchema = z.object({
  do: z.string(),
  to: z.string().optional(),
  source: z.string().optional(),
});
export type Action = z.infer<typeof ActionSchema>;

const EntrySchema = z.object({
  when: z.any(),
  action: ActionSchema,
  priority: z.number().optional(),
});
export type Entry = z.infer<typeof EntrySchema>;

// --- Stat Schema 定义 ---

// 基础的角色定义
const CharacterSchema = z.object({
  name: z.string(),
  好感度: z.number(),
  所在地区: z.string().nullable(),
  居住地区: z.string().nullable(),
  affectionStages: z.array(AffectionStageWithForgetSchema).default([]),
  specials: z.array(EntrySchema).default([]),
  routine: z.array(EntrySchema).default([]),
  目标: z.string().optional(),
});

// Stat.chars 的定义
const CharsSchema = z.record(z.string(), CharacterSchema);

// Stat.user 的定义
const UserSchema = z.object({
  所在地区: z.string().nullable(),
  居住地区: z.string().nullable(),
});

// Stat.incidents 的定义
export const IncidentsSchema = z.record(z.string(), IncidentDetailSchema);
export type Incidents = z.infer<typeof IncidentsSchema>;

// Stat.world 的定义
const MapGraphSchema = z.object({
  tree: z.record(z.string(), z.any()),
  edges: z
    .array(
      z.object({
        a: z.string(),
        b: z.string(),
      }),
    )
    .optional(),
  aliases: z.record(z.string(), z.string()).optional(),
});
export type MapGraph = z.infer<typeof MapGraphSchema>;

const WorldSchema = z
  .object({
    map_graph: MapGraphSchema.optional(),
    fallbackPlace: z.string().default('博丽神社'),
    // 允许其他未知属性
  })
  .passthrough();

// Stat.config 的定义
const IncidentPoolItemSchema = z.object({
  name: z.string(),
  detail: z.string(),
  mainLoc: z.union([z.string(), z.array(z.string())]),
});

export const IncidentConfigSchema = z.object({
  cooldownMinutes: z.number(),
  forceTrigger: z.boolean(),
  isRandomPool: z.boolean(),
  pool: z.array(IncidentPoolItemSchema),
  randomCore: z.array(z.string()),
  randomType: z.array(z.string()),
});
export type IncidentConfig = z.infer<typeof IncidentConfigSchema>;

const TimeConfigSchema = z.object({
  epochISO: z.string(),
  periodNames: z.array(z.string()),
  periodKeys: z.array(z.string()),
  seasonNames: z.array(z.string()),
  seasonKeys: z.array(z.string()),
  weekNames: z.array(z.string()),
});

const ConfigSchema = z
  .object({
    affection: z.object({
      affectionStages: z.array(AffectionStageWithForgetSchema),
    }),
    time: TimeConfigSchema,
    incident: IncidentConfigSchema.optional(),
  })
  .passthrough();

export const IncidentCacheSchema = z.object({
  incidentCooldownAnchor: z.number().nullable(),
});
export type IncidentCache = z.infer<typeof IncidentCacheSchema>;

// Cache 的定义
export const CacheSchema = z.object({
  time: z
    .object({
      clockAck: ClockAckSchema,
    })
    .optional(),
  incident: IncidentCacheSchema.optional(),
  character: z.record(z.string(), CharacterCacheSchema).default({}),
});

// 最终的 Stat Schema
const 世界Schema = z
  .object({
    timeProgress: z.number(),
  })
  .passthrough();

export const StatSchema = z.object({
  config: ConfigSchema,
  chars: CharsSchema,
  user: UserSchema,
  world: WorldSchema.optional(),
  世界: 世界Schema,
  cache: CacheSchema.default({
    character: {},
    incident: { incidentCooldownAnchor: null },
  }),
  incidents: IncidentsSchema.default({}),
  festivals_list: z.array(FestivalDefinitionSchema).default([]),
});

// 从 Schema 推断出 TypeScript 类型
export type Stat = z.infer<typeof StatSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type Cache = z.infer<typeof CacheSchema>;
