import { CHARACTER_FIELDS, type Character } from '../../schema/character';
import { Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { USER_FIELDS } from '../../schema/user';
import { Logger } from '../../utils/log';

const logger = new Logger();

export function processCharacterLocations({ stat, runtime }: { stat: Stat; runtime: Runtime }): {
  runtime: Runtime;
} {
  const funcName = 'processCharacterLocations';
  logger.debug(funcName, '开始处理角色分布...');

  try {
    const playerLocation = (String(getUserLocation(stat) ?? '').trim() || null) as string | null;

    const npcByLocation: Record<string, string[]> = {};
    const chars = getChars(stat);
    Object.entries(chars).forEach(([charId, charObj]) => {
      const key = String(getCharLocation(charObj) ?? '').trim() || '未知';
      if (!npcByLocation[key]) npcByLocation[key] = [];
      npcByLocation[key].push(charId);
    });

    runtime.characterDistribution = {
      playerLocation,
      npcByLocation,
    };

    logger.debug(funcName, '角色分布处理完成。', runtime.characterDistribution);
  } catch (error) {
    logger.error(funcName, '处理角色分布时发生异常', error);
    runtime.characterDistribution = {
      playerLocation: null,
      npcByLocation: {},
    };
  }

  return { runtime };
}

function getUserLocation(stat: Stat): string | null {
  return stat.user?.[USER_FIELDS.currentLocation] ?? null;
}

function getChars(stat: Stat): Record<string, Character> {
  return (stat.chars ?? {}) as Record<string, Character>;
}

function getCharLocation(charObj: Character): string {
  return String(charObj[CHARACTER_FIELDS.currentLocation] ?? '').trim();
}
