/**
 * @file 好感度处理器 (affection-processor) 的测试数据
 */

import _ from 'lodash';
import { WriteDonePayload } from '../../utils/era';
import baseTestData from '../stat-test-data.json';

// --- 辅助函数 ---

// 返回一份深拷贝的基础测试数据，防止交叉污染
const getClonedBaseData = () => _.cloneDeep(baseTestData);

// 返回一个标准角色的深拷贝，用于创建新角色，确保数据结构完整
const getClonedCharData = () => _.cloneDeep(baseTestData.chars.reimu);

// --- 测试用例 ---

// 1. 大幅增加
export const largeIncrease: WriteDonePayload = (() => {
  const stat = getClonedBaseData();
  stat.chars.reimu.好感度 = 150;
  const log = JSON.stringify([{ op: 'update', path: 'chars.reimu.好感度', value_old: 60, value_new: 150 }]);
  return {
    mk: 'affection-test-1',
    message_id: 2001,
    actions: { apiWrite: true, sync: false } as any,
    stat,
    statWithoutMeta: stat,
    editLogs: { 'affection-test-1': log as any },
    selectedMks: ['affection-test-1'],
    consecutiveProcessingCount: 1,
  };
})();

// 2. 大幅减少
export const largeDecrease: WriteDonePayload = (() => {
  const stat = getClonedBaseData();
  stat.chars.reimu.好感度 = -50;
  const log = JSON.stringify([{ op: 'update', path: 'chars.reimu.好感度', value_old: 60, value_new: -50 }]);
  return {
    mk: 'affection-test-2',
    message_id: 2002,
    actions: { apiWrite: true, sync: false } as any,
    stat,
    statWithoutMeta: stat,
    editLogs: { 'affection-test-2': log as any },
    selectedMks: ['affection-test-2'],
    consecutiveProcessingCount: 1,
  };
})();

// 3. 小幅变化 (不应折算)
export const smallChange: WriteDonePayload = (() => {
  const stat = getClonedBaseData();
  stat.chars.reimu.好感度 = 62;
  const log = JSON.stringify([{ op: 'update', path: 'chars.reimu.好感度', value_old: 60, value_new: 62 }]);
  return {
    mk: 'affection-test-3',
    message_id: 2003,
    actions: { apiWrite: true, sync: false } as any,
    stat,
    statWithoutMeta: stat,
    editLogs: { 'affection-test-3': log as any },
    selectedMks: ['affection-test-3'],
    consecutiveProcessingCount: 1,
  };
})();

// 4. 首次赋值 (从无到有)
export const initialAssign: WriteDonePayload = (() => {
  const stat = getClonedBaseData() as any;
  const newChar = getClonedCharData();
  newChar.name = '角色C';
  newChar.好感度 = 200;
  stat.chars['charC'] = newChar;

  const log = JSON.stringify([{ op: 'update', path: 'chars.charC.好感度', value_old: undefined, value_new: 200 }]);
  return {
    mk: 'affection-test-4',
    message_id: 2004,
    actions: { apiWrite: true, sync: false } as any,
    stat,
    statWithoutMeta: stat,
    editLogs: { 'affection-test-4': log as any },
    selectedMks: ['affection-test-4'],
    consecutiveProcessingCount: 1,
  };
})();

// 5. 对象更新 (非直接路径)
export const objectUpdate: WriteDonePayload = (() => {
  const stat = getClonedBaseData();
  stat.chars.marisa.好感度 = 110;
  const log = JSON.stringify([
    {
      op: 'update',
      path: 'chars.marisa',
      value_old: baseTestData.chars.marisa,
      value_new: { ...baseTestData.chars.marisa, 好感度: 110 },
    },
  ]);
  return {
    mk: 'affection-test-5',
    message_id: 2005,
    actions: { apiWrite: true, sync: false } as any,
    stat,
    statWithoutMeta: stat,
    editLogs: { 'affection-test-5': log as any },
    selectedMks: ['affection-test-5'],
    consecutiveProcessingCount: 1,
  };
})();

// 6. 混合操作
export const mixedOps: WriteDonePayload = (() => {
  const stat = getClonedBaseData() as any;
  stat.user.name = '新测试员';
  stat.chars.reimu.好感度 = 250;
  stat.chars.marisa.好感度 = -90;

  const newChar = getClonedCharData();
  newChar.name = '角色D';
  newChar.好感度 = 5;
  stat.chars['charD'] = newChar;

  const log = JSON.stringify([
    { op: 'update', path: 'user.name', value_old: undefined, value_new: '新测试员' },
    { op: 'update', path: 'chars.reimu.好感度', value_old: 60, value_new: 250 },
    { op: 'insert', path: 'chars.charD', value_new: { name: '角色D', 好感度: 5 } }, // insert, 应被忽略
    { op: 'update', path: 'chars.marisa.好感度', value_old: 20, value_new: -90 },
  ]);
  return {
    mk: 'affection-test-6',
    message_id: 2006,
    actions: { apiWrite: true, sync: false } as any,
    stat,
    statWithoutMeta: stat,
    editLogs: { 'affection-test-6': log as any },
    selectedMks: ['affection-test-6'],
    consecutiveProcessingCount: 1,
  };
})();
