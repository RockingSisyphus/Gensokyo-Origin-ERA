/**
 * @file 为 festival 模块提供独立的、自包含的测试数据
 */

import _ from 'lodash';
import baseTestData from '../stat-test-data.json';

// --- 基础数据 ---
// 使用一个特定的节日列表和纪元时间来进行测试
const festivalSpecificData = {
  config: {
    time: {
      epochISO: '2025-01-01T00:00:00+09:00',
    },
  },
  festivals_list: [
    {
      month: 1,
      start_day: 1,
      end_day: 3,
      name: '正月（三天）',
      type: 'seasonal_festival',
      customs: ['初诣参拜', '食御节料理', '发压岁钱'],
      importance: 5,
      主办地: '博丽神社',
    },
    {
      month: 2,
      start_day: 3,
      end_day: 3,
      name: '节分',
      type: 'seasonal_festival',
      customs: ['撒豆驱鬼'],
      importance: 4,
      主办地: '博丽神社',
    },
    {
      month: 12,
      start_day: 31,
      end_day: 31,
      name: '大晦日（除夜）',
      type: 'seasonal_festival',
      customs: ['食跨年荞麦面', '敲钟一百零八声'],
      importance: 4,
      主办地: '博丽神社',
    },
  ],
};
const baseFestivalStat = _.merge(_.cloneDeep(baseTestData), festivalSpecificData);

// --- 工具函数 ---
// 计算从基准日到目标日期的分钟数
const getProgress = (targetMonth: number, targetDay: number): number => {
  const epoch = new Date(baseFestivalStat.config.time.epochISO);
  const target = new Date(epoch);
  // 注意：Date.setMonth 的月份参数是从0开始的
  target.setMonth(targetMonth - 1, targetDay);
  const diffMs = target.getTime() - epoch.getTime();
  return diffMs / 60000;
};

// --- 测试场景 1: 节日进行中 (正月第二天: 1月2日) ---
export const festivalTest_Ongoing = _.cloneDeep(baseFestivalStat);
festivalTest_Ongoing.世界.timeProgress = getProgress(1, 2);

// --- 测试场景 2: 节日即将开始 (节分前2天: 2月1日) ---
export const festivalTest_Upcoming = _.cloneDeep(baseFestivalStat);
festivalTest_Upcoming.世界.timeProgress = getProgress(2, 1);

// --- 测试场景 3: 无任何节日 (4月15日) ---
export const festivalTest_None = _.cloneDeep(baseFestivalStat);
festivalTest_None.世界.timeProgress = getProgress(4, 15);

// --- 测试场景 4: 边界情况 - 节日第一天 (正月: 1月1日) ---
export const festivalTest_BoundaryStart = _.cloneDeep(baseFestivalStat);
festivalTest_BoundaryStart.世界.timeProgress = getProgress(1, 1);

// --- 测试场景 5: 边界情况 - 节日最后一天 (正月: 1月3日) ---
export const festivalTest_BoundaryEnd = _.cloneDeep(baseFestivalStat);
festivalTest_BoundaryEnd.世界.timeProgress = getProgress(1, 3);

// --- 测试场景 6: 跨年预告 (大晦日前2天: 12月29日) ---
export const festivalTest_CrossYearUpcoming = _.cloneDeep(baseFestivalStat);
festivalTest_CrossYearUpcoming.世界.timeProgress = getProgress(12, 29);

// --- 测试场景 7: 空节日列表 ---
export const festivalTest_EmptyList = _.cloneDeep(baseFestivalStat);
festivalTest_EmptyList.festivals_list = [];
festivalTest_EmptyList.世界.timeProgress = getProgress(1, 1);
