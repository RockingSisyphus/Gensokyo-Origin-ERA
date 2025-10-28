import _ from 'lodash';
import { Logger } from '../../../utils/log';

const logger = new Logger();

/**
 * @description 从 stat 对象构建无向图
 * @param {any} stat - 包含 map_graph 的 stat 对象
 * @returns {{ graph: Record<string, Record<string, boolean>>, leafNodes: string[] }} - 返回图和叶子节点列表
 */
export function buildGraph({ stat }: { stat: any }): {
  graph: Record<string, Record<string, boolean>>;
  leafNodes: string[];
} {
  const funcName = 'buildGraph';
  const graph: Record<string, Record<string, boolean>> = {};
  const leafNodes: string[] = [];

  try {
    const mapData = _.get(stat, 'world.map_graph');
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
    const edges = _.get(mapData, 'edges', []);
    logger.debug(funcName, '从 mapData 中提取的 edges:', edges);

    if (Array.isArray(edges)) {
      edges.forEach((edge: any) => {
        if (edge && edge.a && edge.b) {
          logger.debug(funcName, `正在添加边: ${edge.a} <-> ${edge.b}`);
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

/**
 * @description 使用 BFS 算法查找最短路径
 * @param {string} source - 起点
 * @param {string} destination - 终点
 * @param {Record<string, Record<string, boolean>>} graph - 图
 * @returns {{ hops: number, steps: { from: string, to: string }[] } | null} - 返回路径信息或 null
 */
export function bfs(
  source: string,
  destination: string,
  graph: Record<string, Record<string, boolean>>,
): { hops: number; steps: { from: string; to: string }[] } | null {
  const funcName = 'bfs';
  if (!graph[source] || !graph[destination]) return null;

  const queue = [source];
  const previousNode: Record<string, string | null> = { [source]: null };

  let head = 0;
  while (head < queue.length) {
    const currentNode = queue[head++];
    if (currentNode === destination) break;

    const neighbors = graph[currentNode] || {};
    for (const neighbor in neighbors) {
      // 核心防环逻辑：如果一个节点已经有前驱（即已经被访问过），则跳过，避免在图中无限循环。
      if (previousNode[neighbor] !== undefined) continue;

      previousNode[neighbor] = currentNode;
      queue.push(neighbor);
    }
  }

  if (previousNode[destination] === undefined) return null;

  const steps: { from: string; to: string }[] = [];
  let currentNode = destination;
  let guard = 0; // 安全计数器，防止在路径回溯时因意外的图结构导致无限循环。
  while (previousNode[currentNode] != null && guard < 1000) {
    steps.push({ from: previousNode[currentNode]!, to: currentNode });
    currentNode = previousNode[currentNode]!;
    guard++;
  }
  if (guard >= 1000) {
    logger.error(funcName, `BFS路径回溯时陷入死循环, destination=${destination}`);
    return null;
  }

  steps.reverse();
  return { hops: steps.length, steps };
}
