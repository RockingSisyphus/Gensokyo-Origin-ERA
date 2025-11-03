import _ from 'lodash';
import type { ForgettingRule } from '../../schema/character-settings';
import type { ChangeLogEntry } from '../../schema/change-log-entry';
import type { Runtime } from '../../schema/runtime';
import type { Stat } from '../../schema/stat';
import { QueryResultItem } from '../../events/constants';
import { pickAffectionStage } from '../../utils/accessor/affection';
import { createChangeLogEntry } from '../../utils/changeLog';
import { Logger } from '../../utils/log';
import { toFiniteNumber } from '../../utils/format';
import {
  getAnchorMkByFlag,
  getCharacterAffection,
  getCharacterSettings,
  getClock,
  getClockFlagValue,
  getSnapshotCharacterLocation,
  getSnapshotUserLocation,
  parseForgettingRule,
} from './accessors';
import { CHARACTER_FIELDS } from '../../schema/character';

interface ProcessParams {
  stat: Stat;
  runtime: Runtime;
  mk: string | null | undefined;
  selectedMks: (string | null)[] | null | undefined;
  currentMessageId: number | null | undefined;
}

interface ActiveRule {
  flagKey: string;
  rule: ForgettingRule;
}

interface CharacterContext {
  charId: string;
  affection: number;
  rules: ActiveRule[];
}

interface AnchorInfo {
  flagKey: string;
  mk: string;
  messageId: number;
}

const logger = new Logger();

const hasSharedLocation = (snapshots: QueryResultItem[], charId: string): boolean => {
  return snapshots.some(snapshot => {
    const userLocation = getSnapshotUserLocation(snapshot);
    const charLocation = getSnapshotCharacterLocation(snapshot, charId);
    return userLocation && charLocation && userLocation === charLocation;
  });
};

const sumDecrease = (rules: ActiveRule[]): number => {
  return _.sumBy(rules, entry => {
    const value = toFiniteNumber(entry.rule.decrease);
    return value && value > 0 ? value : 0;
  });
};

export async function processAffectionForgettingInternal({
  stat,
  runtime,
  mk,
  selectedMks,
}: ProcessParams): Promise<{ stat: Stat; runtime: Runtime; changes: ChangeLogEntry[] }> {
  const funcName = 'processAffectionForgetting';
  logger.debug(funcName, '--- 开始好感度遗忘处理 ---', { mk });
  const changes: ChangeLogEntry[] = [];

  // 1. --- 前置检查 ---
  const clock = getClock(runtime);
  const characterSettings = getCharacterSettings(runtime);

  if (!clock?.flags || !clock.mkAnchors) {
    logger.debug(funcName, '缺少 clock 数据，跳过遗忘处理。');
    return { stat, runtime, changes };
  }
  if (!characterSettings || !stat.chars) {
    logger.debug(funcName, '缺少角色配置或 stat 数据，跳过遗忘处理。');
    return { stat, runtime, changes };
  }
  if (!mk || !selectedMks) {
    logger.debug(funcName, '缺少 mk / selectedMks 信息，跳过遗忘处理。');
    return { stat, runtime, changes };
  }

  const validSelectedMks = new Set(
    (selectedMks ?? []).filter((value): value is string => typeof value === 'string' && value.length > 0),
  );
  if (validSelectedMks.size === 0) {
    logger.debug(funcName, 'selectedMks 中没有任何有效 MK，跳过遗忘处理。');
    return { stat, runtime, changes };
  }

  // 2. --- 收集需要处理的角色和规则 ---
  const activeCharacters: CharacterContext[] = [];
  const requiredFlags = new Set<string>();

  for (const [charId, settings] of Object.entries(characterSettings)) {
    const affectionValue = getCharacterAffection(stat, charId);
    if (affectionValue == null) continue;

    const stage = pickAffectionStage(affectionValue, settings.affectionStages);
    const parsedRules = (stage?.forgettingSpeed ?? [])
      .map(parseForgettingRule)
      .filter((rule): rule is ForgettingRule => Boolean(rule));

    if (parsedRules.length === 0) continue;

    const rules: ActiveRule[] = [];
    for (const rule of parsedRules) {
      if (!getClockFlagValue(runtime, rule.triggerFlag)) continue;
      rules.push({ flagKey: rule.triggerFlag, rule });
      requiredFlags.add(rule.triggerFlag);
    }

    if (rules.length > 0) {
      activeCharacters.push({ charId, affection: affectionValue, rules });
    }
  }

  if (activeCharacters.length === 0 || requiredFlags.size === 0) {
    logger.debug(funcName, '当前没有角色触发遗忘规则。');
    return { stat, runtime, changes };
  }

  logger.debug(funcName, `[步骤2] 收集到 ${activeCharacters.length} 个待处理角色。`);

  // 3. --- 直接使用 runtime 中的快照 ---
  const snapshots = runtime.snapshots ?? [];
  if (snapshots.length === 0) {
    logger.debug(funcName, 'runtime.snapshots 为空，无法判定同地区情况。');
    return { stat, runtime, changes };
  }
  logger.debug(funcName, `[步骤3] 从 runtime 获取到 ${snapshots.length} 个历史快照。`);

  // 4. --- 判断位置并应用好感度惩罚 ---
  for (const context of activeCharacters) {
    const { charId, affection, rules } = context;

    const anchorMk = getAnchorMkByFlag(runtime, rules[0].flagKey);
    if (!anchorMk || !validSelectedMks.has(anchorMk)) {
      logger.debug(funcName, `角色 ${charId} 的锚点无效或不在主干消息链中，跳过。`);
      continue;
    }

    const shared = hasSharedLocation(snapshots, charId);
    logger.debug(funcName, `[步骤4] 检查角色 ${charId} 与玩家的位置...`, { hasSharedLocation: shared });
    if (shared) {
      logger.debug(funcName, `角色 ${charId} 在跨度内与玩家同地区，跳过遗忘。`);
      continue;
    }

    const decreaseValue = sumDecrease(rules);
    if (decreaseValue <= 0) continue;

    const newAffection = Math.round(affection - decreaseValue);
    const char = stat.chars?.[charId];
    if (!char) continue;
    char[CHARACTER_FIELDS.affection] = newAffection;

    const reason = `在 ${rules.map(item => item.flagKey).join(', ')} 跨度内未与玩家同地区，按遗忘规则降低好感度 ${decreaseValue}`;
    const path = `chars.${charId}.${CHARACTER_FIELDS.affection}`;
    changes.push(createChangeLogEntry('affection-forgetting-processor', path, affection, newAffection, reason));

    logger.debug(funcName, '应用遗忘规则降低好感度。', {
      charId,
      oldAffection: affection,
      newAffection,
      decreaseValue,
      activeFlags: rules.map(item => item.flagKey),
    });
  }

  logger.debug(funcName, '--- 好感度遗忘处理完毕 ---');
  return { stat, runtime, changes };
}
