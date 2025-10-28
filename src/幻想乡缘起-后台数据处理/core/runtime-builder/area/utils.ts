import { Logger } from '../../../utils/log';

const logger = new Logger();

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
