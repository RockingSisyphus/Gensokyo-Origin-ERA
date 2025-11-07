import { z } from 'zod';
import { CacheSchema } from './cache';
import { CharsSchema } from './character';
import { ConfigSchema } from './config';
import { FestivalsListSchema } from './festival';
import { IncidentsSchema } from './incident';
import { UserSchema } from './user';
import { WorldSchema, timeSchema } from './world';

// 最终的 Stat Schema
export const StatSchema = z.object({
  config: ConfigSchema,
  chars: CharsSchema,
  user: UserSchema,
  world: WorldSchema.optional(),
  time: timeSchema,
  cache: CacheSchema.optional(),
  incidents: IncidentsSchema.default({}),
  festivals_list: FestivalsListSchema,
  附加正文: z.string().optional(),
  weather: z.string().optional(),
  文文新闻: z.string().optional(),
});

// 从 Schema 推断出 TypeScript 类型
export type Stat = z.infer<typeof StatSchema>;
