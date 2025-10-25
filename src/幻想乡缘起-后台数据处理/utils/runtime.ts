import { ERA_VARIABLE_PATH } from './constants';
import { get } from './format';
import { Logger } from './logger';

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

/**
 * @description 从聊天作用域中获取完整的 runtime 对象。
 * @returns {object} runtime 对象，如果不存在则返回一个空对象。
 */
export function getRuntimeObject(): object {
  const funcName = 'getRuntimeObject';
  try {
    if (typeof getVariables !== 'function') {
      logger.warn(funcName, 'getVariables 函数不可用。');
      return {};
    }
    const chatVars = getVariables({ type: 'chat' });
    const runtime = get(chatVars, ERA_VARIABLE_PATH.RUNTIME_PREFIX.slice(0, -1), {}); // 移除末尾的点
    logger.log(funcName, '成功获取 runtime 对象', { runtime });
    return runtime || {};
  } catch (error) {
    logger.error(funcName, '获取 runtime 对象失败', error);
    return {};
  }
}

/**
 * @description 将传入的对象设置为聊天作用域的完整 runtime 对象。
 * @param {object} runtimeObject - 新的 runtime 对象。
 * @param {{ mode: 'merge' | 'replace' }} [options] - 写入模式配置。'merge' (默认) 会合并新旧对象，'replace' 会完全替换。
 * @returns {Promise<boolean>} 是否设置成功。
 */
export async function setRuntimeObject(
  runtimeObject: object,
  options?: { mode: 'merge' | 'replace' },
): Promise<boolean> {
  const funcName = 'setRuntimeObject';
  const { mode = 'merge' } = options || {}; // 默认为 'merge'

  try {
    if (typeof updateVariablesWith !== 'function') {
      logger.error(funcName, 'updateVariablesWith 函数不可用。');
      return false;
    }

    const runtimePrefix = ERA_VARIABLE_PATH.RUNTIME_PREFIX.slice(0, -1); // 移除末尾的点
    logger.log(funcName, `准备设置 chat.runtime (mode: ${mode})`, { runtimeObject });

    await updateVariablesWith(
      (vars: any) => {
        const chatVars = vars || {};
        if (mode === 'replace') {
          // 替换模式：直接用新对象覆盖
          _.set(chatVars, runtimePrefix, runtimeObject);
        } else {
          // 合并模式（默认）：将新对象的属性合并到现有对象
          const existingRuntime = _.get(chatVars, runtimePrefix, {});
          _.merge(existingRuntime, runtimeObject);
          _.set(chatVars, runtimePrefix, existingRuntime);
        }
        return chatVars;
      },
      { type: 'chat' },
    );

    logger.log(funcName, '成功设置 chat.runtime');
    return true;
  } catch (error) {
    logger.error(funcName, '设置 runtime 对象失败', error);
    return false;
  }
}
