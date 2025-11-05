/**
 * @file 好感度处理器 - 主逻辑
 * @description 监听单变量更新，将“好感度”的一次性大步长折算成较温和的步进。
 */

import _ from 'lodash';
import { ChangeLogEntry } from '../../schema/change-log';
import { CHARACTER_FIELDS } from '../../schema/character';
import { Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { createChangeLogEntry } from '../../utils/changeLog';
import { EditLogOp, getAtomicChangesFromUpdate, getUpdateOps, parseEditLogString } from '../../utils/editLog';
import { Logger } from '../../utils/log';
import { getCurrentAffectionStage, isTarget } from './utils';

const logger = new Logger();

/**
 * 处理好感度变化，对超过阈值的变化进行软限制。
 * @param stat - 当前的 stat 对象副本。
 * @param editLog - 当前 mk 对应的 editLog (可以是 JSON 字符串或对象)。
 * @param runtime - 当前的 runtime 对象。
 * @returns {{ stat: Stat; changes: ChangeLogEntry[] }} - 处理后的 stat 对象和变更日志。
 */
export function processAffection({ stat, editLog, runtime }: { stat: Stat; editLog: any; runtime: Runtime }): {
  stat: Stat;
  changes: ChangeLogEntry[];
} {
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

        // 从路径中解析角色 ID
        const charId = path.split('.')[1];
        if (!charId) {
          continue;
        }

        // 类型安全地访问角色
        const character = stat.chars[charId];
        if (!character) {
          internalLogs.push({ msg: '角色未在 stat.chars 中找到', path, charId });
          continue;
        }

        const baseAffection = (character as any)[CHARACTER_FIELDS.affection];
        const hasOld = !(oldVal === null || oldVal === undefined);
        const oldValueNum = hasOld ? Number(oldVal) : baseAffection;
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
        let finalDelta = delta;

        internalLogs.push({ msg: '捕获变量更新', path, old: oldValueNum, new: newValueNum, delta, absDelta });

        const charSettings = runtime.characterSettings?.[charId];
        const stages = charSettings?.affectionStages;

        if (stages) {
          const currentStage = getCurrentAffectionStage(oldValueNum, stages);
          const limit = currentStage?.affectionGrowthLimit;

          // 如果配置了限制，并且绝对增量超过了限制的 max 值，则应用软限制
          if (limit && absDelta > limit.max) {
            const limitedAbsDelta = Math.max(absDelta / limit.divisor, limit.max);
            finalDelta = limitedAbsDelta * Math.sign(delta); // 恢复符号
            internalLogs.push({
              msg: '应用好感度变化软限制',
              originalDelta: delta,
              limit,
              finalDelta,
            });
          } else {
            internalLogs.push({ msg: '不应用软限制（未超阈值或无配置）' });
          }
        }

        // 如果处理后没有变化，则跳过
        if (finalDelta === delta) {
          internalLogs.push({ msg: '处理后值无变化，无需覆写' });
          continue;
        }

        const finalNewValue = _.round(oldValueNum + finalDelta);

        // 直接修改 stat 对象
        (character as any)[CHARACTER_FIELDS.affection] = finalNewValue;

        // 记录变更
        const atomicPath = `chars.${charId}.${CHARACTER_FIELDS.affection}`;
        const changeEntry = createChangeLogEntry(
          'affection-processor',
          atomicPath,
          oldValueNum,
          finalNewValue,
          `好感度处理：原始变化量 ${delta} 被软限制为 ${finalDelta}`,
        );
        changes.push(changeEntry);

        internalLogs.push({ msg: '写入完成', changeEntry });
      } catch (err: any) {
        logger.error(funcName, `处理路径 ${path} 时发生异常`, err.stack || err);
        internalLogs.push({ msg: '处理异常', path, error: err.stack || err });
      }
    }
  }

  if (changes.length > 0) {
    logger.debug(funcName, '好感度折算处理完毕。', {
      summary: `共产生 ${changes.length} 条变更。`,
      internalLogs,
    });
  } else {
    logger.debug(funcName, '好感度折算处理完毕，无相关变更。');
  }

  return { stat, changes };
}
