import { Cache } from '../../schema/cache';
import { TimeConfig } from '../../schema/config';
import { ClockAck } from '../../schema/clock';
import { Clock, Runtime } from '../../schema/runtime';
import { TimeProcessorResult } from '../../schema/time-processor-result';
import { Stat } from '../../schema/stat';

// --- Getters ---

/**
 * Safely retrieves the time configuration from the stat object.
 * Relies on the Zod schema default to ensure the object exists.
 * @param stat The main stat object.
 * @returns The time configuration.
 */
export function getTimeConfig(stat: Stat): TimeConfig {
  return stat.config.time;
}

/**
 * Safely retrieves the time progress in minutes from the stat object.
 * @param stat The main stat object.
 * @returns The time progress in minutes.
 */
export function getTimeProgress(stat: Stat): number {
  return stat.世界.timeProgress;
}

/**
 * Safely retrieves the clock acknowledgement from the cache.
 * @param cache The cache object.
 * @returns The clock acknowledgement object, or undefined if not present.
 */
export function getClockAck(cache: Cache): ClockAck | undefined {
  return cache.time?.clockAck;
}

/**
 * Safely retrieves the entire clock object from the runtime.
 * @param runtime The runtime object.
 * @returns The clock object, or undefined if not present.
 */
export function getClock(runtime: Runtime): Clock | undefined {
  return runtime.clock;
}

// --- Writers ---

interface WriteTimeResultParams {
  runtime: Runtime;
  cache: Cache;
  result: TimeProcessorResult;
}

/**
 * Writes the result of the time processor to the runtime and cache objects
 * in a type-safe manner.
 * @param {WriteTimeResultParams} params - The parameters object.
 */
export function writeTimeProcessorResult({ runtime, cache, result }: WriteTimeResultParams): void {
  if (result.clock) {
    runtime.clock = result.clock;
  }

  // Ensure the cache.time object exists before assignment
  if (!cache.time) {
    cache.time = {};
  }
  // Assign the new clock ack, converting null to undefined to match the target type.
  cache.time.clockAck = result.newClockAck ?? undefined;
}
