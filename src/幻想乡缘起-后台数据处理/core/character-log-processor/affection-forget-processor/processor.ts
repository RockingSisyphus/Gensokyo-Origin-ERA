/**
 * @file 角色忘性处理器核心逻辑
 */
import type { Stat, CharacterForgettingInfo } from '../../../schema';
import { getCharAffectionStages } from './accessors';

/**
 * 从 stat 中提取并处理所有角色的忘性信息。
 * @param stat - 经过 Zod 验证的 stat 对象。
 * @returns 一个包含所有角色忘性信息的数组。
 */
export function processCharacterForgetting({ stat }: { stat: Stat }): CharacterForgettingInfo[] {
  const results: CharacterForgettingInfo[] = [];

  // 遍历所有角色
  for (const charId in stat.chars) {
    const character = stat.chars[charId];
    if (!character) continue;

    // 获取该角色的好感度等级表
    const affectionStages = getCharAffectionStages(stat, charId);

    // 构建该角色的忘性信息对象
    const forgettingInfo: CharacterForgettingInfo = {
      id: charId,
      name: character.name,
      affectionStages: affectionStages,
    };

    results.push(forgettingInfo);
  }

  return results;
}
