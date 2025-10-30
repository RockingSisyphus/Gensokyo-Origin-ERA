/**
 * @file 节日信息处理器
 * @description 计算当前日期下的节日信息，并写入 runtime。
 */

import _ from 'lodash';
import { Logger } from '../../utils/log';
import { dayOfYear, toNumber } from './utils';

const logger = new Logger();

/**
 * 处理节日信息，计算当前和未来的节日，并将其合并到 runtime 对象中。
 * @param {object} params - 参数对象
 * @param {any} params.runtime - 当前的 runtime 对象，包含时钟信息。
 * @param {any} params.stat - 包含 festivals_list 的 stat 对象。
 * @returns {any} - 包含 festival 数据的对象。
 */
export function processFestival({ runtime, stat }: { runtime: any; stat: any }): any {
  const funcName = 'processFestival';

  // 定义默认的“无节日”状态，确保 runtime.festival 总是被覆盖
  const defaultFestivalInfo = {
    ongoing: false,
    upcoming: false,
    current: null,
    next: null,
  };

  try {
    // ---------- 1. 读取所需数据 ----------
    const currentMonth = _.get(runtime, 'clock.now.month');
    const currentDay = _.get(runtime, 'clock.now.day');
    const festivalList = _.get(stat, 'festivals_list', []);

    // 如果没有日期信息或节日列表，则直接写入默认值并返回
    if (!currentMonth || !currentDay || !Array.isArray(festivalList) || festivalList.length === 0) {
      logger.debug(funcName, '日期信息不完整或节日列表为空，写入默认节日信息。');
      return { festival: defaultFestivalInfo };
    }
    logger.debug(funcName, `日期: ${currentMonth}/${currentDay}，节日列表条目数: ${festivalList.length}`);

    // ---------- 2. 判定今日是否在节日内 ----------
    const todayFest =
      festivalList.find(
        (fest: any) =>
          toNumber(fest.month) === currentMonth &&
          toNumber(fest.start_day) <= currentDay &&
          currentDay <= toNumber(fest.end_day),
      ) || null;

    // ---------- 3. 寻找“下一个节日”（距今的最小正天数，含跨年） ----------
    const todayDayOfYear = dayOfYear(currentMonth, currentDay);
    let nextFest: any | null = null;
    let minDayGap = Infinity;

    for (const fest of festivalList) {
      const startDayOfYear = dayOfYear(toNumber(fest.month), toNumber(fest.start_day));
      const rawGap = startDayOfYear - todayDayOfYear;
      // 将 gap 归一化到 [0, 364] 的环形距离
      const normalizedGap = ((rawGap % 365) + 365) % 365;

      if (normalizedGap === 0) {
        // 今天开始的节日不算是“下一个”
        continue;
      }

      if (normalizedGap > 0 && normalizedGap < minDayGap) {
        minDayGap = normalizedGap;
        nextFest = fest;
      }
    }

    // ---------- 4. 组织要写入 runtime 的数据 ----------
    const festivalInfo = {
      ongoing: !!todayFest,
      upcoming: !!(nextFest && minDayGap <= 3),
      current: todayFest
        ? {
            name: todayFest.name,
            host: todayFest['主办地'],
            customs: Array.isArray(todayFest.customs) ? todayFest.customs.slice(0, 6) : [],
            month: toNumber(todayFest.month),
            start_day: toNumber(todayFest.start_day),
            end_day: toNumber(todayFest.end_day),
          }
        : null,
      next:
        nextFest && minDayGap <= 3
          ? {
              name: nextFest.name,
              host: nextFest['主办地'],
              customs: Array.isArray(nextFest.customs) ? nextFest.customs.slice(0, 6) : [],
              month: toNumber(nextFest.month),
              start_day: toNumber(nextFest.start_day),
              end_day: toNumber(nextFest.end_day),
              days_until: minDayGap,
            }
          : null,
    };

    // ---------- 5. 构造返回值 ----------
    const result = { festival: festivalInfo };

    logger.debug(funcName, '节日数据处理完成，返回待写入 runtime 的数据：', result);
    return result;
  } catch (err: any) {
    logger.error(funcName, '运行失败: ' + (err?.message || String(err)), err);
    // 失败时返回一个空的 festival 对象，以覆盖旧数据
    return { festival: defaultFestivalInfo };
  }
}
