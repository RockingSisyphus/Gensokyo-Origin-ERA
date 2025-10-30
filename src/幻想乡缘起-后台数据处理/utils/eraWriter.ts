import { Logger } from './log';

const logger = new Logger();

/**
 * @description 通过 era:updateByPath 事件更新 ERA 变量。
 * @param {string} path - 要更新的变量的路径，例如 'config.ui.mainFontPercent'。
 * @param {any} value - 要设置的新值。
 */
export function updateEraVariable(path: string, value: any) {
  const funcName = 'updateEraVariable';
  if (!path || typeof path !== 'string') {
    logger.warn(funcName, '调用失败：path 无效。', { path });
    return;
  }

  const eventData = {
    path,
    value,
  };

  try {
    logger.debug(funcName, `准备发送 era:updateByPath 事件`, eventData);
    eventEmit('era:updateByPath', eventData);
  } catch (e) {
    logger.error(funcName, '发送 era:updateByPath 事件时出现异常', e);
  }
}
