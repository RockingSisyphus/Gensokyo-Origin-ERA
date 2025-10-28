/**
 * @description 异变对象接口
 */
export interface Incident {
  name: string;
  detail: string;
  mainLoc: string[];
  status?: '进行中' | '已结束';
  solver?: string[];
  isFinished?: boolean;
  raw?: any; // 用于存储原始对象
}

/**
 * @description 默认异变配置
 */
export const DEFAULT_INCIDENT_CONFIG = {
  cooldownMinutes: 10080,
  isRandomPool: true,
  forceTrigger: false,
  pool: [],
  randomCore: ['季节', '结界', '妖气', '梦境', '影子', '星光', '时间', '语言', '乐声', '香气'],
  randomType: ['错乱', '逆流', '溢出', '停滞', '偏移', '回响', '侵染', '共鸣', '倒置', '反噬'],
};

/**
 * @description 异变核心词
 */
export const DEFAULT_RANDOM_CORE = DEFAULT_INCIDENT_CONFIG.randomCore;

/**
 * @description 异变类型词
 */
export const DEFAULT_RANDOM_TYPE = DEFAULT_INCIDENT_CONFIG.randomType;
