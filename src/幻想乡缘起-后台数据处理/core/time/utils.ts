// ==================================================================
// 时间计算辅助函数
// ==================================================================

/**
 * 将单个数字补零成两位字符串。
 * @param n - 数字
 * @returns 两位字符串
 */
export const PAD2 = (n: number) => (n < 10 ? '0' + n : '' + n);

/**
 * 从 Date 对象生成 YYYYMMDD 格式的数字 ID。
 * @param d - Date 对象
 * @returns YYYYMMDD 数字
 */
export const ymdID = (d: Date) => d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();

/**
 * 从 Date 对象生成 YYYYMM 格式的数字 ID。
 * @param d - Date 对象
 * @returns YYYYMM 数字
 */
export const ymID = (d: Date) => d.getUTCFullYear() * 100 + (d.getUTCMonth() + 1);

/**
 * 计算给定日期所在周的起始日期（UTC 时间 00:00:00）。
 * @param d - Date 对象
 * @param weekStartsOn - 一周的起始日 (0=周日, 1=周一, ..., 6=周六)
 * @returns 周起始的 Date 对象
 */
export const weekStart = (d: Date, weekStartsOn: number) => {
  const w = (Number(weekStartsOn) >= 0 && Number(weekStartsOn) <= 6) ? Number(weekStartsOn) : 1;
  const dow = d.getUTCDay();
  const diff = ((dow - w) + 7) % 7;
  const x = new Date(d.getTime() - diff * 86400000);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

/**
 * 根据一天中的分钟数（0-1439）返回对应的时段索引。
 * 规则：
 * - 00:00-04:59 下半夜 (7)
 * - 05:00-06:59 清晨 (0)
 * - 07:00-11:29 上午 (1)
 * - 11:30-12:59 中午 (2)
 * - 13:00-16:59 下午 (3)
 * - 17:00-18:59 黄昏 (4)
 * - 19:00-21:59 夜晚 (5)
 * - 22:00-23:59 上半夜 (6)
 * @param mins - 一天中的分钟数 (0-1439)
 * @returns 时段索引 (0-7)
 */
export function periodIndexOf(mins: number) {
  if (mins < 300) return 7;
  if (mins < 420) return 0;
  if (mins < 690) return 1;
  if (mins < 780) return 2;
  if (mins < 1020) return 3;
  if (mins < 1140) return 4;
  if (mins < 1320) return 5;
  return 6;
}

/**
 * 根据月份（1-12）返回对应的季节索引。
 * 规则：
 * - 3-5月: 春 (0)
 * - 6-8月: 夏 (1)
 * - 9-11月: 秋 (2)
 * - 12,1,2月: 冬 (3)
 * @param m - 月份 (1-12)
 * @returns 季节索引 (0-3)
 */
export function seasonIndexOf(m: number) {
  if (m >= 3 && m <= 5) return 0;
  if (m >= 6 && m <= 8) return 1;
  if (m >= 9 && m <= 11) return 2;
  return 3;
}
