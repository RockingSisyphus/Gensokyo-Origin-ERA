/**
 * @file 好感度处理器 (affection-processor) 的测试数据
 */

import _ from 'lodash';
import { WriteDonePayload } from '../../utils/era';

// 基础 stat 对象，用于计算每个测试的初始状态
const baseStat = {
  chars: {
    角色A: {
      好感度: 50,
      其他属性: '不变',
    },
    角色B: {
      好感度: 10,
    },
  },
  user: {
    name: '测试员',
  },
};

// --- 测试用例 ---

// 1. 大幅增加
const stat_largeIncrease = _.cloneDeep(baseStat);
stat_largeIncrease.chars.角色A.好感度 = 150;
const log_largeIncrease = JSON.stringify([
  { op: 'update', path: 'chars.角色A.好感度', value_old: 50, value_new: 150 },
]);
export const largeIncrease: WriteDonePayload = {
  mk: 'affection-test-1',
  message_id: 2001,
  actions: { apiWrite: true, sync: false },
  stat: stat_largeIncrease,
  statWithoutMeta: stat_largeIncrease,
  editLogs: { 'affection-test-1': log_largeIncrease },
  selectedMks: ['affection-test-1'],
  consecutiveProcessingCount: 1,
};

// 2. 大幅减少
const stat_largeDecrease = _.cloneDeep(baseStat);
stat_largeDecrease.chars.角色A.好感度 = -50;
const log_largeDecrease = JSON.stringify([
  { op: 'update', path: 'chars.角色A.好感度', value_old: 50, value_new: -50 },
]);
export const largeDecrease: WriteDonePayload = {
  mk: 'affection-test-2',
  message_id: 2002,
  actions: { apiWrite: true, sync: false },
  stat: stat_largeDecrease,
  statWithoutMeta: stat_largeDecrease,
  editLogs: { 'affection-test-2': log_largeDecrease },
  selectedMks: ['affection-test-2'],
  consecutiveProcessingCount: 1,
};

// 3. 小幅变化 (不应折算)
const stat_smallChange = _.cloneDeep(baseStat);
stat_smallChange.chars.角色A.好感度 = 52;
const log_smallChange = JSON.stringify([
  { op: 'update', path: 'chars.角色A.好感度', value_old: 50, value_new: 52 },
]);
export const smallChange: WriteDonePayload = {
  mk: 'affection-test-3',
  message_id: 2003,
  actions: { apiWrite: true, sync: false },
  stat: stat_smallChange,
  statWithoutMeta: stat_smallChange,
  editLogs: { 'affection-test-3': log_smallChange },
  selectedMks: ['affection-test-3'],
  consecutiveProcessingCount: 1,
};

// 4. 首次赋值 (从无到有)
const stat_initialAssign = _.cloneDeep(baseStat) as any;
stat_initialAssign.chars['角色C'] = { 好感度: 200 };
const log_initialAssign = JSON.stringify([
  { op: 'update', path: 'chars.角色C.好感度', value_old: undefined, value_new: 200 },
]);
export const initialAssign: WriteDonePayload = {
  mk: 'affection-test-4',
  message_id: 2004,
  actions: { apiWrite: true, sync: false },
  stat: stat_initialAssign,
  statWithoutMeta: stat_initialAssign,
  editLogs: { 'affection-test-4': log_initialAssign },
  selectedMks: ['affection-test-4'],
  consecutiveProcessingCount: 1,
};

// 5. 对象更新 (非直接路径)
const stat_objectUpdate = _.cloneDeep(baseStat);
stat_objectUpdate.chars.角色B.好感度 = 110;
const log_objectUpdate = JSON.stringify([
  {
    op: 'update',
    path: 'chars.角色B',
    value_old: { 好感度: 10 },
    value_new: { 好感度: 110 },
  },
]);
export const objectUpdate: WriteDonePayload = {
  mk: 'affection-test-5',
  message_id: 2005,
  actions: { apiWrite: true, sync: false },
  stat: stat_objectUpdate,
  statWithoutMeta: stat_objectUpdate,
  editLogs: { 'affection-test-5': log_objectUpdate },
  selectedMks: ['affection-test-5'],
  consecutiveProcessingCount: 1,
};

// 6. 混合操作
const stat_mixedOps = _.cloneDeep(baseStat) as any;
stat_mixedOps.user.name = '新测试员';
stat_mixedOps.chars.角色A.好感度 = 250;
stat_mixedOps.chars.角色B.好感度 = -90;
stat_mixedOps.chars['角色D'] = { 好感度: 5 };
const log_mixedOps = JSON.stringify([
  { op: 'update', path: 'user.name', value_old: '测试员', value_new: '新测试员' },
  { op: 'update', path: 'chars.角色A.好感度', value_old: 50, value_new: 250 },
  { op: 'insert', path: 'chars.角色D', value_new: { 好感度: 5 } }, // insert, 应被忽略
  { op: 'update', path: 'chars.角色B.好感度', value_old: 10, value_new: -90 },
]);
export const mixedOps: WriteDonePayload = {
  mk: 'affection-test-6',
  message_id: 2006,
  actions: { apiWrite: true, sync: false },
  stat: stat_mixedOps,
  statWithoutMeta: stat_mixedOps,
  editLogs: { 'affection-test-6': log_mixedOps },
  selectedMks: ['affection-test-6'],
  consecutiveProcessingCount: 1,
};
