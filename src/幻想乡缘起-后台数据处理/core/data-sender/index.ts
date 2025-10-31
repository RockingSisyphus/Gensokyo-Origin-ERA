import { ChangeLogEntry } from '../../schema';
import { Logger } from '../../utils/log';
import { setRuntimeObject } from '../../utils/runtime';

const logger = new Logger();

export async function sendData({
  stat,
  runtime,
  eraPayload: originalPayload,
  changes,
}: {
  stat: any;
  runtime: any;
  eraPayload: any;
  changes: ChangeLogEntry[];
}) {
  const funcName = 'sendData';
  logger.debug(funcName, '开始发送数据...');

  // 将新的 runtime 对象【完全替换】旧的
  await setRuntimeObject(runtime, { mode: 'replace' });

  // 在所有处理完成后，统一发送 UI 更新事件
  if (typeof eventEmit === 'function') {
    const uiPayload = {
      ...originalPayload, // 继承原始 payload 的所有属性 (mk, actions, etc.)
      statWithoutMeta: stat, // 传递标准化后的 stat
      runtime: runtime, // 附加被修改后的 runtime 对象
      statChanges: changes, // 附加 stat 的变更日志
    };
    eventEmit('GSKO:showUI', uiPayload);
    logger.debug(funcName, '已发送 GSKO:showUI 事件', uiPayload);
  } else {
    logger.warn(funcName, 'eventEmit 函数不可用，无法发送 UI 更新事件。');
  }

  logger.debug(funcName, '数据发送完毕。');
}
