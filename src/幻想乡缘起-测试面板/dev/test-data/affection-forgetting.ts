/**
 * @file 好感度遗忘处理器 (affection-forgetting-processor) 的测试数据
 * @description 每个场景都必须精确模拟 time-processor 和 time-chat-mk-sync 的输入和输出，
 * 以确保数据在 mk, message_id, selectedMks 和 mkAnchors 之间保持一致。
 */
import _ from 'lodash';
import { ClockAck } from '../../../GSKO-BASE/schema/clock';
import type { Stat } from '../../../GSKO-BASE/schema/stat';
import { TimeChatMkAnchors } from '../../../GSKO-BASE/schema/time-chat-mk-sync';
import { WriteDonePayload } from '../../utils/era';
import baseTestData from '../stat-test-data.json';

// ==================================================
// 辅助定义和函数
// ==================================================

const PREV_DAY_ACK: ClockAck = {
  dayID: 20251023,
  weekID: 20251020,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510237,
  periodIdx: 7,
  seasonID: 20252,
  seasonIdx: 2,
};

const PREV_WEEK_ACK: ClockAck = {
  dayID: 20251019,
  weekID: 20251013,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510197,
  periodIdx: 7,
  seasonID: 20252,
  seasonIdx: 2,
};

/**
 * @description 仿照 `test-data/time.ts` 中的 `CLOCK_ACK_AT_DAWN`，用于构造一个不会跨天的场景
 */
const NO_CHANGE_ACK: ClockAck = {
  dayID: 20251024,
  weekID: 20251020,
  monthID: 202510,
  yearID: 2025,
  periodID: 202510240,
  periodIdx: 0,
  seasonID: 20252,
  seasonIdx: 2,
};

const ANCHOR_MK_DAY = 'mk-anchor-day';
const ANCHOR_MK_WEEK = 'mk-anchor-week';

const PREV_ANCHORS: TimeChatMkAnchors = {
  newDay: ANCHOR_MK_DAY,
  newWeek: ANCHOR_MK_WEEK,
  newMonth: ANCHOR_MK_WEEK,
  newYear: ANCHOR_MK_WEEK,
  newSeason: ANCHOR_MK_WEEK,
  newPeriod: ANCHOR_MK_DAY,
};

/**
 * 创建一个基础的、包含遗忘规则的 stat 对象
 */
function createBaseStatForForgetting(): Stat {
  const stat = _.cloneDeep(baseTestData) as any;
  if (!stat.cache) stat.cache = {};
  if (!stat.cache.timeChatMkSync) stat.cache.timeChatMkSync = { anchors: {} };
  if (!stat.cache.time) stat.cache.time = { clockAck: {} };

  stat.chars.reimu.affectionStages = [
    {
      threshold: 0,
      name: '陌生',
      patienceUnit: 'day',
      forgettingSpeed: [
        { triggerFlag: 'newDay', decrease: 10 },
        { triggerFlag: 'newWeek', decrease: 50 },
      ],
    },
  ] as any;
  stat.chars.reimu.好感度 = 500;
  return stat;
}

// ==================================================
// 锚点伪造 Payloads
// ==================================================

/**
 * 锚点消息的伪造 payload，用于快照模拟器
 */
export const Anchor_Day_Payload: WriteDonePayload = (() => {
  const stat = _.cloneDeep(baseTestData) as any;
  if (!stat.cache) stat.cache = {};
  if (!stat.cache.timeChatMkSync) stat.cache.timeChatMkSync = { anchors: {} };
  if (!stat.cache.time) stat.cache.time = { clockAck: {} };

  stat.cache!.time!.clockAck = PREV_DAY_ACK;
  stat.user.所在地区 = '人间之里';
  stat.chars.reimu.所在地区 = '博丽神社';

  return {
    mk: ANCHOR_MK_DAY,
    message_id: 100,
    actions: {} as any,
    stat,
    statWithoutMeta: stat,
    editLogs: {},
    selectedMks: [ANCHOR_MK_DAY],
    consecutiveProcessingCount: 1,
  };
})();

/**
 * 锚点消息的伪造 payload，用于快照模拟器
 */
export const Anchor_Week_Payload: WriteDonePayload = (() => {
  const stat = _.cloneDeep(baseTestData) as any;
  if (!stat.cache) stat.cache = {};
  if (!stat.cache.timeChatMkSync) stat.cache.timeChatMkSync = { anchors: {} };
  if (!stat.cache.time) stat.cache.time = { clockAck: {} };

  stat.cache!.time!.clockAck = PREV_WEEK_ACK;
  stat.user.所在地区 = '魔法森林';
  stat.chars.reimu.所在地区 = '博丽神社';

  return {
    mk: ANCHOR_MK_WEEK,
    message_id: 99,
    actions: {} as any,
    stat,
    statWithoutMeta: stat,
    editLogs: {},
    selectedMks: [ANCHOR_MK_WEEK],
    consecutiveProcessingCount: 1,
  };
})();

// ==================================================
// 测试场景 Payloads
// ==================================================

/**
 * 场景1: 触发日期转换，但因为当前在同一地点，所以不遗忘
 */
export const Met_ShouldNotForget: WriteDonePayload = (() => {
  const stat = createBaseStatForForgetting();
  stat.time.timeProgress = 24 * 60;
  stat.cache!.time!.clockAck = PREV_DAY_ACK;
  stat.cache!.timeChatMkSync!.anchors = PREV_ANCHORS;
  stat.user.所在地区 = '博丽神社';
  stat.chars.reimu.所在地区 = '博丽神社';

  const currentMk = 'aff-forget-met';
  return {
    mk: currentMk,
    message_id: 101,
    actions: {} as any,
    stat,
    statWithoutMeta: stat,
    editLogs: {},
    selectedMks: [ANCHOR_MK_DAY, currentMk],
    consecutiveProcessingCount: 1,
  };
})();

/**
 * 场景2: 触发日期转换，且不在同一地点，应该遗忘
 */
export const NotMet_ShouldForget: WriteDonePayload = (() => {
  const stat = createBaseStatForForgetting();
  stat.time.timeProgress = 24 * 60;
  stat.cache!.time!.clockAck = PREV_DAY_ACK;
  stat.cache!.timeChatMkSync!.anchors = PREV_ANCHORS;
  stat.user.所在地区 = '人间之里';
  stat.chars.reimu.所在地区 = '博丽神社';

  const currentMk = 'aff-forget-not-met';
  return {
    mk: currentMk,
    message_id: 102,
    actions: {} as any,
    stat,
    statWithoutMeta: stat,
    editLogs: {},
    selectedMks: [ANCHOR_MK_DAY, currentMk],
    consecutiveProcessingCount: 1,
  };
})();

/**
 * 场景3: 未触发日期转换，不应该遗忘
 */
export const NoTrigger_ShouldNotForget: WriteDonePayload = (() => {
  const stat = createBaseStatForForgetting();
  stat.time.timeProgress = 10;
  stat.cache!.time!.clockAck = NO_CHANGE_ACK;
  stat.cache!.timeChatMkSync!.anchors = PREV_ANCHORS;
  stat.user.所在地区 = '人间之里';
  stat.chars.reimu.所在地区 = '博丽神社';

  const currentMk = 'aff-forget-no-trigger';
  return {
    mk: currentMk,
    message_id: 103,
    actions: {} as any,
    stat,
    statWithoutMeta: stat,
    editLogs: {},
    selectedMks: [ANCHOR_MK_DAY, currentMk],
    consecutiveProcessingCount: 1,
  };
})();

/**
 * 场景4: 同时触发跨天和跨周，应该叠加遗忘
 */
export const MultiTriggers_ShouldForgetMore: WriteDonePayload = (() => {
  const stat = createBaseStatForForgetting();
  stat.time.timeProgress = 8 * 24 * 60;
  stat.cache!.time!.clockAck = PREV_WEEK_ACK;
  stat.cache!.timeChatMkSync!.anchors = PREV_ANCHORS;
  stat.user.所在地区 = '人间之里';
  stat.chars.reimu.所在地区 = '博丽神社';

  const currentMk = 'aff-forget-multi-trigger';
  return {
    mk: currentMk,
    message_id: 104,
    actions: {} as any,
    stat,
    statWithoutMeta: stat,
    editLogs: {},
    selectedMks: [ANCHOR_MK_WEEK, ANCHOR_MK_DAY, currentMk],
    consecutiveProcessingCount: 1,
  };
})();
