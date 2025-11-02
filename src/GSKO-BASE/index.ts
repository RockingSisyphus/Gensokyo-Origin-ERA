import _ from 'lodash';
import { processAffectionDecisions } from './core/affection-processor';
import { processArea } from './core/area-processor';
import { processCharacterLog } from './core/character-log-processor';
import { HISTORY_LENGTH } from './core/character-log-processor/constants';
import { processCharacterDecisions } from './core/character-processor';
import { processCharacterLocations } from './core/character-locations-processor';
import { process as processCharacterSettings } from './core/character-settings-processor';
import { sendData } from './core/data-sender';
import { processFestival } from './core/festival-processor';
import { processIncidentDecisions } from './core/incident-processor';
import { normalizeLocationData } from './core/normalizer-processor/location';
import { buildPrompt } from './core/prompt-builder';
import { processTime } from './core/time-processor';
import { QueryResultItem, WriteDonePayload } from './events/constants';
import { getSnapshotsBetweenMIds } from './events/emitter';
import { onWriteDone } from './events/receiver';
import { Runtime } from './schema/runtime';
import { Stat, StatSchema } from './schema/stat';
import { getCache } from './utils/cache';
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
  { stat, runtime, cache }: { stat: Stat; runtime: Runtime; cache: any },
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
    logger.log('handleWriteDone', '接收到原始 stat 数据', statWithoutMeta);

    // 使用酒馆助手 API 获取最新的消息
    const latestMessages = getChatMessages(-1);
    if (!latestMessages || latestMessages.length === 0) {
      logger.error('handleWriteDone', '无法获取到最新的聊天消息，中止执行。');
      return;
    }
    // 使用最新的消息 ID
    const latestMessage = latestMessages[0];
    const message_id = latestMessage.message_id;
    logger.log('handleWriteDone', `使用最新的消息 ID: ${message_id}`);

    // 使用 Zod 解析和验证 stat
    const parseResult = StatSchema.safeParse(statWithoutMeta);
    if (!parseResult.success) {
      logger.error('handleWriteDone', 'Stat 数据结构验证失败。以下是详细错误:');
      parseResult.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        const receivedValue = _.get(statWithoutMeta, issue.path);
        logger.error(
          'Stat-Validation',
          `路径 "${path}": ${issue.message}. (收到的值: ${JSON.stringify(receivedValue, null, 2)})`,
        );
      });
      logger.error('handleWriteDone', '完整的原始 Stat 数据:', statWithoutMeta);
      return; // 中止执行
    }

    try {
      // --- 初始状态 ---
      // 从这里开始，currentStat 就是经过验证和类型推断的
      let currentStat: Stat = parseResult.data;
      let currentRuntime: Runtime = getRuntimeObject();
      logState('初始状态', '无', { stat: currentStat, runtime: currentRuntime, cache: getCache(currentStat) });

      // 根据当前 mk 获取对应的 editLog
      const currentEditLog = (editLogs as any)?.[mk];

      // 2.9. 地区处理
      const areaResult = await processArea({
        stat: currentStat,
        runtime: currentRuntime,
      });
      currentStat = areaResult.stat;
      currentRuntime = areaResult.runtime;
      logState('Area Processor', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // 1. 数据规范化处理
      const normalizationResult = normalizeLocationData({ originalStat: currentStat, runtime: currentRuntime });
      currentStat = normalizationResult.stat;
      const normalizationChanges = normalizationResult.changes;
      logState('Normalizer Processor', 'stat', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // 角色位置处理
      const locResult = processCharacterLocations({
        stat: currentStat,
        runtime: currentRuntime,
      });
      currentStat = locResult.stat;
      currentRuntime = locResult.runtime;
      logState('Character Locations Processor', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // 1.2. 角色设置处理
      currentRuntime = processCharacterSettings({ runtime: currentRuntime, stat: currentStat });
      logState('Character Settings Processor', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // 1.5. 好感度处理
      const affectionResult = processAffectionDecisions({
        stat: currentStat,
        editLog: currentEditLog,
        runtime: currentRuntime,
      });
      currentStat = affectionResult.stat;
      const affectionChanges = affectionResult.changes;
      logState('Affection Processor', 'stat', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // 2.5. 时间处理
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

      // 2.8. 角色日志处理
      const startId = message_id < HISTORY_LENGTH ? 0 : message_id - HISTORY_LENGTH;
      const snapshotPayload = await getSnapshotsBetweenMIds({
        startId,
        endId: message_id,
      });
      const snapshots = (snapshotPayload.result as QueryResultItem[]) || [];
      const charLogResult = processCharacterLog({ runtime: currentRuntime, snapshots, stat: currentStat });
      currentRuntime = charLogResult.runtime;
      logState('Character Log Processor', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // 2.8. 异变处理
      const incidentResult = await processIncidentDecisions({ runtime: currentRuntime, stat: currentStat });
      currentStat = incidentResult.stat;
      currentRuntime = incidentResult.runtime;
      const incidentChanges = incidentResult.changes;
      logState('Incident Processor', 'stat (cache), runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

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
      const charChanges = charResult.changes;
      logState('Character Processor', 'stat (cache), runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // 4. 提示词构建
      const prompt = buildPrompt({ runtime: currentRuntime, stat: currentStat });
      logger.log('handleWriteDone', '提示词构建完毕:', prompt);

      // 5. 数据写入/发送
      // 合并所有 changes
      const allChanges = normalizationChanges.concat(affectionChanges, incidentChanges, charChanges);
      await sendData({
        stat: currentStat,
        runtime: currentRuntime,
        eraPayload: payload,
        changes: allChanges,
      });

      logger.log('handleWriteDone', '所有核心模块处理完毕。', {
        finalRuntime: currentRuntime,
      });
    } catch (error) {
      logger.error('handleWriteDone', '主处理流程发生未捕获的错误:', error);
      if (error instanceof Error) {
        logger.error('handleWriteDone', '错误堆栈:', error.stack);
      }
    }
  };

  // 监听 ERA 数据写入完成事件，并忽略由 API 写入触发的事件
  onWriteDone(
    (detail: WriteDonePayload) => {
      logger.log('main', '接收到 era:writeDone 事件');
      // 确保 handleWriteDone 中的任何未捕获的 Promise 拒绝都会被记录
      handleWriteDone(detail).catch(error => {
        logger.error('onWriteDone', 'handleWriteDone 发生未处理的 Promise 拒绝:', error);
      });
    },
    { ignoreApiWrite: true },
  );

  // 监听来自 dev ael 的伪造数据写入事件，用于测试
  eventOn('dev:fakeWriteDone', (detail: WriteDonePayload) => {
    logger.log('main', '接收到伪造的 dev:fakeWriteDone 事件');
    // 确保 handleWriteDone 中的任何未捕获的 Promise 拒绝都会被记录
    handleWriteDone(detail).catch(error => {
      logger.error('dev:fakeWriteDone', 'handleWriteDone 发生未处理的 Promise 拒绝:', error);
    });
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
