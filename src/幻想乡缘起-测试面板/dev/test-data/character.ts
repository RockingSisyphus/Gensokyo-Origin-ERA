import _ from 'lodash';
import baseTestData from '../stat-test-data.json';

// ==================================================================
// 角色决策模块 (`character-processor`) 测试数据
// ==================================================================

// ==================================================================
// 场景 1: 标准流程 - 第一天
// ==================================================================
// 预期: reimu(相伴), marisa(来访), sanae(routine)
export const charTest_S1_R1_Standard = _.cloneDeep(baseTestData);
// 初始时，时间 flag 应该被正确计算，但角色相关的 cache 是空的
_.set(charTest_S1_R1_Standard, 'cache.character', {});

// ==================================================================
// 场景 2: 标准流程 - 第二天 (承接场景1)
// ==================================================================
// 预期: reimu(routine,耐心耗尽), marisa(routine,冷却中), sanae(special,祭典)
export const charTest_S2_R2_StandardNextDay = _.cloneDeep(baseTestData);
charTest_S2_R2_StandardNextDay.世界.timeProgress = 24 * 60; // 推进一天
charTest_S2_R2_StandardNextDay.chars.marisa.所在地区 = '博丽神社'; // marisa 已到达
// 模拟 marisa 在前一天来访后进入冷却状态
_.set(charTest_S2_R2_StandardNextDay, 'cache.character.marisa.visit.cooling', true);
// 确保 clockAck 保持不变，这样 time-processor 才能检测到时间变化
charTest_S2_R2_StandardNextDay.cache.time = baseTestData.cache.time;

// ==================================================================
// 场景 3: 边缘情况 - 来访概率失败
// ==================================================================
// 预期: marisa 因概率检定失败而不会来访，转而执行 routine
export const charTest_S3_VisitProbFail = _.cloneDeep(baseTestData);
_.set(charTest_S3_VisitProbFail, 'cache.character', {});
// 修改 marisa 的好感度配置，使来访概率为 0
const marisaAffectionStage = charTest_S3_VisitProbFail.config.affection.affectionStages.find(
  stage => stage.name === '普通',
);
if (marisaAffectionStage) {
  marisaAffectionStage.visit.probBase = 0.0;
}

// ==================================================================
// 场景 4: 边缘情况 - 全员待机
// ==================================================================
// 预期: 所有角色都因不满足任何行动条件而待机
export const charTest_S4_AllIdle = _.cloneDeep(baseTestData);
_.set(charTest_S4_AllIdle, 'cache.character', {});
// 通过将 routine 和 specials 设为空数组来确保没有行动会被触发
charTest_S4_AllIdle.chars.reimu.routine = [];
charTest_S4_AllIdle.chars.marisa.routine = [];
charTest_S4_AllIdle.chars.sanae.specials = [];
charTest_S4_AllIdle.chars.sanae.routine = [];

// ==================================================================
// 场景 5: 边缘情况 - 主角位置缺失
// ==================================================================
// 预期: 所有角色被视为 remote, reimu 不会相伴，而是执行 routine
export const charTest_S5_NoUserLocation = _.omit(_.cloneDeep(baseTestData), 'user');
_.set(charTest_S5_NoUserLocation, 'cache.character', {});

// ==================================================================
// 场景 6: 优先级测试 - 相伴 vs 其他决策
// ==================================================================
// 预期: reimu 同时满足“相伴”和“routine”条件时，应优先执行“相伴”。
export const charTest_S6_CompanionPriority = _.cloneDeep(baseTestData);
// 推进2小时，确保 newPeriod 为 true
charTest_S6_CompanionPriority.世界.timeProgress = 120;
// 修改 reimu 的 routine，使其在任何时段变化时都触发
charTest_S6_CompanionPriority.chars.reimu.routine = [
  { when: { byFlag: ['newPeriod'] }, action: { to: '博丽神社', do: '打扫神社' } },
];
// 确保 reimu 和 user 在同一地点以满足相伴条件
charTest_S6_CompanionPriority.chars.reimu.所在地区 = '博丽神社';
charTest_S6_CompanionPriority.user.所在地区 = '博丽神社';
// 重置 cache
_.set(charTest_S6_CompanionPriority, 'cache.character', {});
// 确保 clockAck 保持不变，这样 time-processor 才能检测到时间变化
charTest_S6_CompanionPriority.cache.time = baseTestData.cache.time;
