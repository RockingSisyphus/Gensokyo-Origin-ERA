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
    aliases: z.array(z.string()).default([]),
  })
  .passthrough();
export type MapLeaf = z.infer<typeof MapLeafSchema>;

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

export const WORLD_DEFAULTS = {
  fallbackPlace: '博丽神社' as const,
  mainStoryTag: 'gensokyo' as const,
} as const;

export const WorldSchema = z
  .object({
    map_graph: MapGraphSchema.optional(),
    fallbackPlace: z.string().default(WORLD_DEFAULTS.fallbackPlace),
  })
  .passthrough();

export const 世界Schema = z
  .object({
    timeProgress: z.number(),
  })
  .passthrough();
