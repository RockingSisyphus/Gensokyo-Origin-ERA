/**
 * @file 好感度处理器 (affection-processor) 的测试数据
 */

import _ from 'lodash';
import { WriteDonePayload } from '../../utils/era';
import baseTestData from '../stat-test-data.json';

// --- 辅助函数 ---

const getClonedBaseData = () => _.cloneDeep(baseTestData);

// --- 独立配置 ---

// 为 sanae 创建一套独立的、属性齐全的好感度等级表
const sanaeAffectionStages = [
  {
    threshold: 50,
    name: '崇拜',
    describe: '将对方视为神明一样崇拜，会无条件地听从对方的任何指示。',
    patienceUnit: 'day',
    visit: { enabled: true, probBase: 1.0, coolUnit: 'day' },
    forgettingSpeed: [{ triggerFlag: 'newMonth', decrease: 1 }],
    affectionGrowthLimit: { max: 20, divisor: 2 },
  },
  {
    threshold: 20,
    name: '信赖',
    describe: '非常信赖对方，愿意向对方寻求帮助和建议。',
    patienceUnit: 'day',
    visit: { enabled: true, probBase: 0.8, coolUnit: 'day' },
    forgettingSpeed: [{ triggerFlag: 'newMonth', decrease: 1 }],
    // 通过设置一个极大的 max 值来模拟“无限制”
    affectionGrowthLimit: { max: 99999, divisor: 1 },
  },
  {
    threshold: 0,
    name: '友人',
    describe: '将对方视为朋友，可以一起愉快地交谈和行动。',
    patienceUnit: 'day',
    visit: { enabled: true, probBase: 0.4, coolUnit: 'day' },
    forgettingSpeed: [{ triggerFlag: 'newMonth', decrease: 1 }],
    affectionGrowthLimit: { max: 3, divisor: 4 },
  },
  {
    threshold: -50,
    name: '警惕',
    describe: '对对方抱有强烈的警惕心，会尽量避免与对方接触。',
    patienceUnit: 'day',
    visit: { enabled: false, probBase: 0, coolUnit: 'day' },
    forgettingSpeed: [{ triggerFlag: 'newMonth', decrease: 2 }],
    affectionGrowthLimit: { max: 5, divisor: 2 },
  },
];

// --- 测试用例 ---

// ==================================================
// 1. 使用全局配置 (reimu & sakuya)
// ==================================================

// 1.1. 大幅增加 (触发限制)
// reimu: 60 -> 80 (delta=20). 阶段'亲近'(>=40), limit={max:10, div:3}.
// 20 > 10, 触发. finalDelta = max(20/3, 10) = 10. 结果: 60+10=70
export const globalConfigLargeIncrease: WriteDonePayload = (() => {
  const stat = getClonedBaseData();
  stat.chars.reimu.好感度 = 80;
  const log = JSON.stringify([{ op: 'update', path: 'chars.reimu.好感度', value_old: 60, value_new: 80 }]);
  return {
    mk: 'affection-test-1.1',
    message_id: 2011,
    actions: { apiWrite: true } as any,
    stat,
    statWithoutMeta: stat,
    editLogs: { 'affection-test-1.1': log as any },
  } as any;
})();

// 1.2. 小幅增加 (不触发限制)
// reimu: 60 -> 65 (delta=5). 阶段'亲近'(>=40), limit={max:10, div:3}.
// 5 <= 10, 不触发. 结果: 65 (无变化)
export const globalConfigSmallIncrease: WriteDonePayload = (() => {
  const stat = getClonedBaseData();
  stat.chars.reimu.好感度 = 65;
  const log = JSON.stringify([{ op: 'update', path: 'chars.reimu.好感度', value_old: 60, value_new: 65 }]);
  return {
    mk: 'affection-test-1.2',
    message_id: 2012,
    actions: { apiWrite: true } as any,
    stat,
    statWithoutMeta: stat,
    editLogs: { 'affection-test-1.2': log as any },
  } as any;
})();

// 1.3. 大幅减少 (触发限制)
// sakuya: -50 -> -80 (delta=-30). 阶段'憎恨'(>=-100), limit={max:2, div:2}.
// |-30| > 2, 触发. finalDelta = -max(30/2, 2) = -15. 结果: -50-15=-65
export const globalConfigLargeDecrease: WriteDonePayload = (() => {
  const stat = getClonedBaseData();
  stat.chars.sakuya.好感度 = -80;
  const log = JSON.stringify([{ op: 'update', path: 'chars.sakuya.好感度', value_old: -50, value_new: -80 }]);
  return {
    mk: 'affection-test-1.3',
    message_id: 2013,
    actions: { apiWrite: true } as any,
    stat,
    statWithoutMeta: stat,
    editLogs: { 'affection-test-1.3': log as any },
  } as any;
})();

// ==================================================
// 2. 使用独立配置 (sanae)
// ==================================================

// 2.1. 触发独立配置的限制
// sanae: 10 -> 30 (delta=20). 阶段'友人'(>=0), limit={max:3, div:4}.
// 20 > 3, 触发. finalDelta = max(20/4, 3) = 5. 结果: 10+5=15
export const customConfigLimited: WriteDonePayload = (() => {
  const stat = getClonedBaseData();
  stat.chars.sanae.好感度 = 30;
  stat.chars.sanae.affectionStages = sanaeAffectionStages; // 注入独立配置
  const log = JSON.stringify([{ op: 'update', path: 'chars.sanae.好感度', value_old: 10, value_new: 30 }]);
  return {
    mk: 'affection-test-2.1',
    message_id: 2021,
    actions: { apiWrite: true } as any,
    stat,
    statWithoutMeta: stat,
    editLogs: { 'affection-test-2.1': log as any },
  } as any;
})();

// 2.2. 处于“无限制”的阶段
// sanae: 25 -> 45 (delta=20). 阶段'信赖'(>=20), limit={max:99999, div:1}.
// 20 <= 99999, 不触发. 结果: 45 (无变化)
export const customConfigNoLimit: WriteDonePayload = (() => {
  const stat = getClonedBaseData();
  stat.chars.sanae.好感度 = 45;
  stat.chars.sanae.affectionStages = sanaeAffectionStages; // 注入独立配置
  // 手动设置旧值
  const oldStat = _.cloneDeep(stat);
  oldStat.chars.sanae.好感度 = 25;
  const log = JSON.stringify([{ op: 'update', path: 'chars.sanae.好感度', value_old: 25, value_new: 45 }]);
  return {
    mk: 'affection-test-2.2',
    message_id: 2022,
    actions: { apiWrite: true } as any,
    stat,
    statWithoutMeta: stat,
    editLogs: { 'affection-test-2.2': log as any },
  } as any;
})();

// ==================================================
// 3. 边缘情况
// ==================================================

// 3.1. 对象更新 (非直接路径)
// marisa: 20 -> 110 (delta=90). 阶段'熟悉'(>=20), limit={max:5, div:2}.
// 90 > 5, 触发. finalDelta = max(90/2, 5) = 45. 结果: 20+45=65
export const objectUpdate: WriteDonePayload = (() => {
  const stat = getClonedBaseData();
  const oldMarisa = _.cloneDeep(stat.chars.marisa);
  stat.chars.marisa.好感度 = 110;
  const log = JSON.stringify([
    {
      op: 'update',
      path: 'chars.marisa',
      value_old: oldMarisa,
      value_new: { ...oldMarisa, 好感度: 110 },
    },
  ]);
  return {
    mk: 'affection-test-3.1',
    message_id: 2031,
    actions: { apiWrite: true } as any,
    stat,
    statWithoutMeta: stat,
    editLogs: { 'affection-test-3.1': log as any },
  } as any;
})();
