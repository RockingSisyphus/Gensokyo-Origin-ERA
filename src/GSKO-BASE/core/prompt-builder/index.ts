import { Logger } from '../../utils/log';
import { buildFestivalPrompt } from './festival';
import { buildLegalLocationsPrompt } from './legal-locations';
import { buildRoutePrompt } from './route';
import { buildTimePrompt } from './time';

const logger = new Logger();

/**
 * @description 根据 runtime 和 stat 构建提示词。
 * @param {any} runtime - 运行时对象。
 * @param {any} stat - 状态对象。
 * @returns {string} 构建好的提示词。
 */
export function buildPrompt({ runtime, stat }: { runtime: any; stat: any }): string {
  const funcName = 'buildPrompt';
  logger.debug(funcName, '开始构建提示词...');

  const prompts: string[] = [];

  // 构建时间提示词
  const timePrompt = buildTimePrompt({ runtime });
  if (timePrompt) {
    prompts.push(timePrompt);
  }

  // 构建节日提示词
  const festivalPrompts = buildFestivalPrompt({ runtime });
  if (festivalPrompts.length > 0) {
    prompts.push(...festivalPrompts);
  }

  // 构建路线提示词
  const routePrompt = buildRoutePrompt({ runtime, stat });
  if (routePrompt) {
    prompts.push(routePrompt);
  }

  // 构建合法地点提示词
  const legalLocationsPrompt = buildLegalLocationsPrompt({ runtime });
  if (legalLocationsPrompt) {
    prompts.push(legalLocationsPrompt);
  }

  const finalPrompt = prompts.join('\n\n');

  logger.debug(funcName, '提示词构建完毕。');
  return finalPrompt;
}
