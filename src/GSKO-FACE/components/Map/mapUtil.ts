import { Position } from './Map';

export interface FlatLocation {
  name: string;
  pos: Position;
  htmlEle?: string;
  aliases?: string[];
  level: number;
  children: { name: string; pos: Position }[];
  father?: string;
  isLeaf: boolean;
}

function flattenLocations(locations: Record<string, any>, fatherName?: string): FlatLocation[] {
  const result: FlatLocation[] = [];

  for (const [name, node] of Object.entries(locations)) {
    if (node.pos) {
      // 叶子节点
      result.push({
        name,
        pos: node.pos,
        htmlEle: node.htmlEle,
        aliases: node.aliases,
        level: 0,
        children: [],
        father: fatherName,
        isLeaf: true,
      });
    } else {
      // 非叶子节点
      const childNodes = flattenLocations(node, name);

      // 收集所有直接和间接的叶子后代
      const leafChildrenMap = new Map<string, { name: string; pos: Position }>();

      childNodes.forEach(child => {
        if (child.isLeaf) {
          // 直接子叶子节点
          if (!leafChildrenMap.has(child.name)) {
            leafChildrenMap.set(child.name, { name: child.name, pos: child.pos });
          }
        } else {
          // 非叶子节点的所有叶子后代
          child.children.forEach(leaf => {
            if (!leafChildrenMap.has(leaf.name)) {
              leafChildrenMap.set(leaf.name, leaf);
            }
          });
        }
      });

      const allLeafChildren = Array.from(leafChildrenMap.values());

      // region位置为最大最小除以2
      const xs = allLeafChildren.map(p => p.pos.x);
      const ys = allLeafChildren.map(p => p.pos.y);
      const avgX = (Math.max(...xs) + Math.min(...xs)) / 2;
      const avgY = (Math.max(...ys) + Math.min(...ys)) / 2;
      const pos = { x: avgX, y: avgY };
      
      const maxLevel = childNodes.reduce((max, child) => Math.max(max, child.level), 0) + 1;

      result.push(
        {
          name,
          pos,
          htmlEle: node.htmlEle,
          aliases: node.aliases,
          level: maxLevel,
          children: allLeafChildren,
          father: fatherName,
          isLeaf: false,
        },
        ...childNodes,
      );
    }
  }

  return result;
}

export function getRegions(data: Record<string, any>): { regions: FlatLocation[]; baseLocation: FlatLocation[] } {
  const flattenedData = flattenLocations(data);
  const regions: FlatLocation[] = [];
  const baseLocation: FlatLocation[] = [];
  [...flattenedData].forEach(value => {
    if (value.isLeaf) {
      baseLocation.push(value);
    } else {
      regions.push(value);
    }
  });

  return { regions, baseLocation };
}

export function calculateMaxDifference(points: { name: string; pos: Position }[]): { diffX: number; diffY: number } {
  if (points.length === 0) {
    return { diffX: 0, diffY: 0 };
  }

  const xs = points.map(p => p.pos.x);
  const ys = points.map(p => p.pos.y);

  const diffX = Math.max(...xs) - Math.min(...xs);
  const diffY = Math.max(...ys) - Math.min(...ys);

  return { diffX, diffY };
}
