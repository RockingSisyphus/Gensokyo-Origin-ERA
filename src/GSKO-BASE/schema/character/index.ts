import { z } from 'zod';
import { PreprocessStringifiedObject } from '../../utils/zod';
import { AffectionStageWithForgetSchema, EntrySchema } from '../character-settings';

// 基础的角色定义
export const CharacterSchema = z.object({
  name: z.string(),
  好感度: z.number(),
  所在地区: z.string().nullable(),
  居住地区: z.string().nullable(),
  affectionStages: z.array(PreprocessStringifiedObject(AffectionStageWithForgetSchema)).default([]),
  specials: z.array(PreprocessStringifiedObject(EntrySchema)).default([]),
  routine: z.array(PreprocessStringifiedObject(EntrySchema)).default([]),
  目标: z.string().optional(),
});

// Stat.chars 的定义
export const CharsSchema = z.record(z.string(), CharacterSchema);

export type Character = z.infer<typeof CharacterSchema>;
