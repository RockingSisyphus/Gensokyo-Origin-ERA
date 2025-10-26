<template>
  <div>
    <!-- ===== 世界地图（ASCII）容器 ===== -->
    <hr class="dashed" />
    <h4><span class="emoji">🗺️</span>世界地图（文字）</h4>
    <!-- 地图工具栏，包含刷新、动画切换、复制和弱化非高亮区域的选项 -->
    <div id="world-map-toolbar" class="map-toolbar" aria-label="地图工具条">
      <button id="map-reload" class="font-size-btn" title="请求ERA核心重新读取所有数据并重绘UI">⟳</button>
      <button id="map-toggle-anim" class="font-size-btn" title="切换高亮动画">🎞️</button>
      <button id="map-copy" class="font-size-btn" title="复制原始地图文本">📋</button>
      <span class="debug-switch"><input id="map-dim-others" type="checkbox" /> 弱化非高亮</span>
    </div>
    <!-- 用于显示ASCII地图的 <pre> 元素 -->
    <pre id="world-map" class="ascii-map" aria-live="polite"><span class="map-loading">（等待数据更新……）</span></pre>
    <!-- 地图图例，解释高亮颜色 -->
    <div id="world-map-legend" class="map-legend">
      <span class="swatch swatch-hit"></span>当前位置 <span class="swatch swatch-near"></span>附近地区
    </div>
    <!-- 显示附近地区的段落 -->
    <p>
      <span class="label"><span class="emoji">🏛️</span>附近地区:</span> <span id="nearby-places">—</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { defineExpose, onMounted, ref } from 'vue';
import { ERA_VARIABLE_PATH } from '../../../utils/constants';
import { get, getRaw } from '../../../utils/format';
import { Logger } from '../../../utils/log';

// 日志记录器，用于输出调试信息
const logger = new Logger();
// 存储从 stat_data 获取的原始地图文本
const mapText = ref('');
// 存储从 stat_data 获取的地图图谱数据（节点和边）
const mapGraph = ref<any>(null);

// ===== 工具函数 =====

/**
 * @description 对HTML特殊字符进行转义，防止XSS攻击。
 * @param {string} s - 需要转义的字符串。
 * @returns {string} 转义后的安全字符串。
 */
function escHtml(s: string): string {
  // 根据 .clinerules/酒馆助手bug.md 的要求，为避免预解析，在运行时拼接实体
  const AMP = '&' + 'amp;',
    LT = '&' + 'lt;',
    GT = '&' + 'gt;',
    QUOT = '&' + 'quot;',
    SQT = '&' + '#39;';
  let out = String(s);
  // 顺序很重要，必须先替换 &
  out = out.replace(/&/g, AMP);
  out = out.replace(/</g, LT).replace(/>/g, GT);
  out = out.replace(/"/g, QUOT).replace(/'/g, SQT);
  return out;
}

/**
 * @description 在文本中查找所有子字符串出现的位置。
 * @param {string} text - 要搜索的文本。
 * @param {string} token - 要查找的子字符串。
 * @param {number} [cap=200] - 最多查找的次数，防止性能问题。
 * @returns {number[]} 所有匹配项的起始索引数组。
 */
function findAll(text: string, token: string, cap = 200): number[] {
  const T = String(text || ''),
    K = String(token || '');
  if (!K) return [];
  const out = [];
  let i = 0;
  while (true) {
    const p = T.indexOf(K, i);
    if (p < 0) break;
    out.push(p);
    i = p + Math.max(1, K.length);
    if (out.length >= cap) {
      logger.warn('findAll', `查找“${K}”时达到上限 ${cap} 次，可能存在过多匹配项。`);
      break;
    }
  }
  return out;
}

/**
 * @description 根据当前状态计算高亮后的地图HTML。
 * @param {any} state - 包含所有状态的 statWithoutMeta 对象。
 * @param {{ animate?: boolean }} [options] - 选项，如是否开启动画。
 * @returns {Promise<{ok: boolean, found: boolean, html: string}>} 计算结果。
 */
/**
 * @description 根据地图图谱数据构建邻接表。
 * @param {any} graph - 从 stat_data 获取的图谱数据。
 * @returns {Map<string, Set<string>>} 表示邻接关系的 Map。
 */
function buildAdjacencyMap(graph: any): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  if (!graph) return adj;

  // 使用 getRaw 获取原始 edges 数组，避免被 get() 降维
  const edges = getRaw(graph, 'edges') || [];
  if (!Array.isArray(edges)) {
    logger.warn('buildAdjacencyMap', '图谱中的 "edges" 不是一个数组，无法构建邻接表。', edges);
    return adj;
  }

  for (const e of edges) {
    const a = String(e?.a || '').trim();
    const b = String(e?.b || '').trim();
    if (!a || !b || a === b) continue;
    // 安全地向邻接表添加边
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  }
  return adj;
}

async function computeHighlightedHtml(
  state: any,
  { animate = true } = {},
): Promise<{ ok: boolean; found: boolean; html: string }> {
  const funcName = 'computeHighlightedHtml';
  if (!mapText.value) {
    logger.warn(funcName, '地图文本为空，无法计算高亮。');
    return { ok: true, found: false, html: '<span class="map-loading">（未找到地图文本）</span>' };
  }
  const text = mapText.value;

  // 确定当前高亮关键字（玩家所在地区）
  const fallbackPlace = get(state, ERA_VARIABLE_PATH.FALLBACK_PLACE, '博丽神社');
  const keyword = get(state, ERA_VARIABLE_PATH.USER_LOCATION, fallbackPlace).trim();
  logger.log(funcName, `当前高亮关键字: ${keyword}`);

  // 从图谱数据计算邻近地区
  let nearNames: string[] = [];
  try {
    const adj = buildAdjacencyMap(mapGraph.value);
    nearNames = Array.from(adj.get(keyword) || []);
    logger.log(funcName, `找到 ${nearNames.length} 个邻近地区`, nearNames);
  } catch (e) {
    logger.error(funcName, '邻接计算失败', e);
  }

  // 查找所有需要高亮的文本片段
  const hits: { at: number; len: number; cls: string; pri: number }[] = [];
  const push = (token: string, cls: string) => {
    if (!token) return;
    for (const at of findAll(text, token)) hits.push({ at, len: token.length, cls, pri: cls === 'hit' ? 2 : 1 });
  };
  push(keyword, 'hit');
  nearNames.forEach(n => push(n, 'near'));

  if (!hits.length) {
    logger.log(funcName, '未在地图上找到任何可高亮的地区。');
    return { ok: true, found: false, html: escHtml(text) };
  }

  // 根据查找到的位置，构建带有高亮标签的HTML
  hits.sort((a, b) => a.at - b.at || b.pri - a.pri || b.len - a.len);
  let out = '',
    cur = 0;
  for (const h of hits) {
    if (h.at < cur) continue; // 跳过重叠的匹配
    out += escHtml(text.slice(cur, h.at));
    const mid = text.slice(h.at, h.at + h.len);
    const cls = (h.cls === 'hit' ? 'map-hit' : 'map-near') + (animate ? '' : ' paused');
    const title = (h.cls === 'hit' ? '当前位置：' : '附近地区：') + mid;
    out += `<span class="${cls}" ${h.cls === 'hit' ? 'data-hit="1"' : 'data-near="1"'} title="${escHtml(title)}">${escHtml(mid)}</span>`;
    cur = h.at + h.len;
  }
  out += escHtml(text.slice(cur));
  logger.log(funcName, `高亮HTML构建完成，共处理 ${hits.length} 个高亮区域。`);
  return { ok: true, found: true, html: out };
}

/**
 * @description 组件的主更新函数，由外部事件（如 era:writeDone）调用。
 * @param {any} statWithoutMeta - 包含所有状态的根对象。
 * @returns {Promise<boolean>} 是否更新成功。
 */
const update = async (statWithoutMeta: any): Promise<boolean> => {
  const funcName = 'update';
  logger.log(funcName, '接收到更新请求，开始更新世界地图组件。');

  // 从传入的数据中获取地图文本和图谱
  mapText.value = get(statWithoutMeta, ERA_VARIABLE_PATH.MAP_ASCII, '');
  mapGraph.value = get(statWithoutMeta, ERA_VARIABLE_PATH.MAP_GRAPH, null);

  if (!mapText.value) {
    logger.warn(funcName, '地图文本(world.map_ascii)为空，无法渲染地图。');
  }
  if (!mapGraph.value) {
    logger.warn(funcName, '地图图谱(world.map_graph)为空，无法计算邻近地区。');
  }

  const host = document.getElementById('world-map');
  if (!host) {
    logger.error(funcName, '未找到 #world-map 容器，无法渲染地图。');
    return false;
  }

  // 计算并应用高亮HTML
  const res = await computeHighlightedHtml(statWithoutMeta);
  host.innerHTML = res.html || '<span class="map-loading">（空）</span>';
  logger.log(funcName, '地图高亮渲染完成。');

  // 更新“附近地区”文本
  const nearbyPlacesEl = document.getElementById('nearby-places');
  if (nearbyPlacesEl) {
    const fallbackPlace = get(statWithoutMeta, ERA_VARIABLE_PATH.FALLBACK_PLACE, '博丽神社');
    const base = get(statWithoutMeta, ERA_VARIABLE_PATH.USER_LOCATION, fallbackPlace);
    try {
      const adj = buildAdjacencyMap(mapGraph.value);
      const neighbors = Array.from(adj.get(base) || []);
      nearbyPlacesEl.textContent = neighbors.length > 0 ? neighbors.join('；') : '—';
      logger.log(funcName, `“附近地区”已更新为: ${nearbyPlacesEl.textContent}`);
    } catch (e) {
      nearbyPlacesEl.textContent = '—';
      logger.error(funcName, '更新“附近地区”时发生错误', e);
    }
  }

  logger.log(funcName, '世界地图组件更新流程结束。');
  return true;
};

// 组件挂载后，绑定工具栏按钮的事件
onMounted(() => {
  const funcName = 'onMounted';

  const btnReload = document.getElementById('map-reload');
  if (btnReload) {
    btnReload.onclick = () => {
      logger.log(funcName, '用户点击“重新加载”按钮，派发 era:requestFullUpdate 事件。');
      // 这是一个只读操作，我们触发一个事件，让外部逻辑重新获取数据并调用 update
      // 在这个架构中，我们不能直接访问世界书，所以我们通知外部
      window.dispatchEvent(new CustomEvent('era:requestFullUpdate', { detail: { reason: 'map-reload' } }));
    };
  }

  const btnAnim = document.getElementById('map-toggle-anim');
  if (btnAnim) {
    btnAnim.onclick = () => {
      const host = document.getElementById('world-map');
      if (!host) return;
      const nodes = host.querySelectorAll('.map-hit, .map-near');
      if (!nodes.length) return;
      const willPlay = nodes[0].classList.contains('paused');
      nodes.forEach(n => n.classList.toggle('paused', !willPlay));
      logger.log(funcName, `切换地图动画为: ${willPlay ? '播放' : '暂停'}`);
    };
  }

  const btnCopy = document.getElementById('map-copy');
  if (btnCopy) {
    btnCopy.onclick = async () => {
      if (mapText.value) {
        await navigator.clipboard.writeText(mapText.value);
        logger.log(funcName, '地图原始文本已复制到剪贴板。');
      } else {
        logger.warn(funcName, '复制失败，因为地图文本为空。');
      }
    };
  }

  const dimChk = document.getElementById('map-dim-others') as HTMLInputElement;
  if (dimChk) {
    dimChk.onchange = () => {
      const host = document.getElementById('world-map');
      if (host) {
        host.classList.toggle('dim-others', dimChk.checked);
        logger.log(funcName, `切换“弱化非高亮”为: ${dimChk.checked}`);
      }
    };
  }
  logger.log(funcName, '地图工具栏按钮事件已成功绑定。');
});

// 暴露 update 函数，以便父组件或外部脚本可以调用
defineExpose({
  update,
});
</script>

<!-- ===== 5) 世界地图（ASCII） ===== -->
<style lang="scss" scoped>
.ascii-map {
  margin: 10px 0;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--paper);
  color: var(--ink);
  line-height: 1.35;
  white-space: pre;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 13.5px;
}
.ascii-map .map-loading {
  color: var(--muted);
}
.map-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0 10px;
}
.map-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85em;
  color: var(--muted);
}
.map-legend .swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid var(--line);
  vertical-align: middle;
  margin-right: 6px;
}

.swatch-hit {
  background: linear-gradient(90deg, #ffa94d, #ffd27f);
}
.swatch-near {
  background: linear-gradient(90deg, #8ec5ff, #d6e9ff);
}

:deep(.map-hit) {
  background: linear-gradient(90deg, #ffa94d, #ffd27f);
  border-radius: 4px;
  padding: 0 3px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  text-shadow: 0 0 1px rgba(0, 0, 0, 0.35);
  outline: 1px solid rgba(120, 60, 0, 0.35);
  box-shadow:
    0 0 0 1px rgba(255, 170, 90, 0.45) inset,
    0 0 0 3px rgba(255, 230, 180, 0.9) inset,
    0 0 18px rgba(255, 140, 40, 0.75);
  animation: mapPulse 1.2s ease-in-out infinite;
}
:deep(.map-hit.paused) {
  animation: none;
}

@keyframes mapPulse {
  0% {
    box-shadow:
      0 0 0 1px rgba(255, 170, 90, 0.35) inset,
      0 0 0 2px rgba(255, 220, 170, 0.7) inset,
      0 0 10px rgba(255, 150, 60, 0.35);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(255, 170, 90, 0.6) inset,
      0 0 0 4px rgba(255, 235, 190, 1) inset,
      0 0 20px rgba(255, 140, 40, 0.9);
  }
  100% {
    box-shadow:
      0 0 0 1px rgba(255, 170, 90, 0.35) inset,
      0 0 0 2px rgba(255, 220, 170, 0.7) inset,
      0 0 10px rgba(255, 150, 60, 0.35);
  }
}
:deep(.map-near) {
  background: linear-gradient(90deg, #8ec5ff, #d6e9ff);
  border-radius: 3px;
  padding: 0 2px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  text-shadow: 0 0 0.8px rgba(0, 0, 0, 0.25);
  outline: 1px solid rgba(4, 62, 130, 0.25);
  box-shadow:
    0 0 0 1px rgba(110, 160, 220, 0.35) inset,
    0 0 8px rgba(120, 170, 230, 0.45);
}
.ascii-map.dim-others {
  color: #7d6d5f;
}
:deep(.ascii-map.dim-others .map-hit) {
  color: #2b1e12;
}

:global(:root[data-theme='dark']) {
  .ascii-map {
    background: var(--paper);
    color: var(--ink);
  }
}

@media (max-width: 768px) {
  .ascii-map {
    font-size: 12.5px;
  }
}
</style>
