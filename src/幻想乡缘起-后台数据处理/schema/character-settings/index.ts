/**
 * @file 定义了与角色设置相关的 Zod Schema，包括好感度、行动等。
 */
import { z } from 'zod';
import { PreprocessStringifiedObject } from '../../utils/zod';

// --- 基础定义 ---

/**
 * 时间单位
 */
export const TimeUnitSchema = z.enum(['period', 'day', 'week', 'month', 'season', 'year']);
export type TimeUnit = z.infer<typeof TimeUnitSchema>;

// --- 好感度与忘性 ---

/**
 * 定义好感度阶段中的“忘记速度”规则
 */
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

/**
 * 继承并扩展基础的好感度阶段定义，加入 forgettingSpeed
 */
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
    forgettingSpeed: z.array(PreprocessStringifiedObject(ForgettingRuleSchema)).optional(),
    /**
     * 好感度增长的软性限制。
     * 当增长值超过 max 时，最终增长值将被调整为 Math.max(增长值 / divisor, max)。
     */
    affectionGrowthLimit: z
      .object({
        /**
         * 增长值的上限阈值。
         */
        max: z.number(),
        /**
         * 当增长值超过 max 时，用于缩减增长值的除数。
         */
        divisor: z.number(),
      })
      .optional(),
  })
  .passthrough();
export type AffectionStageWithForget = z.infer<typeof AffectionStageWithForgetSchema>;

// --- 行动定义 (Routine & Specials) ---

const ActionSchema = z.object({
  do: z.string(),
  to: z.string().optional(),
  source: z.string().optional(),
});
export type Action = z.infer<typeof ActionSchema>;

export const EntrySchema = z.object({
  when: z.any(),
  action: ActionSchema,
  priority: z.number().optional(),
});
export type Entry = z.infer<typeof EntrySchema>;

// --- 角色设置聚合 Schema ---

/**
 * @description 单个角色的设置信息，将被存储在 runtime 中。
 */
export const CharacterSettingsSchema = z.object({
  /**
   * 角色 ID
   */
  id: z.string(),
  /**
   * 角色名称
   */
  name: z.string(),
  /**
   * 角色的好感度阶段定义。
   */
  affectionStages: z.array(AffectionStageWithForgetSchema),
  /**
   * 角色的特殊行动列表。
   */
  specials: z.array(EntrySchema),
  /**
   * 角色的日常行动列表。
   */
  routine: z.array(EntrySchema),
});
export type CharacterSettings = z.infer<typeof CharacterSettingsSchema>;

/**
 * @description 角色设置表的 Zod Schema，以角色 ID 为键。
 */
export const CharacterSettingsMapSchema = z.record(z.string(), CharacterSettingsSchema);
export type CharacterSettingsMap = z.infer<typeof CharacterSettingsMapSchema>;
