/**
 * @file 角色日志处理器主文件
 * @description 该模块负责分析角色在最近一段时间内的状态变化，并生成日志。
 */

import { QueryResultItem } from '../../events/constants';
import { Stat } from '../../schema';
import { Runtime } from '../../schema/runtime';
import { Logger } from '../../utils/log';
import { processCharacterForgetting } from './affection-forget-processor';

const logger = new Logger();

interface ProcessCharacterLogParams {
  /** 当前的 runtime 对象 */
  runtime: Runtime;
  /** 最近的历史状态快照数组 */
  snapshots: QueryResultItem[];
  /** 当前的 stat 对象 */
  stat: Stat;
}

/**
 * 处理角色日志。
 * @param params - 包含 runtime、历史快照和 stat 的参数对象。
 * @returns 返回更新后的 runtime 对象。
 */
export function processCharacterLog({ runtime, snapshots, stat }: ProcessCharacterLogParams) {
  logger.log('processCharacterLog', '开始处理角色日志...', {
    snapshotCount: snapshots.length,
  });

  // 1. 处理角色忘性信息
  const forgettingInfo = processCharacterForgetting({ stat });

  // 2. 构建新的 characterLog 对象
  const characterLog = {
    forgettingInfo,
  };

  // 3. 将新的 characterLog 对象合并到 runtime 中
  const newRuntime = {
    ...runtime,
    characterLog,
  };

  // TODO: 在此实现角色日志的其他具体处理逻辑。
  // 例如：分析好感度变化、位置移动、状态变更等，并更新 newRuntime。

  return {
    runtime: newRuntime,
  };
}
