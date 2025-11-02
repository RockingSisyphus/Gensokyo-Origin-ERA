import { z } from 'zod';
import { PreprocessStringifiedObject } from '../../utils/zod';

export const MapSizeSchema = z.object({
  width: z.number(),
  height: z.number(),
});

const MapPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const MapLeafSchema = z
  .object({
    pos: MapPositionSchema,
    htmlEle: z.string(),
  })
  .passthrough();
export type MapLeaf = z.infer<typeof MapLeafSchema>;

// 定义包含地名和完整属性的叶节点类型
export type FullMapLeaf = MapLeaf & { name: string };

export interface MapTreeNode {
  [key: string]: MapLeaf | MapTreeNode;
}

const MapTreeSchema: z.ZodType<MapTreeNode> = z.lazy(() =>
  z.record(z.string(), z.union([MapLeafSchema, MapTreeSchema])),
);

export const MapGraphSchema = z.object({
  mapSize: MapSizeSchema,
  tree: MapTreeSchema,
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
    // allow other unknown properties for forward compatibility
  })
  .passthrough();

export const 世界Schema = z
  .object({
    timeProgress: z.number(),
  })
  .passthrough();
