import { Logger } from '../utils/log';
import { coreTestPayload, normalizerTestPayloads, timeTestPayloads } from './payloads';
import * as affectionTestData from './test-data/affection';
import * as affectionLevelTestData from './test-data/affection-level';
import * as areaTestData from './test-data/area';
import * as festivalTestData from './test-data/festival';
import { incidentTestData } from './test-data/incident';
import {
  boundaryData,
  boundaryRuntime,
  missingData,
  missingRuntime,
  standardData,
  standardRuntime,
} from './test-data/ui';
import { addTestButtons, TestButtonConfig } from './utils';

const logger = new Logger();

function createTestPanel() {
  // 创建悬浮面板
  const panel = $('<div>')
    .attr('id', 'demo-era-test-harness')
    .css({
      position: 'fixed',
      top: '10px',
      left: '10px',
      zIndex: 9999,
      background: 'rgba(40, 40, 40, 0.95)', // 深色背景
      color: '#f0f0f0', // 浅色字体
      border: '1px solid #555', // 深色边框
      padding: '10px',
      borderRadius: '5px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
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
    border: '1px solid #666',
    background: '#444',
    color: '#eee',
    borderRadius: '4px',
  });

  // --- Core 通用测试 ---
  const coreTestConfigs: TestButtonConfig[] = [{ text: '通用Core', payload: coreTestPayload }];
  addTestButtons(panel, 'Core 逻辑测试', coreTestConfigs, {
    cursor: 'pointer',
    padding: '8px 12px',
    border: '1px solid #5c8b2e',
    background: '#385923',
    color: '#dcedc8',
    borderRadius: '4px',
    fontWeight: 'bold',
  });

  // --- 时间模块测试 ---
  const timeTestConfigs: TestButtonConfig[] = Object.entries(timeTestPayloads).map(([key, payload]) => ({
    text: key,
    payload,
  }));
  addTestButtons(panel, '时间模块测试', timeTestConfigs, {
    cursor: 'pointer',
    padding: '5px 10px',
    border: '1px solid #8c7b75',
    background: '#5d4037',
    color: '#efebe9',
    borderRadius: '3px',
    fontSize: '12px',
  });

  // --- 地区模块测试 ---
  const areaTestConfigs: TestButtonConfig[] = Object.entries(areaTestData).map(([key, statData]) => ({
    text: key,
    payload: { statWithoutMeta: statData },
  }));
  addTestButtons(panel, '地区模块测试', areaTestConfigs, {
    cursor: 'pointer',
    padding: '5px 10px',
    border: '1px solid #0288d1',
    background: '#01579b',
    color: '#e1f5fe',
    borderRadius: '3px',
    fontSize: '12px',
  });

  // --- 路线计算测试 ---
  const routeTestConfigs: TestButtonConfig[] = [
    { text: '从神社出发', payload: { statWithoutMeta: areaTestData.statForRouteFromShrine } },
    { text: '从永远亭出发', payload: { statWithoutMeta: areaTestData.statForRouteFromEientei } },
    { text: '从孤立点出发', payload: { statWithoutMeta: areaTestData.statForRouteFromIsolated } },
  ];
  addTestButtons(panel, '路线计算测试', routeTestConfigs, {
    cursor: 'pointer',
    padding: '5px 10px',
    border: '1px solid #4caf50',
    background: '#2e7d32',
    color: '#e8f5e9',
    borderRadius: '3px',
    fontSize: '12px',
  });

  // --- Normalizer 模块测试 ---
  const normalizerTestConfigs: TestButtonConfig[] = Object.entries(normalizerTestPayloads).map(([key, payload]) => ({
    text: key,
    payload,
  }));
  addTestButtons(panel, 'Normalizer 模块测试', normalizerTestConfigs, {
    cursor: 'pointer',
    padding: '5px 10px',
    border: '1px solid #d84315',
    background: '#bf360c',
    color: '#fbe9e7',
    borderRadius: '3px',
    fontSize: '12px',
  });

  // --- 好感度模块测试 ---
  const affectionTestConfigs: TestButtonConfig[] = Object.entries(affectionTestData).map(([key, payload]) => ({
    text: key,
    payload,
  }));
  addTestButtons(panel, '好感度模块测试', affectionTestConfigs, {
    cursor: 'pointer',
    padding: '5px 10px',
    border: '1px solid #7b1fa2',
    background: '#4a148c',
    color: '#f3e5f5',
    borderRadius: '3px',
    fontSize: '12px',
  });

  // --- 好感度等级模块测试 ---
  const affectionLevelTestConfigs: TestButtonConfig[] = Object.entries(affectionLevelTestData).map(
    ([key, statData]) => ({
      text: key,
      payload: { statWithoutMeta: statData },
    }),
  );
  addTestButtons(panel, '好感度等级模块测试', affectionLevelTestConfigs, {
    cursor: 'pointer',
    padding: '5px 10px',
    border: '1px solid #c2185b',
    background: '#880e4f',
    color: '#fce4ec',
    borderRadius: '3px',
    fontSize: '12px',
  });

  // --- 节日模块测试 ---
  const festivalTestConfigs: TestButtonConfig[] = Object.entries(festivalTestData).map(([key, statData]) => ({
    text: key.replace('festivalTest_', ''), // 移除前缀以简化按钮文本
    payload: { statWithoutMeta: statData },
  }));
  addTestButtons(panel, '节日模块测试', festivalTestConfigs, {
    cursor: 'pointer',
    padding: '5px 10px',
    border: '1px solid #ff6f00',
    background: '#e65100',
    color: '#fff3e0',
    borderRadius: '3px',
    fontSize: '12px',
  });

  // --- 异变模块测试 ---
  const incidentTestConfigs: TestButtonConfig[] = Object.entries(incidentTestData).map(([key, data]) => ({
    text: key,
    payload: { statWithoutMeta: data.stat },
  }));
  addTestButtons(panel, '异变模块测试', incidentTestConfigs, {
    cursor: 'pointer',
    padding: '5px 10px',
    border: '1px solid #b71c1c',
    background: '#d32f2f',
    color: '#ffebee',
    borderRadius: '3px',
    fontSize: '12px',
  });
}

function destroyTestPanel() {
  $('body').find('#demo-era-test-harness').remove();
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
