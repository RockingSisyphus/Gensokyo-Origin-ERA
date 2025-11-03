import { Logger } from '../../utils/log';
import { buildAyaNewsPrompt } from './aya-news';
import { buildCharacterMovementPrompt } from './character-movement';
import { buildCoLocatedCharactersPrompt } from './co-located-characters';
import { buildCompanionDecisionPrompt } from './companion-decision';
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

  // 构建文文新闻提示词
  const ayaNewsPrompt = buildAyaNewsPrompt(runtime);
  if (ayaNewsPrompt) {
    prompts.push(ayaNewsPrompt);
  }

  // 构建相伴角色决策提示词
  const companionDecisionPrompt = buildCompanionDecisionPrompt({ runtime, stat });
  if (companionDecisionPrompt) {
    prompts.push(companionDecisionPrompt);
  }

  // 构建同区角色提示词
  const coLocatedCharactersPrompt = buildCoLocatedCharactersPrompt({ runtime, stat });
  if (coLocatedCharactersPrompt) {
    prompts.push(coLocatedCharactersPrompt);
  }

  // 构建角色移动提示词
  const characterMovementPrompts = buildCharacterMovementPrompt({ runtime, stat });
  if (characterMovementPrompts.length > 0) {
    prompts.push(...characterMovementPrompts);
  }

  const finalPrompt = prompts.join('\n\n');

  logger.debug(funcName, '提示词构建完毕。');
  return finalPrompt;
}
