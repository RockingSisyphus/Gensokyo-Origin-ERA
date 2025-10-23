// ==================================================================
// 时间相关常量数据
// ==================================================================

/**
 * @description 时段中文名称
 * 顺序: 0清晨, 1上午, 2中午, 3下午, 4黄昏, 5夜晚, 6上半夜, 7下半夜
 */
export const PERIOD_NAMES = ['清晨', '上午', '中午', '下午', '黄昏', '夜晚', '上半夜', '下半夜'];

/**
 * @description 时段 new* 标志键名
 */
export const PERIOD_KEYS = ['newDawn', 'newMorning', 'newNoon', 'newAfternoon', 'newDusk', 'newNight', 'newFirstHalfNight', 'newSecondHalfNight'];

/**
 * @description 季节中文名称
 */
export const SEASON_NAMES = ['春', '夏', '秋', '冬'];

/**
 * @description 季节 new* 标志键名
 */
export const SEASON_KEYS = ['newSpring', 'newSummer', 'newAutumn', 'newWinter'];

/**
 * @description 星期中文名称 (周㫙开始)
 */
export const WEEK_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

/**
 * @description 纪元起点, ISO 8601 格式, 默认为 2025-10-24 06:00:00 (JST, UTC+9)
 */
export const EPOCH_ISO = '2025-10-24T06:00:00+09:00';
