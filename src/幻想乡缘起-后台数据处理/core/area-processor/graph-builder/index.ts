import _ from 'lodash';
import { Stat } from '../../../schema';
import { Logger } from '../../../utils/log';

const logger = new Logger();

/**
 * @description 从 stat 对象构建无向图
 * @param {Stat} stat - 包含 map_graph 的 stat 对象
 * @returns {{ graph: Record<string, Record<string, boolean>>, leafNodes: string[] }} - 返回图和叶子节点列表
 */
export function buildGraph({ stat }: { stat: Stat }): {
  graph: Record<string, Record<string, boolean>>;
  leafNodes: string[];
} {
  const funcName = 'buildGraph';
  const graph: Record<string, Record<string, boolean>> = {};
  const leafNodes: string[] = [];

  try {
    const mapData = stat.world?.map_graph;
    if (!mapData) {
      logger.warn(funcName, 'stat.world.map_graph 为空或不存在。');
      return { graph, leafNodes };
    }
    logger.debug(funcName, 'stat.world.map_graph获取成功：', mapData);

    const addEdge = (nodeA: string, nodeB: string) => {
      if (nodeA === nodeB) return;
      if (!graph[nodeA]) graph[nodeA] = {};
      if (!graph[nodeB]) graph[nodeB] = {};
      graph[nodeA][nodeB] = true;
      graph[nodeB][nodeA] = true;
    };

    const walkTree = (node: any) => {
      if (Array.isArray(node)) {
        node.forEach(item => {
          if (typeof item === 'string') {
            if (!leafNodes.includes(item)) leafNodes.push(item);
          } else if (item && typeof item === 'object') {
            walkTree(item);
          }
        });
      } else if (node && typeof node === 'object') {
        Object.values(node).forEach(walkTree);
      }
    };

    if (mapData.tree) {
      walkTree(mapData.tree);
    }

    // 确保所有从 tree 中解析出的地区都被初始化为图的节点，即使它们是孤立的
    leafNodes.forEach(node => {
      if (!graph[node]) {
        graph[node] = {};
      }
    });

    const edges = mapData.edges ?? [];
    logger.debug(funcName, '从 mapData 中提取的 edges:', edges);

    if (Array.isArray(edges)) {
      edges.forEach(edge => {
        if (edge && edge.a && edge.b) {
          //logger.debug(funcName, `正在添加边: ${edge.a} <-> ${edge.b}`);
          addEdge(edge.a, edge.b);
        }
      });
    }
  } catch (error) {
    logger.error(funcName, '构建地图图谱时出错', error);
  }
  logger.debug(funcName, 'graph完成构建：', graph);
  logger.debug(funcName, 'leafNodes完成构建：', leafNodes);
  return { graph, leafNodes };
}
