import { Logger } from '../../../utils/logger';
import { extractLeafs } from '../../../utils/map';

const logger = new Logger('core-area-legal-locations');

/**
 * @description 从 stat.world.map_graph 中提取所有合法地区。
 * @param {any} stat - 不含 $meta 的纯净变量对象。
 * @returns {string[]} 合法地区名称的数组。
 */
export function getLegalLocations(stat: any): string[] {
  const funcName = 'getLegalLocations';
  let legalLocations: string[] = [];

  try {
    const MAP = _.get(stat, 'world.map_graph', null);
    logger.debug(funcName, '从 stat.world.map_graph 中获取 map_graph...', { MAP });

    if (MAP && MAP.tree) {
      legalLocations = extractLeafs(MAP);
      logger.debug(funcName, `从 map_graph 中提取了 ${legalLocations.length} 个地区关键词`, { legalLocations });
    } else {
      logger.log(funcName, '未找到有效的 map_graph，返回空数组');
    }
  } catch (e) {
    logger.error(funcName, '提取合法地区时发生异常', e);
    legalLocations = [];
  }

  logger.debug(funcName, '模块退出');
  return legalLocations;
}
