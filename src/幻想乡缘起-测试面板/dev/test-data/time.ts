import _ from 'lodash';
import baseTestData from '../stat-test-data.json';

// ==================================================================
// 时间模块测试数据
// 每个测试场景现在都是独立的，包含了完整的 stat 对象（含 cache）。
// ==================================================================

// 场景 1: 首次运行 (2025-10-24 06:00 UTC, 清晨)
// 预期: new* 均为 false
function getInitialTest() {
  const data = _.cloneDeep(baseTestData);
  data.世界.timeProgress = 0;
  delete (data as any).cache; // 确保 cache 为空，模拟首次运行
  return data;
}
export const timeTest_Initial = getInitialTest();

// 场景 2: 时间推进，但不跨越任何边界 (2025-10-24 06:10 UTC, 清晨)
// 预期: new* 均为 false
function getNoChangeTest() {
  const data = _.cloneDeep(baseTestData);
  data.世界.timeProgress = 10; // 推进10分钟
  data.cache = {
    ...baseTestData.cache,
    time: {
      // 上一刻是 06:00 UTC (timeProgress: 0)
      clockAck: {
        dayID: 20251024,
        weekID: 20251020,
        monthID: 202510,
        yearID: 2025,
        periodID: 202510240,
        periodIdx: 0,
        seasonID: 20252,
        seasonIdx: 2,
      },
    },
  };
  return data;
}
export const timeTest_NoChange = getNoChangeTest();

// 场景 3: 跨时段 (清晨 -> 上午) (2025-10-24 08:00 UTC)
// 预期: newPeriod=true, newDay=false, ...
function getNewPeriodTest() {
  const data = _.cloneDeep(baseTestData);
  data.世界.timeProgress = 2 * 60; // 06:00 + 2h = 08:00
  data.cache = {
    ...baseTestData.cache,
    time: {
      // 上一刻是 07:59 (清晨, timeProgress: 119)
      clockAck: {
        dayID: 20251024,
        weekID: 20251020,
        monthID: 202510,
        yearID: 2025,
        periodID: 202510240,
        periodIdx: 0,
        seasonID: 20252,
        seasonIdx: 2,
      },
    },
  };
  return data;
}
export const timeTest_NewPeriod = getNewPeriodTest();

// 场景 4: 跨天 (2025-10-25 01:00 UTC)
// 预期: newDay=true, newWeek=false, ...
function getNewDayTest() {
  const data = _.cloneDeep(baseTestData);
  data.世界.timeProgress = 19 * 60; // 06:00(24th) + 19h = 01:00(25th)
  data.cache = {
    ...baseTestData.cache,
    time: {
      // 上一刻是 23:59 (下半夜, 24th)
      clockAck: {
        dayID: 20251024,
        weekID: 20251020,
        monthID: 202510,
        yearID: 2025,
        periodID: 202510247,
        periodIdx: 7,
        seasonID: 20252,
        seasonIdx: 2,
      },
    },
  };
  return data;
}
export const timeTest_NewDay = getNewDayTest();

// 场景 5: 跨周 (2025-10-27 06:00 UTC, 周一)
// 预期: newWeek=true, ...
function getNewWeekTest() {
  const data = _.cloneDeep(baseTestData);
  data.世界.timeProgress = 3 * 24 * 60; // Oct 24 (Fri) + 3 days = Oct 27 (Mon)
  data.cache = {
    ...baseTestData.cache,
    time: {
      // 上一刻是 2025-10-26 (周日) 23:59
      clockAck: {
        dayID: 20251026,
        weekID: 20251020,
        monthID: 202510,
        yearID: 2025,
        periodID: 202510267,
        periodIdx: 7,
        seasonID: 20252,
        seasonIdx: 2,
      },
    },
  };
  return data;
}
export const timeTest_NewWeek = getNewWeekTest();

// 场景 6: 跨月 (2025-11-01 06:00 UTC)
// 预期: newMonth=true, ...
function getNewMonthTest() {
  const data = _.cloneDeep(baseTestData);
  data.世界.timeProgress = 8 * 24 * 60; // Oct 24th + 8 days = Nov 1st
  data.cache = {
    ...baseTestData.cache,
    time: {
      // 上一刻是 2025-10-31 23:59
      clockAck: {
        dayID: 20251031,
        weekID: 20251027,
        monthID: 202510,
        yearID: 2025,
        periodID: 202510317,
        periodIdx: 7,
        seasonID: 20252,
        seasonIdx: 2,
      },
    },
  };
  return data;
}
export const timeTest_NewMonth = getNewMonthTest();

// 场景 7: 跨季节 (秋 -> 冬) (2025-12-01 06:00 UTC)
// 预期: newSeason=true, ...
function getNewSeasonTest() {
  const data = _.cloneDeep(baseTestData);
  data.世界.timeProgress = (8 + 30) * 24 * 60; // Oct 24th -> Dec 1st
  data.cache = {
    ...baseTestData.cache,
    time: {
      // 上一刻是 2025-11-30 23:59
      clockAck: {
        dayID: 20251130,
        weekID: 20251124,
        monthID: 202511,
        yearID: 2025,
        periodID: 202511307,
        periodIdx: 7,
        seasonID: 20252,
        seasonIdx: 2,
      },
    },
  };
  return data;
}
export const timeTest_NewSeason = getNewSeasonTest();

// 场景 8: 跨年 (2026-01-01 06:00 UTC)
// 预期: newYear=true, ...
function getNewYearTest() {
  const data = _.cloneDeep(baseTestData);
  data.世界.timeProgress = (8 + 30 + 31) * 24 * 60; // Oct 24th -> Jan 1st
  data.cache = {
    ...baseTestData.cache,
    time: {
      // 上一刻是 2025-12-31 23:59
      clockAck: {
        dayID: 20251231,
        weekID: 20251229,
        monthID: 202512,
        yearID: 2025,
        periodID: 202512317,
        periodIdx: 7,
        seasonID: 20253,
        seasonIdx: 3,
      },
    },
  };
  return data;
}
export const timeTest_NewYear = getNewYearTest();
