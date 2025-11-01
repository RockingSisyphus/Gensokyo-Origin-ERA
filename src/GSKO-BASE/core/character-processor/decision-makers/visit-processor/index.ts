import _ from 'lodash';
import { Cache } from '../../../../schema/cache';
import { Action } from '../../../../schema/runtime';
import { Stat } from '../../../../schema/stat';
import { Runtime } from '../../../../schema/runtime';
import { Logger } from '../../../../utils/log';
import { getAffectionStageFromRuntime, getChar, isVisitCooling, setVisitCooling } from '../../accessors';
import { PREDEFINED_ACTIONS } from '../../constants';

const logger = new Logger();

/**
 * 执行概率检定。
 */
function checkProbability(
  probBase: number = 0,
  probK: number = 0,
  affection: number = 0,
): { passed: boolean; finalProb: number } {
  const finalProb = _.clamp(probBase + probK * affection, 0, 1);
  const passed = Math.random() < finalProb;
  return { passed, finalProb };
}

/**
 * 来访决策处理器。在异区角色中决定谁会前来拜访。
 */
export function makeVisitDecisions({
  runtime,
  stat,
  cache,
  remoteChars,
}: {
  runtime: Runtime;
  stat: Stat;
  cache: Cache;
  remoteChars: string[];
}): {
  decisions: Record<string, Action>;
  decidedChars: string[];
  newCache: Cache;
} {
  const funcName = 'makeVisitDecisions';
  const decisions: Record<string, Action> = {};
  const decidedChars: string[] = [];
  const newCache = _.cloneDeep(cache);

  for (const charId of remoteChars) {
    const affectionStage = getAffectionStageFromRuntime(runtime, charId);
    if (!affectionStage?.visit?.enabled) continue;

    const char = getChar(stat, charId);
    if (!char) continue;

    const isCooling = isVisitCooling(newCache, charId);
    if (isCooling) {
      logger.debug(funcName, `角色 ${charId} 处于来访冷却中，跳过决策。`);
      continue;
    }

    const { probBase = 0, probK = 0 } = affectionStage.visit;
    const { passed, finalProb } = checkProbability(probBase, probK, char.好感度);

    if (passed) {
      decisions[charId] = PREDEFINED_ACTIONS.VISIT_HERO;
      decidedChars.push(charId);
      setVisitCooling(newCache, charId, true);
      logger.debug(funcName, `角色 ${charId} 通过概率检定 (P=${finalProb.toFixed(2)})，决定前来拜访主角。`);
    } else {
      logger.debug(funcName, `角色 ${charId} 未通过概率检定 (P=${finalProb.toFixed(2)})，不进行拜访。`);
    }
  }

  return { decisions, decidedChars, newCache };
}
