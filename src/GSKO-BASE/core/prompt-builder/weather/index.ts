import type { Runtime } from '../../../schema/runtime';
import type { WeatherDay } from '../../../schema/weather';
import { Logger } from '../../../utils/log';

const logger = new Logger();

/**
 * @description 读取 runtime.weather ，向 AI 提示“今天/明天”的天气情况。
 * @returns {string | null} 天气提示词，若无有效天气数据则返回 null。
 */
export function buildWeatherPrompt({ runtime }: { runtime: Runtime | null }): string | null {
  const funcName = 'buildWeatherPrompt';

  try {
    const weather = runtime?.weather;
    if (!weather || !Array.isArray(weather.days) || weather.days.length === 0) {
      logger.debug(funcName, '缺少 weather.days，跳过天气提示词。');
      return null;
    }

    const today = weather.days[0];
    const tomorrow = weather.days[1];

    const lines: string[] = [];
    if (today) {
      lines.push(formatWeatherLine('今天', today));
    }
    if (tomorrow) {
      lines.push(formatWeatherLine('明天', tomorrow));
    }

    if (lines.length === 0) {
      return null;
    }

    const prompt = ['天气情况：', ...lines.map(line => `- ${line}`)].join('\n');
    logger.debug(funcName, '天气提示词生成成功。', { prompt });
    return prompt;
  } catch (err: any) {
    logger.error(funcName, '生成天气提示词失败: ' + (err?.message || String(err)), err);
    return null;
  }
}

function formatWeatherLine(label: string, day: WeatherDay): string {
  const condition = day.condition?.label || '未知天气';
  const temp = formatTemperature(day);
  const precipitation = formatPercent(day.precipitationChance);
  const humidity = formatPercent(day.humidity);
  const wind = Number.isFinite(day.windLevel) ? `${day.windLevel}级` : '未知风力';
  const detailParts = [`温度 ${temp}`, `降水 ${precipitation}`, `湿度 ${humidity}`, `风力 ${wind}`];
  const detail = detailParts.join('，');
  return `${label}：${condition}，${detail}。`;
}

function formatTemperature(day: WeatherDay): string {
  const temperature = day.temperature;
  const maxValue = temperature?.maxC;
  const minValue = temperature?.minC;
  const max = Number.isFinite(maxValue) ? `${maxValue}°C` : '未知';
  const min = Number.isFinite(minValue) ? `${minValue}°C` : '未知';
  return `${max} / ${min}`;
}

function formatPercent(value?: number | null): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '未知';
  }
  return `${Math.round(value * 100)}%`;
}
