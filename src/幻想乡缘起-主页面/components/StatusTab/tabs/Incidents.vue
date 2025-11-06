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
      <strong id="incident-countdown">{{ countdownText }}</strong>
      <span class="debug-switch" title="来自 config.incident.forceTrigger；修改即写回到配置">
        <input id="incident-trigger-now" v-model="immediateTrigger" type="checkbox" /> 立即引发异变
      </span>
      <span class="debug-switch" title="来自 config.incident.isRandomPool；修改即写回到配置">
        <input id="incident-pool-random" v-model="randomPool" type="checkbox" /> 乱序异变
      </span>
    </div>

    <div id="incident-list" class="incident-list">
      <template v-if="incidentCards.length">
        <div v-for="incident in incidentCards" :key="incident.key" class="role-card">
          <div class="role-card-header">
            <div class="role-avatar">异</div>
            <div>
              <div class="role-name">{{ incident.name }}</div>
              <div class="role-meta">进程：{{ incident.statusText }}</div>
            </div>
          </div>
          <div v-for="field in incident.fields" :key="field.label" class="role-line">
            <strong>{{ field.label }}：</strong>{{ field.value }}
          </div>
        </div>
      </template>
      <template v-else>
        <div class="role-card">
          <div class="role-card-header">
            <div class="role-avatar">✔</div>
            <div>
              <div class="role-name">暂无记录</div>
              <div class="role-meta">最近没有可展示的异变</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { IncidentDetail } from '../../../../GSKO-BASE/schema/incident';
import type { Runtime } from '../../../../GSKO-BASE/schema/runtime';
import type { Stat } from '../../../../GSKO-BASE/schema/stat';
import { updateEraVariableByObject } from '../../../utils/eraWriter';
import { Logger } from '../../../utils/log';

const logger = new Logger();

const props = defineProps<{
  stat: Stat | null;
  runtime: Runtime | null;
}>();

interface IncidentCardField {
  label: string;
  value: string;
}

interface IncidentCard {
  key: string;
  name: string;
  statusText: string;
  fields: IncidentCardField[];
}

const incidentCards = computed<IncidentCard[]>(() => {
  const stat = props.stat;
  if (!stat || !stat.incidents) return [];

  const entries = Object.entries(stat.incidents).filter(([key, value]) => {
    return !key.startsWith('$') && !!value;
  });

  return entries.map(([name, detail]) => {
    const incident = detail as IncidentDetail;
    const solver = incident.异变退治者;
    const solverText = Array.isArray(solver) ? solver.join('、') : (solver ?? '');
    const mainLoc = incident.主要地区?.join('、') ?? '';

    const fields: IncidentCardField[] = [];
    if (incident.异变细节) {
      fields.push({ label: '异变细节', value: incident.异变细节 });
    }
    if (mainLoc) {
      fields.push({ label: '主要地区', value: mainLoc });
    }
    if (solverText) {
      fields.push({ label: '异变退治者', value: solverText });
    }

    return {
      key: name,
      name,
      statusText: incident.异变已结束 ? '已结束' : '进行中',
      fields,
    };
  });
});

const countdownMinutes = computed<number | null>(() => {
  const runtimeCountdown = props.runtime?.incident?.remainingCooldown;
  if (typeof runtimeCountdown === 'number' && Number.isFinite(runtimeCountdown)) {
    return Math.max(0, Math.floor(runtimeCountdown));
  }

  const config = props.stat?.config?.incident;
  const timeProgress = props.stat?.世界?.timeProgress;
  if (!config || typeof config.cooldownMinutes !== 'number' || typeof timeProgress !== 'number') {
    return null;
  }

  const anchor = props.stat?.cache?.incident?.incidentCooldownAnchor;
  if (anchor == null) {
    return Math.max(0, Math.floor(config.cooldownMinutes));
  }

  const remaining = config.cooldownMinutes - (timeProgress - anchor);
  return Math.max(0, Math.floor(remaining));
});

const countdownText = computed(() => {
  const value = countdownMinutes.value;
  return value == null ? '—' : String(value);
});

const immediateTrigger = ref(false);
const randomPool = ref(false);

let skipImmediatePropagation = false;
let skipRandomPropagation = false;

watch(
  () => props.stat?.config?.incident?.forceTrigger ?? false,
  value => {
    if (immediateTrigger.value === value) {
      return;
    }
    skipImmediatePropagation = true;
    immediateTrigger.value = value;
    logger.log('syncImmediateTrigger', `已同步“立即引发异变”状态: ${value}`);
  },
  { immediate: true },
);

watch(
  () => props.stat?.config?.incident?.isRandomPool ?? false,
  value => {
    if (randomPool.value === value) {
      return;
    }
    skipRandomPropagation = true;
    randomPool.value = value;
    logger.log('syncRandomPool', `已同步“乱序异变”状态: ${value}`);
  },
  { immediate: true },
);

watch(
  immediateTrigger,
  value => {
    if (skipImmediatePropagation) {
      skipImmediatePropagation = false;
      return;
    }
    logger.log('onImmediateTriggerChange', `用户切换“立即引发异变”为: ${value}`);
    updateEraVariableByObject({
      config: {
        incident: {
          forceTrigger: value,
        },
      },
    });
  },
  { flush: 'post' },
);

watch(
  randomPool,
  value => {
    if (skipRandomPropagation) {
      skipRandomPropagation = false;
      return;
    }
    logger.log('onRandomPoolChange', `用户切换“乱序异变”为: ${value}`);
    updateEraVariableByObject({
      config: {
        incident: {
          isRandomPool: value,
        },
      },
    });
  },
  { flush: 'post' },
);
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
