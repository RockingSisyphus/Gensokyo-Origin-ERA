/**
 * @file 好感度处理器 - 工具函数
 */
import { AffectionStageWithForget } from '../../schema/character-settings';
import { pickAffectionStage } from '../../utils/accessor/affection';
import { PATH_RE } from './constants';

/**
 * 判断给定路径是否为好感度目标路径。
 * @param path - 需检测的路径字符串。
 * @returns {boolean} - 如果是目标路径则返回 true。
 */
export const isTarget = (path: string): boolean => PATH_RE.test(String(path || ''));

/**
 * 根据当前好感度值获取对应的好感度阶段配置。
 * @param affection - 当前的好感度数值。
 * @param stages - 好感度阶段数组。
 * @returns {AffectionStageWithForget | undefined} - 匹配的阶段配置，若不存在则返回 undefined。
 */
export function getCurrentAffectionStage(
  affection: number,
  stages: AffectionStageWithForget[],
): AffectionStageWithForget | undefined {
  return pickAffectionStage(affection, stages);
}
