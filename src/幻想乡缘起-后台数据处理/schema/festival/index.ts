import { z } from 'zod';
import { PreprocessStringifiedObject } from '../../utils/zod';

const FestivalDefinitionSchema = z.object({
  name: z.string(),
  month: z.number(),
  start_day: z.number(),
  end_day: z.number(),
  host: z.string().optional(),
  customs: z.array(z.string()).optional(),
});

export const FestivalsListSchema = z.array(PreprocessStringifiedObject(FestivalDefinitionSchema)).default([]);
