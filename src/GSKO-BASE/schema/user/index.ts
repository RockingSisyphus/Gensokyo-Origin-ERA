import { z } from "zod";

export const UserSchema = z.object({
  姓名: z.string().nullable(),
  所在地区: z.string().nullable(),
  居住地区: z.string().nullable(),
});

export const USER_FIELDS = {
  name: "姓名" as const,
  currentLocation: "所在地区" as const,
  home: "居住地区" as const,
} as const;
