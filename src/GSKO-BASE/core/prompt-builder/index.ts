import { Logger } from '../../utils/log';
import { buildAyaNewsPrompt } from './aya-news';
import { buildCharacterMovementPrompt } from './character-movement';
import { buildCoLocatedCharactersPrompt } from './co-located-characters';
import { buildCoLocatedCharsAffectionPrompt } from './co-located-characters-affection';
import { buildCompanionDecisionPrompt } from './companion-decision';
import { buildFestivalPrompt } from './festival';
import { buildLegalLocationsPrompt } from './legal-locations';
import { buildMainCharacterPrompt } from './main-character';
import { buildRoutePrompt } from './route';
import { buildTimePrompt } from './time';
import { buildWeatherPrompt } from './weather';

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
  prompts.push('<剧情编写基准>');
  prompts.push('**以下为编写最新剧情的**核心基准**，你编写的剧情必须严格遵守以下设定。**');
  // 构建时间提示词
  const timePrompt = buildTimePrompt({ runtime });
  if (timePrompt) {
    prompts.push(timePrompt);
  }

  // 添加天气提示词（紧随时间模块之后）
  const weatherPrompt = buildWeatherPrompt({ runtime });
  if (weatherPrompt) {
    prompts.push(weatherPrompt);
  }

  // 构建节日提示词
  const festivalPrompts = buildFestivalPrompt({ runtime });
  if (festivalPrompts.length > 0) {
    prompts.push(...festivalPrompts);
  }

  prompts.push('**以上为编写最新剧情的**核心基准**，你编写的剧情必须严格遵守以下设定。**');
  prompts.push('</剧情编写基准>');

  prompts.push('<沉浸感核心>');
  prompts.push('**为了提高你编写的剧情的沉浸感，请参考以下内容编写最新剧情。**');

  // 构建路线提示词
  const routePrompt = buildRoutePrompt({ runtime, stat });
  if (routePrompt) {
    prompts.push(routePrompt);
  }

  // 构建角色移动提示词
  const characterMovementPrompts = buildCharacterMovementPrompt({ runtime, stat });
  if (characterMovementPrompts.length > 0) {
    prompts.push(...characterMovementPrompts);
  }
  // 构建同区角色好感度提示词
  const coLocatedCharsAffectionPrompt = buildCoLocatedCharsAffectionPrompt({ runtime, stat });
  if (coLocatedCharsAffectionPrompt) {
    prompts.push(coLocatedCharsAffectionPrompt);
  }
  // 构建相伴角色决策提示词
  const companionDecisionPrompt = buildCompanionDecisionPrompt({ runtime, stat });
  if (companionDecisionPrompt) {
    prompts.push(companionDecisionPrompt);
  }

  prompts.push('**为了提高你编写的剧情的沉浸感，请参考以上内容编写最新剧情。**');
  prompts.push('</沉浸感核心>');

  prompts.push('<本轮需更新的ERA变量>');
  prompts.push('**以下是你应当在本轮参照ERA变量更新规则更新的变量及其结构。**');
  // 构建文文新闻提示词
  const ayaNewsPrompt = buildAyaNewsPrompt(runtime);
  if (ayaNewsPrompt) {
    prompts.push(ayaNewsPrompt);
  }

  // 构建合法地点提示词
  const legalLocationsPrompt = buildLegalLocationsPrompt({ runtime });
  if (legalLocationsPrompt) {
    prompts.push(legalLocationsPrompt);
  }

  // 主角状态提示词
  const mainCharacterPrompt = buildMainCharacterPrompt({ stat });
  if (mainCharacterPrompt) {
    prompts.push(mainCharacterPrompt);
  }

  // 构建同区角色提示词
  const coLocatedCharactersPrompt = buildCoLocatedCharactersPrompt({ runtime, stat });
  if (coLocatedCharactersPrompt) {
    prompts.push(coLocatedCharactersPrompt);
  }

  prompts.push('**以上是你应当在本轮参照ERA变量更新规则更新的变量及其结构。**');
  prompts.push('</本轮需更新的ERA变量>');
  const finalPrompt = prompts.join('\n\n');

  logger.debug(funcName, '提示词构建完毕。');
  return finalPrompt;
}
