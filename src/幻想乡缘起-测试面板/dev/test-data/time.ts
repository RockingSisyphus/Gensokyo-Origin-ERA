import _ from 'lodash';

// ==================================================================
// 时间模块测试数据
// 每个测试场景现在都是独立的，包含了完整的 stat 对象（含 cache）。
// ==================================================================

const baseConfig = {
  config: {
    time: {
      epochISO: '2025-10-24T06:00:00+09:00', // JST, 2025-10-24 清晨
    },
  },
};

// 场景 1: 首次运行 (2025-10-24 06:00 JST, 清晨)
// 预期: new* 均为 false
export const timeTest_Initial = {
  ..._.cloneDeep(baseConfig),
  世界: { timeProgress: 0 },
  // cache 为空，模拟首次运行
};

// 场景 2: 时间推进，但不跨越任何边界 (2025-10-24 06:10 JST, 清晨)
// 预期: new* 均为 false
export const timeTest_NoChange = {
  ..._.cloneDeep(baseConfig),
  世界: { timeProgress: 10 }, // 推进10分钟
  cache: {
    time: {
      // 上一刻是 06:00
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
  },
};

// 场景 3: 跨时段 (清晨 -> 上午) (2025-10-24 08:00 JST, 上午)
// 预期: newPeriod=true, newDay=true, ...
export const timeTest_NewPeriod = {
  ..._.cloneDeep(baseConfig),
  世界: { timeProgress: 2 * 60 }, // 06:00 + 2h = 08:00
  cache: {
    time: {
      // 上一刻是 07:59 (清晨)
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
  },
};

// 场景 4: 跨天 (2025-10-25 01:00 JST, 夜晚)
// 预期: newDay=true, newWeek=false, ...
export const timeTest_NewDay = {
  ..._.cloneDeep(baseConfig),
  世界: { timeProgress: 19 * 60 }, // 06:00 + 19h = 01:00 a.m. next day
  cache: {
    time: {
      // 上一刻是 2025-10-24 23:59 (深夜)
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
  },
};

// 场景 5: 跨周 (2025-10-27 06:00 JST, 周一 清晨)
// 预期: newWeek=true, ...
export const timeTest_NewWeek = {
  ..._.cloneDeep(baseConfig),
  世界: { timeProgress: 3 * 24 * 60 }, // Oct 24 (Fri) + 3 days = Oct 27 (Mon)
  cache: {
    time: {
      // 上一刻是 2025-10-26 (周日)
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
  },
};

// 场景 6: 跨月 (2025-11-01 06:00 JST, 清晨)
// 预期: newMonth=true, ...
export const timeTest_NewMonth = {
  ..._.cloneDeep(baseConfig),
  世界: { timeProgress: 8 * 24 * 60 }, // Oct 24th + 8 days = Nov 1st
  cache: {
    time: {
      // 上一刻是 2025-10-31
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
  },
};

// 场景 7: 跨季节 (秋 -> 冬) (2025-12-01 06:00 JST, 清晨)
// 预期: newSeason=true, ...
export const timeTest_NewSeason = {
  ..._.cloneDeep(baseConfig),
  世界: { timeProgress: (8 + 30) * 24 * 60 }, // Oct 24th -> Dec 1st
  cache: {
    time: {
      // 上一刻是 2025-11-30 (秋)
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
  },
};

// 场景 8: 跨年 (2026-01-01 06:00 JST, 清晨)
// 预期: newYear=true, ...
export const timeTest_NewYear = {
  ..._.cloneDeep(baseConfig),
  世界: { timeProgress: (8 + 30 + 31) * 24 * 60 }, // Oct 24th -> Jan 1st
  cache: {
    time: {
      // 上一刻是 2025-12-31 (冬)
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
  },
};
