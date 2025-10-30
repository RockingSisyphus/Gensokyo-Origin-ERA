import _ from 'lodash';
import { getCacheValue, setCacheValue } from '../../utils/cache';
import {
  AFFECTION_STAGE_IN_RUNTIME_PATH,
  Character,
  MODULE_CACHE_ROOT,
  VISIT_COOLING_PATH,
} from './constants';

// --- 读取 (Read) ---

/** 从 stat 中安全地获取角色对象 */
export function getChar(stat: any, charId: string): Character | null {
  return _.get(stat, `chars.${charId}`, null);
}

/** 从 stat 中安全地获取用户位置 */
export function getUserLocation(stat: any): string | null {
  return _.get(stat, 'user.所在地区', null);
}

/** 从角色对象中安全地获取其位置 */
export function getCharLocation(char: Character | null): string | null {
  return char?.所在地区 || null;
}

/** 从 stat 中安全地获取全局好感度等级配置 */
export function getGlobalAffectionStages(stat: any): any[] {
  return _.get(stat, 'config.affection.affectionStages', []);
}

/** 从 runtime 中获取已解析的好感度等级 */
export function getAffectionStageFromRuntime(runtime: any, charId: string): any | null {
  return _.get(runtime, AFFECTION_STAGE_IN_RUNTIME_PATH(charId), null);
}

/** 从 character-processor 缓存中获取角色的来访冷却状态 */
export function isVisitCooling(cache: any, charId: string): boolean {
  const fullPath = `${MODULE_CACHE_ROOT}.${VISIT_COOLING_PATH(charId)}`;
  // 确保返回值始终是布尔值
  return getCacheValue(cache, fullPath, false) || false;
}

// --- 写入 (Write) ---

/** 将解析出的好感度等级写入 runtime */
export function setAffectionStageInRuntime(runtime: any, charId: string, stage: any): void {
  _.set(runtime, AFFECTION_STAGE_IN_RUNTIME_PATH(charId), stage);
}

/** 设置角色的来访冷却状态到 character-processor 缓存 */
export function setVisitCooling(cache: any, charId: string, value: boolean): void {
  const fullPath = `${MODULE_CACHE_ROOT}.${VISIT_COOLING_PATH(charId)}`;
  setCacheValue(cache, fullPath, value);
}

/**
 * 更新角色在 stat 中的位置。
 * @param stat - The stat object.
 * @param charId - The character's ID.
 * @param location - The new location.
 */
export function setCharLocationInStat(stat: any, charId: string, location: string): void {
  _.set(stat, `chars.${charId}.所在地区`, location);
}

/**
 * 更新角色在 stat 中的当前目标。
 * @param stat - The stat object.
 * @param charId - The character's ID.
 * @param goal - The new goal.
 */
export function setCharGoalInStat(stat: any, charId: string, goal: string): void {
  _.set(stat, `chars.${charId}.当前目标`, goal);
}
