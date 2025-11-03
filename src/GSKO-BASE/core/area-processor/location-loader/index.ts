import _ from 'lodash';
import { FullMapLeaf, WORLD_DEFAULTS } from '../../../schema/world';
import { USER_FIELDS } from '../../../schema/user';
import { Stat } from '../../../schema/stat';
import { Logger } from '../../../utils/log';
import { matchMessages } from '../../../utils/message';

const logger = new Logger();

export async function loadLocations({
  stat,
  legalLocations,
  neighbors,
}: {
  stat: Stat;
  legalLocations: FullMapLeaf[];
  neighbors: string[];
}): Promise<string[]> {
  const funcName = 'loadLocations';
  let hits: string[] = [];

  try {
    if (!legalLocations || legalLocations.length === 0) {
      logger.debug(funcName, '合法地点列表为空，直接返回空数组。');
      return [];
    }

    const legalLocationNames = legalLocations.map(loc => loc.name);

    const matched = await matchMessages(legalLocationNames, {
      depth: 5,
      includeSwipes: false,
      tag: WORLD_DEFAULTS.mainStoryTag,
    });
    hits = Array.from(new Set(matched));

    const userLoc = stat.user?.[USER_FIELDS.currentLocation]?.trim() ?? '';
    if (userLoc) {
      logger.debug(funcName, `获取到用户当前位置: ${userLoc}`);
      if (!hits.includes(userLoc) && legalLocationNames.includes(userLoc)) {
        hits.push(userLoc);
      }
    } else {
      logger.debug(funcName, 'stat.user 中没有当前位置数据。');
    }

    if (neighbors && neighbors.length > 0) {
      for (const neighbor of neighbors) {
        if (!hits.includes(neighbor) && legalLocationNames.includes(neighbor)) {
          hits.push(neighbor);
        }
      }
      logger.debug(funcName, `合并邻居后地点列表: ${JSON.stringify(hits)}`);
    }

    logger.debug(funcName, `最终命中地点: ${JSON.stringify(hits)}`);
  } catch (error) {
    logger.error(funcName, '加载地点信息时发生异常', error);
    hits = [];
  }

  return _.uniq(hits);
}
