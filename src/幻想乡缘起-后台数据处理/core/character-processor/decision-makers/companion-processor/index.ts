import { Logger } from '../../../../utils/log';
import { PREDEFINED_ACTIONS } from '../../constants';
import { getAffectionStageFromContext } from '../../accessors';

const logger = new Logger();

/**
 * 检查角色是否命中其“耐心窗口”。
 */
function isPatienceWindowHit(patienceUnit: string, flags: any): boolean {
  if (!patienceUnit || !flags) return false;
  switch (patienceUnit) {
    case 'period':
      return flags.newPeriod === true || Object.values(flags.byPeriod || {}).some(v => v === true);
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
export function makeCompanionDecisions({ runtime, coLocatedChars }: { runtime: any; coLocatedChars: string[] }): {
  companionChars: string[];
} {
  const funcName = 'makeCompanionDecisions';
  // const companionDecisions: Record<string, any> = {}; // 暂时停用，目前只需要返回角色列表
  const companionChars: string[] = [];

  for (const charId of coLocatedChars) {
    const affectionStage = getAffectionStageFromContext(runtime, charId);
    if (!affectionStage) {
      logger.debug(funcName, `角色 ${charId} 缺少好感度等级信息，跳过“相伴”决策。`);
      continue;
    }

    const { patienceUnit } = affectionStage;
    const patienceHit = isPatienceWindowHit(patienceUnit, runtime.clock.flags);

    // 如果未命中耐心窗口（即耐心未耗尽），则角色决定继续相伴
    if (!patienceHit) {
      // companionDecisions[charId] = { ...PREDEFINED_ACTIONS.STAY_WITH_HERO, isCompanion: true }; // 暂时停用
      companionChars.push(charId);
      logger.debug(funcName, `角色 ${charId} 的耐心未耗尽 (patienceUnit: ${patienceUnit})，标记为“相伴”。`);
    } else {
      // 如果命中了耐心窗口，则耐心耗尽，不在此处做决定，交由 action-processor 处理
      logger.debug(funcName, `角色 ${charId} 的耐心已在 ${patienceUnit} 耗尽，将由后续模块决定其新行动。`);
    }
  }

  return { companionChars };
}
