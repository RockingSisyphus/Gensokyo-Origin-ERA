import { AffectionStageWithForget } from '../../schema/character-settings';

/**
 * 根据当前好感度返回匹配的好感度阶段。
 * 阶段按照阈值从高到低排列时，会返回第一个满足阈值的阶段。
 */
export function pickAffectionStage(
  affection: number,
  stages: AffectionStageWithForget[] | undefined,
): AffectionStageWithForget | undefined {
  if (!stages || stages.length === 0) {
    return undefined;
  }
  for (const stage of stages) {
    if (affection >= stage.threshold) {
      return stage;
    }
  }
  return stages[stages.length - 1];
}
