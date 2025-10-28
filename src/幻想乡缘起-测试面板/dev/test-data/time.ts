import _ from 'lodash';

// ==================================================================
// 时间模块测试数据
// ==================================================================

const baseTimeData = {
  config: {
    time: {
      epochISO: '2025-10-24T06:00:00+09:00', // JST, 2025-10-24 清晨
    },
  },
  世界: {
    timeProgress: 0,
  },
};

// 场景 1: 首次运行 (2025-10-24 06:00 JST, 清晨)
export const timeTest_Initial = _.cloneDeep(baseTimeData);

// 场景 2: 时间推进，但不跨越任何边界 (2025-10-24 06:10 JST, 清晨)
export const timeTest_NoChange = _.cloneDeep(baseTimeData);
timeTest_NoChange.世界.timeProgress = 10; // 推进10分钟

// 场景 3: 跨时段 (清晨 -> 上午) (2025-10-24 08:00 JST, 上午)
export const timeTest_NewPeriod = _.cloneDeep(baseTimeData);
timeTest_NewPeriod.世界.timeProgress = 2 * 60; // 06:00 + 2h = 08:00

// 场景 4: 跨天 (2025-10-25 01:00 JST, 夜晚)
export const timeTest_NewDay = _.cloneDeep(baseTimeData);
timeTest_NewDay.世界.timeProgress = 19 * 60; // 06:00 + 19h = 01:00 a.m. next day

// 场景 5: 跨周 (2025-10-27 06:00 JST, 周一 清晨)
export const timeTest_NewWeek = _.cloneDeep(baseTimeData);
timeTest_NewWeek.世界.timeProgress = 3 * 24 * 60; // Oct 24 (Fri) + 3 days = Oct 27 (Mon)

// 场景 6: 跨月 (2025-11-01 06:00 JST, 清晨)
export const timeTest_NewMonth = _.cloneDeep(baseTimeData);
timeTest_NewMonth.世界.timeProgress = 8 * 24 * 60; // Oct 24th + 8 days = Nov 1st

// 场景 7: 跨季节 (秋 -> 冬) (2025-12-01 06:00 JST, 清晨)
export const timeTest_NewSeason = _.cloneDeep(baseTimeData);
timeTest_NewSeason.世界.timeProgress = (8 + 30) * 24 * 60; // Oct 24th -> Dec 1st

// 场景 8: 跨年 (2026-01-01 06:00 JST, 清晨)
export const timeTest_NewYear = _.cloneDeep(baseTimeData);
timeTest_NewYear.世界.timeProgress = (8 + 30 + 31) * 24 * 60; // Oct 24th -> Jan 1st
