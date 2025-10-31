/**
 * @file 角色忘性处理器的数据访问器
 */
import { Stat, AffectionStageWithForget } from '../../../schema';

/**
 * 获取指定角色的好感度阶段定义。
 * 优先返回角色自身的定义，如果不存在，则返回全局默认定义。
 * @param stat - The stat object.
 * @param charId - The ID of the character.
 * @returns The affection stages for the character.
 */
export function getCharAffectionStages(stat: Stat, charId: string): AffectionStageWithForget[] {
  const character = stat.chars[charId];
  if (character && character.affectionStages) {
    return character.affectionStages;
  }
  return stat.config.affection.affectionStages;
}
