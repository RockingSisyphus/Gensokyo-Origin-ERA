/**
 * @file 角色设置处理器核心逻辑
 */
import type { Stat } from '../../schema/stat';
import type { CharacterSettings, CharacterSettingsMap } from '../../schema/character-settings';
import { getCharAffectionStages, getCharRoutine, getCharSpecials } from './accessors';

/**
 * 从 stat 中提取并处理所有角色的设置信息。
 * @param stat - 经过 Zod 验证的 stat 对象。
 * @returns 一个包含所有角色设置的映射表。
 */
export function processCharacterSettings({ stat }: { stat: Stat }): CharacterSettingsMap {
  const settingsMap: CharacterSettingsMap = {};

  // 确保 stat.chars 存在
  if (!stat.chars) {
    return settingsMap;
  }

  // 遍历所有角色
  for (const charId in stat.chars) {
    const character = stat.chars[charId];
    if (!character) continue;

    // 获取该角色的好感度等级表 (如果角色未定义，则自动回退到全局默认值)
    const affectionStages = getCharAffectionStages(stat, charId);
    // 获取角色的特殊行动
    const specials = getCharSpecials(stat, charId);
    // 获取角色的日常行动
    const routine = getCharRoutine(stat, charId);

    // 构建该角色的设置对象
    const settings: CharacterSettings = {
      id: charId,
      name: character.name,
      affectionStages: affectionStages,
      specials: specials,
      routine: routine,
    };

    settingsMap[charId] = settings;
  }

  return settingsMap;
}
