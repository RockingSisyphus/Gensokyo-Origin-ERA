import { z } from 'zod';
import { ClockAckSchema } from './clock';
import { ClockSchema } from './runtime';

export const TimeProcessorResultSchema = z.object({
  clock: ClockSchema,
  newClockAck: ClockAckSchema.nullable(),
});
export type TimeProcessorResult = z.infer<typeof TimeProcessorResultSchema>;
