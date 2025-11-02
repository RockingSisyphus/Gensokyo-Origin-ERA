/**
 * @file 定义时间体系中会被多个模块共享的固定常量
 * @description 这些常量不再从 stat.config 中读取，确保前端运行态与处理器之间拥有统一的时间基准设置。
 */

// --- 时段（Period） ---

/**
 * TIME_PERIOD_NAMES
 * -----------------
 * 用于展示给用户的 8 个时间段名称，从“清晨”到“下半夜”。
 * 时间处理器与提示词构建器等模块会依赖这些名称来生成对外展示的时间描述。
 */
export const TIME_PERIOD_NAMES = ['清晨', '上午', '中午', '下午', '黄昏', '夜晚', '上半夜', '下半夜'] as const;
export type TimePeriodName = (typeof TIME_PERIOD_NAMES)[number];

/**
 * TIME_PERIOD_KEYS
 * ----------------
 * 与时段变化相关的 flag 键名，保持与 ClockFlags.byPeriod 一致。
 * 在聊天锚点、flag 校验等逻辑中，通过这些键名判断对应的历史锚点。
 */
export const TIME_PERIOD_KEYS = [
  'newDawn',
  'newMorning',
  'newNoon',
  'newAfternoon',
  'newDusk',
  'newNight',
  'newFirstHalfNight',
  'newSecondHalfNight',
] as const;
export type TimePeriodKey = (typeof TIME_PERIOD_KEYS)[number];

// --- 季节（Season） ---

/**
 * TIME_SEASON_NAMES
 * -----------------
 * 四季的中文名称，供展示与提示词拼装使用。
 */
export const TIME_SEASON_NAMES = ['春', '夏', '秋', '冬'] as const;
export type TimeSeasonName = (typeof TIME_SEASON_NAMES)[number];

/**
 * TIME_SEASON_KEYS
 * ----------------
 * 与季节变化相关的 flag 键名，保持与 ClockFlags.bySeason 一致。
 */
export const TIME_SEASON_KEYS = ['newSpring', 'newSummer', 'newAutumn', 'newWinter'] as const;
export type TimeSeasonKey = (typeof TIME_SEASON_KEYS)[number];

// --- 星期（Weekday） ---

/**
 * TIME_WEEK_NAMES
 * ---------------
 * 一周七天的展示名称，供时间处理器在生成当前星期时查表使用。
 */
export const TIME_WEEK_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] as const;
export type TimeWeekName = (typeof TIME_WEEK_NAMES)[number];

