import _ from 'lodash';
import { processAffectionDecisions } from './core/affection-processor';
import { processArea } from './core/area-processor';
import { processCharacterDecisions } from './core/character-processor';
import { sendData } from './core/data-sender';
import { processFestival } from './core/festival-processor';
import { processIncidentDecisions } from './core/incident-processor';
import { processNormalization } from './core/normalizer-processor';
import { buildPrompt } from './core/prompt-builder';
import { processTime } from './core/time-processor';
import { getCache } from './utils/cache';
import { WriteDonePayload } from './utils/era';
import { Logger } from './utils/log';
import { getRuntimeObject } from './utils/runtime';

const logger = new Logger();

/**
 * 辅助函数，用于在控制台清晰地打印当前的核心对象状态。
 * @param moduleName - 刚刚执行完毕的模块名。
 * @param modified - 一个描述哪些核心对象被修改的字符串。
 * @param stat - 当前的 stat 对象。
 * @param runtime - 当前的 runtime 对象。
 * @param cache - 当前的 cache 对象。
 */
function logState(
  moduleName: string,
  modified: string,
  { stat, runtime, cache }: { stat: any; runtime: any; cache: any },
) {
  const title = `[${moduleName}] (修改: ${modified})`;
  const data = {
    Stat: _.cloneDeep(stat),
    Runtime: _.cloneDeep(runtime),
    Cache: _.cloneDeep(cache),
  };
  logger.log('logState', title, data);
}

// 主程序入口
$(() => {
  logger.log('main', '后台数据处理脚本加载');

  // 定义核心数据处理函数
  const handleWriteDone = async (payload: WriteDonePayload) => {
    const { statWithoutMeta, mk, editLogs } = payload;
    logger.log('handleWriteDone', '开始处理数据...', statWithoutMeta);

    // --- 初始状态 ---
    let currentStat = _.cloneDeep(statWithoutMeta); // 直接克隆
    let currentRuntime = getRuntimeObject();
    logState('初始状态', '无', { stat: currentStat, runtime: currentRuntime, cache: getCache(currentStat) });

    // 根据当前 mk 获取对应的 editLog
    const currentEditLog = (editLogs as any)?.[mk];

    // 1. 数据规范化处理
    const normalizationResult = processNormalization({ originalStat: currentStat });
    currentStat = normalizationResult.processedStat;
    const normalizationChanges = normalizationResult.changes;
    logState('Normalizer Processor', 'stat', {
      stat: currentStat,
      runtime: currentRuntime,
      cache: getCache(currentStat),
    });

    // 1.5. 好感度处理
    const affectionResult = processAffectionDecisions({ stat: currentStat, editLog: currentEditLog });
    currentStat = affectionResult.stat;
    const affectionChanges = affectionResult.changes;
    logState('Affection Processor', 'stat', {
      stat: currentStat,
      runtime: currentRuntime,
      cache: getCache(currentStat),
    });

    // 2.5. 异变处理
    const incidentResult = await processIncidentDecisions({ runtime: currentRuntime, stat: currentStat });
    currentStat = incidentResult.stat;
    currentRuntime = incidentResult.runtime;
    const incidentChanges = incidentResult.changes;
    logState('Incident Processor', 'stat (cache), runtime', {
      stat: currentStat,
      runtime: currentRuntime,
      cache: getCache(currentStat),
    });
    // 合并所有 changes
    const allChanges = normalizationChanges.concat(affectionChanges, incidentChanges);

    // 2.8. 时间处理
    const timeResult = await processTime({
      stat: currentStat,
      runtime: currentRuntime,
    });
    currentStat = timeResult.stat;
    currentRuntime = timeResult.runtime;
    logState('Time Processor', 'stat (cache), runtime', {
      stat: currentStat,
      runtime: currentRuntime,
      cache: getCache(currentStat),
    });

    // 2.9. 地区处理
    const areaResult = await processArea({
      stat: currentStat,
      runtime: currentRuntime,
    });
    currentStat = areaResult.stat;
    currentRuntime = areaResult.runtime;
    logState('Area Processor', 'runtime', { stat: currentStat, runtime: currentRuntime, cache: getCache(currentStat) });

    // 3. 节日处理
    const festivalResult = await processFestival({
      stat: currentStat,
      runtime: currentRuntime,
    });
    currentStat = festivalResult.stat;
    currentRuntime = festivalResult.runtime;
    logState('Festival Processor', 'runtime', {
      stat: currentStat,
      runtime: currentRuntime,
      cache: getCache(currentStat),
    });

    // 3.5. 角色决策处理
    const charResult = await processCharacterDecisions({
      stat: currentStat,
      runtime: currentRuntime,
    });
    currentStat = charResult.stat;
    currentRuntime = charResult.runtime;
    logState('Character Processor', 'stat (cache), runtime', {
      stat: currentStat,
      runtime: currentRuntime,
      cache: getCache(currentStat),
    });

    // 4. 提示词构建
    const prompt = buildPrompt({ runtime: currentRuntime, stat: currentStat });
    logger.log('handleWriteDone', '提示词构建完毕:', prompt);

    // 5. 数据写入/发送
    await sendData({
      stat: currentStat,
      runtime: currentRuntime,
      eraPayload: payload,
      changes: allChanges,
    });

    logger.log('handleWriteDone', '所有核心模块处理完毕。', {
      finalRuntime: currentRuntime,
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
