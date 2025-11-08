import { z } from 'zod';
import { PreprocessStringifiedObject } from '../../utils/zod';

export const FestivalDefinitionSchema = z.object({
  month: z.number(),
  start_day: z.number(),
  end_day: z.number(),
  name: z.string(),
  type: z.string(),
  customs: z.array(z.string()),
  importance: z.number(),
  host: z.string(),
});

/**
 * 处理后单个节日对象的 schema，包含一个可选的 ID。
 */
export const FestivalSchema = FestivalDefinitionSchema.extend({
  id: z.string().optional(),
});

export type Festival = z.infer<typeof FestivalSchema>;

/**
 * 用于处理节日列表的 schema。
 * festivals_list 现在是一个对象，其键是节日的唯一 ID（例如 'NEW_YEAR'），
 * 值是节日的定义对象。
 */
export const FestivalsListSchema = z
  .record(z.string(), PreprocessStringifiedObject(FestivalDefinitionSchema))
  .default({});
