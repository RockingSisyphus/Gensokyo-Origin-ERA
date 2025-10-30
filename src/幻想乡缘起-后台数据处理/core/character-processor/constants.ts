import _ from 'lodash';

// ====================
//      路径定义
// ====================

/** 获取角色在 runtime 中上下文对象的路径 */
export const CHAR_RUNTIME_CONTEXT_PATH = (charId: string) => `chars.${charId}.context`;

/** 获取角色在 runtime 上下文中好感度等级的路径 */
export const AFFECTION_STAGE_IN_CONTEXT_PATH = (charId: string) =>
  `${CHAR_RUNTIME_CONTEXT_PATH(charId)}.affectionStage`;

/** character-processor 模块在 cache 中的根路径 */
export const MODULE_CACHE_ROOT = 'character-processor';

/** 获取角色在 character-processor 缓存中来访冷却状态的相对路径 */
export const VISIT_COOLING_PATH = (charId: string) => `${charId}.visit.cooling`;

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
