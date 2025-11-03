import _ from 'lodash';
import { Runtime, RuntimeSchema } from '../schema/runtime';
import { Logger } from './log';

const logger = new Logger();

/**
 * Return a fresh runtime object that conforms to RuntimeSchema.
 */
export function getRuntimeObject(): Runtime {
  return RuntimeSchema.parse({});
}

/**
 * Persist runtime changes back to chat variables.
 */
export async function setRuntimeObject(
  runtimeObject: Runtime,
  options?: { mode: 'merge' | 'replace' },
): Promise<boolean> {
  const funcName = 'setRuntimeObject';
  const { mode = 'replace' } = options ?? {};

  try {
    if (typeof updateVariablesWith !== 'function') {
      logger.error(funcName, 'updateVariablesWith is not available.');
      return false;
    }

    logger.debug(funcName, `Writing to chat.runtime (mode: ${mode})`, { runtimeObject });

    await updateVariablesWith(
      (vars: any) => {
        const chatVars = vars || {};
        if (mode === 'replace') {
          chatVars.runtime = runtimeObject;
        } else {
          const existingRuntime = chatVars.runtime ?? {};
          chatVars.runtime = _.merge({}, existingRuntime, runtimeObject);
        }
        return chatVars;
      },
      { type: 'chat' },
    );

    logger.debug(funcName, 'chat.runtime written successfully');
    return true;
  } catch (error) {
    logger.error(funcName, 'Failed to write runtime', error);
    return false;
  }
}
