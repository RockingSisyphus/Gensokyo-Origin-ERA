import { Clock } from '../../schema/runtime';
import {
  WeatherCondition,
  WeatherConditionType,
  WeatherDay,
  WeatherRuntime,
  WEATHER_CONDITION_TYPES,
} from '../../schema/weather';
import { TIME_WEEK_NAMES } from '../../schema/time/constants';
import { seasonIndexOf } from '../time-processor/utils';

const FORECAST_RANGE_DAYS = 8; // 今天 + 7 天

const SEASON_CONDITION_POOL: Record<number, WeatherConditionType[]> = {
  0: ['clear', 'partly_cloudy', 'overcast', 'light_rain', 'storm'],
  1: ['clear', 'partly_cloudy', 'overcast', 'light_rain', 'heavy_rain', 'storm'],
  2: ['clear', 'partly_cloudy', 'overcast', 'light_rain', 'fog'],
  3: ['clear', 'overcast', 'snow', 'fog', 'storm'],
};

const CONDITION_DETAIL_MAP: Record<
  WeatherConditionType,
  WeatherCondition & { precipitationBias: number; humidityBias: number; windBias: number; tempOffset: number }
> = {
  clear: {
    type: 'clear',
    label: '晴朗',
    description: '天空澄净，阳光透彻。',
    precipitationBias: 0.05,
    humidityBias: 0.35,
    windBias: 2,
    tempOffset: 2,
  },
  partly_cloudy: {
    type: 'partly_cloudy',
    label: '多云',
    description: '云层舒展开来，偶有日光穿透。',
    precipitationBias: 0.2,
    humidityBias: 0.45,
    windBias: 3,
    tempOffset: 0,
  },
  overcast: {
    type: 'overcast',
    label: '阴天',
    description: '厚重云层笼罩，光线柔和。',
    precipitationBias: 0.35,
    humidityBias: 0.55,
    windBias: 3,
    tempOffset: -1,
  },
  light_rain: {
    type: 'light_rain',
    label: '小雨',
    description: '细雨如丝，空气湿润。',
    precipitationBias: 0.65,
    humidityBias: 0.75,
    windBias: 4,
    tempOffset: -2,
  },
  heavy_rain: {
    type: 'heavy_rain',
    label: '大雨',
    description: '雨势强劲，需要注意出行安全。',
    precipitationBias: 0.85,
    humidityBias: 0.85,
    windBias: 5,
    tempOffset: -3,
  },
  storm: {
    type: 'storm',
    label: '雷暴',
    description: '雷霆交织，风雨大作。',
    precipitationBias: 0.95,
    humidityBias: 0.9,
    windBias: 6,
    tempOffset: -3,
  },
  snow: {
    type: 'snow',
    label: '降雪',
    description: '雪花轻覆大地，气温寒凉。',
    precipitationBias: 0.7,
    humidityBias: 0.8,
    windBias: 4,
    tempOffset: -4,
  },
  fog: {
    type: 'fog',
    label: '薄雾',
    description: '雾气弥漫，视野受限。',
    precipitationBias: 0.25,
    humidityBias: 0.9,
    windBias: 2,
    tempOffset: -1,
  },
};

const SEASON_TEMPERATURE_PRESET = [
  { min: 5, max: 20 },
  { min: 22, max: 35 },
  { min: 10, max: 24 },
  { min: -5, max: 8 },
];

interface WeatherProcessorParams {
  clock?: Clock;
  current?: WeatherRuntime;
}

/**
 * 根据当前 clock 信息与已有 weather runtime，生成“今天+7 天”的确定性天气数据。
 * 仅在 clock.flags.newDay 拉起或 anchor 与缓存不一致时才刷新，避免同一天重复计算。
 */
export function buildWeatherRuntime({ clock, current }: WeatherProcessorParams): WeatherRuntime | undefined {
  if (!clock?.now) {
    return current;
  }

  const baseDate = getAnchorDate(clock);
  if (!baseDate) {
    return current;
  }

  const anchorIso = formatDate(baseDate);
  const newDayFlag = Boolean(clock.flags?.newDay);
  const needsRefresh = !current || current.anchorDayISO !== anchorIso;

  if (!needsRefresh && !newDayFlag) {
    return current;
  }

  const days: WeatherDay[] = [];
  for (let offset = 0; offset < FORECAST_RANGE_DAYS; offset += 1) {
    days.push(buildWeatherDay(baseDate, offset));
  }

  return {
    generatedAtISO: new Date().toISOString(),
    anchorDayISO: anchorIso,
    days,
  };
}

/**
 * 根据基准日期与偏移天数生成某一天的天气条目，所有值由日期种子推导。
 */
function buildWeatherDay(baseDate: Date, offsetDays: number): WeatherDay {
  const targetDate = addDays(baseDate, offsetDays);
  const year = targetDate.getUTCFullYear();
  const month = targetDate.getUTCMonth() + 1;
  const day = targetDate.getUTCDate();
  const weekdayIndex = ((targetDate.getUTCDay() - 1 + 7) % 7) as number;
  const weekdayName = TIME_WEEK_NAMES[weekdayIndex] ?? TIME_WEEK_NAMES[0];

  const seasonIndex = seasonIndexOf(month);
  const seedBase = year * 10000 + month * 100 + day;
  const conditionType = pickConditionType(seedBase, seasonIndex);
  const condition = CONDITION_DETAIL_MAP[conditionType];

  const temperature = calculateTemperature(seedBase, seasonIndex, condition.tempOffset);
  const precipitationChance = calculateProbability(seedBase + 17, condition.precipitationBias);
  const humidity = calculateProbability(seedBase + 23, condition.humidityBias, 0.1);
  const windLevel = calculateWindLevel(seedBase + 31, condition.windBias);
  const narrative = buildNarrative({
    weekdayName,
    conditionLabel: condition.label,
    temperature,
    precipitationChance,
    windLevel,
  });

  return {
    condition: {
      type: condition.type,
      label: condition.label,
      description: condition.description,
    },
    temperature,
    precipitationChance,
    humidity,
    windLevel,
    narrative,
  };
}

/**
 * 读取 clock.now 中的年月日，生成 UTC 当天 Date 作为天气锚点。
 */
function getAnchorDate(clock: Clock): Date | null {
  const { year, month, day } = clock.now;
  if (!year || !month || !day) {
    return null;
  }
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * 在给定日期上追加 offset 天数，得到新的 Date。
 */
function addDays(date: Date, offset: number): Date {
  return new Date(date.getTime() + offset * 86400000);
}

/**
 * 将日期转成 YYYY-MM-DD 字符串，便于与 runtime.weather.anchorDayISO 比较。
 */
function formatDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/**
 * 将数字补齐为两位字符串。
 */
function pad(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

/**
 * 使用日期种子与季节索引，在对应季节的天气池中挑选天气类型，确保同一天恒定。
 */
function pickConditionType(seed: number, seasonIdx: number): WeatherConditionType {
  const pool = SEASON_CONDITION_POOL[seasonIdx] ?? WEATHER_CONDITION_TYPES;
  const value = pseudoRandom(seed);
  const index = Math.floor(value * pool.length) % pool.length;
  return pool[index];
}

/**
 * 基于季节温度模板和天气偏移，生成当日的最高/最低温度。
 */
function calculateTemperature(seed: number, seasonIdx: number, offset: number) {
  const preset = SEASON_TEMPERATURE_PRESET[seasonIdx] ?? { min: 8, max: 20 };
  const variance = 6;
  const min = Math.round(preset.min + offset + (pseudoRandom(seed) - 0.5) * variance);
  const rawMax = Math.round(preset.max + offset + (pseudoRandom(seed + 7) - 0.5) * variance);
  const max = Math.max(rawMax, min + 2);
  return {
    minC: min,
    maxC: max,
  };
}

/**
 * 根据基准概率与随机微调，生成 0-1 的概率值（湿度/降水）。
 */
function calculateProbability(seed: number, bias: number, spread = 0.2): number {
  const value = bias + (pseudoRandom(seed) - 0.5) * spread * 2;
  return clamp(value, 0, 1);
}

/**
 * 生成 1-12 级的风力值，受天气类型的风力偏移影响。
 */
function calculateWindLevel(seed: number, bias: number): number {
  const value = bias + Math.round((pseudoRandom(seed) - 0.5) * 4);
  return Math.max(1, Math.min(12, value));
}

/**
 * 将生成的指标转换成一句可读中文描述，用于 UI 展示。
 */
function buildNarrative({
  weekdayName,
  conditionLabel,
  temperature,
  precipitationChance,
  windLevel,
}: {
  weekdayName: string;
  conditionLabel: string;
  temperature: { minC: number; maxC: number };
  precipitationChance: number;
  windLevel: number;
}): string {
  const precipText =
    precipitationChance > 0.6 ? '降水概率较高' : precipitationChance < 0.2 ? '几乎无降水可能' : '有零散降水机会';
  return `${weekdayName} ${conditionLabel}，最高 ${temperature.maxC}C / 最低 ${temperature.minC}C，${precipText}，风力等级 ${windLevel} 级。`;
}

/**
 * 简单的可重复伪随机函数，保证相同种子得到相同结果。
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * 将数值限制在 [min, max]，防止概率或风力越界。
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
