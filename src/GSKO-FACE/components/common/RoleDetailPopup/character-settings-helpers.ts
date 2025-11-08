import {
  TIME_PERIOD_KEYS,
  TIME_PERIOD_NAMES,
  TIME_SEASON_KEYS,
  TIME_SEASON_NAMES,
  TIME_WEEK_NAMES,
} from '../../../../GSKO-BASE/schema/time/constants';

export const TIME_UNIT_OPTIONS = ['period', 'day', 'week', 'month', 'season', 'year'] as const;

export const BASE_FLAG_OPTIONS = ['newPeriod', 'newDay', 'newWeek', 'newMonth', 'newSeason', 'newYear'] as const;
export const PERIOD_FLAG_OPTIONS = TIME_PERIOD_KEYS.map(flag => `byPeriod.${flag}` as const);
export const SEASON_FLAG_OPTIONS = TIME_SEASON_KEYS.map(flag => `bySeason.${flag}` as const);

export const FLAG_GROUPS = [
  { title: '基础时间节点', options: BASE_FLAG_OPTIONS },
  { title: '时段 Flags', options: PERIOD_FLAG_OPTIONS },
  { title: '季节 Flags', options: SEASON_FLAG_OPTIONS },
] as const;

export const TRIGGER_FLAG_OPTIONS = [...BASE_FLAG_OPTIONS, ...PERIOD_FLAG_OPTIONS, ...SEASON_FLAG_OPTIONS] as const;
export type TriggerFlag = (typeof TRIGGER_FLAG_OPTIONS)[number];
export const TRIGGER_FLAG_LOOKUP = new Set<TriggerFlag>(TRIGGER_FLAG_OPTIONS);
export const KNOWN_FLAG_SET = new Set<TriggerFlag>(TRIGGER_FLAG_OPTIONS);
export const isTriggerFlag = (flag: string): flag is TriggerFlag => TRIGGER_FLAG_LOOKUP.has(flag as TriggerFlag);

const PERIOD_LABEL_MAP = Object.fromEntries(
  TIME_PERIOD_KEYS.map((key, idx) => [`byPeriod.${key}`, `时段·${TIME_PERIOD_NAMES[idx]} (${key})`]),
);
const SEASON_LABEL_MAP = Object.fromEntries(
  TIME_SEASON_KEYS.map((key, idx) => [`bySeason.${key}`, `季节·${TIME_SEASON_NAMES[idx]} (${key})`]),
);
const BASE_FLAG_LABELS: Record<string, string> = {
  newPeriod: '新时段 (newPeriod)',
  newDay: '新的一天 (newDay)',
  newWeek: '新的一周 (newWeek)',
  newMonth: '新的一月 (newMonth)',
  newSeason: '新季节 (newSeason)',
  newYear: '新年 (newYear)',
};

export const formatFlagLabel = (flag: string) =>
  PERIOD_LABEL_MAP[flag] || SEASON_LABEL_MAP[flag] || BASE_FLAG_LABELS[flag] || flag;

export const BY_NOW_SELECT_FIELDS = [
  { key: 'weekdayName', label: '星期', options: TIME_WEEK_NAMES },
  { key: 'periodName', label: '时间段', options: TIME_PERIOD_NAMES },
  { key: 'seasonName', label: '季节', options: TIME_SEASON_NAMES },
] as const;

export const BY_NOW_TEXT_FIELDS = [
  { key: 'iso', label: 'ISO 字符串', placeholder: '2025-01-01T08:00:00Z' },
  { key: 'hm', label: 'HH:mm', placeholder: '08:00' },
] as const;

export const BY_NOW_NUMERIC_FIELDS = [
  { key: 'year', label: '年份' },
  { key: 'month', label: '月份' },
  { key: 'day', label: '日期' },
  { key: 'hour', label: '小时' },
  { key: 'minute', label: '分钟' },
  { key: 'weekdayIndex', label: '星期索引' },
  { key: 'periodIdx', label: '时间段索引' },
  { key: 'seasonIdx', label: '季节索引' },
  { key: 'minutesSinceMidnight', label: '分钟数（当日零点开始算）' },
] as const;

type ByNowSelectKey = (typeof BY_NOW_SELECT_FIELDS)[number]['key'];
type ByNowTextKey = (typeof BY_NOW_TEXT_FIELDS)[number]['key'];
export type ByNowNumericKey = (typeof BY_NOW_NUMERIC_FIELDS)[number]['key'];
export type ByNowFieldKey = ByNowSelectKey | ByNowTextKey | ByNowNumericKey;

const KNOWN_BY_NOW_KEY_ARRAY = [
  ...BY_NOW_SELECT_FIELDS.map(field => field.key),
  ...BY_NOW_TEXT_FIELDS.map(field => field.key),
  ...BY_NOW_NUMERIC_FIELDS.map(field => field.key),
] as const;
export const KNOWN_BY_NOW_KEYS = new Set<string>(KNOWN_BY_NOW_KEY_ARRAY);

export const NUMERIC_BY_NOW_FIELDS = new Set<ByNowNumericKey>(BY_NOW_NUMERIC_FIELDS.map(field => field.key));
export const isNumericByNowKey = (key: string): key is ByNowNumericKey =>
  NUMERIC_BY_NOW_FIELDS.has(key as ByNowNumericKey);

export const ACTION_TO_SPECIALS = ['$HOME', 'HERO', 'RANDOM'] as const;
export const ACTION_TO_STAY = '__stay__';
export const ACTION_TO_CUSTOM = '__custom__';

export type FestivalMode = 'none' | 'any' | 'single' | 'multiple';
