import { z } from 'zod';
import { ClockAckSchema } from './clock';

// 同区角色的信息
const OtherCharacterInfoSchema = z.object({
  name: z.string(),
  target: z.string(),
});

// 单条新闻条目
export const AyaNewsEntrySchema = z.object({
  /** 地点 */
  location: z.string(),
  /** 该地点的其他角色列表 */
  otherCharacters: z.array(OtherCharacterInfoSchema),
  /** 射命丸文的目标 */
  target: z.string(),
  /** 时间戳 */
  clockAck: ClockAckSchema,
});
export type AyaNewsEntry = z.infer<typeof AyaNewsEntrySchema>;

// 文文新闻的完整结构
export const AyaNewsSchema = z.object({
  entries: z.array(AyaNewsEntrySchema),
});
export type AyaNews = z.infer<typeof AyaNewsSchema>;
