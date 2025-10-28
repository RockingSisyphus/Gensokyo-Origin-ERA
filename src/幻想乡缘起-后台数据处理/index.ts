import { sendData } from './core/data-sender';
import { processMixed } from './core/mixed-processor';
import { buildPrompt } from './core/prompt-builder';
import { buildRuntime } from './core/runtime-builder';
import { processStat } from './core/stat-processor';
import { WriteDonePayload } from './utils/era';
import { Logger } from './utils/log';
import { getRuntimeObject } from './utils/runtime';

const logger = new Logger();

// 主程序入口
$(() => {
  logger.log('main', '后台数据处理脚本加载');

  // 定义核心数据处理函数
  const handleWriteDone = async (payload: WriteDonePayload) => {
    const { statWithoutMeta, mk, editLogs } = payload;
    logger.log('handleWriteDone', '开始处理数据...', statWithoutMeta);

    // 根据当前 mk 获取对应的 editLog
    const currentEditLog = (editLogs as any)?.[mk];

    // 1. Stat 处理
    let { processedStat, changes: statChanges } = processStat({
      originalStat: statWithoutMeta,
      editLog: currentEditLog,
    });

    // 2. 从 chat 变量域中读取上一楼层的 runtime 对象
    const prevRuntime = getRuntimeObject();

    // 2.5. 混合处理（可能同时修改 stat 和 runtime）
    const mixedResult = processMixed({ runtime: prevRuntime, stat: processedStat });
    const mixedProcessedStat = mixedResult.stat;
    const mixedProcessedRuntime = mixedResult.runtime;
    const mixedChanges = mixedResult.changes;

    // 合并所有 changes
    const allChanges = statChanges.concat(mixedChanges);

    // 3. Runtime 构建
    const newRuntime = await buildRuntime({ stat: mixedProcessedStat, runtime: mixedProcessedRuntime });

    // 4. 提示词构建
    const prompt = buildPrompt({ runtime: newRuntime, stat: mixedProcessedStat });
    logger.log('handleWriteDone', '提示词构建完毕:', prompt);
    // 5. 数据写入/发送
    await sendData({
      stat: mixedProcessedStat,
      runtime: newRuntime,
      eraPayload: payload,
      changes: allChanges,
    });

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

    // 在这里可以清理其他核心模块
    // import { cleanupCore } from './core/main';
    // cleanupCore();

    // 解除所有命名空间下的事件监听
    $(window).off('.main');
  });
});
