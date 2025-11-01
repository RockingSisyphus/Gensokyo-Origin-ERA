import { z } from 'zod';

export const IncidentDetailSchema = z.object({
  异变细节: z.string(),
  主要地区: z.array(z.string()),
  异变退治者: z.union([z.string(), z.array(z.string())]).optional(),
  异变已结束: z.boolean(),
});
export type IncidentDetail = z.infer<typeof IncidentDetailSchema>;

// Stat.incidents 的定义
export const IncidentsSchema = z.record(z.string(), IncidentDetailSchema);
export type Incidents = z.infer<typeof IncidentsSchema>;
