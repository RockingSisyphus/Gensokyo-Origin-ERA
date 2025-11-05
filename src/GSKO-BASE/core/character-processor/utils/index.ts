import _ from 'lodash';

/**
 * 根据角色的好感度和好感度等级表，解析出当前生效的好感度等级对象。
 * 规则：返回所有满足 `好感度 >= threshold` 的等级中，`threshold` 最高的那一个。
 * @param char - 角色对象，需要包含 `好感度` 属性。
 * @param affectionStages - 用于匹配的好感度等级数组。
 * @returns 当前生效的好感度等级对象，如果找不到则返回 null。
 */
export function getAffectionStage(char: any, affectionStages: any[]): any | null {
  if (!affectionStages || !Array.isArray(affectionStages)) {
    return null;
  }

  // 确保所有条目都是对象格式
  const parsedStages = affectionStages.map(stage => (typeof stage === 'string' ? JSON.parse(stage) : stage));

  const applicableStages = parsedStages.filter(stage => char.好感度 >= stage.threshold);

  if (applicableStages.length === 0) {
    return null;
  }

  // 从适用的等级中，找到 threshold 最高的那一个
  return _.maxBy(applicableStages, 'threshold') || null;
}
