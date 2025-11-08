/**
 * @file 节日信息处理器
 * @description 计算当前日期下的节日信息，并写入 runtime。
 */

import _ from 'lodash';
import { z } from 'zod';
import { Stat } from '../../schema/stat';
import { FestivalSchema, Runtime } from '../../schema/runtime';
import { Logger } from '../../utils/log';
import { dayOfYear } from './utils';

const logger = new Logger();

// 定义此处理器生成的运行时数据片段的类型
type FestivalProcessorResult = {
  festival: z.infer<typeof FestivalSchema>;
};

/**
 * 处理节日信息，计算当前和未来的节日，并将其合并到 runtime 对象中。
 * @param {object} params - 参数对象
 * @param {Runtime} params.runtime - 当前的 runtime 对象，包含时钟信息。
 * @param {Stat} params.stat - 包含 festivals_list 的 stat 对象。
 * @returns {FestivalProcessorResult} - 包含 festival 数据的对象。
 */
export function processFestival({ runtime, stat }: { runtime: Runtime; stat: Stat }): FestivalProcessorResult {
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
    if (!runtime.clock) {
      logger.warn(funcName, 'runtime.clock 未定义，无法处理节日信息。');
      return { festival: defaultFestivalInfo };
    }
    // schema 保证了 clock.now 和 festivals_list 的存在，因此可以直接访问
    const { month: currentMonth, day: currentDay } = runtime.clock.now;
    const { festivals_list: festivalList } = stat; // festivalList is a Record<string, Festival>

    // 如果节日列表为空，则直接写入默认值并返回
    if (Object.keys(festivalList).length === 0) {
      logger.debug(funcName, '节日列表为空，写入默认节日信息。');
      return { festival: defaultFestivalInfo };
    }
    logger.debug(
      funcName,
      `日期: ${currentMonth}/${currentDay}，节日列表条目数: ${Object.keys(festivalList).length}`,
    );

    // ---------- 2. 判定今日是否在节日内 ----------
    let todayFest: (typeof festivalList)[string] | null = null;
    for (const festId in festivalList) {
      const fest = festivalList[festId];
      if (fest.month === currentMonth && fest.start_day <= currentDay && currentDay <= fest.end_day) {
        todayFest = fest;
        break; // 找到即可退出
      }
    }

    // ---------- 3. 寻找“下一个节日”（距今的最小正天数，含跨年） ----------
    const todayDayOfYear = dayOfYear(currentMonth, currentDay);
    let nextFest: (typeof festivalList)[string] | null = null;
    let minDayGap = Infinity;

    for (const festId in festivalList) {
      const fest = festivalList[festId];
      const startDayOfYear = dayOfYear(fest.month, fest.start_day);
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
            host: todayFest.host ?? '', // 确保有默认值
            customs: todayFest.customs?.slice(0, 6) ?? [], // 确保有默认值
            month: todayFest.month,
            start_day: todayFest.start_day,
            end_day: todayFest.end_day,
          }
        : null,
      next:
        nextFest && minDayGap <= 3
          ? {
              name: nextFest.name,
              host: nextFest.host ?? '', // 确保有默认值
              customs: nextFest.customs?.slice(0, 6) ?? [], // 确保有默认值
              month: nextFest.month,
              start_day: nextFest.start_day,
              end_day: nextFest.end_day,
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
