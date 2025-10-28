/**
 * @file 好感度处理器 - 主逻辑
 * @description 监听单变量更新，将“好感度”的一次性大步长折算成较温和的步进。
 */

import _ from 'lodash';
import { ChangeLogEntry } from '../../../utils/constants';
import { Logger } from '../../../utils/log';
import { FOLD_RATIO, MIN_STEP } from './constants';
import { isTarget } from './utils';
import { parseEditLogString, getUpdateOps, getAtomicChangesFromUpdate, EditLogOp } from '../../../utils/editLog';

const logger = new Logger();

/**
 * 处理好感度变化，将大的跳变折算为平滑的步进。
 * @param stat - 当前的 stat 对象副本。
 * @param editLog - 当前 mk 对应的 editLog (可以是 JSON 字符串或对象)。
 * @returns {{ stat: any; changes: ChangeLogEntry[] }} - 处理后的 stat 对象和变更日志。
 */
export function processAffection(stat: any, editLog: any): { stat: any; changes: ChangeLogEntry[] } {
  const funcName = 'processAffection';
  const changes: ChangeLogEntry[] = [];
  const internalLogs: any[] = [];

  if (!editLog) {
    logger.debug(funcName, 'editLog 不存在，跳过处理。');
    return { stat, changes };
  }

  // 1. 解析 editLog
  const logJson = typeof editLog === 'string' ? parseEditLogString(editLog) : (editLog as EditLogOp[]);
  if (!logJson) {
    logger.warn(funcName, '解析 editLog 失败，跳过处理。');
    return { stat, changes };
  }

  // 2. 只获取 'update' 操作
  const updateOps = getUpdateOps(logJson);
  if (updateOps.length === 0) {
    logger.debug(funcName, '没有找到 update 操作，跳过处理。');
    return { stat, changes };
  }

  logger.debug(funcName, `找到 ${updateOps.length} 条 update 操作，开始处理...`);

  // 3. 遍历 update 操作并处理
  for (const op of updateOps) {
    const atomicChanges = getAtomicChangesFromUpdate(op);

    for (const change of atomicChanges) {
      const { path, oldVal, newVal } = change;

      try {
        if (!isTarget(path)) {
          continue;
        }

        const hasOld = !(oldVal === null || oldVal === undefined);
        const oldValueNum = hasOld ? Number(oldVal) : 0;
        const newValueNum = Number(newVal);

        if (!Number.isFinite(oldValueNum) || !Number.isFinite(newValueNum)) {
          internalLogs.push({
            msg: '类型异常：old/new 不是有效数字，放弃处理',
            path,
            oldVal,
            newVal,
          });
          continue;
        }
        if (!hasOld) {
          internalLogs.push({ msg: '提示：old 缺失，按 0 处理首次赋值', path, asOld: 0 });
        }

        const delta = newValueNum - oldValueNum;
        const absDelta = Math.abs(delta);

        internalLogs.push({ msg: '捕获变量更新', path, old: oldValueNum, new: newValueNum, delta, absDelta });

        // 阈值：|Δ| ≤ 2 不折算
        if (absDelta <= MIN_STEP) {
          internalLogs.push({ msg: '不折算：变化量 ≤ 阈值', absDelta, MIN_STEP });
          continue;
        }

        // 折算步长：ceil(|Δ|/FOLD_RATIO)，至少 2；并保留方向
        const step = Math.max(MIN_STEP, Math.ceil(absDelta / FOLD_RATIO));
        const foldedDelta = (delta < 0 ? -1 : 1) * step;
        const foldedNewValue = oldValueNum + foldedDelta;

        internalLogs.push({ msg: '折算计算结果', FOLD_RATIO, step, foldedDelta, foldedNewValue });

        // 直接修改 stat 对象
        _.set(stat, path, foldedNewValue);

        // 记录变更
        const changeEntry: ChangeLogEntry = {
          module: 'affection-processor',
          path,
          oldValue: oldValueNum,
          newValue: foldedNewValue,
          reason: `好感度折算：原始变化量 ${delta} 被折算为 ${foldedDelta}`,
        };
        changes.push(changeEntry);

        internalLogs.push({ msg: '折算写入完成', changeEntry });
      } catch (err: any) {
        logger.error(funcName, `处理路径 ${path} 时发生异常`, err.stack || err);
        internalLogs.push({ msg: '处理异常', path, error: err.stack || err });
      }
    }
  }

  if (changes.length > 0) {
    logger.log(funcName, '好感度折算处理完毕。', {
      summary: `共产生 ${changes.length} 条变更。`,
      internalLogs,
    });
  } else {
    logger.debug(funcName, '好感度折算处理完毕，无相关变更。');
  }

  return { stat, changes };
}
