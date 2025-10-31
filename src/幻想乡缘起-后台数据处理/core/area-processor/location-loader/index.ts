import _ from 'lodash';
import { Stat } from '../../../schema';
import { ERA_VARIABLE_PATH } from '../../../utils/constants';
import { Logger } from '../../../utils/log';
import { matchMessages } from '../../../utils/message';

const logger = new Logger();

/**
 * @description 根据合法地区列表、最近消息、用户当前位置和相邻地区，处理并返回需要加载的地区。
 * @param {object} params
 * @param {Stat} params.stat - The stat object.
 * @param {string[]} params.legalLocations - An array of legal locations.
 * @param {string[]} params.neighbors - An array of neighboring locations.
 * @returns {Promise<string[]>} 需要加载的地区数组。
 */
export async function loadLocations({
  stat,
  legalLocations,
  neighbors,
}: {
  stat: Stat;
  legalLocations: string[];
  neighbors: string[];
}): Promise<string[]> {
  const funcName = 'loadLocations';
  let hits: string[] = [];

  try {
    if (!legalLocations || legalLocations.length === 0) {
      logger.debug(funcName, '传入的合法地区列表为空，无需加载。');
      return [];
    }

    // 1. 匹配最近消息
    const matched = await matchMessages(legalLocations, {
      depth: 5,
      includeSwipes: false,
      tag: ERA_VARIABLE_PATH.GENSOKYO_MAIN_STORY,
    });
    hits = Array.from(new Set(matched));

    // 2. 获取用户当前所在地区并加入 HITS
    const userLoc = stat.user?.所在地区?.trim() ?? '';
    if (userLoc) {
      logger.debug(funcName, `获取到用户当前地区: ${userLoc}`);
      if (!hits.includes(userLoc) && legalLocations.includes(userLoc)) {
        hits.push(userLoc);
      }
    } else {
      logger.debug(funcName, '在 stat.user.所在地区 中未找到用户位置');
    }

    // 3. 合并与当前位置相邻的地区
    if (neighbors && neighbors.length > 0) {
      neighbors.forEach(neighbor => {
        if (!hits.includes(neighbor) && legalLocations.includes(neighbor)) {
          hits.push(neighbor);
        }
      });
      logger.debug(funcName, `合并邻居后: ${JSON.stringify(hits)}`);
    }

    logger.debug(funcName, `处理完成，加载地区: ${JSON.stringify(hits)}`);
  } catch (e) {
    logger.error(funcName, '处理加载地区时发生异常', e);
    hits = [];
  }

  logger.debug(funcName, '模块退出，最终输出:', { hits });
  return _.uniq(hits);
}
