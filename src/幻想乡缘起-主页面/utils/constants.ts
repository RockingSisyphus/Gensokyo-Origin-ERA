import type { Stat } from '../../../GSKO-BASE/schema/stat';

/**
 * @description 不含 `$meta` 字段的纯净变量对象类型。
 * 约定上与 `Stat` 结构保持一致，但允许扩展额外的运行期字段。
 */
export type StatWithoutMeta = Stat & {
  [key: string]: unknown;
};

/**
 * @description 时钟信息对象类型，由 runtime.clock.now 和 stat.festivals_list 组合而成。
 */
export interface ClockInfo {
  hm: string;
  periodName: string;
  iso: string;
  festivals: {
    name: string;
    month: number;
    start_day: number;
    end_day: number;
    description: string;
  }[];
  [key: string]: unknown;
}
