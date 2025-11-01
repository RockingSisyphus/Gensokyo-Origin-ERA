import { z } from 'zod';
import { PreprocessStringifiedObject } from '../../utils/zod';

// Stat.world 的定义
const MapGraphSchema = z.object({
  tree: z.record(z.string(), z.any()),
  edges: z
    .array(
      PreprocessStringifiedObject(
        z.object({
          a: z.string(),
          b: z.string(),
        }),
      ),
    )
    .optional(),
  aliases: z.record(z.string(), z.array(z.string())).optional(),
});
export type MapGraph = z.infer<typeof MapGraphSchema>;

export const WorldSchema = z
  .object({
    map_graph: MapGraphSchema.optional(),
    fallbackPlace: z.string().default('博丽神社'),
    // 允许其他未知属性
  })
  .passthrough();

export const 世界Schema = z
  .object({
    timeProgress: z.number(),
  })
  .passthrough();
