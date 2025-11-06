/**
 * @file 定义了 stat.config.ui 对象的 Zod Schema
 */
import { z } from 'zod';

export const UiConfigSchema = z
  .object({
    theme: z.enum(['light', 'dark']).default('light'),
    mainFontPercent: z.number().default(100),
    fontScaleStepPct: z.number().default(10),
  })
  .passthrough();
export type UiConfig = z.infer<typeof UiConfigSchema>;
