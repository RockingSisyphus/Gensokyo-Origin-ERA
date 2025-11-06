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

export const FestivalsListSchema = z.array(PreprocessStringifiedObject(FestivalDefinitionSchema)).default([]);
