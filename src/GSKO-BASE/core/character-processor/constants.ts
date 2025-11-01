// ====================
//      路径定义
// ====================

/** 获取角色在 runtime 中的路径 */
export const CHAR_RUNTIME_PATH = (charId: string) => `character.chars.${charId}`;

/** 获取角色在 runtime 中好感度等级的路径 */
export const AFFECTION_STAGE_IN_RUNTIME_PATH = (charId: string) => `${CHAR_RUNTIME_PATH(charId)}.affectionStage`;

/** 获取角色在 runtime 中决策的路径 */
export const DECISION_IN_RUNTIME_PATH = (charId: string) => `${CHAR_RUNTIME_PATH(charId)}.decision`;

/** 获取角色在 runtime 中相伴决策的路径 */
export const COMPANION_DECISION_IN_RUNTIME_PATH = (charId: string) => `${CHAR_RUNTIME_PATH(charId)}.companionDecision`;

/** 角色分区在 runtime 中的路径 */
export const CHAR_PARTITIONS_IN_RUNTIME_PATH = 'character.partitions';
/** 同区角色列表在 runtime 中的路径 */
export const CO_LOCATED_CHARS_IN_RUNTIME_PATH = `${CHAR_PARTITIONS_IN_RUNTIME_PATH}.coLocated`;
/** 异区角色列表在 runtime 中的路径 */
export const REMOTE_CHARS_IN_RUNTIME_PATH = `${CHAR_PARTITIONS_IN_RUNTIME_PATH}.remote`;

/** character-processor 模块在 cache 中的根路径 */
export const MODULE_CACHE_ROOT = 'character-processor';

/** 获取角色在 character-processor 缓存中来访冷却状态的相对路径 */
export const VISIT_COOLING_PATH = (charId: string) => `${charId}.visit.cooling`;

// ====================
//      类型定义 (Types)
// ====================

// All type definitions are now in schema.ts

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
