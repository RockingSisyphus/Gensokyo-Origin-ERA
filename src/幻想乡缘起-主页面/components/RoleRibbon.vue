<template>
  <!-- 严格拷贝自 app.vue 的 DOM 结构：角色横幅容器与箭头按钮 -->
  <div class="role-ribbon-container">
    <button id="ribbon-left" class="ribbon-arrow left" aria-label="左移">‹</button>
    <button id="ribbon-right" class="ribbon-arrow right" aria-label="右移">›</button>
    <div id="role-ribbon" class="role-ribbon"></div>
  </div>
  <!-- 以上结构需保持不变，以兼容现有样式与选择器 -->
</template>

<script setup lang="ts">
import { defineExpose } from 'vue';
import { ERA_VARIABLE_PATH } from '../utils/constants';
import { Logger } from '../utils/logger';
import { get } from '../utils/mvu';

// 中文调试日志记录器
const logger = new Logger('components-RoleRibbon');

// —— 本组件的核心职责：
// 1) 绑定左右箭头的滚动事件（步长来自 statWithoutMeta.config.ui.ribbonStep，默认 320）
// 2) 根据 statWithoutMeta 渲染“同区角色”的卡片到 #role-ribbon 容器（逻辑严格拷贝自 index.ts -> MVU.render.rolesRibbon，后做适配）

// 辅助：把值转成显示文本（严格拷贝自 index.ts，后做最小改造）
const toText = (v: any) => {
  if (Array.isArray(v)) return v.length ? v.join('；') : '—';
  const t = (() => {
    if (Array.isArray(v)) return v[0] ?? '';
    return v;
  })();
  if (t == null || t === '') return '—';
  return String(t);
};

// 将同区角色渲染到 #role-ribbon 容器（严格拷贝自 index.ts 的 MVU.render.rolesRibbon 后适配）
const renderRolesRibbon = (state: any, hostId = 'role-ribbon') => {
  const host = document.getElementById(hostId);
  if (!host) {
    logger.warn('renderRolesRibbon', '【渲染/附近角色】未找到容器。', { hostId });
    return 0;
  }
  host.innerHTML = '';

  const uLoc = String(get(state, ERA_VARIABLE_PATH.USER_LOCATION, '')).trim();
  let chars: any = state?.[ERA_VARIABLE_PATH.CHARS as any];
  try {
    if (typeof chars === 'string') chars = JSON.parse(chars);
  } catch {
    chars = null;
  }
  if (!chars || typeof chars !== 'object') {
    logger.warn('renderRolesRibbon', '【渲染/附近角色】chars 无效。');
    return 0;
  }

  const entries = Object.entries(chars).filter(
    ([k, v]: any[]) => !String(k).startsWith('$') && v && typeof v === 'object' && !Array.isArray(v),
  );

  const nearby = entries.filter(([, obj]: any[]) => {
    const cLoc = String(get(obj, ERA_VARIABLE_PATH.CHAR_LOCATION, '')).trim();
    return uLoc && cLoc && cLoc === uLoc;
  });

  if (!nearby.length) {
    const placeholder = document.createElement('div');
    placeholder.className = 'role-card';
    placeholder.innerHTML = `<div class="role-card-header"><div class="role-avatar">—</div><div><div class="role-name">附近暂无角色</div><div class="role-meta">${uLoc || '未知地区'}</div></div></div><div class="role-line">当前与玩家同区的角色将显示在此。</div>`;
    host.appendChild(placeholder);
    logger.log('renderRolesRibbon', '【渲染/附近角色】同区为 0，显示占位卡片。', { 用户所在: uLoc });
    return 0;
  }

  const t0 = performance.now?.() ?? Date.now();
  nearby.forEach(([name, obj]: any[]) => {
    const fields: Array<[string, string]> = [
      ['年龄', '年龄'],
      ['性别', '性别'],
      ['身份', '身份'],
      ['性格', '性格'],
      ['外貌', '外貌'],
      ['衣着', '衣着'],
      ['人际关系', '人际关系'],
      ['性经验', '性经验'],
      ['性知识', '性知识'],
      ['特殊能力', '特殊能力'],
      ['身体状况', '身体状况'],
      ['目标', '当前目标'],
      ['所想', '当前所想'],
      ['居住地区', '居住地区'],
    ];
    const meta = toText(get(obj, ERA_VARIABLE_PATH.CHAR_LOCATION, '未知'));
    const fav = get(obj, ERA_VARIABLE_PATH.CHAR_AFFECTION, 0);
    const lines = fields
      .map(([label, key]) => `<div class="role-line"><strong>${label}：</strong>${toText(get(obj, key, '—'))}</div>`)
      .join('');
    const div = document.createElement('div');
    div.innerHTML = `
<div class="role-card">
  <div class="role-card-header">
    <div class="role-avatar">${String(name).slice(0, 1)}</div>
    <div><div class="role-name">${name}</div><div class="role-meta">${meta}</div></div>
  </div>
  ${lines}
  <div class="role-line">
    <strong>好感度：</strong>
    <span class="aff-num">${toText(fav)}</span>
    <span class="aff-stage" style="margin-left:6px;color:var(--muted);font-size:.85em;">—</span>
    <div class="mini-bar"><div class="val" data-aff="bar"></div></div>
  </div>
</div>`;
    const card = div.firstElementChild as HTMLElement | null;
    if (card) host.appendChild(card);
    const valEl = (card?.querySelector('.mini-bar .val') as HTMLElement) || null;
    if (valEl) valEl.style.width = Math.min(Math.abs(Number(fav) || 0), 100) + '%';
  });
  const dt = (performance.now?.() ?? Date.now()) - t0;
  logger.log('renderRolesRibbon', '【渲染/附近角色】完成。', {
    数量: nearby.length,
    用时毫秒: dt.toFixed ? dt.toFixed(1) : dt,
  });
  return nearby.length;
};

// 对外暴露：由 index.ts 的 era:writeDone 调用以完成初始化与渲染
const updateRibbon = (statWithoutMeta: any) => {
  const func = 'updateRibbon';
  if (!statWithoutMeta || typeof statWithoutMeta !== 'object') {
    logger.warn(func, '传入的 statWithoutMeta 无效。', statWithoutMeta);
    return;
  }
  // 1) 绑定左右箭头（步长从事件数据中读取；默认 320）
  const ribbon = document.getElementById('role-ribbon');
  const step = Number(get(statWithoutMeta, ERA_VARIABLE_PATH.UI_RIBBON_STEP, 320)) || 320;
  const L = document.getElementById('ribbon-left');
  const R = document.getElementById('ribbon-right');
  if (L) (L as HTMLButtonElement).onclick = () => ribbon?.scrollBy({ left: -step, behavior: 'smooth' });
  if (R) (R as HTMLButtonElement).onclick = () => ribbon?.scrollBy({ left: step, behavior: 'smooth' });
  logger.log(func, '箭头点击事件已绑定。', { step });

  // 2) 渲染同区角色卡片
  renderRolesRibbon(statWithoutMeta, 'role-ribbon');
};

defineExpose({
  updateRibbon,
});
</script>

<style lang="scss">
/*
  这些样式是为 RoleRibbon.vue 组件专门设计的。
  没有使用 'scoped' 属性，因为组件使用 innerHTML 动态渲染内容，
  'scoped' 的哈希属性无法应用到这些动态元素上。
  通过将所有样式嵌套在 .role-ribbon-container 内，
  我们实现了“手动作用域”，以防止样式泄漏到组件外部。
*/

/* ===== 全局动画与主题覆盖 (Global Keyframes & Theme Overrides) ===== */
@keyframes affPop {
  0% {
    transform: translateY(0) scale(0.85);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(-18px) scale(1.15);
    opacity: 0;
  }
}

@keyframes cardPop {
  0% {
    transform: translate(0, 0) scale(0.8) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--dx, 0), var(--dy, -40px)) scale(1.1) rotate(var(--rot, 0deg));
    opacity: 0;
  }
}

:root[data-theme='dark'] .role-ribbon-container .aff-particle.skull,
:root[data-theme='dark'] .role-ribbon-container .card-particle.skull {
  color: #714f4f;
  text-shadow: 0 0 6px rgba(185, 88, 88, 0.6);
}

/* ===== 组件样式 (Component Styles) ===== */
.role-ribbon-container {
  position: relative;
  background: var(--paper);
  border-bottom: 1px solid var(--line);
  padding: 10px 40px;
  max-width: 100%;
  overflow-x: hidden;

  .role-ribbon {
    display: flex;
    gap: 12px;
    overflow: auto hidden;
    scroll-snap-type: x proximity;
    padding-bottom: 6px;
  }

  .ribbon-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border: 1px solid var(--line);
    background: var(--bg);
    border-radius: 4px;
    cursor: pointer;
    z-index: 10;
  }
  .ribbon-arrow.left {
    left: 8px;
  }
  .ribbon-arrow.right {
    right: 8px;
  }

  .role-card {
    flex: 0 0 260px;
    min-width: 0;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: var(--pad);
    scroll-snap-align: start;
    position: relative;
    overflow: hidden;
  }

  .role-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px dashed var(--line);
  }

  .role-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--line);
    background: var(--avatar-bg);
    display: grid;
    place-items: center;
    font-weight: 700;
    color: var(--muted);
  }

  .role-name {
    font-weight: 700;
  }

  .role-meta {
    font-size: 0.85em;
    color: var(--muted);
  }

  .role-line {
    margin: 6px 0;
    font-size: 0.9em;
  }

  /* 迷你条 & 粒子 */
  .mini-bar {
    height: 8px;
    background: var(--bar-bg);
    border: 1px solid var(--line);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }
  .mini-bar .val {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #c0a58a, #8c7b6a);
    transition: width 0.3s ease;
  }
  .mini-bar .val.rtl {
    left: auto;
    right: 0;
  }
  .mini-bar .val.negative {
    background: #b00020;
  }
  .mini-bar .val.very-hate {
    background: #000;
  }
  .mini-bar .val.very-love {
    background: linear-gradient(90deg, #7e3ff2, #c084fc);
  }

  .aff-particle,
  .card-particle {
    position: absolute;
    line-height: 1;
    pointer-events: none;
    user-select: none;
    opacity: 0;
    animation: affPop 1.1s ease-out forwards;
    filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.25));
  }
  .card-particle {
    animation: cardPop 1.2s ease-out forwards;
    font-size: 16px;
  }
  .card-particle.heart {
    color: #b65ff7;
    text-shadow: 0 0 8px rgba(126, 63, 242, 0.5);
  }
  .card-particle.skull {
    color: #222;
    text-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  }
  .aff-particle.heart {
    text-shadow: 0 0 6px rgba(126, 63, 242, 0.45);
  }
  .aff-particle.skull {
    color: #000;
    text-shadow: 0 0 6px rgba(0, 0, 0, 0.35);
  }

  /* X) 好感度等级徽章 */
  .aff-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .aff-level {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    line-height: 1.8;
    font-weight: 700;
    font-size: 0.85em;
    border-radius: 999px;
    background: var(--bar-bg);
    color: var(--ink);
    border: 1px solid var(--line);
    white-space: nowrap;
  }
  .aff-level::before {
    content: attr(data-icon);
  }
  .aff-level[data-icon='']::before {
    content: none;
  }

  .aff-level.very-love {
    background: linear-gradient(90deg, #7e3ff2, #c084fc);
    color: #fff;
    border-color: color-mix(in srgb, #7e3ff2 55%, white 45%);
  }
  .aff-level.love {
    background: color-mix(in srgb, #7e3ff2 18%, var(--paper) 82%);
    color: color-mix(in srgb, #7e3ff2 85%, white 15%);
    border-color: color-mix(in srgb, #7e3ff2 45%, var(--line) 55%);
  }
  .aff-level.neutral {
    background: var(--bar-bg);
    color: var(--ink);
    border-color: var(--line);
  }
  .aff-level.dislike {
    background: color-mix(in srgb, #b00020 12%, var(--paper) 88%);
    color: color-mix(in srgb, #b00020 80%, white 20%);
    border-color: color-mix(in srgb, #b00020 45%, var(--line) 55%);
  }
  .aff-level.hate,
  .aff-level.negative {
    background: #b00020;
    color: #fff;
    border-color: color-mix(in srgb, #b00020 65%, white 35%);
  }
  .aff-level.very-hate {
    background: #000;
    color: #fff;
    border-color: #333;
  }
}
</style>
