import { WriteDonePayload } from '../utils/era';
import { standardData } from './test-data/ui';
import * as timeData from './test-data/time';
import * as normalizerData from './test-data/normalizer';
import _ from 'lodash';

/**
 * 用于测试核心处理逻辑的伪造 WriteDonePayload。
 */
export const coreTestPayload: WriteDonePayload = {
  mk: 'test-mk-001',
  message_id: 999,
  actions: {
    apiWrite: true,
    sync: false,
  },
  stat: standardData, // 复用现有的标准数据作为基础
  statWithoutMeta: standardData, // 在测试中，我们让 stat 和 statWithoutMeta 相同
  editLogs: {},
  selectedMks: ['test-mk-001'],
  consecutiveProcessingCount: 1,
};

// ==================================================================
// 时间模块测试 Payloads
// ==================================================================

function createTimeTestPayload(scenario: timeData.TimeTestScenario): WriteDonePayload {
  const stat = _.cloneDeep(scenario.stat);
  const actions = scenario.actions ? _.cloneDeep(scenario.actions) : { apiWrite: true, sync: false };
  const editLogs = scenario.editLogs ? _.cloneDeep(scenario.editLogs) : {};
  const selectedMks = scenario.selectedMks ? [...scenario.selectedMks] : [];

  return {
    mk: scenario.mk,
    message_id: scenario.messageId,
    actions,
    stat,
    statWithoutMeta: stat,
    editLogs,
    selectedMks,
    consecutiveProcessingCount: 1,
  };
}

export const timeTestPayloads = Object.fromEntries(
  Object.entries(timeData.timeTestScenarios).map(([key, scenario]) => {
    const label =
      timeData.timeTestScenarioLabels[key as keyof typeof timeData.timeTestScenarioLabels] ?? `时间测试-${key}`;
    return [label, createTimeTestPayload(scenario)];
  }),
);

// ==================================================================
// Normalizer 模块测试 Payloads
// ==================================================================

function createNormalizerTestPayload(data: any): WriteDonePayload {
  return {
    mk: `normalizer-test-${Date.now()}`,
    message_id: 1001,
    actions: { apiWrite: true, sync: false },
    stat: data,
    statWithoutMeta: data,
    editLogs: {},
    selectedMks: [],
    consecutiveProcessingCount: 1,
  };
}

export const normalizerTestPayloads = {
  IllegalLocations: createNormalizerTestPayload(normalizerData.statWithIllegalLocations),
  MissingLocations: createNormalizerTestPayload(normalizerData.statWithMissingLocations),
};
