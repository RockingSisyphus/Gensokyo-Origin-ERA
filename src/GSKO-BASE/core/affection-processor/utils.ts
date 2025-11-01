/**
 * @file 好感度处理器 - 工具函数
 */
import { AffectionStageWithForget } from '../../schema/character-settings';
import { PATH_RE } from './constants';

/**
 * 检查给定路径是否是好感度目标路径。
 * @param path - 要检查的路径字符串。
 * @returns {boolean} - 如果是目标路径则返回 true。
 */
export const isTarget = (path: string): boolean => PATH_RE.test(String(path || ''));

/**
 * 根据当前好感度值获取对应的好感度阶段配置。
 * @param affection - 当前的好感度值。
 * @param stages - 好感度阶段配置数组。假定该数组已按 threshold 降序排列。
 * @returns {AffectionStageWithForget | undefined} - 匹配的阶段配置，或 undefined。
 */
export function getCurrentAffectionStage(
  affection: number,
  stages: AffectionStageWithForget[],
): AffectionStageWithForget | undefined {
  if (!stages || stages.length === 0) {
    return undefined;
  }
  // 从高到低寻找第一个满足阈值的阶段
  for (const stage of stages) {
    if (affection >= stage.threshold) {
      return stage;
    }
  }
  // 如果没有找到（例如好感度低于所有阈值），返回最低的阶段
  return stages[stages.length - 1];
}
