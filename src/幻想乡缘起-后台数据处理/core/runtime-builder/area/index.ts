import { Logger } from '../../../utils/log';
import { buildGraph } from './graph-builder';
import { loadLocations } from './location-loader';
import { processNeighbors } from './neighbor-loader';
import { processRoute } from './route';

const logger = new Logger();

/**
 * @description 地区处理总入口。构建图，提取合法地区，获取邻居，确定加载地区，并计算路线。
 * @param {any} stat - 不含 $meta 的纯净变量对象。
 * @param {any} runtime - 当前的 runtime 对象。
 * @returns {Promise<object>} 一个包含 area 相关数据的对象。
 */
export async function processArea(stat: any, runtime: any): Promise<object> {
  const funcName = 'processArea';
  logger.debug(funcName, '开始处理地区...');

  // 遵循“显式覆盖原则”，在函数开头为所有属性设置明确的“空状态”默认值
  const output: {
    graph: Record<string, Record<string, boolean>>;
    legal_locations: string[];
    neighbors: string[];
    loadArea: string[];
    route: any;
  } = {
    graph: {},
    legal_locations: [],
    neighbors: [],
    loadArea: [],
    route: { candidates: [], routes: [] }, // 总是包含一个默认的 route 结构
  };

  try {
    // 1. 构建图
    const { graph, leafNodes } = buildGraph({ stat });
    output.graph = graph;
    logger.debug(funcName, `图构建完成，包含 ${Object.keys(graph).length} 个节点。`);

    // 2. 获取所有合法地区
    output.legal_locations = leafNodes;
    logger.debug(funcName, `获取到 ${leafNodes.length} 个合法地区`);

    // 3. 获取相邻地区
    output.neighbors = processNeighbors({ stat, graph });
    logger.debug(funcName, `获取到 ${output.neighbors.length} 个相邻地区`);

    // 4. 根据合法地区、相邻地区等，确定需要加载的地区
    output.loadArea = await loadLocations({ stat, legalLocations: leafNodes, neighbors: output.neighbors });
    logger.debug(funcName, `需要加载 ${output.loadArea.length} 个地区`);

    // 5. 基于加载的地区计算路线
    const tempRuntimeForRoute = { loadArea: output.loadArea };
    output.route = processRoute({ stat, runtime: tempRuntimeForRoute, graph });
    logger.debug(funcName, '路线计算完成');
  } catch (e) {
    logger.error(funcName, '处理地区时发生异常', e);
    // 因为 output 已经有了安全的默认值，这里只需记录错误即可，无需重置。
  }

  logger.log(funcName, '地区处理完成', output);
  return output;
}
