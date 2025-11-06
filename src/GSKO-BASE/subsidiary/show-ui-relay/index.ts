import { Logger } from '../../utils/log';

const logger = new Logger();

/**
 * 由于 SillyTavern 的事件实现支持任意参数，所以我们通过追加一个布尔值作为标记
 * 来区分自己转发的事件。使用单独的状态位配合布尔标记可以避免和外部事件冲突。
 */
const SELF_DISPATCH_FLAG = true;

type ShowUIEventArgs = unknown[] | null;

let cachedArgs: ShowUIEventArgs = null;
let isReplaying = false;

function isSelfDispatched(args: unknown[]): boolean {
  if (args.length === 0) return false;
  const maybeFlag = args[args.length - 1];
  return typeof maybeFlag === 'boolean' && maybeFlag === SELF_DISPATCH_FLAG;
}

eventOn('GSKO:showUI', (...args: unknown[]) => {
  const funcName = 'onShowUI';

  if (isSelfDispatched(args)) {
    if (isReplaying) {
      logger.debug(funcName, '检测到由自身转发的事件，忽略以避免循环。');
      isReplaying = false;
    } else {
      logger.debug(funcName, '检测到带有转发标记的事件，已忽略。');
    }
    return;
  }

  cachedArgs = [...args];
  logger.debug(funcName, '已缓存最新的 GSKO:showUI 参数。', cachedArgs);
});

eventOn('GSKO:requireData', () => {
  const funcName = 'onRequireData';

  if (!cachedArgs) {
    logger.debug(funcName, '收到 GSKO:requireData 但尚未缓存任何数据，忽略。');
    return;
  }

  logger.debug(funcName, '收到 GSKO:requireData，准备重放缓存的 UI 数据。');

  isReplaying = true;

  const dispatchResult = eventEmit('GSKO:showUI', ...cachedArgs, SELF_DISPATCH_FLAG);

  Promise.resolve(dispatchResult)
    .catch(error => {
      logger.error(funcName, '重放缓存数据时 eventEmit 失败。', error);
    })
    .finally(() => {
      if (isReplaying) {
        // 如果事件执行流程里没有命中 onShowUI 中的标记分支，也需要兜底复位
        isReplaying = false;
      }
    });
});

