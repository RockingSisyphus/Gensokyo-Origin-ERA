import { Logger } from '../../utils/logger';
import { getLegalLocations } from './legal-locations';
import { loadLocations } from './location-loader';

const logger = new Logger('core-area');

/**
 * @description 地区处理总入口。提取合法地区，并根据上下文确定需要加载的地区。
 * @param {any} stat - 不含 $meta 的纯净变量对象。
 * @param {any} runtime - 当前的 runtime 对象 (此模块未使用)。
 * @returns {Promise<object>} 一个包含 legal_locations 和 loadArea 的对象。
 */
export async function processArea(stat: any, runtime: any): Promise<object> {
  const funcName = 'processArea';
  logger.debug(funcName, '开始处理地区...');

  const output = {
    legal_locations: [] as string[],
    loadArea: [] as string[],
  };

  try {
    // 1. 获取所有合法地区
    const legalLocations = getLegalLocations(stat);
    output.legal_locations = legalLocations;
    logger.debug(funcName, `获取到 ${legalLocations.length} 个合法地区`);

    // 2. 根据合法地区列表，确定需要加载的地区
    const areasToLoad = await loadLocations(stat, legalLocations);
    output.loadArea = areasToLoad;
    logger.debug(funcName, `需要加载 ${areasToLoad.length} 个地区`);
  } catch (e) {
    logger.error(funcName, '处理地区时发生异常', e);
    // 发生异常时，确保返回默认值
    output.legal_locations = [];
    output.loadArea = [];
  }

  logger.log(funcName, '地区处理完成', output);
  return output;
}
