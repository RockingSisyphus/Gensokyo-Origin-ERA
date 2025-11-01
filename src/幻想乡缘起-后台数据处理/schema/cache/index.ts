import { z } from 'zod';
import { ClockAckSchema } from '../clock';

export const CharacterCacheSchema = z.object({
  visit: z
    .object({
      cooling: z.boolean().optional(),
    })
    .optional(),
});
export type CharacterCache = z.infer<typeof CharacterCacheSchema>;

export const IncidentCacheSchema = z.object({
  incidentCooldownAnchor: z.number().nullable().optional(),
});
export type IncidentCache = z.infer<typeof IncidentCacheSchema>;

// Cache 的定义
export const CacheSchema = z.object({
  time: z
    .object({
      clockAck: ClockAckSchema.optional(),
    })
    .optional()
    .default({}),
  incident: IncidentCacheSchema.optional().default({}),
  character: z.record(z.string(), CharacterCacheSchema).optional().default({}),
});

export type Cache = z.infer<typeof CacheSchema>;
