/**
 * @file GSKO-BASE 核心脚本入口
 * @description
 * 该文件是整个幻想乡缘起核心数据处理逻辑的总调度中心。
 * 它通过监听 ERA 框架的 `era:writeDone` 事件来触发一系列的处理器（processor），
 * 形成一个数据处理流水线。每个处理器负责计算特定的数据片段（如时间、好感度、角色位置等），
 * 并将结果写入一个临时的 `runtime` 对象。
 *
 * 数据流：
 * 1. ERA 写入数据后，广播 `era:writeDone` 事件，携带最新的 `stat` 对象。
 * 2. 本脚本监听到事件，启动 `handleWriteDone` 函数。
 * 3. `handleWriteDone` 按预定顺序依次调用各个核心处理器。
 * 4. 每个处理器接收当前的 `stat` 和 `runtime`，进行计算，并返回更新后的对象。
 * 5. 所有处理器执行完毕后，将最终的 `stat` 变更和构建好的 `prompt` 通过 `sendData` 发回 ERA。
 */

import _ from 'lodash';

// --- 核心处理器导入 ---
import { processAffectionForgetting } from './core/affection-forgetting-processor';
import { processAffectionDecisions } from './core/affection-processor';
import { processArea } from './core/area-processor';
import { processCharacterLocations } from './core/character-locations-processor';
import { processCharacterLog } from './core/character-log-processor';
import { processCharacterDecisions } from './core/character-processor';
import { process as processCharacterSettings } from './core/character-settings-processor';
import { sendData } from './core/data-sender';
import { processFestival } from './core/festival-processor';
import { processIncidentDecisions } from './core/incident-processor';
import { mentionedCharacterProcessor } from './core/mentioned-character-processor';
import { normalizeLocationData } from './core/normalizer-processor/location';
import { buildPrompt } from './core/prompt-builder';
import { fetchSnapshotsForTimeFlags } from './core/snapshot-fetcher';
import { processTimeChatMkSync } from './core/time-chat-mk-sync';
import { processTime } from './core/time-processor';
import { processWeather } from './core/weather-processor';
import { writeChangesToEra } from './io';
import { ayaNewsProcessor } from './subsidiary/aya-news-processor';
import './subsidiary/show-ui-relay';
import { worldBookConfigProcessor } from './subsidiary/world-book-config-processor';

// --- 事件与 Schema 导入 ---
import { WriteDonePayload } from './events/constants';
import { onWriteDone } from './events/receiver';
import { Runtime } from './schema/runtime';
import { Stat, StatSchema } from './schema/stat';

// --- 工具函数导入 ---
import { getCache } from './utils/cache';
import { Logger } from './utils/log';
import { refreshInjectedPrompt } from './utils/prompt-injection';
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

// 主程序入口：当脚本被加载到 DOM 中时执行
$(() => {
  logger.log('main', '后台数据处理脚本加载');

  /**
   * 核心事件处理函数，在每次 ERA 数据写入完成后被调用。
   * 这是所有数据处理逻辑的起点，它 orchestrates（编排）了所有核心处理器的执行。
   * @param payload - 从 `era:writeDone` 事件中接收到的数据。
   * @param isFakeEvent - 标志位，指示当前是否在处理一个伪造的测试事件。
   */
  const handleWriteDone = async (payload: WriteDonePayload, isFakeEvent = false) => {
    const { statWithoutMeta, mk, editLogs, selectedMks } = payload;
    logger.log('handleWriteDone', '接收到原始 stat 数据', statWithoutMeta);

    // --- 数据获取与验证 ---

    // 使用酒馆助手 API 获取最新的消息，以确保我们有正确的 message_id 上下文
    const latestMessages = getChatMessages(-1);
    if (!latestMessages || latestMessages.length === 0) {
      logger.error('handleWriteDone', '无法获取到最新的聊天消息，中止执行。');
      return;
    }
    const latestMessage = latestMessages[0];
    const message_id = latestMessage.message_id;
    logger.log('handleWriteDone', `使用最新的消息 ID: ${message_id}`);

    // 使用 Zod Schema 对从 ERA 接收的 stat 数据进行严格的验证和解析。
    // 这是确保数据类型安全和结构正确的第一道防线。
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
      return; // 如果数据无效，则中止执行
    }

    try {
      // --- 核心处理器流水线 ---
      // 此处开始，`currentStat` 是经过 Zod 验证和类型推断的安全对象。
      // `currentRuntime` 是一个临时的、每轮重新计算的对象，用于在处理器之间传递中间状态。
      let currentStat: Stat = parseResult.data;
      const initialStat = _.cloneDeep(currentStat);
      let currentRuntime: Runtime = getRuntimeObject();
      logState('初始状态', '无', { stat: currentStat, runtime: currentRuntime, cache: getCache(currentStat) });

      // [世界书配置处理器]：从世界书加载配置并合并到 stat
      currentStat = await worldBookConfigProcessor({ stat: currentStat });
      logState('WorldBook Config Processor', 'stat', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // 根据当前消息的 mk 获取对应的 editLog，用于分析 AI 输出。
      const currentEditLog = (editLogs as any)?.[mk];

      // [地区处理器]：加载地区数据，构建地区关系图，计算地区间的可达性。
      const areaResult = await processArea({
        stat: currentStat,
        runtime: currentRuntime,
      });
      currentRuntime = areaResult.runtime;
      logState('Area Processor', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [数据规范化处理器]：统一和修正数据格式，例如将不规范的地点名称标准化。
      const normalizationResult = normalizeLocationData({ originalStat: currentStat, runtime: currentRuntime });
      currentStat = normalizationResult.stat;
      const normalizationChanges = normalizationResult.changeLog;
      logState('Normalizer Processor', 'stat', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [角色位置处理器]：根据角色的行动计划和当前状态，将他们在地图上的位置读取到runtime中。
      const locResult = processCharacterLocations({
        stat: currentStat,
        runtime: currentRuntime,
      });
      currentRuntime = locResult.runtime;
      logState('Character Locations Processor', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [角色设置处理器]：从 stat 中加载角色的配置信息（如好感度阶段、行动模式）到 runtime 中。
      currentRuntime = processCharacterSettings({ runtime: currentRuntime, stat: currentStat });
      logState('Character Settings Processor', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [好感度增加限制处理器]：根据 AI 的输出（editLog）分析并更新角色的好感度。
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

      // [时间处理器]：推进游戏内时间，并生成时间流逝的标志（flags）。
      const timeResult = await processTime({
        stat: currentStat,
        runtime: currentRuntime,
      });
      currentStat = timeResult.stat;
      currentRuntime = timeResult.runtime;
      const timeChanges = timeResult.changes;
      logState('Time Processor', 'stat (cache), runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [天气处理器] 依据时间旗标在必要时刷新 runtime.weather。
      const weatherResult = processWeather({
        stat: currentStat,
        runtime: currentRuntime,
      });
      currentRuntime = weatherResult.runtime;
      logState('Weather Processor', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [时间-消息同步处理器]：将时间流逝的标志（如“新的一天”）与当前消息的 MK 关联起来，形成锚点。
      const mkSyncResult = processTimeChatMkSync({
        stat: currentStat,
        runtime: currentRuntime,
        mk,
        selectedMks,
      });
      currentStat = mkSyncResult.stat;
      currentRuntime = mkSyncResult.runtime;
      const mkSyncChanges = mkSyncResult.changeLog;
      logState('Time Chat MK Sync', 'stat (cache), runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [快照获取器]：根据时间标志，获取处理所需的所有历史快照。
      currentRuntime = await fetchSnapshotsForTimeFlags({ runtime: currentRuntime, mk, isFake: isFakeEvent });
      logState('Snapshot Fetcher', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [好感度遗忘处理器]：根据时间锚点，判断角色是否因长时间未与玩家互动而降低好感度。
      const forgettingResult = await processAffectionForgetting({
        stat: currentStat,
        runtime: currentRuntime,
        mk,
        selectedMks,
        currentMessageId: message_id,
      });
      currentStat = forgettingResult.stat;
      currentRuntime = forgettingResult.runtime;
      const forgettingChanges = forgettingResult.changes;
      logState('Affection Forgetting Processor', 'stat', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [异变处理器]：根据当前状态决定是否触发、推进或结束游戏中的“异变”事件。
      const incidentResult = await processIncidentDecisions({ runtime: currentRuntime, stat: currentStat });
      currentStat = incidentResult.stat;
      currentRuntime = incidentResult.runtime;
      const incidentChanges = incidentResult.changes;
      logState('Incident Processor', 'stat (cache), runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [节日处理器]：处理游戏中的节日逻辑。
      const festivalResult = await processFestival({
        stat: currentStat,
        runtime: currentRuntime,
      });
      currentRuntime = festivalResult.runtime;
      logState('Festival Processor', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [角色决策处理器]：根据所有上下文信息，为每个角色决定他们下一步的行动。
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

      // [角色日志处理器]：获取最近的历史消息快照，为每个角色生成行动日志。
      currentRuntime = processCharacterLog(currentRuntime);
      logState('Character Log Processor', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [文文新闻处理器]：在新的一天开始时，生成文文新闻。
      currentRuntime = ayaNewsProcessor(currentRuntime);
      logState('Aya News Processor', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [被提及角色处理器]：从消息中提取提到的角色，并更新到 runtime
      currentRuntime = await mentionedCharacterProcessor({ runtime: currentRuntime });
      logState('Mentioned Character Processor', 'runtime', {
        stat: currentStat,
        runtime: currentRuntime,
        cache: getCache(currentStat),
      });

      // [提示词构建器]：将 `runtime` 中的所有计算结果汇总，生成最终注入给 LLM 的提示词。
      const prompt = buildPrompt({ runtime: currentRuntime, stat: currentStat });
      refreshInjectedPrompt(prompt);
      logger.log('handleWriteDone', '提示词构建完毕:', prompt);

      // [数据发送器]：将所有 `stat` 的变更和生成的提示词发送回 ERA 框架。
      const allChanges = normalizationChanges
        .concat(affectionChanges)
        .concat(timeChanges)
        .concat(mkSyncChanges)
        .concat(forgettingChanges)
        .concat(incidentChanges)
        .concat(charChanges);

      // [IO模块]：将所有 stat 的变更写入 ERA
      await writeChangesToEra({ changes: allChanges, stat: initialStat });

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

  // --- 事件监听器 ---

  // 监听 ERA 框架的 `era:writeDone` 事件。这是脚本的主要触发点。
  // `ignoreApiWrite: true` 选项是为了防止脚本响应由自身 API 调用（如 sendData）触发的 `writeDone` 事件，从而避免无限循环。
  onWriteDone(
    (detail: WriteDonePayload) => {
      logger.log('main', '接收到 era:writeDone 事件', detail);
      // 如果是 apiWrite 触发的，说明正在执行写入，避免循环
      if (detail?.actions?.apiWrite === true) {
        logger.log('onWriteDone', '检测到 apiWrite 标记事件，跳过刷新逻辑');
        return;
      }

      // 确保 handleWriteDone 中的任何异步错误都能被捕获和记录。
      handleWriteDone(detail, false).catch(error => {
        logger.error('onWriteDone', 'handleWriteDone 发生未处理的 Promise 拒绝:', error);
      });
    },
    { ignoreApiWrite: true },
  );

  // 监听一个用于开发的伪造事件 `dev:fakeWriteDone`，方便在不实际与 AI 交互的情况下测试数据处理流程。
  eventOn('dev:fakeWriteDone', (detail: WriteDonePayload) => {
    logger.log('main', '接收到伪造的 dev:fakeWriteDone 事件');
    handleWriteDone(detail, true).catch(error => {
      logger.error('dev:fakeWriteDone', 'handleWriteDone 发生未处理的 Promise 拒绝:', error);
    });
  });

  // --- 脚本卸载处理 ---

  // 监听 `pagehide` 事件，当脚本被卸载（例如关闭或刷新页面）时执行清理工作。
  $(window).on('pagehide.main', () => {
    logger.log('main', '后台数据处理脚本卸载');

    // 在此可以添加其他核心模块的清理函数。
    // import { cleanupCore } from './core/main';
    // cleanupCore();

    // 使用命名空间 `.main` 来确保只解除本脚本添加的事件监听，避免影响其他脚本。
    $(window).off('.main');
  });
});
