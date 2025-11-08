<template>
  <div>
    <!-- ▼ [移植] 这部分 HTML 结构严格复制自 app.vue -->
    <div id="status-tabs" class="status-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :data-tab="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="switchTab(tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>

    <div id="status-tab-content-area" class="status-tab-content-area">
      <!-- 正文 Tab -->
      <div id="content_main" class="status-tab-content" :class="{ active: activeTab === 'main' }">
        <FontSizeControls :ui-config="fontSizeUiConfig" />
        <MainContent :latest-message="latestMessage" :refresh-key="mainContentRefreshKey" :stat="statForTabs" />
        <div id="main-extra" class="preserve-format"></div>
      </div>

      <!-- 世界 Tab (WorldMap) -->
      <div
        v-if="activeTab === 'status'"
        id="content_status"
        class="status-tab-content"
        :class="{ active: activeTab === 'status' }"
      >
        <Map :context="contextRef" />
      </div>

      <!-- 异变 Tab -->
      <div id="content_incidents" class="status-tab-content" :class="{ active: activeTab === 'incidents' }">
        <Incidents :stat="statForTabs" :runtime="runtimeForTabs" />
      </div>

      <!-- 履历与关系 Tab -->
      <div id="content_bio" class="status-tab-content" :class="{ active: activeTab === 'bio' }">
        <ContentBio ref="contentBio" />
      </div>

      <!-- 设置 Tab -->
      <div id="content_settings" class="status-tab-content" :class="{ active: activeTab === 'settings' }">
        <ContentSettings :config="contentSettingsConfig" @saved="handleContentSettingsSaved" />
      </div>
    </div>
    <!-- ▲ [移植] 结构结束 -->
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Runtime } from '../../../GSKO-BASE/schema/runtime';
import type { Stat } from '../../../GSKO-BASE/schema/stat';
import type { UiConfig } from '../../../GSKO-BASE/schema/ui';
import Map from '../../components/Map/Map.vue';
import { Logger } from '../../utils/log';
import ContentBio from './tabs/ContentBio.vue';
import ContentSettings from './tabs/ContentSettings.vue';
import Incidents from './tabs/Incidents.vue';
// [重构] FontSizeControls 已移入 tabs 文件夹内
import FontSizeControls from './tabs/FontSizeControls.vue';
import MainContent from './tabs/MainContent.vue';

// 日志工具
const logger = new Logger();

// 子组件对外暴露的实例类型
type Updatable = { update: (payload: any) => void };

// ▼ [移植] 严格参考 app.vue，为所有子组件创建 ref
const worldMap = ref<Updatable | null>(null);
const contentBio = ref<Updatable | null>(null);
const contentSettingsConfig = ref<Record<string, any> | null>(null);
const fontSizeUiConfig = ref<UiConfig | null>(null);
// ▲ [移植] ref 创建结束

// ▼ [改造] 将 index.ts 中的 tab 切换逻辑改造成 Vue 的方式
const tabs = [
  { id: 'main', name: '正文' },
  { id: 'status', name: '世界' },
  { id: 'incidents', name: '异变啊异变！' },
  { id: 'bio', name: '履历与关系' },
  { id: 'settings', name: '设置' },
];
const activeTab = ref('main'); // 默认激活 '正文' 选项卡
const mainContentRefreshKey = ref(0);
const latestMessage = ref<ChatMessage | null>(null);

type StatusTabContext = {
  statWithoutMeta: Stat;
  runtime: Runtime | null;
  messageId?: number | null;
  latestMessage?: ChatMessage | null;
};
const contextRef = ref<StatusTabContext | null>(null);

const statForTabs = computed<Stat | null>(() => contextRef.value?.statWithoutMeta ?? null);
const runtimeForTabs = computed<Runtime | null>(() => contextRef.value?.runtime ?? null);

/**
 * @description 切换选项卡。这是对 index.ts 中原始 DOM 事件监听器的 Vue 化改造。
 * @param {string} tabId - 要切换到的选项卡的 ID
 */
const switchTab = (tabId: string) => {
  logger.log('switchTab', `切换选项卡到: ${tabId}`);
  activeTab.value = tabId;
};
// ▲ [改造] tab 切换逻辑结束

// ▼ [移植] 将 index.ts 中 era:writeDone 事件监听器内的 UI 更新逻辑，以及废弃的 renderAll 中的逻辑，整合到 update 方法中
/**
 * @description 接收来自父组件的数据并更新所有相关的子组件。
 *              这个方法的核心逻辑来自于 index.ts 中对 GSKO:showUI 事件的响应。
 * @param {object} context - 包含 statWithoutMeta 和 runtime 的上下文对象。
 */
const update = (context: StatusTabContext) => {
  contextRef.value = context;
  const funcName = 'update';
  const { statWithoutMeta, latestMessage: msg } = context || {};
  latestMessage.value = msg || null;

  logger.log(funcName, `接收到更新请求，开始更新所有子组件...`, { context });

  if (!statWithoutMeta) {
    logger.warn(funcName, '传入的 context 或 statWithoutMeta 为空，无法更新 UI。');
    return;
  }

  fontSizeUiConfig.value = statWithoutMeta?.config?.ui ?? null;
  logger.debug(funcName, '已同步 FontSizeControls 配置', {
    hasUiConfig: !!fontSizeUiConfig.value,
  });

  mainContentRefreshKey.value += 1;

  // [移植自 index.ts] 调用世界地图组件的更新函数
  if (worldMap.value && typeof worldMap.value.update === 'function') {
    worldMap.value.update(statWithoutMeta);
    logger.debug(funcName, '已调用 WorldMap.update');
  }

  // [移植自 index.ts] 调用履历与关系组件的更新函数
  if (contentBio.value && typeof contentBio.value.update === 'function') {
    contentBio.value.update(context);
    logger.debug(funcName, '已调用 ContentBio.update');
  }

  // 将配置对象传递给设置组件，触发内置 watch 更新
  contentSettingsConfig.value = statWithoutMeta?.config ?? null;
  logger.debug(funcName, '已同步 ContentSettings 配置', {
    hasConfig: !!contentSettingsConfig.value,
  });

  // [移植自 index.ts 的 MVU.render.mainColumns] 更新附加正文
  const mainExtraEl = document.getElementById('main-extra');
  if (mainExtraEl) {
    const contentString = typeof statWithoutMeta.附加正文 === 'string' ? statWithoutMeta.附加正文 : '';
    mainExtraEl.textContent = contentString;
    logger.debug(funcName, '已更新附加正文', { content: contentString.slice(0, 50) + '...' });
  }

  logger.log(funcName, '所有子组件更新完成。');
};
// ▲ [移植] update 方法结束

const handleContentSettingsSaved = (payload: { ok: number; fail: number; patch: Record<string, any> }) => {
  logger.log('handleContentSettingsSaved', '设置页保存完成', payload);
};

// 将 update 方法和所有子组件的 ref 暴露出去，以便父组件(app.vue)可以访问
defineExpose({
  update,
  worldMap,
  contentBio,
});
</script>

<!-- ===== 4) 选项卡与内容区 ===== -->
<style lang="scss" scoped>
.status-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--line);
  background: var(--paper);
  padding: 0 15px;
  overflow: auto hidden;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
}
.status-tabs button {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 0.95em;
  color: var(--muted);
  border: none;
  background: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  flex: 0 0 auto;
  scroll-snap-align: start;
}
.status-tabs button.active {
  color: var(--ink);
  border-bottom-color: var(--tab-active);
  font-weight: 700;
}

.status-tab-content-area {
  flex: 1;
  overflow: auto;
  padding: 20px;
}
.status-tab-content {
  display: none;
  line-height: 1.6;
  font-size: 0.95em;
}
.status-tab-content.active {
  display: block;
}

:global(:root[data-theme='dark']) .status-tabs button {
  color: var(--muted);
}
:global(:root[data-theme='dark']) .status-tabs button.active {
  color: var(--ink);
}

@media (max-width: 768px) {
  .status-tab-content-area {
    padding: 15px;
  }
}

/* 从 style_modeled.scss 移植过来的、属于子组件的样式 */
/* 使用 :deep() 以确保样式能应用到子组件 */
:deep(.font-size-controls) {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-bottom: 10px;
}
:deep(.font-size-btn) {
  width: 28px;
  height: 28px;
  border: 1px solid var(--line);
  background: var(--paper);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
}

:deep(.incident-list) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
