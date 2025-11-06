/**
 * @file 访问器函数，用于从 stat 对象中安全地获取角色设置相关数据。
 */
import type { AffectionStageWithForget, Entry } from '../../schema/character-settings';
import type { Stat } from '../../schema/stat';

/**
 * 获取全局默认的好感度等级表。
 * @param stat - The stat object.
 * @returns The global affection stages array.
 */
export function getGlobalAffectionStages(stat: Stat): AffectionStageWithForget[] {
  return stat.config?.affection?.affectionStages ?? [];
}

/**
 * 获取全局默认的特殊行动条目。
 * @param stat - The stat object.
 * @returns The global specials array.
 */
export function getGlobalSpecials(stat: Stat): Entry[] {
  return stat.config?.specials ?? [];
}

/**
 * 获取全局默认的日常行动条目。
 * @param stat - The stat object.
 * @returns The global routine array.
 */
export function getGlobalRoutine(stat: Stat): Entry[] {
  return stat.config?.routine ?? [];
}

/**
 * 获取指定角色的好感度等级表。
 * 如果角色自定义了等级表，则返回角色的版本；否则返回全局默认版本。
 * @param stat - The stat object.
 * @param charId - The ID of the character.
 * @returns The character's affection stages array.
 */
export function getCharAffectionStages(stat: Stat, charId: string): AffectionStageWithForget[] {
  const charStages = stat.chars?.[charId]?.affectionStages;
  if (charStages && charStages.length > 0) {
    return charStages;
  }
  return getGlobalAffectionStages(stat);
}

/**
 * 获取指定角色的特殊行动列表。
 * @param stat - The stat object.
 * @param charId - The ID of the character.
 * @returns The character's specials array.
 */
export function getCharSpecials(stat: Stat, charId: string): Entry[] {
  const charSpecials = stat.chars?.[charId]?.specials;
  if (charSpecials && charSpecials.length > 0) {
    return charSpecials;
  }
  return getGlobalSpecials(stat);
}

/**
 * 获取指定角色的日常行动列表。
 * @param stat - The stat object.
 * @param charId - The ID of the character.
 * @returns The character's routine array.
 */
export function getCharRoutine(stat: Stat, charId: string): Entry[] {
  const charRoutine = stat.chars?.[charId]?.routine;
  if (charRoutine && charRoutine.length > 0) {
    return charRoutine;
  }
  return getGlobalRoutine(stat);
}
