import { Stat } from '../../../schema/stat';
import { FullMapLeaf, MapLeafSchema, MapTreeNode } from '../../../schema/world';
import { Logger } from '../../../utils/log';

const logger = new Logger();

/**
 * @description 从 stat 对象构建无向图和叶节点元数据
 * @param {Stat} stat - 包含 map_graph 的 stat 对象
 * @returns {{ graph: Record<string, Record<string, boolean>>, leafNodes: FullMapLeaf[] }} - 返回图和完整的叶子节点列表
 */
export function buildGraph({ stat }: { stat: Stat }): {
  graph: Record<string, Record<string, boolean>>;
  leafNodes: FullMapLeaf[];
} {
  const funcName = 'buildGraph';
  const graph: Record<string, Record<string, boolean>> = {};
  const leafNodes: FullMapLeaf[] = [];
  const seenNodes = new Set<string>(); // 用于去重

  try {
    const mapData = stat.world?.map_graph;
    if (!mapData?.tree) {
      logger.warn(funcName, 'stat.world.map_graph.tree 为空或不存在。');
      return { graph, leafNodes };
    }
    logger.debug(funcName, 'stat.world.map_graph 获取成功');

    const addEdge = (nodeA: string, nodeB: string) => {
      if (nodeA === nodeB) return;
      if (!graph[nodeA]) graph[nodeA] = {};
      if (!graph[nodeB]) graph[nodeB] = {};
      graph[nodeA][nodeB] = true;
      graph[nodeB][nodeA] = true;
    };

    // 新的 walkTree 函数，使用 Zod schema 进行类型判断
    const walkTree = (node: MapTreeNode) => {
      for (const key in node) {
        const child = node[key];
        const parseResult = MapLeafSchema.safeParse(child);

        if (parseResult.success) {
          // 这是一个有效的 MapLeaf
          if (!seenNodes.has(key)) {
            leafNodes.push({ name: key, ...parseResult.data });
            seenNodes.add(key);
          }
        } else if (child && typeof child === 'object') {
          // 否则，假设它是一个 MapTreeNode，继续递归
          walkTree(child as MapTreeNode);
        }
      }
    };

    walkTree(mapData.tree);

    // 确保所有从 tree 中解析出的地区都被初始化为图的节点，即使它们是孤立的
    leafNodes.forEach(leaf => {
      if (!graph[leaf.name]) {
        graph[leaf.name] = {};
      }
    });

    const edges = mapData.edges ?? [];
    logger.debug(funcName, '从 mapData 中提取的 edges:', edges);

    if (Array.isArray(edges)) {
      edges.forEach(edge => {
        if (edge && edge.a && edge.b) {
          addEdge(edge.a, edge.b);
        }
      });
    }
  } catch (error) {
    logger.error(funcName, '构建地图图谱时出错', error);
  }

  logger.debug(funcName, 'graph 完成构建');
  logger.debug(funcName, 'leafNodes 完成构建');

  return { graph, leafNodes };
}
