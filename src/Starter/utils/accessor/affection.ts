import _ from 'lodash';
import { AffectionStageWithForget } from '../../schema/character-settings';

/**
 * 根据当前好感度返回匹配的好感度阶段。
 * 该函数会自动将传入的阶段按阈值从高到低排序。
 */
export function pickAffectionStage(
  affection: number,
  stages: AffectionStageWithForget[] | undefined,
): AffectionStageWithForget | undefined {
  if (!stages || stages.length === 0) {
    return undefined;
  }

  // 为确保逻辑正确，始终在函数内部对阶段按阈值进行降序排序
  const sortedStages = _.orderBy(stages, ['threshold'], ['desc']);

  for (const stage of sortedStages) {
    if (affection >= stage.threshold) {
      return stage;
    }
  }

  // 如果没有一个阶段的阈值被满足，则返回阈值最低的阶段
  return sortedStages[sortedStages.length - 1];
}
