import { z } from 'zod';
import { Cache, CharacterCache } from '../../schema/cache';
import { CHARACTER_FIELDS, type Character } from '../../schema/character';
import { AffectionStageWithForget } from '../../schema/character-settings';
import { Action, CharacterRuntime, Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { USER_FIELDS } from '../../schema/user';

export function getChars(stat: Stat): Stat['chars'] {
  return stat.chars;
}

export function getChar(stat: Stat, charId: string): Character | undefined {
  return stat.chars[charId];
}

export function getGlobalAffectionStages(stat: Stat): AffectionStageWithForget[] {
  return stat.config.affection.affectionStages;
}

export function getUserLocation(stat: Stat): string {
  return stat.user?.[USER_FIELDS.currentLocation] ?? '';
}

export function getCharLocation(char: Character): string {
  return char[CHARACTER_FIELDS.currentLocation] ?? '';
}

export function setCharLocationInStat(stat: Stat, charId: string, location: string): void {
  stat.chars[charId]![CHARACTER_FIELDS.currentLocation] = location;
}

export function setCharGoalInStat(stat: Stat, charId: string, goal: string): void {
  stat.chars[charId]!.目标 = goal;
}

function ensureCharacterRuntime(runtime: Runtime, charId: string) {
  if (!runtime.character) {
    runtime.character = {
      chars: {},
      partitions: { coLocated: [], remote: [] },
    };
  }
  if (!runtime.character.chars[charId]) {
    runtime.character.chars[charId] = z.object({}).passthrough().parse({});
  }
}

export function getCharacterRuntime(runtime: Runtime, charId: string): CharacterRuntime | undefined {
  return runtime.character?.chars[charId];
}

export function getAffectionStageFromRuntime(runtime: Runtime, charId: string): AffectionStageWithForget | undefined {
  return getCharacterRuntime(runtime, charId)?.affectionStage;
}

export function setAffectionStageInRuntime(runtime: Runtime, charId: string, stage: AffectionStageWithForget): void {
  ensureCharacterRuntime(runtime, charId);
  runtime.character!.chars[charId]!.affectionStage = stage;
}

export function getDecisionFromRuntime(runtime: Runtime, charId: string): Action | undefined {
  return getCharacterRuntime(runtime, charId)?.decision;
}

export function setDecisionInRuntime(runtime: Runtime, charId: string, decision: Action): void {
  ensureCharacterRuntime(runtime, charId);
  runtime.character!.chars[charId]!.decision = decision;
}

export function getCompanionDecisionFromRuntime(runtime: Runtime, charId: string): Action | undefined {
  return getCharacterRuntime(runtime, charId)?.companionDecision;
}

export function setCompanionDecisionInRuntime(runtime: Runtime, charId: string, decision: Action): void {
  ensureCharacterRuntime(runtime, charId);
  runtime.character!.chars[charId]!.companionDecision = decision;
}

export function getCoLocatedPartition(runtime: Runtime): string[] {
  return runtime.character?.partitions.coLocated ?? [];
}

export function setPartitions(runtime: Runtime, partitions: { coLocated: string[]; remote: string[] }): void {
  if (!runtime.character) {
    runtime.character = {
      chars: {},
      partitions: { coLocated: [], remote: [] },
    };
  }
  runtime.character.partitions = partitions;
}

function ensureCharacterCache(cache: Cache, charId: string) {
  if (!cache.character) {
    cache.character = {};
  }
  if (!cache.character[charId]) {
    cache.character[charId] = z.object({}).passthrough().parse({});
  }
}

export function getCharacterCache(cache: Cache, charId: string): CharacterCache | undefined {
  return cache.character?.[charId];
}

export function isVisitCooling(cache: Cache, charId: string): boolean {
  return getCharacterCache(cache, charId)?.visit?.cooling === true;
}

export function setVisitCooling(cache: Cache, charId: string, cooling: boolean): void {
  ensureCharacterCache(cache, charId);
  const charCache = cache.character![charId]!;
  if (!charCache.visit) {
    charCache.visit = {};
  }
  charCache.visit.cooling = cooling;
}