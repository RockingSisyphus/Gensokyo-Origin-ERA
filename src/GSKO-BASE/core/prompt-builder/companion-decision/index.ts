import _ from 'lodash';
import { Runtime } from '../../../schema/runtime';
import { Stat } from '../../../schema/stat';
import { Logger } from '../../../utils/log';
import { getCharName } from '../../character-processor/accessors';

const logger = new Logger();

/**
 * 构建关于相伴角色内心决策的提示词。
 *
 * 这些提示词旨在告诉 AI，尽管角色选择与玩家在一起，但她们内心可能还有别的计划或想法。
 *
 * @param {object} params - 参数对象。
 * @param {Stat} params.stat - 完整的持久层数据，用于获取角色名等静态信息。
 * @param {Runtime} params.runtime - 完整的易失层数据，用于获取角色的相伴决策。
 * @returns {string} - 生成的提示词字符串，如果没有相伴决策则为空字符串。
 */
export function buildCompanionDecisionPrompt({ stat, runtime }: { stat: Stat; runtime: Runtime }): string {
  const funcName = 'buildCompanionDecisionPrompt';
  const characterRuntimes = runtime.character?.chars;

  if (_.isEmpty(characterRuntimes)) {
    return '';
  }

  const prompts: string[] = [];

  // 遍历所有角色的 runtime 信息
  _.forEach(characterRuntimes, (charRuntime, charId) => {
    const decision = charRuntime.companionDecision;

    // 检查是否存在相伴决策
    if (!decision || !decision.do) {
      return; // 如果没有，则跳过此角色
    }

    const charName = getCharName(stat, charId);
    logger.debug(funcName, `角色 ${charName} (${charId}) 存在相伴决策: ${decision.do}`);

    let prompt = `${charName}似乎想做“${decision.do}”`;

    if (decision.to) {
      prompt += `，目标是“${decision.to}”`;
    }

    prompts.push(prompt);
  });

  if (prompts.length === 0) {
    return '';
  }

  // 组合所有提示，并添加总结性的引导句
  const combinedPrompts = prompts.join('；');
  return `\n当前，${combinedPrompts}...但她们觉得和主角呆在一起似乎更有趣。`;
}
