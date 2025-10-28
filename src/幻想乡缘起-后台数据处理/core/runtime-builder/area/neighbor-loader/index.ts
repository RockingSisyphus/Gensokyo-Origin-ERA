import _ from 'lodash';
import { Logger } from '../../../../utils/log';

const logger = new Logger();

/**
 * @description 根据用户当前位置，从已构建的图中获取所有相邻地区。
 * @param {object} params
 * @param {any} params.stat - The stat object.
 * @param {Record<string, Record<string, boolean>>} params.graph - The pre-built graph.
 * @returns {string[]} - An array of neighboring locations.
 */
export function processNeighbors({
  stat,
  graph,
}: {
  stat: any;
  graph: Record<string, Record<string, boolean>>;
}): string[] {
  const funcName = 'processNeighbors';
  try {
    const currentUserLocation = _.get(stat, 'user.所在地区', '');
    if (!currentUserLocation) {
      logger.debug(funcName, '用户当前位置未知，无法获取邻居。');
      return [];
    }

    if (_.isEmpty(graph) || !graph[currentUserLocation]) {
      logger.debug(funcName, `图中没有节点 ${currentUserLocation} 或该节点没有邻居。`);
      return [];
    }

    const neighbors = Object.keys(graph[currentUserLocation]);
    logger.log(funcName, `找到 ${currentUserLocation} 的邻居: ${neighbors.join(', ')}`);
    return neighbors;
  } catch (error) {
    logger.error(funcName, '获取相邻地区时发生异常', error);
    return [];
  }
}
