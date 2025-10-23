import _ from 'lodash';
import { processTime } from './core/time/processor';
import { cleanupDevPanel, initDevPanel } from './dev/panel';
import { WriteDonePayload } from './utils/era';
import { Logger } from './utils/logger';
import { getRuntimeObject, setRuntimeObject } from './utils/runtime';

const logger = new Logger();

// 主程序入口
$(() => {
  logger.log('main', '后台数据处理脚本加载');

  // 初始化开发/测试模块
  initDevPanel();

  // 在这里可以初始化其他核心模块
  // import { initCore } from './core/main';
  // initCore();

  // 定义核心数据处理函数
  const handleWriteDone = async (payload: WriteDonePayload) => {
    const { statWithoutMeta, message_id } = payload;
    logger.log('handleWriteDone', '开始处理数据...', statWithoutMeta);

    // 1. 从 chat 变量域中读取上一楼层的 runtime 对象，主要用于获取 ack
    const prevRuntime = getRuntimeObject();

    // 2. 调用所有核心处理模块
    const timeResult = processTime(statWithoutMeta, prevRuntime);
    // const characterResult = processCharacters(statWithoutMeta, prevRuntime);
    // const worldResult = processWorld(statWithoutMeta, prevRuntime);

    // 3. 将所有模块的结果合并成一个新的、干净的 runtime 对象
    const newRuntime = _.merge({}, timeResult /*, characterResult, worldResult */);

    // 4. 将新的 runtime 对象【完全替换】旧的
    await setRuntimeObject(newRuntime, { mode: 'replace' });

    logger.log('handleWriteDone', '所有核心模块处理完毕。', {
      finalRuntime: newRuntime,
    });

    // 5. 在所有处理完成后，统一发送 UI 更新事件
    if (typeof eventEmit === 'function') {
      const uiPayload = {
        ...payload, // 继承原始 payload 的所有属性 (mk, actions, etc.)
        statWithoutMeta: statWithoutMeta,
        runtime: newRuntime, // 附加被修改后的 runtime 对象
      };
      eventEmit('GSKO:showUI', uiPayload);
      logger.log('handleWriteDone', '已发送 GSKO:showUI 事件', uiPayload);
    } else {
      logger.warn('handleWriteDone', 'eventEmit 函数不可用，无法发送 UI 更新事件。');
    }
  };

  // 监听真实的 ERA 数据写入完成事件
  eventOn('era:writeDone', (detail: WriteDonePayload) => {
    logger.log('main', '接收到真实的 era:writeDone 事件');
    handleWriteDone(detail);
  });

  // 监听来自 dev ael 的伪造数据写入事件，用于测试
  eventOn('dev:fakeWriteDone', (detail: WriteDonePayload) => {
    logger.log('main', '接收到伪造的 dev:fakeWriteDone 事件');
    handleWriteDone(detail);
  });

  // 脚本卸载时的清理工作
  $(window).on('pagehide.main', () => {
    logger.log('main', '后台数据处理脚本卸载');

    // 清理开发/测试模块
    cleanupDevPanel();

    // 在这里可以清理其他核心模块
    // import { cleanupCore } from './core/main';
    // cleanupCore();

    // 解除所有命名空间下的事件监听
    $(window).off('.main');
  });
});
