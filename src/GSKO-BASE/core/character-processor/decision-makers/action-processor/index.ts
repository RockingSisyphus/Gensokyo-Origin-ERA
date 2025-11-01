import _ from 'lodash';
import { Character } from '../../../../schema/character';
import { Entry } from '../../../../schema/character-settings';
import { Action } from '../../../../schema/runtime';
import { Stat } from '../../../../schema/stat';
import { Runtime } from '../../../../schema/runtime';
import { Logger } from '../../../../utils/log';
import { getChar, getCharLocation } from '../../accessors';
import { DEFAULT_VALUES, ENTRY_KEYS } from '../../constants';

const logger = new Logger();

/**
 * 检查一个行为条目（Entry）的 `when` 条件是否满足。
 */
function areConditionsMet(entry: Entry, { runtime }: { runtime: Runtime }): boolean {
  const { when } = entry;
  if (!when) return true; // 如果没有 when 条件，则始终满足

  const clock = runtime.clock;
  if (!clock) return false;

  // 检查 byFlag
  if (when.byFlag) {
    if (!when.byFlag.some((flagPath: string) => _.get(clock.flags, flagPath) === true)) {
      return false;
    }
  }

  // 检查 byNow
  if (when.byNow) {
    if (!_.isMatch(clock.now, when.byNow)) {
      return false;
    }
  }

  // 检查 byMonthDay
  if (when.byMonthDay) {
    const { month, day } = clock.now;
    if (month !== when.byMonthDay.month || day !== when.byMonthDay.day) {
      return false;
    }
  }

  // 检查 byFestival
  if (when.byFestival) {
    const currentFestival = runtime.festival?.current?.name;
    if (when.byFestival === 'ANY' && !currentFestival) {
      return false;
    }
    if (_.isString(when.byFestival) && when.byFestival !== 'ANY' && currentFestival !== when.byFestival) {
      return false;
    }
    if (_.isArray(when.byFestival) && currentFestival && !when.byFestival.includes(currentFestival)) {
      return false;
    }
  }

  return true;
}

/**
 * 从角色的行动列表中选择一个行动。
 * 优先级: specials > routine
 */
function chooseAction(
  charId: string,
  char: Character,
  { runtime, stat }: { runtime: Runtime; stat: Stat },
): Action | null {
  const funcName = 'chooseAction';

  // 1. 检查特殊行动 (specials)
  const specials = char.specials || [];
  logger.debug(funcName, `角色 ${charId}: 开始检查 ${specials.length} 个特殊行动...`);
  const metSpecials = specials
    .map((entry, index) => ({ ...entry, originalIndex: index }))
    .filter(entry => {
      const met = areConditionsMet(entry, { runtime });
      if (met) {
        logger.debug(funcName, `角色 ${charId}: 特殊行动 [${entry.action.do}] 条件满足。`);
      }
      return met;
    });

  if (metSpecials.length > 0) {
    // TODO: 处理 usesRemaining
    const highestPrioritySpecial = _.maxBy(metSpecials, ENTRY_KEYS.PRIORITY);
    if (highestPrioritySpecial) {
      logger.debug(
        funcName,
        `角色 ${charId}: 选中了优先级最高的特殊行动 [${highestPrioritySpecial.action.do}] (P=${highestPrioritySpecial.priority})。`,
      );
      return highestPrioritySpecial.action;
    }
  }

  // 2. 检查日常行动 (routine)
  const routine = char.routine || [];
  logger.debug(funcName, `角色 ${charId}: 开始检查 ${routine.length} 个日常行动...`);
  for (const entry of routine) {
    if (areConditionsMet(entry, { runtime })) {
      logger.debug(funcName, `角色 ${charId}: 选中了第一个满足条件的日常行动 [${entry.action.do}]。`);
      return entry.action;
    }
  }

  // 3. 兜底返回 Idle (无行动)
  logger.debug(funcName, `角色 ${charId}: 未找到任何满足条件的行动。`);
  return null;
}

/**
 * 常规行动决策处理器。
 */
export function makeActionDecisions({
  runtime,
  stat,
  remainingChars,
}: {
  runtime: Runtime;
  stat: Stat;
  remainingChars: string[];
}): {
  decisions: Record<string, Action>;
} {
  const funcName = 'makeActionDecisions';
  const decisions: Record<string, Action> = {};

  for (const charId of remainingChars) {
    const char = getChar(stat, charId);
    if (!char) continue;

    logger.debug(funcName, `开始为角色 ${charId} 选择常规行动...`);
    const action = chooseAction(charId, char, { runtime, stat });

    if (action) {
      const finalAction = { ...action };
      // 如果行动没有指定目的地，则默认为角色当前所在地
      if (!finalAction.to) {
        finalAction.to = getCharLocation(char) || DEFAULT_VALUES.UNKNOWN_LOCATION;
      }
      decisions[charId] = finalAction;
      logger.debug(funcName, `为角色 ${charId} 分配了行动 [${finalAction.do}]。`);
    } else {
      // 如果没有命中任何行动，则不为该角色生成决策，让其维持现状
      logger.debug(funcName, `角色 ${charId} 未命中任何行动，本次不作决策。`);
    }
  }

  return { decisions };
}
