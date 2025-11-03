import _ from 'lodash';
import { Runtime } from '../../../schema/runtime';
import { Stat } from '../../../schema/stat';
import { getCharName } from '../../character-processor/accessors';

/**
 * 生成角色移动的提示。
 */
export function buildCharacterMovementPrompt({ runtime, stat }: { runtime: Runtime; stat: Stat }): string[] {
  const playerLocation = runtime.characterDistribution?.playerLocation;
  if (!playerLocation) return [];

  const allChars = runtime.character?.chars;
  if (!allChars) return [];

  const prompts: string[] = [];

  for (const charId in allChars) {
    const charRuntime = allChars[charId];
    const decision = charRuntime.decision;

    // 只处理有确定性决策的角色，忽略同伴决策
    if (!decision) continue;

    const { from, to, do: action } = decision;

    // 跳过没有移动的决策
    if (!from || !to || from === to) continue;

    const charName = getCharName(stat, charId);

    // 情况一：角色进入主角所在地
    if (to === playerLocation && from !== playerLocation) {
      prompts.push(`[${charName}从${from}来到了这里，目的是${action}]`);
    }

    // 情况二：角色从主角所在地离开
    if (from === playerLocation && to !== playerLocation) {
      prompts.push(`[${charName}离开了这里，前往${to}，目的是${action}]`);
    }
  }

  return prompts;
}
