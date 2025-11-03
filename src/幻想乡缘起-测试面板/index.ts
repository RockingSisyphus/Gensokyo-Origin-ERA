/**
 * @file 幻想乡缘起 - 测试面板入口
 * @description 这是一个独立的脚本，用于在开发环境中加载测试面板，并响应模拟快照的请求。
 */

import { cleanupDevPanel, initDevPanel } from './dev/panel';
import * as affectionTestData from './dev/test-data/affection';
import * as affectionForgettingData from './dev/test-data/affection-forgetting';
import { WriteDonePayload } from './utils/era';
import { Logger } from './utils/log';

const logger = new Logger();

// --- 快照模拟数据提供 ---

// 将所有测试数据收集到一个 Map 中，方便 GSKO-BASE 查询
const allTestDataByMk = new Map<string, WriteDonePayload>();
[...Object.values(affectionTestData), ...Object.values(affectionForgettingData)].forEach(p => {
  if (p.mk) {
    allTestDataByMk.set(p.mk, p);
  }
});

/**
 * 监听来自 GSKO-BASE 的伪快照请求，并将所有测试数据作为响应发送回去。
 */
function setupFakeSnapshotProvider() {
  eventOn('dev:requestFakeSnapshots', () => {
    logger.log('dev:snapshotProvider', '收到伪快照请求，发送所有测试数据...');
    eventEmit('dev:fakeSnapshotsResponse', { snapshots: allTestDataByMk });
  });
}

// --- 主程序 ---

$(() => {
  logger.log('main', '测试面板脚本加载');
  initDevPanel();

  // 启动伪快照提供者
  setupFakeSnapshotProvider();
  logger.log('main', '伪快照提供者已启动');

  $(window).on('pagehide.testpanel', () => {
    logger.log('main', '测试面板脚本卸载');
    cleanupDevPanel();
    // eventRemoveListener 需要传入函数引用，但匿名函数无法获取引用，
    // 不过测试面板的生命周期与页面相同，关闭时所有监听会自动移除，所以此处不处理也无妨。
    // 如果需要手动移除，需要将监听器定义为具名函数。
    $(window).off('.testpanel');
  });
});
