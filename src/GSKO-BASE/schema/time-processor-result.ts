import type { ClockAck } from './clock';
import type { Clock } from './runtime';

export interface TimeProcessorResult {
  clock: Clock;
  newClockAck: ClockAck | null;
}
