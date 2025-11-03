/**
 * @file affection-forgetting-processor 的数据访问器
 */
import _ from 'lodash';
import type { Runtime } from '../../schema/runtime';
import { FLAG_PREFIX, TRIGGER_FLAG_PREFIX_KEYS } from './constants';
import { toFiniteNumber } from '../../utils/format';
import { ForgettingRule, ForgettingRuleSchema } from '../../schema/character-settings';
import { CHARACTER_FIELDS, Character, CharsSchema } from '../../schema/character';
import { USER_FIELDS, UserSchema } from '../../schema/user';
import { QueryResultItem } from '../../events/constants';
import { Stat } from '../../schema/stat';

// --- Runtime Accessors ---

export const getClock = (runtime: Runtime) => runtime.clock;
export const getClockFlags = (runtime: Runtime) => runtime.clock?.flags;
export const getMkAnchors = (runtime: Runtime) => runtime.clock?.mkAnchors;
export const getCharacterSettings = (runtime: Runtime) => runtime.characterSettings;

/**
 * 从 runtime.clock.flags 中解析一个 flag 的状态
 * @param runtime
 * @param flagKey - 例如 'newDay', 'byPeriod.newMorning'
 * @returns
 */
export const getClockFlagValue = (runtime: Runtime, flagKey: string): boolean => {
  const flags = getClockFlags(runtime);
  if (!flags) {
    return false;
  }
  return _.get(flags, flagKey) === true;
};

/**
 * 从 runtime.clock.mkAnchors 中解析一个 flag 对应的锚点 MK
 * @param runtime
 * @param flagKey
 * @returns
 */
export const getAnchorMkByFlag = (runtime: Runtime, flagKey: string): string | null => {
  const mkAnchors = getMkAnchors(runtime);
  if (!mkAnchors) {
    return null;
  }

  if (flagKey.startsWith(FLAG_PREFIX.BY_PERIOD)) {
    const periodKey = flagKey.slice(FLAG_PREFIX.BY_PERIOD.length);
    return _.get(mkAnchors, [TRIGGER_FLAG_PREFIX_KEYS.BY_PERIOD, periodKey]) ?? null;
  }
  if (flagKey.startsWith(FLAG_PREFIX.BY_SEASON)) {
    const seasonKey = flagKey.slice(FLAG_PREFIX.BY_SEASON.length);
    return _.get(mkAnchors, [TRIGGER_FLAG_PREFIX_KEYS.BY_SEASON, seasonKey]) ?? null;
  }

  // For root flags like 'newDay', 'newWeek'
  const rootFlagKey = flagKey as keyof typeof mkAnchors;
  if (rootFlagKey in mkAnchors) {
    const mk = mkAnchors[rootFlagKey];
    return typeof mk === 'string' ? mk : null;
  }

  return null;
};

// --- Stat Accessors ---

export const getCharacters = (stat: Stat) => stat.chars;
export const getCharacter = (stat: Stat, charId: string): Character | undefined => stat.chars?.[charId];
export const getCharacterAffection = (stat: Stat, charId: string) => {
  const char = getCharacter(stat, charId);
  return toFiniteNumber(char?.[CHARACTER_FIELDS.affection]);
};
export const getUser = (stat: Stat) => stat.user;
export const getUserLocation = (stat: Stat) => getUser(stat)?.[USER_FIELDS.currentLocation];
export const getCharacterLocation = (stat: Stat, charId: string) => {
  const char = getCharacter(stat, charId);
  return char?.[CHARACTER_FIELDS.currentLocation];
};

// --- Snapshot Accessors ---

export const getSnapshotUserLocation = (snapshot: QueryResultItem) => {
  const state = (snapshot.statWithoutMeta ?? snapshot.stat) as Stat | undefined;
  if (!state) return undefined;
  return getUserLocation(state);
};

export const getSnapshotCharacterLocation = (snapshot: QueryResultItem, charId: string) => {
  const state = (snapshot.statWithoutMeta ?? snapshot.stat) as Stat | undefined;
  if (!state) return undefined;
  return getCharacterLocation(state, charId);
};

// --- Rule Normalization ---

/**
 * 安全地将未知输入解析为 ForgettingRule
 * @param entry
 * @returns
 */
export const parseForgettingRule = (entry: unknown): ForgettingRule | null => {
  const result = ForgettingRuleSchema.safeParse(entry);
  return result.success ? result.data : null;
};
