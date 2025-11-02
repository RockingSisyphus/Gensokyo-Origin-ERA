import _ from 'lodash';
import type { TimeFlagHistoryLimits } from '../../../GSKO-BASE/schema/config';
import baseTestData from '../stat-test-data.json';

// ------------------------------------------------------------------
// 常量定义：用于描述时间阶段、季节与 ClockAck 的基本结构
// ------------------------------------------------------------------
const PERIOD_KEYS = [
  'newDawn',
  'newMorning',
  'newNoon',
  'newAfternoon',
  'newDusk',
  'newNight',
  'newFirstHalfNight',
  'newSecondHalfNight',
] as const;

const SEASON_KEYS = ['newSpring', 'newSummer', 'newAutumn', 'newWinter'] as const;

type PeriodKey = (typeof PERIOD_KEYS)[number];
type SeasonKey = (typeof SEASON_KEYS)[number];

type ClockAckLike = {
  dayID: number;
  weekID: number;
  monthID: number;
  yearID: number;
  periodID: number;
  periodIdx: number;
  seasonID: number;
  seasonIdx: number;
};

// ------------------------------------------------------------------
// 类型定义：时间锚点结构与测试场景配置
// ------------------------------------------------------------------
export interface TimeChatAnchorsLike {
  newPeriod?: string | null;
  period?: Partial<Record<PeriodKey, string | null>>;
  newDay?: string | null;
  newWeek?: string | null;
  newMonth?: string | null;
  newSeason?: string | null;
  season?: Partial<Record<SeasonKey, string | null>>;
  newYear?: string | null;
}

export interface TimeTestScenario {
  stat: any;
  mk: string;
  messageId: number;
  selectedMks: string[];
  editLogs?: Record<string, any[]>;
  actions?: Record<string, any>;
  description?: string;
}

interface ScenarioConfig {
  mk: string;
  messageId: number;
  timeProgress: number;
  dropCache?: boolean;
  prevClockAck?: ClockAckLike;
  anchors?: TimeChatAnchorsLike;
  selectedMks?: string[];
  editLogs?: Record<string, any[]>;
  actions?: Record<string, any>;
  description?: string;
  flagHistoryLimits?: PartialFlagHistoryLimits;
}

type PartialFlagHistoryLimits = {
  [K in keyof TimeFlagHistoryLimits]?: TimeFlagHistoryLimits[K] extends Record<string, any>
    ? Partial<TimeFlagHistoryLimits[K]>
    : TimeFlagHistoryLimits[K];
};

// ------------------------------------------------------------------
// 预设的 ClockAck 边界，用于构造“刚刚跨越”某个时间节点的测试样例
// ------------------------------------------------------------------
const CLOCK_ACK_AT_DAWN: ClockAckLike = {
  dayID: 20251024,
  weekID: 20251020,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510240,
  periodIdx: 0,
  seasonID: 20252,
  seasonIdx: 2,
};

const CLOCK_ACK_END_OF_DAY: ClockAckLike = {
  dayID: 20251024,
  weekID: 20251020,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510247,
  periodIdx: 7,
  seasonID: 20252,
  seasonIdx: 2,
};

const CLOCK_ACK_END_OF_WEEK: ClockAckLike = {
  dayID: 20251026,
  weekID: 20251020,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510267,
  periodIdx: 7,
  seasonID: 20252,
  seasonIdx: 2,
};

const CLOCK_ACK_END_OF_MONTH: ClockAckLike = {
  dayID: 20251031,
  weekID: 20251027,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510317,
  periodIdx: 7,
  seasonID: 20252,
  seasonIdx: 2,
};

const CLOCK_ACK_END_OF_AUTUMN: ClockAckLike = {
  dayID: 20251130,
  weekID: 20251124,
  monthID: 202511,
  yearID: 2025,
  periodID: 202511307,
  periodIdx: 7,
  seasonID: 20252,
  seasonIdx: 2,
};

const CLOCK_ACK_END_OF_YEAR: ClockAckLike = {
  dayID: 20251231,
  weekID: 20251229,
  monthID: 202512,
  yearID: 2025,
  periodID: 202512317,
  periodIdx: 7,
  seasonID: 20253,
  seasonIdx: 3,
};

const MK_INITIAL = 'mk-time-initial';
const MK_NO_CHANGE = 'mk-time-no-change';
const MK_NEW_PERIOD = 'mk-time-new-period';
const MK_NEW_DAY = 'mk-time-new-day';
const MK_NEW_WEEK = 'mk-time-new-week';
const MK_NEW_MONTH = 'mk-time-new-month';
const MK_NEW_SEASON = 'mk-time-new-season';
const MK_NEW_YEAR = 'mk-time-new-year';
const MK_NEW_WEEK_CLAMPED = 'mk-time-new-week-clamped';
const MK_NEW_WEEK_ANCHORLESS = 'mk-time-new-week-anchorless';

const buildSequentialMkList = (length: number, prefix = 'mk-history-'): string[] =>
  Array.from({ length }, (_, idx) => `${prefix}${idx.toString().padStart(4, '0')}`);

const LONG_HISTORY_SELECTED_MKS = [...buildSequentialMkList(180), MK_NEW_WEEK_CLAMPED];
const LONG_HISTORY_SELECTED_MKS_ANCHORLESS = [...buildSequentialMkList(120, 'mk-anchorless-'), MK_NEW_WEEK_ANCHORLESS];
const LONG_HISTORY_EARLY_MK = LONG_HISTORY_SELECTED_MKS[0];
const LONG_HISTORY_PERIOD_MK = LONG_HISTORY_SELECTED_MKS[20];
const LONG_HISTORY_SEASON_MK = LONG_HISTORY_SELECTED_MKS[30];
const LONG_HISTORY_NEW_DAY_ANCHOR = LONG_HISTORY_SELECTED_MKS[110];
const LONG_HISTORY_NEW_MONTH_ANCHOR = LONG_HISTORY_SELECTED_MKS[150];
const LONG_HISTORY_NEW_SEASON_ANCHOR = LONG_HISTORY_SELECTED_MKS[100];
const LONG_HISTORY_NEW_YEAR_ANCHOR = LONG_HISTORY_SELECTED_MKS[60];

// ------------------------------------------------------------------
// 工具函数：基于输入配置生成完整的测试场景数据
// ------------------------------------------------------------------
function createScenario(config: ScenarioConfig): TimeTestScenario {
  const stat = _.cloneDeep(baseTestData);
  stat.世界.timeProgress = config.timeProgress;

  if (config.dropCache) {
    // 首次运行的场景需要完全丢弃 cache，以便验证初始化逻辑
    delete (stat as any).cache;
  } else {
    // 深拷贝 cache，确保不会污染基准测试数据
    const cache = _.cloneDeep(baseTestData.cache ?? {});
    const cacheAny = cache as Record<string, any>;
    if (config.prevClockAck) {
      // 为时间处理器提供“上一刻”的时间戳
      cacheAny.time = {
        ...(cacheAny.time ?? {}),
        clockAck: { ...config.prevClockAck },
      };
    } else if (cacheAny.time) {
      // 未提供 clockAck 时，清理旧值，模拟缺省情况
      Reflect.deleteProperty(cacheAny.time, 'clockAck');
    }

    if (config.anchors) {
      // 预设时间锚点，确保时间-MK 同步模块可以读取到历史记录
      cacheAny.timeChatMkSync = { anchors: _.cloneDeep(config.anchors) };
    } else if (cacheAny.timeChatMkSync) {
      // 无锚点配置时清理旧数据
      Reflect.deleteProperty(cacheAny, 'timeChatMkSync');
    }

    stat.cache = cache;
  }

  if (config.flagHistoryLimits && stat.config?.time) {
    const mergedLimits = _.merge({}, stat.config.time.flagHistoryLimits ?? {}, config.flagHistoryLimits);
    stat.config.time.flagHistoryLimits = mergedLimits;
  }

  const mk = config.mk;
  const selectedMks = config.selectedMks ? [...config.selectedMks] : [mk];

  return {
    stat,
    mk,
    messageId: config.messageId,
    selectedMks,
    editLogs: config.editLogs ? _.cloneDeep(config.editLogs) : undefined,
    actions: config.actions ? _.cloneDeep(config.actions) : undefined,
    description: config.description,
  };
}

// ------------------------------------------------------------------
// 测试场景：首次运行，期望所有 new* 标志为 false，但锚点被初始化
// ------------------------------------------------------------------
const scenarioInitial = createScenario({
  mk: MK_INITIAL,
  messageId: 2000,
  timeProgress: 0,
  dropCache: true,
  description: '首次运行，cache 为空，检查时间处理与锚点的初始化。',
});

// ------------------------------------------------------------------
// 测试场景：时间轻微推进，不跨越任何边界，锚点应保持原样
// ------------------------------------------------------------------
const scenarioNoChange = createScenario({
  mk: MK_NO_CHANGE,
  messageId: 2001,
  timeProgress: 10,
  prevClockAck: CLOCK_ACK_AT_DAWN,
  anchors: {
    newPeriod: MK_INITIAL,
    period: {
      newDawn: MK_INITIAL,
    },
    newDay: 'mk-day-20251024',
    newWeek: 'mk-week-20251020',
    newMonth: 'mk-month-202510',
    newSeason: 'mk-season-autumn-start',
    season: {
      newAutumn: 'mk-season-autumn-start',
    },
    newYear: 'mk-year-2025',
  },
  selectedMks: [MK_INITIAL, MK_NO_CHANGE],
  description: '时间推进 10 分钟但未跨越任何边界，锚点应保持原值。',
});

// ------------------------------------------------------------------
// 测试场景：跨越清晨 -> 上午，期待 newPeriod/newMorning 被更新
// ------------------------------------------------------------------
const scenarioNewPeriod = createScenario({
  mk: MK_NEW_PERIOD,
  messageId: 2002,
  timeProgress: 2 * 60,
  prevClockAck: CLOCK_ACK_AT_DAWN,
  anchors: {
    newPeriod: MK_NO_CHANGE,
    period: {
      newDawn: MK_INITIAL,
      newMorning: MK_NO_CHANGE,
    },
    newDay: 'mk-day-20251024',
    newWeek: 'mk-week-20251020',
    newMonth: 'mk-month-202510',
    newSeason: 'mk-season-autumn-start',
    season: {
      newAutumn: 'mk-season-autumn-start',
    },
    newYear: 'mk-year-2025',
  },
  selectedMks: [MK_INITIAL, MK_NO_CHANGE, MK_NEW_PERIOD],
  description: '跨越清晨到上午，newMorning/newPeriod 的锚点应更新为当前 MK。',
});

// ------------------------------------------------------------------
// 测试场景：跨日（到凌晨），期待 newDay 与夜间段锚点同步刷新
// ------------------------------------------------------------------
const scenarioNewDay = createScenario({
  mk: MK_NEW_DAY,
  messageId: 2003,
  timeProgress: 19 * 60,
  prevClockAck: CLOCK_ACK_END_OF_DAY,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newMorning: MK_NEW_PERIOD,
      newSecondHalfNight: 'mk-period-second-night-prev',
    },
    newDay: 'mk-day-20251024',
    newWeek: 'mk-week-20251020',
    newMonth: 'mk-month-202510',
    newSeason: 'mk-season-autumn-start',
    season: {
      newAutumn: 'mk-season-autumn-start',
    },
    newYear: 'mk-year-2025',
  },
  selectedMks: [MK_INITIAL, MK_NO_CHANGE, MK_NEW_PERIOD, MK_NEW_DAY],
  description: '跨日，newDay 与夜间相关的锚点需要同步到当前 MK。',
});

// ------------------------------------------------------------------
// 测试场景：跨周（周日 -> 周一），期待 newWeek 被刷新
// ------------------------------------------------------------------
const scenarioNewWeek = createScenario({
  mk: MK_NEW_WEEK,
  messageId: 2004,
  timeProgress: 3 * 24 * 60,
  prevClockAck: CLOCK_ACK_END_OF_WEEK,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newMorning: MK_NEW_PERIOD,
    },
    newDay: MK_NEW_DAY,
    newWeek: 'mk-week-20251020',
    newMonth: 'mk-month-202510',
    newSeason: 'mk-season-autumn-start',
    season: {
      newAutumn: 'mk-season-autumn-start',
    },
    newYear: 'mk-year-2025',
  },
  selectedMks: [MK_INITIAL, MK_NO_CHANGE, MK_NEW_PERIOD, MK_NEW_DAY, MK_NEW_WEEK],
  description: '跨周，newWeek 锚点应从旧的周首 MK 切换到当前 MK。',
});

// ------------------------------------------------------------------
// 测试场景：跨月（10 月 -> 11 月），期待 newMonth 锚点刷新
// ------------------------------------------------------------------
const scenarioNewMonth = createScenario({
  mk: MK_NEW_MONTH,
  messageId: 2005,
  timeProgress: 8 * 24 * 60,
  prevClockAck: CLOCK_ACK_END_OF_MONTH,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newMorning: MK_NEW_PERIOD,
    },
    newDay: MK_NEW_DAY,
    newWeek: MK_NEW_WEEK,
    newMonth: 'mk-month-202510',
    newSeason: 'mk-season-autumn-start',
    season: {
      newAutumn: 'mk-season-autumn-start',
    },
    newYear: 'mk-year-2025',
  },
  selectedMks: [MK_INITIAL, MK_NO_CHANGE, MK_NEW_PERIOD, MK_NEW_DAY, MK_NEW_WEEK, MK_NEW_MONTH],
  description: '跨月，newMonth 锚点应该刷新为当前 MK。',
});

// ------------------------------------------------------------------
// 测试场景：跨季节（秋 -> 冬），期待 newSeason / newWinter 刷新
// ------------------------------------------------------------------
const scenarioNewSeason = createScenario({
  mk: MK_NEW_SEASON,
  messageId: 2006,
  timeProgress: (8 + 30) * 24 * 60,
  prevClockAck: CLOCK_ACK_END_OF_AUTUMN,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newMorning: MK_NEW_PERIOD,
    },
    newDay: MK_NEW_DAY,
    newWeek: MK_NEW_WEEK,
    newMonth: MK_NEW_MONTH,
    newSeason: 'mk-season-autumn-start',
    season: {
      newAutumn: 'mk-season-autumn-start',
      newWinter: 'mk-season-winter-prev',
    },
    newYear: 'mk-year-2025',
  },
  selectedMks: [MK_INITIAL, MK_NO_CHANGE, MK_NEW_PERIOD, MK_NEW_DAY, MK_NEW_WEEK, MK_NEW_MONTH, MK_NEW_SEASON],
  description: '跨季节，newSeason 与 newWinter 的锚点应被当前 MK 覆盖。',
});

// ------------------------------------------------------------------
// 测试场景：跨年（2025 -> 2026），期待 newYear 以及冬季锚点同步
// ------------------------------------------------------------------
const scenarioNewYear = createScenario({
  mk: MK_NEW_YEAR,
  messageId: 2007,
  timeProgress: (8 + 30 + 31) * 24 * 60,
  prevClockAck: CLOCK_ACK_END_OF_YEAR,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newMorning: MK_NEW_PERIOD,
    },
    newDay: MK_NEW_DAY,
    newWeek: MK_NEW_WEEK,
    newMonth: MK_NEW_MONTH,
    newSeason: MK_NEW_SEASON,
    season: {
      newWinter: MK_NEW_SEASON,
    },
    newYear: 'mk-year-2025',
  },
  selectedMks: [
    MK_INITIAL,
    MK_NO_CHANGE,
    MK_NEW_PERIOD,
    MK_NEW_DAY,
    MK_NEW_WEEK,
    MK_NEW_MONTH,
    MK_NEW_SEASON,
    MK_NEW_YEAR,
  ],
  description: '跨年，newYear 锚点需要刷新，同时保持其他季节锚点稳定。',
});

// ------------------------------------------------------------------
// 测试场景：长历史记录触发 newWeek 限制，锚点应被截断
// ------------------------------------------------------------------
const scenarioNewWeekHistoryClamped = createScenario({
  mk: MK_NEW_WEEK_CLAMPED,
  messageId: 2100,
  timeProgress: 3 * 24 * 60 + 30,
  prevClockAck: CLOCK_ACK_END_OF_WEEK,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newNight: LONG_HISTORY_PERIOD_MK,
    },
    newDay: LONG_HISTORY_NEW_DAY_ANCHOR,
    newWeek: LONG_HISTORY_EARLY_MK,
    newMonth: LONG_HISTORY_NEW_MONTH_ANCHOR,
    newSeason: LONG_HISTORY_NEW_SEASON_ANCHOR,
    season: {
      newAutumn: LONG_HISTORY_SEASON_MK,
    },
    newYear: LONG_HISTORY_NEW_YEAR_ANCHOR,
  },
  selectedMks: LONG_HISTORY_SELECTED_MKS,
  description: '历史消息超出配置限制时，newWeek 与相关锚点应被截断到限制范围内。',
});

// ------------------------------------------------------------------
// 测试场景：锚点缺失时按限制兜底选取历史 MK
// ------------------------------------------------------------------
const scenarioNewWeekAnchorFallback = createScenario({
  mk: MK_NEW_WEEK_ANCHORLESS,
  messageId: 2101,
  timeProgress: 3 * 24 * 60 + 45,
  prevClockAck: CLOCK_ACK_END_OF_WEEK,
  anchors: {
    newPeriod: MK_NEW_PERIOD,
    period: {
      newNoon: 'mk-period-anchor-missing',
    },
    newDay: MK_NEW_DAY,
    newWeek: 'mk-week-anchor-missing',
    newMonth: MK_NEW_MONTH,
    newSeason: MK_NEW_SEASON,
    season: {
      newWinter: 'mk-season-anchor-missing',
    },
    newYear: MK_NEW_YEAR,
  },
  selectedMks: LONG_HISTORY_SELECTED_MKS_ANCHORLESS,
  description: '当锚点在 selectedMks 中缺失时，模块会按限制回溯并选择兜底 MK。',
});

export const timeTestScenarios: Record<string, TimeTestScenario> = {
  Initial: scenarioInitial,
  NoChange: scenarioNoChange,
  NewPeriod: scenarioNewPeriod,
  NewDay: scenarioNewDay,
  NewWeek: scenarioNewWeek,
  NewMonth: scenarioNewMonth,
  NewSeason: scenarioNewSeason,
  NewYear: scenarioNewYear,
  NewWeekHistoryClamped: scenarioNewWeekHistoryClamped,
  NewWeekAnchorFallback: scenarioNewWeekAnchorFallback,
};

export const timeTestScenarioLabels = {
  Initial: '初始化场景（首次运行）',
  NoChange: '时间推进但未跨越边界',
  NewPeriod: '跨越时间段（清晨→上午）',
  NewDay: '跨日（进入新一天）',
  NewWeek: '跨周（进入新的一周）',
  NewMonth: '跨月（进入新的一月）',
  NewSeason: '跨季节（秋→冬）',
  NewYear: '跨年（2025→2026）',
  NewWeekHistoryClamped: '历史消息超限时锚点截断',
  NewWeekAnchorFallback: '锚点缺失时限制兜底取值',
} as const;

// 兼容旧的命名导出，其他模块如有引用不受影响。
export const timeTest_Initial = scenarioInitial.stat;
export const timeTest_NoChange = scenarioNoChange.stat;
export const timeTest_NewPeriod = scenarioNewPeriod.stat;
export const timeTest_NewDay = scenarioNewDay.stat;
export const timeTest_NewWeek = scenarioNewWeek.stat;
export const timeTest_NewMonth = scenarioNewMonth.stat;
export const timeTest_NewSeason = scenarioNewSeason.stat;
export const timeTest_NewYear = scenarioNewYear.stat;
export const timeTest_NewWeekHistoryClamped = scenarioNewWeekHistoryClamped.stat;
export const timeTest_NewWeekAnchorFallback = scenarioNewWeekAnchorFallback.stat;
