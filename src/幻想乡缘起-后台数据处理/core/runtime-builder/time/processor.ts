import _ from 'lodash';
import { Logger } from '../../../utils/log';
import * as TimeData from './data';
import { PAD2, periodIndexOf, seasonIndexOf, weekStart, ymID, ymdID } from './utils';

const logger = new Logger();

export function processTime({ runtime, stat }: { runtime: any; stat: any }) {
  const funcName = 'processTime';

  // 预先清理上一轮的计算结果，但保留 clockAck
  if (runtime.clock) {
    delete runtime.clock.now;
    delete runtime.clock.flags;
  }

  try {
    logger.debug(funcName, `开始时间计算，stat=`, stat);
    logger.debug(funcName, `开始时间计算，runtime=`, runtime);
    // ---------- 读取上一楼层的 ACK (从传入的 runtime 对象) ----------
    const prev = _.get(runtime, 'clock.clockAck', null) as any;
    logger.debug(funcName, `从 runtime 读取上一楼 ACK:`, prev);

    // ---------- 读取时间源和配置 ----------
    const timeConfig = _.get(stat, 'config.time', {});
    const epochISO = _.get(timeConfig, 'epochISO', TimeData.EPOCH_ISO);
    const periodNames = _.get(timeConfig, 'periodNames', TimeData.PERIOD_NAMES);
    const periodKeys = _.get(timeConfig, 'periodKeys', TimeData.PERIOD_KEYS);
    const seasonNames = _.get(timeConfig, 'seasonNames', TimeData.SEASON_NAMES);
    const seasonKeys = _.get(timeConfig, 'seasonKeys', TimeData.SEASON_KEYS);
    const weekNames = _.get(timeConfig, 'weekNames', TimeData.WEEK_NAMES);

    const tpMin = _.get(stat, '世界.timeProgress', 0);
    logger.debug(funcName, `配置: epochISO=${epochISO}, timeProgress=${tpMin}min`);

    const weekStartsOn = 1; // 周一

    const epochMS = Date.parse(epochISO);
    if (Number.isNaN(epochMS)) {
      logger.warn(funcName, `epochISO 解析失败，使用 1970-01-01Z；原值=${epochISO}`);
    }
    const baseMS = Number.isNaN(epochMS) ? 0 : epochMS;

    let tzMin = 0;
    const tzMatch = String(epochISO).match(/(?:([+-])(\d{2}):?(\d{2})|Z)$/);
    if (tzMatch && tzMatch[0] !== 'Z') {
      tzMin = (tzMatch[1] === '-' ? -1 : 1) * (parseInt(tzMatch[2], 10) * 60 + parseInt(tzMatch[3], 10));
    }

    // ---------- 计算当前本地时间 ----------
    const nowUTCms = baseMS + tpMin * 60000;
    const local = new Date(nowUTCms + tzMin * 60000);

    const year = local.getUTCFullYear();
    const month = local.getUTCMonth() + 1;
    const day = local.getUTCDate();

    const seasonIdx = seasonIndexOf(month);
    const seasonName = seasonNames[seasonIdx];
    const seasonID = year * 10 + seasonIdx;

    const ws = weekStart(local, weekStartsOn);
    const dayID = ymdID(local);
    const weekID = ymdID(ws);
    const monthID = ymID(local);
    const yearID = year;

    const weekdayIdx = (local.getUTCDay() - 1 + 7) % 7;
    const weekdayName = weekNames[weekdayIdx] || `周?(${weekdayIdx})`;

    const sign = tzMin >= 0 ? '+' : '-';
    const offH = ('0' + Math.floor(Math.abs(tzMin) / 60)).slice(-2);
    const offM = ('0' + (Math.abs(tzMin) % 60)).slice(-2);
    const iso =
      `${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}T` +
      `${('0' + local.getUTCHours()).slice(-2)}:${('0' + local.getUTCMinutes()).slice(-2)}:${('0' + local.getUTCSeconds()).slice(-2)}` +
      `${sign}${offH}:${offM}`;

    const minutesSinceMidnight = local.getUTCHours() * 60 + local.getUTCMinutes();
    const periodIdx = periodIndexOf(minutesSinceMidnight);
    const periodName = periodNames[periodIdx];
    const periodKey = periodKeys[periodIdx];
    const periodID = dayID * 10 + periodIdx;

    logger.log(
      funcName,
      `计算: nowLocal=${iso}, dayID=${dayID}, weekID=${weekID}, monthID=${monthID}, yearID=${yearID}`,
    );
    logger.log(funcName, `时段: ${periodName} (idx=${periodIdx}, mins=${minutesSinceMidnight})`);
    logger.log(funcName, `季节: ${seasonName} (idx=${seasonIdx})`);

    // ---------- 变化判定 ----------
    let newDay = false,
      newWeek = false,
      newMonth = false,
      newYear = false,
      newPeriod = false,
      newSeason = false;

    if (prev && typeof prev === 'object') {
      const d = prev.dayID !== dayID;
      const w = prev.weekID !== weekID;
      const m = prev.monthID !== monthID;
      const y = prev.yearID !== yearID;
      const s = prev.seasonID !== seasonID;
      const p = prev.periodID !== periodID;

      // 按照 年 > 季节 > 月 > 周 > 日 > 时段 的层级进行级联判断
      newYear = y;
      newSeason = newYear || s;
      newMonth = newSeason || m;
      newWeek = newMonth || w;
      newDay = newWeek || d;
      newPeriod = newDay || p;

      logger.log(
        funcName,
        `比较: raw={d:${d},w:${w},m:${m},y:${y},s:${s},p:${p}} -> cascade={day:${newDay},week:${newWeek},month:${newMonth},year:${newYear},season:${newSeason},period:${newPeriod}}`,
      );
    } else {
      logger.log(funcName, '首次或上一楼无 ACK: 不触发 new* (全部 false)');
    }

    // ---------- 构造返回值 ----------
    const clockAck = { dayID, weekID, monthID, yearID, periodID, periodIdx, seasonID, seasonIdx };

    const now = {
      iso,
      year,
      month,
      day,
      weekdayIndex: weekdayIdx,
      weekdayName,
      periodName,
      periodIdx,
      minutesSinceMidnight,
      seasonName,
      seasonIdx,
      hour: Math.floor(minutesSinceMidnight / 60),
      minute: minutesSinceMidnight % 60,
      hm: PAD2(Math.floor(minutesSinceMidnight / 60)) + ':' + PAD2(minutesSinceMidnight % 60),
    };

    const periodFlags = {
      newDawn: false,
      newMorning: false,
      newNoon: false,
      newAfternoon: false,
      newDusk: false,
      newNight: false,
      newFirstHalfNight: false,
      newSecondHalfNight: false,
    };
    if (newPeriod) (periodFlags as any)[periodKey] = true;

    const seasonFlags = {
      newSpring: false,
      newSummer: false,
      newAutumn: false,
      newWinter: false,
    };
    if (newSeason) (seasonFlags as any)[seasonKeys[seasonIdx]] = true;

    const flags = {
      newPeriod,
      byPeriod: periodFlags,
      newDay,
      newWeek,
      newMonth,
      newSeason,
      bySeason: seasonFlags,
      newYear,
    };

    const result = {
      clock: {
        clockAck,
        now,
        flags,
      },
    };

    logger.log(funcName, '时间数据处理完成，返回待写入 runtime 的数据。');
    _.merge(runtime, result);
    return runtime;
  } catch (err: any) {
    logger.error(funcName, '运行失败: ' + (err?.message || String(err)), err);
    // 失败时也要确保清理
    if (runtime.clock) {
      delete runtime.clock.now;
      delete runtime.clock.flags;
    }
    return runtime;
  }
}
