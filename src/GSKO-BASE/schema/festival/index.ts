import { z } from 'zod';
import { PreprocessStringifiedObject } from '../../utils/zod';

const FestivalDefinitionSchema = z.object({
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

/**
 * 用于处理节日列表的 schema。
 * 为了向后兼容，它接受两种格式：
 * 1. 新的记录格式（record），其中节日对象由唯一的 ID（例如 'NEW_YEAR'）作为键。
 * 2. 旧的数组格式。
 *
 * transform 函数确保输出始终是节日对象的数组。
 * 对于记录格式，它会将键作为 'id' 属性注入到每个节日对象中。
 * 对于数组格式，节日对象将缺少 'id' 属性。
 */
export const FestivalsListSchema = z
  .union([
    z.array(PreprocessStringifiedObject(FestivalDefinitionSchema)),
    z.record(z.string(), PreprocessStringifiedObject(FestivalDefinitionSchema)),
  ])
  .transform((val): z.infer<typeof FestivalSchema>[] => {
    if (Array.isArray(val)) {
      // 旧格式：直接返回。对象将缺少 `id`。
      return val;
    }
    // 新格式：将记录转换为数组，并将键作为 `id` 注入。
    return Object.entries(val).map(([id, festivalData]) => ({
      ...festivalData,
      id,
    }));
  })
  .default([]);
