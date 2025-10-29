import _ from 'lodash';

/**
 * 根据角色的好感度和配置，解析出当前生效的好感度等级对象。
 * 规则：返回所有满足 `好感度 >= threshold` 的等级中，`threshold` 最高的那一个。
 * @param char - 角色对象，需要包含 `好感度` 和可选的 `affectionStages`。
 * @param globalAffectionStages - 全局的好感度等级配置。
 * @returns 当前生效的好感度等级对象，如果找不到则返回 null。
 */
export function getAffectionStage(char: any, globalAffectionStages: any[]): any | null {
  const stages = char.affectionStages || globalAffectionStages;
  if (!stages || !Array.isArray(stages)) {
    return null;
  }

  // 确保所有条目都是对象格式
  const parsedStages = stages.map(stage => (typeof stage === 'string' ? JSON.parse(stage) : stage));

  const applicableStages = parsedStages.filter(stage => char.好感度 >= stage.threshold);

  if (applicableStages.length === 0) {
    return null;
  }

  // 从适用的等级中，找到 threshold 最高的那一个
  return _.maxBy(applicableStages, 'threshold') || null;
}

/**
 * 检查一个行为条目（`Entry`）的 `when` 条件是否被满足。
 * @param when - `when` 条件对象。
 * @param runtime - 完整的 `runtime` 对象，用于检查 `clock` 和 `festival`。
 * @returns 如果所有条件都满足，则返回 `true`，否则返回 `false`。
 */
export function checkConditions(when: any, runtime: any): boolean {
  // TODO: 实现完整的条件检查逻辑
  // 1. byFlag
  // 2. byNow
  // 3. byMonthDay
  // 4. byFestival
  return false;
}

/**
 * 解析 `action.to` 语法，返回一个具体的地点名称。
 * @param to - `action.to` 字符串。
 * @param context - 上下文对象，包含 `userLocation` 和 `graph` 等信息。
 * @returns 解析后的具体地点名称。
 */
export function resolveLocation(to: string, context: { userLocation: string; graph: any; currentLocation: string }): string {
  // TODO: 实现完整的地点解析逻辑
  // 1. HERO
  // 2. FIXED:地点名
  // 3. NEIGHBOR
  // 4. FROM:地点1|地点2|...
  // 5. ANY
  return context.currentLocation;
}
