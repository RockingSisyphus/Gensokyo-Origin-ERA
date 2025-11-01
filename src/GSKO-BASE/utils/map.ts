import { MapGraph } from '../schema/world';

/**
 * @description 从地图图谱的 `aliases` 字段中提取并构建一个别名到标准名称的映射表。
 *              它会处理别名为字符串数组或单个字符串的情况。
 * @param {MapGraph} mapGraph - 完整的 `map_graph` 对象。
 * @returns {Record<string, string>} 别名映射表。
 */
export function getAliasMap(mapGraph: MapGraph): Record<string, string> {
  const aliasMap: Record<string, string> = Object.create(null);
  if (mapGraph?.aliases && typeof mapGraph.aliases === 'object') {
    for (const [standardName, aliasValue] of Object.entries(mapGraph.aliases)) {
      const trimmedStandardName = String(standardName || '').trim();
      if (!trimmedStandardName) continue;

      const aliases = Array.isArray(aliasValue) ? aliasValue : [aliasValue];
      for (const alias of aliases) {
        const trimmedAlias = String(alias || '').trim();
        if (trimmedAlias) {
          aliasMap[trimmedAlias] = trimmedStandardName;
        }
      }
    }
  }
  return aliasMap;
}

/**
 * @description 递归提取地图图谱 `tree` 中所有的叶子节点（即合法地点）。
 * @param {MapGraph} mapGraph - 完整的 `map_graph` 对象。
 * @returns {string[]} 合法地点名称的数组。
 */
export function extractLeafs(mapGraph: MapGraph): string[] {
  const leafs: string[] = [];
  function walk(node: any) {
    if (!node) return;
    if (Array.isArray(node)) {
      for (const item of node) {
        if (typeof item === 'string' && item.trim()) {
          leafs.push(item.trim());
        }
      }
      return;
    }
    if (typeof node === 'object') {
      for (const value of Object.values(node)) {
        walk(value);
      }
    }
  }
  if (mapGraph?.tree) {
    walk(mapGraph.tree);
  }
  return leafs;
}
