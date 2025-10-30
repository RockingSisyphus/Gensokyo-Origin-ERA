import _ from 'lodash';
import { ERA_VARIABLE_PATH } from './constants';
import { Logger } from './log';

const logger = new Logger();

/**
 * @description 获取一个全新的、空的 runtime 对象。
 * @returns {object} 一个空对象。
 */
export function getRuntimeObject(): object {
  // 始终返回一个新对象，以确保 runtime 的纯粹临时性。
  return {};
}

/**
 * @description 将传入的对象设置为聊天作用域的完整 runtime 对象。
 * @param {object} runtimeObject - 新的 runtime 对象。
 * @param {{ mode: 'merge' | 'replace' }} [options] - 写入模式配置。'replace' (默认) 会完全替换, 'merge' 会合并新旧对象。
 * @returns {Promise<boolean>} 是否设置成功。
 */
export async function setRuntimeObject(
  runtimeObject: object,
  options?: { mode: 'merge' | 'replace' },
): Promise<boolean> {
  const funcName = 'setRuntimeObject';
  const { mode = 'replace' } = options || {}; // 默认为 'replace'

  try {
    if (typeof updateVariablesWith !== 'function') {
      logger.error(funcName, 'updateVariablesWith 函数不可用。');
      return false;
    }

    const runtimePrefix = ERA_VARIABLE_PATH.RUNTIME_PREFIX.slice(0, -1); // 移除末尾的点
    logger.debug(funcName, `准备设置 chat.runtime (mode: ${mode})`, { runtimeObject });

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

    logger.debug(funcName, '成功设置 chat.runtime');
    return true;
  } catch (error) {
    logger.error(funcName, '设置 runtime 对象失败', error);
    return false;
  }
}
