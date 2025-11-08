/**
 * @file 角色日志处理器主文件
 * @description 该模块负责分析角色在最近一段时间内的状态变化，并生成日志。
 */
import { Runtime } from '../../schema/runtime';
import { Logger } from '../../utils/log';
import { processCharacterLogs } from './processor';

const logger = new Logger();

/**
 * 处理角色日志。
 * @param runtime - 当前的 runtime 对象。
 * @returns 返回更新后的 runtime 对象。
 */
export function processCharacterLog(runtime: Runtime) {
  logger.debug('processCharacterLog', '开始处理角色日志...');

  return processCharacterLogs(runtime);
}
