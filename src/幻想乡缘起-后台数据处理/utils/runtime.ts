import _ from 'lodash';
import { Runtime, RuntimeSchema } from '../schema/runtime';
import { ERA_VARIABLE_PATH } from './constants';
import { Logger } from './log';

const logger = new Logger();

/**
 * @description 获取一个全新的、符合 RuntimeSchema 的 runtime 对象。
 * @returns {Runtime} 一个经过 Zod 解析的、类型安全的 runtime 对象。
 */
export function getRuntimeObject(): Runtime {
  // 通过解析一个空对象，Zod 会根据 schema 创建一个包含所有 optional 字段的默认结构。
  // 这确保了 runtime 从一开始就具有正确的类型和结构。
  return RuntimeSchema.parse({});
}

/**
 * @description 将传入的对象设置为聊天作用域的完整 runtime 对象。
 * @param {Runtime} runtimeObject - 新的 runtime 对象。
 * @param {{ mode: 'merge' | 'replace' }} [options] - 写入模式配置。'replace' (默认) 会完全替换, 'merge' 会合并新旧对象。
 * @returns {Promise<boolean>} 是否设置成功。
 */
export async function setRuntimeObject(
  runtimeObject: Runtime,
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
