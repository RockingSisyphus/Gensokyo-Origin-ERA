import { clampTimeChatMkAnchors } from './anchor-limiter';
import { syncTimeChatMkAnchors, type SyncParams, type SyncResult } from './sync';

export { clampTimeChatMkAnchors, syncTimeChatMkAnchors };

export interface ProcessTimeChatMkSyncParams extends SyncParams {
  selectedMks: (string | null)[] | null | undefined;
}

export type ProcessTimeChatMkSyncResult = SyncResult;

export function processTimeChatMkSync({
  stat,
  runtime,
  mk,
  selectedMks,
}: ProcessTimeChatMkSyncParams): ProcessTimeChatMkSyncResult {
  const syncResult = syncTimeChatMkAnchors({ stat, runtime, mk });
  const finalRuntime = clampTimeChatMkAnchors({
    runtime: syncResult.runtime,
    stat: syncResult.stat,
    selectedMks: selectedMks ?? [],
    mk,
  });

  return { stat: syncResult.stat, runtime: finalRuntime };
}
