import { z } from "zod";
import { PreprocessStringifiedObject } from "../../utils/zod";
import { AffectionStageWithForgetSchema, EntrySchema } from "../character-settings";

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

export const CharsSchema = z.record(z.string(), CharacterSchema);

export type Character = z.infer<typeof CharacterSchema>;

export const CHARACTER_FIELDS = {
  affection: "好感度" as const,
  currentLocation: "所在地区" as const,
  home: "居住地区" as const,
} as const;
