import _ from 'lodash';

// ====================
//      路径定义
// ====================

/** 获取角色在 runtime 中上下文对象的路径 */
export const CHAR_RUNTIME_CONTEXT_PATH = (charId: string) => `chars.${charId}.context`;

/** 获取角色在 runtime 上下文中好感度等级的路径 */
export const AFFECTION_STAGE_IN_CONTEXT_PATH = (charId: string) =>
  `${CHAR_RUNTIME_CONTEXT_PATH(charId)}.affectionStage`;

/** 获取角色在 runtime.charsState 中来访冷却状态的路径 */
export const VISIT_COOLING_IN_STATE_PATH = (charId: string) => `charsState.${charId}.visit.cooling`;

// ====================
//      类型定义 (Types)
// ====================

export interface Action {
  to: string;
  do: string;
  source?: string;
}

export interface When {
  byFlag?: string[];
  byNow?: object;
  byMonthDay?: { month: number; day: number };
  byFestival?: 'ANY' | string | string[];
}

export interface Entry {
  when?: When;
  action: Action;
  priority?: number;
  usesRemaining?: number | null;
}

export interface Character {
  所在地区: string;
  居住地区: string;
  当前目标: string;
  好感度: number;
  affectionStages?: any[];
  routine: Entry[];
  specials: Entry[];
}

// ====================
//      数据访问器 (Accessors)
// ====================

// --- 读取 (Read) ---

/** 从 stat 中安全地获取角色对象 */
export function getChar(stat: any, charId: string): Character | null {
  return _.get(stat, `chars.${charId}`, null);
}

/** 从 stat 中安全地获取用户位置 */
export function getUserLocation(stat: any): string | null {
  return _.get(stat, 'user.所在地区', null);
}

/** 从角色对象中安全地获取其位置 */
export function getCharLocation(char: Character | null): string | null {
  return char?.所在地区 || null;
}

/** 从 stat 中安全地获取全局好感度等级配置 */
export function getGlobalAffectionStages(stat: any): any[] {
  return _.get(stat, 'config.affection.affectionStages', []);
}

/** 从 runtime 的上下文中获取已解析的好感度等级 */
export function getAffectionStageFromContext(runtime: any, charId: string): any | null {
  return _.get(runtime, AFFECTION_STAGE_IN_CONTEXT_PATH(charId), null);
}

/** 从 runtime.charsState 中获取角色的来访冷却状态 */
export function isVisitCooling(runtime: any, charId: string): boolean {
  return _.get(runtime, VISIT_COOLING_IN_STATE_PATH(charId), false);
}

// --- 写入 (Write) ---

/** 将解析出的好感度等级写入 runtime 的上下文 */
export function setAffectionStageInContext(runtime: any, charId: string, stage: any): void {
  _.set(runtime, AFFECTION_STAGE_IN_CONTEXT_PATH(charId), stage);
}

/** 设置角色的来访冷却状态到 runtime.charsState */
export function setVisitCooling(runtime: any, charId: string, value: boolean): void {
  _.set(runtime, VISIT_COOLING_IN_STATE_PATH(charId), value);
}

/**
 * 更新角色在 stat 中的位置。
 * @param stat - The stat object.
 * @param charId - The character's ID.
 * @param location - The new location.
 */
export function setCharLocationInStat(stat: any, charId: string, location: string): void {
  _.set(stat, `chars.${charId}.所在地区`, location);
}

/**
 * 更新角色在 stat 中的当前目标。
 * @param stat - The stat object.
 * @param charId - The character's ID.
 * @param goal - The new goal.
 */
export function setCharGoalInStat(stat: any, charId: string, goal: string): void {
  _.set(stat, `chars.${charId}.当前目标`, goal);
}

// ====================
//      行为常量
// ====================

/** 预定义的特殊行动 */
export const PREDEFINED_ACTIONS = {
  /** 拜访主角 */
  VISIT_HERO: {
    to: 'HERO',
    do: '拜访主角',
    source: 'visit',
  },
  /** 与主角相伴 */
  STAY_WITH_HERO: {
    to: 'HERO',
    do: '与主角相伴',
    source: 'companion',
  },
};

/** 行为条目中的键名 */
export const ENTRY_KEYS = {
  PRIORITY: 'priority',
  ACTION: 'action',
  WHEN: 'when',
};

/** 默认或特殊状态值 */
export const DEFAULT_VALUES = {
  UNKNOWN_LOCATION: 'UNKNOWN',
  IDLE_ACTION_SOURCE: 'idle',
  IDLE_ACTION_DO: '待机',
};
