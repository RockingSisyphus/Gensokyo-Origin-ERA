import { z } from 'zod';

// Stat.user 的定义
export const UserSchema = z.object({
  姓名: z.string().nullable(),
  所在地区: z.string().nullable(),
  居住地区: z.string().nullable(),
});
