import { z } from 'zod';
import { PreprocessStringifiedObject } from '../../utils/zod';
import { AffectionStageWithForgetSchema, EntryListPreprocessSchema } from '../character-settings';

export const CharacterSchema = z.object({
  name: z.string(),
  pic: z.string().optional(),
  好感度: z.number(),
  所在地区: z.string().nullable(),
  居住地区: z.string().nullable(),
  affectionStages: z.array(PreprocessStringifiedObject(AffectionStageWithForgetSchema)).default([]),
  specials: EntryListPreprocessSchema.default([]),
  routine: EntryListPreprocessSchema.default([]),
  目标: z.string().optional(),
  性知识: z.string().optional(),
  性经验: z.string().optional(),
  身体状况: z.string().optional(),
  内心想法: z.string().optional(),
  外貌: z.string().optional(),
  衣着: z.string().optional(),
  性格: z.string().optional(),
  性别: z.string().optional(),
  年龄: z.string().optional(),
});

export const CharsSchema = z
  .object({
    $meta: z.any().optional(),
  })
  .catchall(CharacterSchema);

export type Character = z.infer<typeof CharacterSchema>;

export const CHARACTER_FIELDS = {
  affection: '好感度' as const,
  currentLocation: '所在地区' as const,
  home: '居住地区' as const,
} as const;
