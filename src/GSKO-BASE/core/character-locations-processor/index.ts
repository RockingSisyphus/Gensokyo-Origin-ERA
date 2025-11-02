import { Stat } from '../../schema/stat';
import { Runtime } from '../../schema/runtime';
import { Logger } from '../../utils/log';
import type { Character } from '../../schema/character';

const logger = new Logger();

/**
 * 基于 stat 计算角色分布：
 * - 主角当前位置
 * - 各地点对应的 NPC（按角色 ID 列表）
 */
export function processCharacterLocations({
  stat,
  runtime,
}: {
  stat: Stat;
  runtime: Runtime;
}): { stat: Stat; runtime: Runtime } {
  const funcName = 'processCharacterLocations';
  logger.debug(funcName, '开始计算角色分布...');

  try {
    const playerLocation = (String(getUserLocationLocal(stat) ?? '').trim() || null) as string | null;

    const npcByLocation: Record<string, string[]> = {};
    const chars = getCharsLocal(stat);
    Object.entries(chars).forEach(([charId, charObj]) => {
      const key = String(getCharLocationLocal(charObj) ?? '').trim() || '未知';
      if (!npcByLocation[key]) npcByLocation[key] = [];
      npcByLocation[key].push(charId);
    });

    runtime.characterDistribution = {
      playerLocation,
      npcByLocation,
    };

    logger.debug(funcName, '角色分布计算完成');
  } catch (e) {
    logger.error(funcName, '计算角色分布时发生异常', e);
    runtime.characterDistribution = {
      playerLocation: null,
      npcByLocation: {},
    };
  }

  return { stat, runtime };
}

// ===== 本地辅助函数：避免依赖同级其他模块 =====
function getUserLocationLocal(stat: Stat): string | null {
  // user.所在地区（对象点访问，参与类型检查）
  return stat.user?.所在地区 ?? null;
}

function getCharsLocal(stat: Stat): Record<string, Character> {
  return (stat.chars ?? {}) as Record<string, Character>;
}

function getCharLocationLocal(charObj: Character): string {
  // char.所在地区（对象点访问，参与类型检查）
  return String(charObj.所在地区 ?? '').trim();
}
