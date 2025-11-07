import { Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { Logger } from '../../utils/log';
import { buildWeatherRuntime } from './processor';

const logger = new Logger();

export function processWeather({
  stat,
  runtime,
}: {
  stat: Stat;
  runtime: Runtime;
}): { runtime: Runtime } {
  const funcName = 'processWeather';
  logger.debug(funcName, '开始计算天气预报...');

  try {
    void stat;
    const weather = buildWeatherRuntime({
      clock: runtime.clock,
      current: runtime.weather,
    });

    if (weather) {
      runtime.weather = weather;
    }

    logger.debug(funcName, '天气处理完成。');
    return { runtime };
  } catch (err) {
    logger.error(funcName, '天气处理失败:', err);
    return { runtime };
  }
}
