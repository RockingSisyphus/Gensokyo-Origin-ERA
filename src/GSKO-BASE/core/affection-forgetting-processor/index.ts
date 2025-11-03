import type { Runtime } from '../../schema/runtime';
import type { Stat } from '../../schema/stat';
import type { ChangeLogEntry } from '../../schema/change-log-entry';
import { processAffectionForgettingInternal } from './processor';

export interface ProcessAffectionForgettingParams {
  stat: Stat;
  runtime: Runtime;
  mk: string | null | undefined;
  selectedMks: (string | null)[] | null | undefined;
  currentMessageId: number | null | undefined;
}

export interface ProcessAffectionForgettingResult {
  stat: Stat;
  runtime: Runtime;
  changes: ChangeLogEntry[];
}

export async function processAffectionForgetting({
  stat,
  runtime,
  mk,
  selectedMks,
  currentMessageId,
}: ProcessAffectionForgettingParams): Promise<ProcessAffectionForgettingResult> {
  return processAffectionForgettingInternal({ stat, runtime, mk, selectedMks, currentMessageId });
}
