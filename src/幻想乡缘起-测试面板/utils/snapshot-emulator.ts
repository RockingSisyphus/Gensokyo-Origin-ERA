import * as affectionTestData from '../dev/test-data/affection';
import * as affectionForgettingData from '../dev/test-data/affection-forgetting';
import { QueryResultPayload, WriteDonePayload } from './era';
import { Logger } from './log';

const logger = new Logger();

// 将所有测试数据收集起来
const allTestDataByMk = new Map<string, WriteDonePayload>();
const allTestDataOrdered: WriteDonePayload[] = [];
let isAllDataCollected = false;

function collectAllTestData() {
  if (isAllDataCollected) return;

  const combinedData = [...Object.values(affectionTestData), ...Object.values(affectionForgettingData)];

  combinedData.forEach((p: any) => {
    if (p.mk) {
      allTestDataByMk.set(p.mk, p);
      allTestDataOrdered.push(p);
    }
  });

  // 按 message_id 排序，确保顺序正确
  allTestDataOrdered.sort((a, b) => a.message_id - b.message_id);

  logger.log('dev:snapshotEmulator', '已收集并排序所有测试数据', {
    count: allTestDataOrdered.length,
    mks: allTestDataOrdered.map(p => p.mk),
  });

  isAllDataCollected = true;
}

/**
 * 设置快照模拟器，确保测试隔离。
 * @param activeScenarioPayload - 当前正在运行的测试场景的 payload。
 * @returns 返回一个清理函数，用于移除事件监听器。
 */
export function setupSnapshotEmulator(activeScenarioPayload: WriteDonePayload): () => void {
  collectAllTestData(); // 确保全局数据已加载

  const listener = (detail: { startMk?: string; endMk?: string }) => {
    // 1. 根据当前激活场景的 selectedMks 构建隔离的、有序的历史记录
    const scenarioMks = activeScenarioPayload.selectedMks || [];
    const scenarioSpecificData = scenarioMks
      .map(mk => (mk ? allTestDataByMk.get(mk) : undefined))
      .filter((p): p is WriteDonePayload => p !== undefined);

    // 2. 在这个隔离的列表上执行查找和切片
    const { startMk, endMk } = detail;
    logger.log('dev:snapshotEmulator', `[模拟] 开始默认逻辑筛选，范围: [${startMk}, ${endMk}]`);
    logger.log('dev:snapshotEmulator', `[模拟] 当前场景的历史链:`, scenarioMks);

    const startIndex = startMk ? scenarioSpecificData.findIndex(p => p.mk === startMk) : 0;
    const endIndex = endMk ? scenarioSpecificData.findIndex(p => p.mk === endMk) : scenarioSpecificData.length - 1;

    logger.log('dev:snapshotEmulator', `[模拟] 计算索引范围: [${startIndex}, ${endIndex}]`);

    if (startIndex === -1 || endIndex === -1) {
      logger.error('dev:snapshotEmulator', `[模拟] 无法在当前场景的历史链中找到 startMk 或 endMk`, {
        startMk,
        endMk,
        scenarioMks,
      });
      eventEmit('dev:fakeSnapshotsResponse', {
        result: { queryType: 'getSnapshotsBetweenMks', request: detail, result: [] },
      });
      return;
    }

    const results = scenarioSpecificData.slice(startIndex, endIndex + 1);
    logger.log('dev:snapshotEmulator', `[模拟] 切片结果`, {
      mks: results.map(p => p.mk),
    });

    const queryResult: QueryResultPayload = {
      queryType: 'getSnapshotsBetweenMks',
      request: detail,
      result: results.map(p => ({
        mk: p.mk,
        message_id: p.message_id,
        is_user: false,
        stat: p.stat,
        statWithoutMeta: p.statWithoutMeta,
      })),
    } as any;

    logger.log('dev:snapshotEmulator', `[模拟] 使用默认逻辑，找到 ${results.length} 个匹配`, queryResult);
    eventEmit('dev:fakeSnapshotsResponse', { result: queryResult });
  };

  eventOn('dev:getSnapshotsBetweenMks', listener);

  // 返回一个清理函数
  return () => {
    eventRemoveListener('dev:getSnapshotsBetweenMks', listener);
  };
}
