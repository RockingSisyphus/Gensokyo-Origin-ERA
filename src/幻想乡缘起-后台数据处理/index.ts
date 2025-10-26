import _ from 'lodash';
import { buildPrompt } from './core/prompt-builder';
import { buildRuntime } from './core/runtime-builder';
import { processStat } from './core/stat-processor';
import { sendData } from './core/data-sender';
import { cleanupDevPanel, initDevPanel } from './dev/panel';
import { WriteDonePayload } from './utils/era';
import { Logger } from './utils/log';
import { getRuntimeObject } from './utils/runtime';

const logger = new Logger();

// 主程序入口
$(() => {
  logger.log('main', '后台数据处理脚本加载');

  // 初始化开发/测试模块
  initDevPanel();

  // 定义核心数据处理函数
  const handleWriteDone = async (payload: WriteDonePayload) => {
    const { statWithoutMeta } = payload;
    logger.log('handleWriteDone', '开始处理数据...', statWithoutMeta);

    // 1. Stat 处理
    const processedStat = processStat(statWithoutMeta);

    // 2. 从 chat 变量域中读取上一楼层的 runtime 对象
    const prevRuntime = getRuntimeObject();

    // 3. Runtime 构建
    const newRuntime = buildRuntime(processedStat, prevRuntime);

    // 4. 提示词构建 (暂未实现)
    const prompt = buildPrompt(newRuntime, processedStat);

    // 5. 数据写入/发送
    await sendData(processedStat, newRuntime, payload);

    logger.log('handleWriteDone', '所有核心模块处理完毕。', {
      finalRuntime: newRuntime,
    });
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
