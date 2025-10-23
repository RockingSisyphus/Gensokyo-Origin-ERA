import { ERA_VARIABLE_PATH } from '../utils/constants';
import { updateEraVariable } from '../utils/eraWriter';
import { get } from '../utils/format';
import { Logger } from '../utils/logger';

/*
【底层工具 · 地图图谱加载器（基于 statWithoutMeta）】
职责（严格抄原始实现思路，并改为从事件传入的 statWithoutMeta 读取）：
- 从 statWithoutMeta 读取 world.map_graph 的 JSON；
- 提取合法叶节点集合 legal:Set 与别名表 alias:Object；
- 原样返回 graph，并构建无向邻接表 adj（仅使用 edges 的原名，不做别名归一）；
- 结果可做简单缓存（基于浅哈希或对象引用），避免重复计算；

变更点：
- 不再访问 window.__MVU_LORE__ 或世界书接口；
- 统一中文调试输出；
- runtime 如需读写，一律经 utils/runtime 提供的方法按路径操作（此模块当前未直接用到 runtime，留接口以备后续扩展）。
*/

const logger = new Logger('backend-mapLocation');

export type MapGraph = {
  tree?: any;
  aliases?: Record<string, string>;
  edges?: Array<{ a: string; b: string }>;
};

export type LoadedGraph = {
  legal: Set<string>;
  alias: Record<string, string>;
  graph: MapGraph | null;
  adj: Map<string, Set<string>>;
};

// 简易缓存：使用引用 key（事件传入对象的同一轮调用中可复用）
const GRAPH_CACHE = new WeakMap<object, LoadedGraph>();

/**
 * @description 从 context.statWithoutMeta 读取并构建地图图谱结构
 */
export function loadMapGraphFromState(context: { statWithoutMeta: any; runtime: any }): LoadedGraph | null {
  const funcName = 'loadMapGraphFromState';
  const { statWithoutMeta } = context || {};

  if (!statWithoutMeta) {
    logger.warn(funcName, '上下文信息不完整，缺少 statWithoutMeta，已中止。');
    return null;
  }

  try {
    const graph = get(statWithoutMeta, ERA_VARIABLE_PATH.MAP_GRAPH, null) as MapGraph | null;
    if (!graph || typeof graph !== 'object') {
      logger.warn(funcName, '未找到 world.map_graph 或数据非法。');
      return null;
    }

    // 以 graph 对象作为缓存 key
    if (GRAPH_CACHE.has(graph as object)) {
      const hit = GRAPH_CACHE.get(graph as object)!;
      logger.log(funcName, '命中缓存。', {
        叶节点数: hit.legal.size,
        边数: Array.isArray(hit.graph?.edges) ? hit.graph!.edges!.length : 0,
        别名数: Object.keys(hit.alias).length,
      });
      return hit;
    }

    // 1) 合法叶节点（只采集数组中的纯字符串叶）
    const legal = new Set<string>();
    const alias: Record<string, string> = Object.create(null);
    (function walk(node: any) {
      if (!node) return;
      if (Array.isArray(node)) {
        for (const it of node) if (typeof it === 'string' && it.trim()) legal.add(it.trim());
        return;
      }
      if (typeof node === 'object') for (const v of Object.values(node)) walk(v);
    })(graph.tree);

    // 2) 别名表（不强行加入 legal）
    if (graph.aliases && typeof graph.aliases === 'object') {
      for (const [k, v] of Object.entries(graph.aliases)) {
        const K = String(k || '').trim();
        const V = String(v || '').trim();
        if (K && V) alias[K] = V;
      }
    }

    // 3) 邻接表（基于 edges 原名，不做别名归一）
    const adj = new Map<string, Set<string>>();
    const ensureSet = (key: string): Set<string> => {
      let s = adj.get(key);
      if (!s) {
        s = new Set<string>();
        adj.set(key, s);
      }
      return s;
    };
    const add = (a?: string, b?: string) => {
      const A = String(a || '').trim();
      const B = String(b || '').trim();
      if (!A || !B || A === B) return;
      ensureSet(A).add(B);
      ensureSet(B).add(A);
    };
    if (Array.isArray(graph.edges)) {
      for (const e of graph.edges) add(e?.a, e?.b);
    }

    const res: LoadedGraph = { legal, alias, graph, adj };
    GRAPH_CACHE.set(graph as object, res);

    logger.log(funcName, '装载完成。', {
      叶节点数: legal.size,
      边数: Array.isArray(graph.edges) ? graph.edges.length : 0,
      别名数: Object.keys(alias).length,
    });
    return res;
  } catch (e) {
    logger.error(funcName, '装载异常：' + String(e));
    return null;
  }
}

/*
【位置合法化（enforceLocationsFromState）】
职责（严格抄原始实现思路，并改造写入路径）：
- 读取当前状态中的用户与角色“居住地区/所在地区”；
- 按 map_graph 中的叶节点合法化，并用别名表归一；
- 计算需要写回的补丁；
- 通过 eraWriter.updateEraVariable(path,value) 写入 ERA（逐条写，替代原先的 mvuApplyPatches）。

变更点：
- 不依赖 getVariables 读取世界书/变量，直接使用传入的 statWithoutMeta；
- fallback 地点从 statWithoutMeta.config.defaults.fallbackPlace 读取；
- 路径写入采用“点路径”方式（如 'user.所在地区'、'chars.灵梦.居住地区'）。
*/

export async function enforceLocationsFromState(context: { statWithoutMeta: any; runtime: any }): Promise<boolean> {
  const funcName = 'enforceLocationsFromState';
  const { statWithoutMeta } = context || {};

  if (!statWithoutMeta) {
    logger.warn(funcName, '上下文信息不完整，缺少 statWithoutMeta，已中止。');
    return false;
  }

  logger.log(funcName, '开始位置合法化校验。');
  try {
    const mg = loadMapGraphFromState(context);
    if (!mg || !mg.legal) {
      logger.warn(funcName, '地图未载入或非法，跳过合法化。');
      return false;
    }
    const { legal, alias } = mg;

    const fallback = get(statWithoutMeta, ERA_VARIABLE_PATH.FALLBACK_PLACE, '博丽神社');
    const norm = (raw: any, fb: string) => {
      const s = Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
      if (!s) return { ok: false, fixed: fb };
      if (legal.has(s)) return { ok: true, fixed: s };
      const a = alias?.[s as string];
      if (a && legal.has(a)) return { ok: true, fixed: a };
      return { ok: false, fixed: fb };
    };

    const patches: Array<{ path: string; value: any }> = [];

    // 用户
    const uHome = get(statWithoutMeta, ERA_VARIABLE_PATH.USER_HOME, undefined);
    const uLoc = get(statWithoutMeta, ERA_VARIABLE_PATH.USER_LOCATION, undefined);
    const hN = norm(uHome, fallback);
    const prefer = hN.ok ? hN.fixed : fallback;
    const lN = norm(uLoc, prefer);
    if (!hN.ok || hN.fixed !== uHome) patches.push({ path: ERA_VARIABLE_PATH.USER_HOME, value: hN.fixed });
    if (!lN.ok || lN.fixed !== uLoc) patches.push({ path: ERA_VARIABLE_PATH.USER_LOCATION, value: lN.fixed });

    // 角色
    let chars: any = get(statWithoutMeta, ERA_VARIABLE_PATH.CHARS, null);
    if (typeof chars === 'string') {
      try {
        chars = JSON.parse(chars);
      } catch {
        chars = null;
      }
    }
    if (chars && typeof chars === 'object') {
      for (const [name, obj] of Object.entries<any>(chars)) {
        if (String(name).startsWith('$') || !obj || typeof obj !== 'object') continue;
        const ch = norm((obj as any)[ERA_VARIABLE_PATH.CHAR_HOME], fallback);
        const pref = ch.ok ? ch.fixed : fallback;
        const cl = norm((obj as any)[ERA_VARIABLE_PATH.CHAR_LOCATION], pref);
        if (!ch.ok || ch.fixed !== (obj as any)[ERA_VARIABLE_PATH.CHAR_HOME])
          patches.push({ path: `${ERA_VARIABLE_PATH.CHARS}.${name}.${ERA_VARIABLE_PATH.CHAR_HOME}`, value: ch.fixed });
        if (!cl.ok || cl.fixed !== (obj as any)[ERA_VARIABLE_PATH.CHAR_LOCATION])
          patches.push({
            path: `${ERA_VARIABLE_PATH.CHARS}.${name}.${ERA_VARIABLE_PATH.CHAR_LOCATION}`,
            value: cl.fixed,
          });
      }
    }

    if (!patches.length) {
      logger.log(funcName, '无需修改，位置数据已合法。');
      return true;
    }

    // 逐条写回（替代 mvuApplyPatches）
    for (const p of patches) {
      try {
        logger.log(funcName, '写回位置修复', p);
        updateEraVariable(p.path, p.value);
      } catch (e) {
        logger.warn(funcName, '单条写回失败：' + p.path, e);
      }
    }
    logger.log(funcName, `位置合法化写回完成，共 ${patches.length} 条。`);
    return true;
  } catch (e) {
    logger.error(funcName, '执行异常：' + String(e));
    return false;
  }
}

/**
 * @description 总入口：供 index.ts 在 GSKO:showUI 中调用。
 */
export async function runMapAndLocationPipeline(context: { statWithoutMeta: any; runtime: any }): Promise<void> {
  const funcName = 'runMapAndLocationPipeline';
  const { statWithoutMeta } = context || {};

  if (!statWithoutMeta) {
    logger.warn(funcName, '上下文信息不完整，缺少 statWithoutMeta，已中止。');
    return;
  }

  logger.log(funcName, '开始执行地图加载与位置合法化流水线。');
  const mg = loadMapGraphFromState(context);
  if (!mg) {
    logger.warn(funcName, '地图图谱未能装载，后续位置合法化可能跳过。');
  }
  await enforceLocationsFromState(context);
  logger.log(funcName, '流水线执行完毕。');
}
