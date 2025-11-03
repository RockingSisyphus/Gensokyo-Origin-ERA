import _ from 'lodash';
import { Stat } from '../../../schema/stat';
import { USER_FIELDS } from '../../../schema/user';
import { Logger } from '../../../utils/log';

const logger = new Logger();

export function processNeighbors({
  stat,
  graph,
}: {
  stat: Stat;
  graph: Record<string, Record<string, boolean>>;
}): string[] {
  const funcName = 'processNeighbors';
  try {
    const currentUserLocation = stat.user?.[USER_FIELDS.currentLocation] ?? '';
    if (!currentUserLocation) {
      logger.debug(funcName, '用户当前位置未知，无法获取邻居。');
      return [];
    }

    if (_.isEmpty(graph) || !graph[currentUserLocation]) {
      logger.debug(funcName, `图中没有节点 ${currentUserLocation} 或缺少邻居。`);
      return [];
    }

    const neighbors = Object.keys(graph[currentUserLocation]);
    logger.debug(funcName, `找到 ${currentUserLocation} 的邻居: ${neighbors.join(', ')}`);
    return neighbors;
  } catch (error) {
    logger.error(funcName, '获取邻居时发生异常', error);
    return [];
  }
}
