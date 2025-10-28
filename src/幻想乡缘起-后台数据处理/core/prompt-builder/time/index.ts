import _ from 'lodash';
import { Logger } from '../../../utils/log';

const logger = new Logger();

/**
 * @description 根据 runtime.clock 数据构建世界时钟的提示词。
 * @param {any} runtime - 包含 clock 数据的 runtime 对象。
 * @returns {string | null} 构建完成的提示词字符串，如果数据无效则返回 null。
 */
export function buildTimePrompt({ runtime }: { runtime: any }): string | null {
  const funcName = 'buildTimePrompt';
  try {
    const now = _.get(runtime, 'clock.now');
    const flags = _.get(runtime, 'clock.flags');

    if (!now || !flags) {
      logger.warn(funcName, 'runtime.clock.now 或 runtime.clock.flags 不存在，无法构建时间提示词。');
      return null;
    }

    // 解构 + 兜底
    const year = now.year ?? 0;
    const month = now.month ?? 0;
    const day = now.day ?? 0;
    const weekdayName = now.weekdayName || '周?';
    const hourMinute = now.hm || (
      (Number.isFinite(now.hour) && Number.isFinite(now.minute))
        ? String(now.hour).padStart(2, '0') + ':' + String(now.minute).padStart(2, '0')
        : '--:--'
    );
    const periodName = now.periodName || '—';
    const seasonName = now.seasonName || '';

    // 第1行：当前时间
    const monthString = String(month).padStart(2, '0');
    const dayString = String(day).padStart(2, '0');
    const line1 = `【当前轮世界时钟】当前是 ${year}年${monthString}月${dayString}日（${weekdayName}） ${hourMinute} · ${periodName}${seasonName ? ' · ' + seasonName : ''}`;

    // 第2行：时间变化
    const changes = [];
    if (flags.newYear) changes.push('新年');
    if (flags.newMonth) changes.push('新月');
    if (flags.newWeek) changes.push('新周');
    if (flags.newDay) changes.push('新日');
    if (flags.newSeason) changes.push('新季' + (seasonName ? `(${seasonName})` : ''));
    if (flags.newPeriod) changes.push('新时段' + (periodName ? `(${periodName})` : ''));
    
    const line2 = changes.length ? `【上一轮时间变化】${changes.join('，')}。` : '';

    const result = line2 ? (line1 + '\n' + line2) : line1;
    logger.log(funcName, '成功构建时间提示词。', { result });
    return result;

  } catch (err: any) {
    logger.error(funcName, '构建时间提示词失败: ' + (err?.message || String(err)), err);
    return null;
  }
}
