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

function createTimeTestPayload(data: any): WriteDonePayload {
  return {
    mk: `time-test-${Date.now()}`,
    message_id: 1000,
    actions: { apiWrite: true, sync: false },
    stat: data,
    statWithoutMeta: data,
    editLogs: {},
    selectedMks: [],
    consecutiveProcessingCount: 1,
  };
}

export const timeTestPayloads = {
  Initial: createTimeTestPayload(timeData.timeTest_Initial),
  NoChange: createTimeTestPayload(timeData.timeTest_NoChange),
  NewPeriod: createTimeTestPayload(timeData.timeTest_NewPeriod),
  NewDay: createTimeTestPayload(timeData.timeTest_NewDay),
  NewWeek: createTimeTestPayload(timeData.timeTest_NewWeek),
  NewMonth: createTimeTestPayload(timeData.timeTest_NewMonth),
  NewSeason: createTimeTestPayload(timeData.timeTest_NewSeason),
  NewYear: createTimeTestPayload(timeData.timeTest_NewYear),
};

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
