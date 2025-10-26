import { Logger } from '../../utils/log';

const logger = new Logger();

/**
 * @description 根据 runtime 和 stat 构建提示词。
 * @param {any} runtime - 运行时对象。
 * @param {any} stat - 状态对象。
 * @returns {string} 构建好的提示词。
 */
export function buildPrompt(runtime: any, stat: any): string {
  const funcName = 'buildPrompt';
  logger.log(funcName, '开始构建提示词...');

  // TODO: 实现提示词构建逻辑

  const prompt = '';

  logger.log(funcName, '提示词构建完毕。');
  return prompt;
}
