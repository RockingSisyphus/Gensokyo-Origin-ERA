import { z } from 'zod';

export const UserSchema = z.object({
  姓名: z.string().nullable(),
  身份: z.string().nullable(),
  性别: z.string().nullable(),
  年龄: z.string().nullable(),
  特殊能力: z.string().nullable(),
  所在地区: z.string().nullable(),
  居住地区: z.string().nullable(),
  重要经历: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  人际关系: z.union([z.string(), z.array(z.string())]).optional().nullable(),
});

export const USER_FIELDS = {
  name: '姓名' as const,
  identity: '身份' as const,
  gender: '性别' as const,
  age: '年龄' as const,
  abilities: '特殊能力' as const,
  currentLocation: '所在地区' as const,
  home: '居住地区' as const,
  events: '重要经历' as const,
  relationships: '人际关系' as const,
} as const;
