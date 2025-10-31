import _ from 'lodash';
import baseTestData from '../stat-test-data.json';

// ====================================================================
// UI 测试数据
// ====================================================================

// --- 测试场景 1：标准情况 (Happy Path) ---

export const standardRuntime = {
  clock: {
    now: { year: 1, month: 10, day: 24, hm: '06:00', periodName: '清晨', iso: '2025-10-24T06:00:00+09:00' },
  },
  chars: {
    reimu: { 好感度等级: '亲近' },
    marisa: { 好感度等级: '熟悉' },
    sanae: { 好感度等级: '普通' },
    sakuya: { 好感度等级: '厌恶' },
  },
};

export const standardData = _.cloneDeep(baseTestData);

// --- 测试场景 2：数据缺失与空值 ---

export const missingRuntime = {};

export const missingData = _.merge(_.cloneDeep(baseTestData), {
  world: {
    map_graph: undefined,
  },
  festivals_list: [],
  incidents: {},
});
// @ts-expect-error: for testing purpose
delete missingData.user;
// @ts-expect-error: for testing purpose
delete missingData.chars.reimu;

// --- 测试场景 3：边界与特殊情况 ---

export const boundaryRuntime = {
  clock: {
    now: { year: 9999, month: 12, day: 31, hm: '23:59', periodName: '深夜', iso: '9999-12-31T23:59:59+09:00' },
  },
  chars: {
    reimu: { 好感度等级: '不渝' },
    sakuya: { 好感度等级: '死敌' },
  },
};

export const boundaryData = _.merge(_.cloneDeep(baseTestData), {
  config: {
    affection: {
      affectionStages: [
        { threshold: -100, name: 'HATE' },
        { threshold: 100, name: 'LOVE' },
      ],
    },
  },
  chars: {
    reimu: {
      好感度: 9999,
    },
    sakuya: {
      好感度: -9999,
    },
  },
  festivals_list: null,
});
