import { TimeUnit } from '../../../../schema/character-settings';
import { ClockFlags } from '../../../../schema/clock';
import { Runtime } from '../../../../schema/runtime';
import { Logger } from '../../../../utils/log';
import { getAffectionStageFromRuntime } from '../../accessors';

const logger = new Logger();

/**
 * 检查角色是否命中其“耐心窗口”。
 */
function isPatienceWindowHit(patienceUnit: TimeUnit, flags: ClockFlags): boolean {
  switch (patienceUnit) {
    case 'period':
      return flags.newPeriod === true || Object.values(flags.byPeriod).some(v => v === true);
    case 'day':
      return flags.newDay === true;
    case 'week':
      return flags.newWeek === true;
    case 'month':
      return flags.newMonth === true;
    case 'season':
      return flags.newSeason === true;
    case 'year':
      return flags.newYear === true;
    default:
      return false;
  }
}

/**
 * 相伴决策处理器。在同区角色中筛选出决定与主角相伴的角色。
 */
export function makeCompanionDecisions({ runtime, coLocatedChars }: { runtime: Runtime; coLocatedChars: string[] }): {
  companionChars: string[];
} {
  const funcName = 'makeCompanionDecisions';
  const companionChars: string[] = [];
  const clockFlags = runtime.clock?.flags;

  if (!clockFlags) {
    logger.warn(funcName, '无法获取 clock flags，所有同区角色都将视为“相伴”。');
    return { companionChars: coLocatedChars };
  }

  for (const charId of coLocatedChars) {
    const affectionStage = getAffectionStageFromRuntime(runtime, charId);
    const patienceUnit = affectionStage?.patienceUnit;

    // 如果没有耐心单位，或者耐心未耗尽，则角色决定继续相伴
    if (!patienceUnit || !isPatienceWindowHit(patienceUnit, clockFlags)) {
      companionChars.push(charId);
      logger.debug(funcName, `角色 ${charId} 的耐心未耗尽 (patienceUnit: ${patienceUnit || '无'})，标记为“相伴”。`);
    } else {
      // 如果命中了耐心窗口，则耐心耗尽，不在此处做决定，交由 action-processor 处理
      logger.debug(funcName, `角色 ${charId} 的耐心已在 ${patienceUnit} 耗尽，将由后续模块决定其新行动。`);
    }
  }

  return { companionChars };
}
