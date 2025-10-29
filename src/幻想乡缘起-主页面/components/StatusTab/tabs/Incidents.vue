<template>
  <div>
    <h4><span class="emoji">⚠️</span>异变啊异变！</h4>

    <!-- ===== 异变工具栏（倒计时 + 立即引发） ===== -->
    <div
      id="incident-toolbar"
      class="debug-select"
      style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap"
    >
      <span class="label" style="min-width: auto; margin: 0"> <span class="emoji">⏳</span>异变倒计时（分钟）: </span>
      <strong id="incident-countdown">—</strong>
      <span
        class="debug-switch"
        title="来自世界书 config 的初始值；修改即写回到聊天变量的 config.incidents.triggerImmediate"
      >
        <input id="incident-trigger-now" type="checkbox" /> 立即引发异变
      </span>
      <span class="debug-switch" title="来自 config.incident.random_pool">
        <input id="incident-pool-random" type="checkbox" /> 乱序异变
      </span>
    </div>

    <div id="incident-list" class="incident-list"></div>
  </div>
</template>

<script setup lang="ts">
import { defineExpose, onMounted } from 'vue';
import { ERA_VARIABLE_PATH } from '../../../utils/constants';
import { updateEraVariable } from '../../../utils/eraWriter';
import { get, getRaw, toText } from '../../../utils/format';
import { Logger } from '../../../utils/log';

const logger = new Logger();

// 定义常量
const T0_PATH = 'incident.异变冷却基准时间';

/**
 * @description 从 stat_data 中提取所有异变条目。
 * @param {any} data - stat_data 对象。
 * @returns {Array<{__name: string, __data: any}>} 异变条目数组。
 */
function extractIncidents(data: any): Array<{ __name: string; __data: any }> {
  let root = get(data, 'incidents');
  if (typeof root === 'string') {
    try {
      root = JSON.parse(root);
    } catch {
      root = null;
    }
  }
  if (!root || typeof root !== 'object' || Array.isArray(root)) return [];
  return Object.entries(root)
    .filter(([k, v]) => !String(k).startsWith('$') && v && typeof v === 'object' && !Array.isArray(v))
    .map(([__name, __data]) => ({ __name, __data: __data as any }));
}

/**
 * @description 渲染异变列表。
 * @param {any} state - stat_data 对象。
 */
function renderIncidents(state: any) {
  const funcName = 'renderIncidents';
  const host = document.getElementById('incident-list');
  if (!host) {
    logger.warn(funcName, '未找到 #incident-list 容器。');
    return;
  }
  host.innerHTML = '';
  const items = extractIncidents(state);
  logger.log(funcName, `开始渲染 ${items.length} 个异变卡片。`);

  items.forEach(({ __name, __data }) => {
    const name = toText(get(__data, '异变名称', __name));
    const status = get(__data, '异变已结束') ? '已结束' : '进行中';
    const fields = [
      ['影响', '异变影响'],
      ['退治者', '异变退治者'],
      ['发起者', '异变发起者'],
      ['黑幕', '异变黑幕'],
      ['其他信息', '其他异变信息'],
    ];
    const card = document.createElement('div');
    card.className = 'role-card';
    card.innerHTML = `
<div class="role-card-header">
    <div class="role-avatar">异</div>
    <div><div class="role-name">${name}</div><div class="role-meta">进程：${status}</div></div>
</div>
${fields
  .map(([label, key]) => {
    const val = key === '异变退治者' ? getRaw(__data, key, []) : get(__data, key, '—');
    return `<div class="role-line"><strong>${label}：</strong>${toText(val)}</div>`;
  })
  .join('')}
`;
    host.appendChild(card);
  });
  logger.log(funcName, '异变卡片渲染完成。');
}

// ===== 倒计时逻辑 =====

function readT0(runtime: any): number | null {
  if (!runtime) {
    logger.warn('readT0', 'runtime 对象不存在，无法读取 T0。');
    return null;
  }
  // 直接从传入的 runtime 对象读取
  const t0 = get(runtime, T0_PATH, null);
  if (t0 != null) {
    const n = Number(toText(t0));
    if (Number.isFinite(n)) {
      logger.log('readT0', `从 runtime 读取到 t0: ${n}`);
      return n;
    }
  }
  logger.log('readT0', '未在 runtime 中读取到合法 t0。');
  return null;
}

function readCooldownMinutes(state: any): number {
  const cooldown = get(state, ERA_VARIABLE_PATH.INCIDENT_COOLDOWN, 0);
  const n = Number(toText(cooldown));
  if (Number.isFinite(n) && n >= 0) {
    return Math.floor(n);
  }
  return 0;
}

function readTimeProgress(state: any): number {
  const timeProgress = get(state, ERA_VARIABLE_PATH.TIME_PROGRESS, 0);
  const n = Number(toText(timeProgress));
  return Number.isFinite(n) ? Math.floor(n) : 0;
}

function calcCountdownMinutes(context: { statWithoutMeta: any; runtime: any }): number {
  const { statWithoutMeta, runtime } = context;
  const t0 = readT0(runtime);
  if (t0 === null) {
    logger.log('calcCountdownMinutes', 't0 不存在/非法，本轮倒计时按 0 处理。');
    return 0;
  }
  const tp = readTimeProgress(statWithoutMeta);
  const cd = readCooldownMinutes(statWithoutMeta);
  const left = Math.max(0, Math.floor(cd - (tp - t0)));
  logger.log(
    'calcCountdownMinutes',
    `计算倒计时（分钟）: { t0: ${t0}, timeProgress: ${tp}, cooldown: ${cd}, 剩余: ${left} }`,
  );
  return left;
}

/**
 * @description 更新异变工具栏的状态。
 * @param {object} context - 包含 statWithoutMeta 和 runtime 的上下文对象。
 */
function updateIncidentToolbar(context: { statWithoutMeta: any; runtime: any }) {
  const funcName = 'updateIncidentToolbar';
  const { statWithoutMeta } = context;

  const cdEl = document.getElementById('incident-countdown');
  const triggerNowEl = document.getElementById('incident-trigger-now') as HTMLInputElement;
  const randomPoolEl = document.getElementById('incident-pool-random') as HTMLInputElement;

  if (cdEl) {
    const left = calcCountdownMinutes(context);
    cdEl.textContent = left == null ? '—' : String(left);
    logger.log(funcName, `异变倒计时已更新为: ${cdEl.textContent}`);
  }

  if (triggerNowEl) {
    const shouldTrigger = get(statWithoutMeta, ERA_VARIABLE_PATH.INCIDENT_IMMEDIATE_TRIGGER, false);
    triggerNowEl.checked = !!shouldTrigger;
    logger.log(funcName, `“立即引发异变”状态已更新为: ${triggerNowEl.checked}`);
  }

  if (randomPoolEl) {
    const useRandom = get(statWithoutMeta, ERA_VARIABLE_PATH.INCIDENT_RANDOM_POOL, false);
    randomPoolEl.checked = !!useRandom;
    logger.log(funcName, `“乱序异变”状态已更新为: ${randomPoolEl.checked}`);
  }
}

/**
 * @description 组件的主更新函数。
 * @param {object} context - 包含 statWithoutMeta 和 runtime 的上下文对象。
 */
const update = (context: { statWithoutMeta: any; runtime: any }) => {
  const { statWithoutMeta } = context || {};
  if (!statWithoutMeta) {
    logger.warn('update', '上下文信息不完整，缺少 statWithoutMeta，已中止。');
    return;
  }
  renderIncidents(statWithoutMeta);
  updateIncidentToolbar(context);
};

onMounted(() => {
  const funcName = 'onMounted';
  const triggerNowEl = document.getElementById('incident-trigger-now') as HTMLInputElement;
  const randomPoolEl = document.getElementById('incident-pool-random') as HTMLInputElement;

  if (triggerNowEl) {
    triggerNowEl.onchange = () => {
      const newValue = triggerNowEl.checked;
      logger.log(funcName, `用户切换“立即引发异变”为: ${newValue}`);
      updateEraVariable(ERA_VARIABLE_PATH.INCIDENT_IMMEDIATE_TRIGGER, newValue);
    };
  }

  if (randomPoolEl) {
    randomPoolEl.onchange = () => {
      const newValue = randomPoolEl.checked;
      logger.log(funcName, `用户切换“乱序异变”为: ${newValue}`);
      updateEraVariable(ERA_VARIABLE_PATH.INCIDENT_RANDOM_POOL, newValue);
    };
  }
  logger.log(funcName, '异变工具栏事件已绑定。');
});

defineExpose({
  update,
});
</script>

<!-- ===== 异变列表 & 卡片样式 ===== -->
<style lang="scss" scoped>
/* 容器和标题 */
#content_incidents {
  h4 {
    display: flex;
    align-items: center;
    margin: 0 0 15px;
    padding-bottom: 10px;
    line-height: 1;
    font-size: 1.1em;
    color: var(--muted);
    border-bottom: 1px solid var(--line);
  }
  .emoji {
    font-size: 1em;
    line-height: 1;
    margin-right: 8px;
  }
}

/* 工具栏 */
#incident-toolbar {
  margin-bottom: 15px;
}

/* 调试风格的控件 (移植自 style_modeled.scss) */
.debug-select,
.debug-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9em;
  padding: 4px 8px;
  border: 1px dashed var(--line);
  border-radius: 6px;
  background: color-mix(in srgb, var(--paper) 50%, var(--bg) 50%);
}

:global(:root[data-theme='dark']) {
  .debug-select,
  .debug-switch {
    background: rgba(255, 255, 255, 0.05);
  }
}

.incident-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* 基础卡片样式 (异变卡片专用) */
  /* 使用 :deep() 来确保样式能应用到 innerHTML 创建的 DOM 上 */
  :deep(.role-card) {
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: var(--pad);
    overflow: hidden;

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
  }
}
</style>
