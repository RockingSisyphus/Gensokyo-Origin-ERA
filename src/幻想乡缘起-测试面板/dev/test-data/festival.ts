/**
 * @file festival 模块提供独立的、自包含的测试数据
 */

import _ from 'lodash';
import type { Stat } from '../../../GSKO-BASE/schema/stat';
import '../stat-test-data.json';

const FESTIVAL_EPOCH_ISO = '2025-01-01T00:00:00Z';

const festivalSpecificData = {
  config: {
    time: {
      epochISO: FESTIVAL_EPOCH_ISO,
    },
  },
  festivals_list: [
    {
      month: 1,
      start_day: 1,
      end_day: 3,
      name: '正月（三天）',
      type: 'seasonal_festival',
      customs: ['初詣参拜', '食御节料理', '发压岁钱'],
      importance: 5,
      host: '博丽神社',
    },
    {
      month: 2,
      start_day: 3,
      end_day: 3,
      name: '节分',
      type: 'seasonal_festival',
      customs: ['撒豆驱鬼'],
      importance: 4,
      host: '博丽神社',
    },
    {
      month: 12,
      start_day: 31,
      end_day: 31,
      name: '大晦日（除夜）',
      type: 'seasonal_festival',
      customs: ['吃跨年荞麦面', '敲钟一百零八声'],
      importance: 4,
      host: '博丽神社',
    },
  ],
};

const baseFestivalStat = _.merge(_.cloneDeep(baseTestData) as Stat, festivalSpecificData) as Stat;

const getProgress = (targetMonth: number, targetDay: number): number => {
  const epoch = new Date(baseFestivalStat.config.time.epochISO);
  const target = new Date(epoch);
  target.setMonth(targetMonth - 1, targetDay);
  const diffMs = target.getTime() - epoch.getTime();
  return diffMs / 60000;
};

const createFestivalStat = (month: number, day: number) => {
  const stat = _.cloneDeep(baseFestivalStat);
  const progress = getProgress(month, day);
  _.set(stat, ['世界', 'timeProgress'], progress);

  if (_.has(stat, 'world')) {
    _.set(stat, ['world', 'timeProgress'], progress);
  }

  return stat;
};

export const festivalTest_Ongoing = createFestivalStat(1, 2);

export const festivalTest_Upcoming = createFestivalStat(2, 1);

export const festivalTest_None = createFestivalStat(4, 15);

export const festivalTest_BoundaryStart = createFestivalStat(1, 1);

export const festivalTest_BoundaryEnd = createFestivalStat(1, 3);

export const festivalTest_CrossYearUpcoming = createFestivalStat(12, 29);

export const festivalTest_EmptyList = (() => {
  const stat = createFestivalStat(1, 1);
  stat.festivals_list = [];
  return stat;
})();
