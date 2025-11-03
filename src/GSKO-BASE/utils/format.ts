import { TIME_PERIOD_NAMES } from '../schema/time/constants';
import { Logger } from './log';

const logger = new Logger();

/**
 * @description 从数组或单个值中获取第一个有效值。
 *              如果输入是数组，返回第一个元素；否则直接返回输入值。
 * @param {any} x - 输入值。
 * @returns {any} 处理后的值。
 */
function firstVal(x: any): any {
  return Array.isArray(x) ? (x.length ? x[0] : '') : x;
}

/**
 * @description 安全地从嵌套对象中按路径获取值。
 * @param {object} obj - 要查询的对象。
 * @param {string | string[]} path - 属性路径，可以是点分隔的字符串或字符串数组。
 * @param {any} [fallback=''] - 如果路径不存在或值为 null/undefined，返回的默认值。
 * @returns {any} 获取到的值或默认值。
 */
export function get(obj: object, path: string | string[], fallback: any = ''): any {
  try {
    const ks = Array.isArray(path) ? path : String(path).split('.');
    // 将 cur 的类型显式设置为 any，以允许字符串索引访问
    // 这是因为 TypeScript 的 `object` 类型默认不允许 `cur[k]` 这样的操作
    let cur: any = obj;
    for (const k of ks) {
      if (!cur || typeof cur !== 'object' || !(k in cur)) {
        // 原 verboseGet 日志改为 debug 级别，由 LOG_CONFIG 统一控制
        logger.debug('get', '未找到键，使用默认值。', {
          路径: String(path),
          缺失键: String(k),
          默认值: fallback,
        });
        return fallback;
      }
      cur = cur[k];
    }
    const v = firstVal(cur);
    if (v == null) {
      logger.debug('get', '路径存在但值为空(null/undefined)，使用默认值。', {
        路径: String(path),
        默认值: fallback,
      });
      return fallback;
    }
    return v;
  } catch (e) {
    logger.error('get', '异常，使用默认值。', {
      路径: String(path),
      异常: String(e),
      默认值: fallback,
    });
    return fallback;
  }
}

/**
 * @description 将文本内容安全地设置到指定 ID 的 DOM 元素中。
 * @param {string} id - 目标 DOM 元素的 ID。
 * @param {any} raw - 要设置的原始值。函数会自动处理数组和 null/undefined。
 */
export function text(id: string, raw: any): void {
  const el = document.getElementById(id);
  if (!el) {
    logger.warn('text', '目标元素不存在，跳过写入。', { 元素ID: id });
    return;
  }
  el.textContent = toText(raw);
}

/**
 * @description 安全地从嵌套对象中按路径获取原始值，与 get() 不同，它不会对数组进行降维。
 * @param {object} obj - 要查询的对象。
 * @param {string | string[]} path - 属性路径。
 * @param {any} [fallback=null] - 默认值。
 * @returns {any} 获取到的原始值或默认值。
 */
export function getRaw(obj: object, path: string | string[], fallback: any = null): any {
  try {
    const ks = Array.isArray(path) ? path : String(path).split('.');
    let cur: any = obj;
    for (const k of ks) {
      if (!cur || typeof cur !== 'object' || !(k in cur)) {
        return fallback;
      }
      cur = cur[k];
    }
    return cur == null ? fallback : cur;
  } catch (e) {
    logger.error('getRaw', '异常，使用默认值。', {
      路径: String(path),
      异常: String(e),
      默认值: fallback,
    });
    return fallback;
  }
}

/**
 * @description 将任意类型的值转换为适合在 UI 中显示的字符串。
 * @param {any} v - 输入值。
 * @returns {string} 显示用的字符串，null/undefined/空字符串会变成 '—'。
 */
export function toText(v: any): string {
  if (v == null || v === '') return '—';
  if (Array.isArray(v)) return v.length ? v.join('；') : '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/**
 * @description 安全地从嵌套对象中获取值的字符串表示形式。
 *              如果路径对应的值是数组，会自动使用 '；' 拼接。
 * @param {object} obj - 要查询的对象。
 * @param {string | string[]} path - 属性路径。
 * @param {any} [fallback=''] - 如果路径不存在或值为空，返回的默认值。
 * @returns {string} 获取到的值的字符串表示或默认值。
 */
export function getStr(obj: object, path: string | string[], fallback: any = ''): string {
  // 复用 getRaw 获取原始值，复用 toText 将其转换为最终的显示字符串
  const rawValue = getRaw(obj, path, null);
  if (rawValue === null) {
    // 如果 getRaw 返回 null（表示未找到或值为 null/undefined），则使用 toText 处理 fallback
    return toText(fallback);
  }
  return toText(rawValue);
}

/**
 * @description 格式化时间戳对象为可读的年月日和时间段字符串。
 * @param clock - 时间戳对象。
 * @returns {string} 格式化后的时间字符串，例如 "1 年 10 月 28 日，清晨"。
 */
export function formatTime(clock: {
  yearID: number;
  monthID: number;
  dayID: number;
  periodIdx: number;
}): string {
  if (!clock) return '未知时间';

  const year = clock.yearID;
  // monthID 格式为 YYYYMM，从中提取月份
  const month = clock.monthID % 100;
  // dayID 格式为 YYYYMMDD，从中提取日期
  const day = clock.dayID % 100;

  const periodName = TIME_PERIOD_NAMES[clock.periodIdx] || '未知时段';

  return `${year} 年 ${month} 月 ${day} 日，${periodName}`;
}

/**
 * @description 将未知输入安全地转换为有限数值。
 * @param value - 输入值，可以是数字、字符串或任何其他类型。
 * @returns {number | null} 如果转换成功，返回一个有限数值；否则返回 null。
 */
export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}
