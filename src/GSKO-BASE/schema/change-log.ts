import { z } from 'zod';

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

/**
 * @description 变更日志，由多个变更条目组成的数组。
 */
export const ChangeLogSchema = z.array(ChangeLogEntrySchema);

/**
 * @description 从 Schema 推断出的变更日志类型。
 */
export type ChangeLog = z.infer<typeof ChangeLogSchema>;
