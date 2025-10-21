import { get } from './format';
import { Logger } from './logger';
import { ERA_VARIABLE_PATH } from './constants';

const logger = new Logger('runtime');

/**
 * @description 从聊天作用域的 runtime 对象中读取指定路径的变量。
 * @param {string} path - 要读取的变量路径，相对于 runtime 对象。
 * @param {T} [defaultValue] - 如果路径不存在或无效，返回的默认值。
 * @returns {T | undefined} 读取到的值或默认值。
 */
export function getRuntimeVar<T>(path: string, defaultValue?: T): T | undefined {
  const funcName = 'getRuntimeVar';
  try {
    if (typeof getVariables !== 'function') {
      logger.warn(funcName, 'getVariables 函数不可用。');
      return defaultValue;
    }
    const chatVars = getVariables({ type: 'chat' });
    const runtimePath = `${ERA_VARIABLE_PATH.RUNTIME_PREFIX}${path}`;
    const value = get(chatVars, runtimePath, defaultValue);
    logger.log(funcName, `从 chat.runtime 读取: ${path}`, { value });
    return value;
  } catch (error) {
    logger.error(funcName, `读取 runtime 变量失败: ${path}`, error);
    return defaultValue;
  }
}

/**
 * @description 更新聊天作用域的 runtime 对象中指定路径的变量。
 * @param {string} path - 要更新的变量路径，相对于 runtime 对象。
 * @param {any} value - 要设置的新值。
 * @returns {Promise<boolean>} 是否更新成功。
 */
export async function setRuntimeVar(path: string, value: any): Promise<boolean> {
  const funcName = 'setRuntimeVar';
  try {
    if (typeof updateVariablesWith !== 'function') {
      logger.error(funcName, 'updateVariablesWith 函数不可用。');
      return false;
    }

    const runtimePath = `${ERA_VARIABLE_PATH.RUNTIME_PREFIX}${path}`;
    logger.log(funcName, `准备更新 chat.runtime: ${path}`, { value });

    await updateVariablesWith(
      (vars: any) => {
        const chatVars = vars || {};
        // 使用 lodash.set 来安全地设置深层嵌套的属性
        _.set(chatVars, runtimePath, value);
        return chatVars;
      },
      { type: 'chat' },
    );

    logger.log(funcName, `成功更新 chat.runtime: ${path}`);
    return true;
  } catch (error) {
    logger.error(funcName, `更新 runtime 变量失败: ${path}`, error);
    return false;
  }
}
