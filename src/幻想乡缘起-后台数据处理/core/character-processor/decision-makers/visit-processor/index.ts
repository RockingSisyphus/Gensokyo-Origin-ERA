import _ from 'lodash';
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
  runtime: any;
  stat: any;
  cache: any;
  remoteChars: string[];
}): {
  decisions: Record<string, any>;
  decidedChars: string[];
} {
  const funcName = 'makeVisitDecisions';
  const decisions: Record<string, any> = {};
  const decidedChars: string[] = [];

  for (const charId of remoteChars) {
    const affectionStage = getAffectionStageFromRuntime(runtime, charId);
    if (!affectionStage) continue;

    const { visit: visitConfig } = affectionStage;
    const char = getChar(stat, charId);
    const affection = char?.好感度 || 0;

    const isCooling = isVisitCooling(cache, charId);
    const canVisit = visitConfig?.enabled === true && !isCooling;

    if (!canVisit) {
      logger.debug(
        funcName,
        `角色 ${charId} 跳过“来访”决策 (visit.enabled: ${visitConfig?.enabled}, isCooling: ${isCooling})`,
      );
      continue;
    }

    const { passed, finalProb } = checkProbability(visitConfig.probBase, visitConfig.probK, affection);
    if (passed) {
      decisions[charId] = PREDEFINED_ACTIONS.VISIT_HERO;
      decidedChars.push(charId);
      setVisitCooling(cache, charId, true);
      logger.debug(funcName, `角色 ${charId} 通过概率检定 (P=${finalProb.toFixed(2)})，决定前来拜访主角。`);
    } else {
      logger.debug(funcName, `角色 ${charId} 未通过概率检定 (P=${finalProb.toFixed(2)})，不进行拜访。`);
    }
  }

  return { decisions, decidedChars };
}
