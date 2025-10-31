/**
 * @file 好感度处理器 (affection-processor) 的测试数据
 */

import _ from 'lodash';
import { WriteDonePayload } from '../../utils/era';
import baseTestData from '../stat-test-data.json';

// --- 测试用例 ---

// 1. 大幅增加
const stat_largeIncrease = _.cloneDeep(baseTestData);
stat_largeIncrease.chars.reimu.好感度 = 150;
const log_largeIncrease = JSON.stringify([{ op: 'update', path: 'chars.reimu.好感度', value_old: 60, value_new: 150 }]);
export const largeIncrease: WriteDonePayload = {
  mk: 'affection-test-1',
  message_id: 2001,
  actions: { apiWrite: true, sync: false } as any,
  stat: stat_largeIncrease,
  statWithoutMeta: stat_largeIncrease,
  editLogs: { 'affection-test-1': log_largeIncrease as any },
  selectedMks: ['affection-test-1'],
  consecutiveProcessingCount: 1,
};

// 2. 大幅减少
const stat_largeDecrease = _.cloneDeep(baseTestData);
stat_largeDecrease.chars.reimu.好感度 = -50;
const log_largeDecrease = JSON.stringify([{ op: 'update', path: 'chars.reimu.好感度', value_old: 60, value_new: -50 }]);
export const largeDecrease: WriteDonePayload = {
  mk: 'affection-test-2',
  message_id: 2002,
  actions: { apiWrite: true, sync: false } as any,
  stat: stat_largeDecrease,
  statWithoutMeta: stat_largeDecrease,
  editLogs: { 'affection-test-2': log_largeDecrease as any },
  selectedMks: ['affection-test-2'],
  consecutiveProcessingCount: 1,
};

// 3. 小幅变化 (不应折算)
const stat_smallChange = _.cloneDeep(baseTestData);
stat_smallChange.chars.reimu.好感度 = 62;
const log_smallChange = JSON.stringify([{ op: 'update', path: 'chars.reimu.好感度', value_old: 60, value_new: 62 }]);
export const smallChange: WriteDonePayload = {
  mk: 'affection-test-3',
  message_id: 2003,
  actions: { apiWrite: true, sync: false } as any,
  stat: stat_smallChange,
  statWithoutMeta: stat_smallChange,
  editLogs: { 'affection-test-3': log_smallChange as any },
  selectedMks: ['affection-test-3'],
  consecutiveProcessingCount: 1,
};

// 4. 首次赋值 (从无到有)
const stat_initialAssign = _.cloneDeep(baseTestData) as any;
stat_initialAssign.chars['charC'] = { name: '角色C', 好感度: 200 };
const log_initialAssign = JSON.stringify([
  { op: 'update', path: 'chars.charC.好感度', value_old: undefined, value_new: 200 },
]);
export const initialAssign: WriteDonePayload = {
  mk: 'affection-test-4',
  message_id: 2004,
  actions: { apiWrite: true, sync: false } as any,
  stat: stat_initialAssign,
  statWithoutMeta: stat_initialAssign,
  editLogs: { 'affection-test-4': log_initialAssign as any },
  selectedMks: ['affection-test-4'],
  consecutiveProcessingCount: 1,
};

// 5. 对象更新 (非直接路径)
const stat_objectUpdate = _.cloneDeep(baseTestData);
stat_objectUpdate.chars.marisa.好感度 = 110;
const log_objectUpdate = JSON.stringify([
  {
    op: 'update',
    path: 'chars.marisa',
    value_old: baseTestData.chars.marisa,
    value_new: { ...baseTestData.chars.marisa, 好感度: 110 },
  },
]);
export const objectUpdate: WriteDonePayload = {
  mk: 'affection-test-5',
  message_id: 2005,
  actions: { apiWrite: true, sync: false } as any,
  stat: stat_objectUpdate,
  statWithoutMeta: stat_objectUpdate,
  editLogs: { 'affection-test-5': log_objectUpdate as any },
  selectedMks: ['affection-test-5'],
  consecutiveProcessingCount: 1,
};

// 6. 混合操作
const stat_mixedOps = _.cloneDeep(baseTestData) as any;
stat_mixedOps.user.name = '新测试员';
stat_mixedOps.chars.reimu.好感度 = 250;
stat_mixedOps.chars.marisa.好感度 = -90;
stat_mixedOps.chars['charD'] = { name: '角色D', 好感度: 5 };
const log_mixedOps = JSON.stringify([
  { op: 'update', path: 'user.name', value_old: undefined, value_new: '新测试员' },
  { op: 'update', path: 'chars.reimu.好感度', value_old: 60, value_new: 250 },
  { op: 'insert', path: 'chars.charD', value_new: { name: '角色D', 好感度: 5 } }, // insert, 应被忽略
  { op: 'update', path: 'chars.marisa.好感度', value_old: 20, value_new: -90 },
]);
export const mixedOps: WriteDonePayload = {
  mk: 'affection-test-6',
  message_id: 2006,
  actions: { apiWrite: true, sync: false } as any,
  stat: stat_mixedOps,
  statWithoutMeta: stat_mixedOps,
  editLogs: { 'affection-test-6': log_mixedOps as any },
  selectedMks: ['affection-test-6'],
  consecutiveProcessingCount: 1,
};
