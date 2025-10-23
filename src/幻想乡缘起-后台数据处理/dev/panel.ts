import { Logger } from '../utils/logger';
import { coreTestPayload, timeTestPayloads } from './payloads';
import {
  boundaryData,
  boundaryRuntime,
  missingData,
  missingRuntime,
  standardData,
  standardRuntime,
} from './test-data/ui';
import { addTestButtons, TestButtonConfig } from './utils';

const logger = new Logger('dev-panel');

function createTestPanel() {
  // 创建悬浮面板
  const panel = $('<div>')
    .attr('id', 'demo-era-test-harness')
    .css({
      position: 'fixed',
      top: '10px',
      left: '10px',
      zIndex: 9999,
      background: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '5px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    })
    .appendTo($('body'));

  // --- UI 测试 ---
  const uiTestConfigs: TestButtonConfig[] = [
    {
      text: '标准UI',
      payload: { statWithoutMeta: standardData, runtime: standardRuntime },
      eventType: 'GSKO:showUI',
    },
    {
      text: '缺失UI',
      payload: { statWithoutMeta: missingData, runtime: missingRuntime },
      eventType: 'GSKO:showUI',
    },
    {
      text: '边界UI',
      payload: { statWithoutMeta: boundaryData, runtime: boundaryRuntime },
      eventType: 'GSKO:showUI',
    },
  ];
  addTestButtons(panel, 'UI 测试', uiTestConfigs, {
    cursor: 'pointer',
    padding: '8px 12px',
    border: '1px solid #ddd',
    background: '#f0f0f0',
    borderRadius: '4px',
  });

  // --- Core 通用测试 ---
  const coreTestConfigs: TestButtonConfig[] = [{ text: '通用Core', payload: coreTestPayload }];
  addTestButtons(panel, 'Core 逻辑测试', coreTestConfigs, {
    cursor: 'pointer',
    padding: '8px 12px',
    border: '1px solid #aed581',
    background: '#dcedc8',
    borderRadius: '4px',
    fontWeight: 'bold',
  });

  // --- 时间模块测试 ---
  const timeTestConfigs: TestButtonConfig[] = Object.entries(timeTestPayloads).map(([key, payload]) => ({
    text: key,
    payload,
    // beforeTest 逻辑已移除，因为 runtime 现在是事件 payload 的一部分
  }));
  addTestButtons(panel, '时间模块测试', timeTestConfigs, {
    cursor: 'pointer',
    padding: '5px 10px',
    border: '1px solid #bcaaa4',
    background: '#efebe9',
    borderRadius: '3px',
    fontSize: '12px',
  });

  toastr.info('ERA 测试工具已加载。');
}

function destroyTestPanel() {
  $('body').find('#demo-era-test-harness').remove();
  toastr.info('ERA 测试工具已卸载。');
}

export function initDevPanel() {
  logger.log('initDevPanel', '初始化测试面板');
  createTestPanel();
  $(window).on('pagehide.devpanel', function () {
    cleanupDevPanel();
  });
}

export function cleanupDevPanel() {
  logger.log('cleanupDevPanel', '清理测试面板');
  destroyTestPanel();
  $(window).off('pagehide.devpanel');
}
