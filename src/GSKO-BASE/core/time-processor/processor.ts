import { z } from 'zod';
import {
  BY_PERIOD_KEYS,
  BY_SEASON_KEYS,
  ClockAck,
  ClockFlags,
  EMPTY_FLAGS,
  EMPTY_NOW,
  NowSchema,
} from '../../schema/clock';
import { Stat } from '../../schema/stat';
import { TimeProcessorResult } from '../../schema/time-processor-result';
import { TIME_PERIOD_KEYS, TIME_PERIOD_NAMES, TIME_SEASON_NAMES, TIME_WEEK_NAMES } from '../../schema/time/constants';
import { Logger } from '../../utils/log';
import { getTimeConfig, getTimeProgress } from './accessors';
import { PAD2, periodIndexOf, seasonIndexOf, weekStart, ymID, ymdID } from './utils';

const logger = new Logger();

interface ProcessTimeParams {
  stat: Stat;
  prevClockAck: ClockAck | null;
}

export function processTime({ stat, prevClockAck }: ProcessTimeParams): TimeProcessorResult {
  const funcName = 'processTime';

  try {
    logger.debug(funcName, `开始时间计算...`);
    // ---------- 读取上一楼层的 ACK (从参数传入) ----------
    const prev = prevClockAck;
    logger.debug(funcName, `从缓存读取上一楼 ACK:`, prev);

    // ---------- 读取时间源和配置 ----------
    const timeConfig = getTimeConfig(stat);
    const { epochISO } = timeConfig;

    const tpMin = getTimeProgress(stat);
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
    const seasonName = TIME_SEASON_NAMES[seasonIdx];
    const seasonID = year * 10 + seasonIdx;

    const ws = weekStart(local, weekStartsOn);
    const dayID = ymdID(local);
    const weekID = ymdID(ws);
    const monthID = ymID(local);
    const yearID = year;

    const weekdayIdx = (local.getUTCDay() - 1 + 7) % 7;
    const weekdayName = TIME_WEEK_NAMES[weekdayIdx] || `周?(${weekdayIdx})`;

    const sign = tzMin >= 0 ? '+' : '-';
    const offH = ('0' + Math.floor(Math.abs(tzMin) / 60)).slice(-2);
    const offM = ('0' + (Math.abs(tzMin) % 60)).slice(-2);
    const iso =
      `${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}T` +
      `${('0' + local.getUTCHours()).slice(-2)}:${('0' + local.getUTCMinutes()).slice(-2)}:${('0' + local.getUTCSeconds()).slice(-2)}` +
      `${sign}${offH}:${offM}`;

    const minutesSinceMidnight = local.getUTCHours() * 60 + local.getUTCMinutes();
    const periodIdx = periodIndexOf(minutesSinceMidnight);
    const periodName = TIME_PERIOD_NAMES[periodIdx];
    const periodKey = TIME_PERIOD_KEYS[periodIdx];
    const periodID = dayID * 10 + periodIdx;

    logger.debug(
      funcName,
      `计算: nowLocal=${iso}, dayID=${dayID}, weekID=${weekID}, monthID=${monthID}, yearID=${yearID}`,
    );
    logger.debug(funcName, `时段: ${periodName} (idx=${periodIdx}, mins=${minutesSinceMidnight})`);
    logger.debug(funcName, `季节: ${seasonName} (idx=${seasonIdx})`);

    // ---------- 变化判定 ----------
    let newDay = false,
      newWeek = false,
      newMonth = false,
      newYear = false,
      newPeriod = false,
      newSeason = false;

    if (prev) {
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

      logger.debug(
        funcName,
        `比较: raw={d:${d},w:${w},m:${m},y:${y},s:${s},p:${p}} -> cascade={day:${newDay},week:${newWeek},month:${newMonth},year:${newYear},season:${newSeason},period:${newPeriod}}`,
      );
    } else {
      logger.debug(funcName, '首次或上一楼无 ACK: 不触发 new* (全部 false)');
    }

    // ---------- 构造返回值 ----------
    const newClockAck: ClockAck = { dayID, weekID, monthID, yearID, periodID, periodIdx, seasonID, seasonIdx };

    const now: z.infer<typeof NowSchema> = {
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

    const byPeriod = {
      newDawn: false,
      newMorning: false,
      newNoon: false,
      newAfternoon: false,
      newDusk: false,
      newNight: false,
      newFirstHalfNight: false,
      newSecondHalfNight: false,
    };

    if (newPeriod) {
      const keyToSet = BY_PERIOD_KEYS[periodIdx];
      if (keyToSet) {
        byPeriod[keyToSet] = true;
      }
    }

    const bySeason = {
      newSpring: false,
      newSummer: false,
      newAutumn: false,
      newWinter: false,
    };

    if (newSeason) {
      const keyToSet = BY_SEASON_KEYS[seasonIdx];
      if (keyToSet) {
        bySeason[keyToSet] = true;
      }
    }

    const flags: ClockFlags = {
      newPeriod,
      byPeriod,
      newDay,
      newWeek,
      newMonth,
      newSeason,
      bySeason,
      newYear,
    };

    const result: TimeProcessorResult = {
      clock: {
        now,
        flags,
      },
      // 将 clockAck 单独返回，以便上层写入 cache
      newClockAck,
    };

    logger.debug(funcName, '时间数据处理完成，返回待写入 runtime 的数据。');
    return result;
  } catch (err: any) {
    logger.error(funcName, '运行失败: ' + (err?.message || String(err)), err);
    // 失败时返回一个定义好的空结构，以避免类型错误
    return { clock: { now: EMPTY_NOW, flags: EMPTY_FLAGS }, newClockAck: null };
  }
}
