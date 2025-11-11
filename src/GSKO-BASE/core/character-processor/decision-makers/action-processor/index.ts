import _ from 'lodash';
import { Character } from '../../../../schema/character';
import { Action, Entry } from '../../../../schema/character-settings';
import { Runtime } from '../../../../schema/runtime';
import { Stat } from '../../../../schema/stat';
import { Logger } from '../../../../utils/log';
import { getChar, getCharLocation } from '../../accessors';
import { DEFAULT_VALUES, ENTRY_KEYS } from '../../constants';

const logger = new Logger();

/**
 * 检查一个行为条目（Entry）的 `when` 条件是否满足。
 * @returns 返回一个对象，包含是否满足条件 (`met`) 和原因 (`reason`)。
 */
function areConditionsMet(
  entry: Entry,
  { runtime }: { runtime: Runtime },
): { met: boolean; reason: string } {
  const { when } = entry;
  if (!when) return { met: true, reason: '无 `when` 条件。' };

  const clock = runtime.clock;
  if (!clock) return { met: false, reason: '`runtime.clock` 不存在。' };

  const reasons: string[] = [];

  // 检查 byFlag
  if (when.byFlag) {
    const metFlags = when.byFlag.filter((flagPath: string) => _.get(clock.flags, flagPath) === true);
    if (metFlags.length > 0) {
      reasons.push(`满足 Flag: [${metFlags.join(', ')}]`);
    } else {
      return { met: false, reason: `未满足任何 Flag: [${when.byFlag.join(', ')}]` };
    }
  }

  // 检查 byNow
  if (when.byNow) {
    if (_.isMatch(clock.now, when.byNow)) {
      reasons.push(`满足时间条件: ${JSON.stringify(when.byNow)}`);
    } else {
      return {
        met: false,
        reason: `当前时间 ${JSON.stringify(clock.now)} 与 byNow ${JSON.stringify(when.byNow)} 不匹配。`,
      };
    }
  }

  // 检查 byMonthDay
  if (when.byMonthDay) {
    const { month, day } = clock.now;
    if (month === when.byMonthDay.month && day === when.byMonthDay.day) {
      reasons.push(`满足日期: ${month}月${day}日`);
    } else {
      return { met: false, reason: `当前日期 ${month}月${day}日 与 byMonthDay 不匹配。` };
    }
  }

  // 检查 byFestival
  if (when.byFestival) {
    const currentFestival = runtime.festival?.current?.name;
    if (when.byFestival === 'ANY') {
      if (currentFestival) {
        reasons.push(`满足节日条件: 当前是节日 [${currentFestival}]`);
      } else {
        return { met: false, reason: '要求任意节日，但当前没有节日。' };
      }
    } else if (_.isString(when.byFestival)) {
      if (currentFestival === when.byFestival) {
        reasons.push(`满足节日条件: 当前是 [${currentFestival}]`);
      } else {
        return { met: false, reason: `要求节日 [${when.byFestival}]，但当前是 [${currentFestival || '无'}]。` };
      }
    } else if (_.isArray(when.byFestival)) {
      if (currentFestival && when.byFestival.includes(currentFestival)) {
        reasons.push(`满足节日条件: 当前节日 [${currentFestival}] 在指定列表中。`);
      } else {
        return {
          met: false,
          reason: `当前节日 [${currentFestival || '无'}] 不在指定的节日列表 [${when.byFestival.join(', ')}] 中。`,
        };
      }
    }
  }

  if (reasons.length === 0) {
    return { met: true, reason: '`when` 条件为空或未指定任何有效检查。' };
  }

  return { met: true, reason: reasons.join('; ') };
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
      const { met, reason } = areConditionsMet(entry, { runtime });
      if (met) {
        logger.debug(funcName, `角色 ${charId}: 特殊行动 [${entry.action.do}] 条件满足。原因: ${reason}`);
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
    const { met, reason } = areConditionsMet(entry, { runtime });
    if (met) {
      logger.debug(
        funcName,
        `角色 ${charId}: 选中了第一个满足条件的日常行动 [${entry.action.do}]。原因: ${reason}`,
      );
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
      const finalAction: Action = { ...action };
      const currentLocation = getCharLocation(stat, charId) || DEFAULT_VALUES.UNKNOWN_LOCATION;

      // 如果行动没有指定目的地，则默认为角色当前所在地
      if (!finalAction.to) {
        finalAction.to = currentLocation;
      }

      // 填充行动的起始地
      finalAction.from = currentLocation;

      decisions[charId] = finalAction;
      logger.debug(funcName, `为角色 ${charId} 分配了行动 [${finalAction.do}]。`);
    } else {
      // 如果没有命中任何行动，则不为该角色生成决策，让其维持现状
      logger.debug(funcName, `角色 ${charId} 未命中任何行动，本次不作决策。`);
    }
  }

  return { decisions };
}
