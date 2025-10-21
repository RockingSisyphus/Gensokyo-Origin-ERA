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
        <FontSizeControls ref="fontSizeControls" />
        <div id="main-content" class="preserve-format">
          <content>$1</content>
        </div>
        <div id="main-extra" class="preserve-format"></div>
      </div>

      <!-- 世界 Tab (WorldMap) -->
      <div id="content_status" class="status-tab-content" :class="{ active: activeTab === 'status' }">
        <WorldMap ref="worldMap" />
      </div>

      <!-- 异变 Tab -->
      <div id="content_incidents" class="status-tab-content" :class="{ active: activeTab === 'incidents' }">
        <Incidents ref="incidents" />
      </div>

      <!-- 其他角色 Tab -->
      <div id="content_others" class="status-tab-content" :class="{ active: activeTab === 'others' }">
        <ContentOthers ref="contentOthers" />
      </div>

      <!-- 履历与关系 Tab -->
      <div id="content_bio" class="status-tab-content" :class="{ active: activeTab === 'bio' }">
        <ContentBio ref="contentBio" />
      </div>

      <!-- 设置 Tab -->
      <div id="content_settings" class="status-tab-content" :class="{ active: activeTab === 'settings' }">
        <ContentSettings ref="contentSettings" />
      </div>
    </div>
    <!-- ▲ [移植] 结构结束 -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ERA_VARIABLE_PATH } from '../../utils/constants';
import { Logger } from '../../utils/logger';
import { get, getStr } from '../../utils/mvu';
import ContentBio from './tabs/ContentBio.vue';
import ContentOthers from './tabs/ContentOthers.vue';
import ContentSettings from './tabs/ContentSettings.vue';
import Incidents from './tabs/Incidents.vue';
import WorldMap from './tabs/WorldMap.vue';
// [重构] FontSizeControls 已移入 tabs 文件夹内
import FontSizeControls from './tabs/FontSizeControls.vue';

// 日志工具
const logger = new Logger('components-StatusTab-StatusTabContent');

// 子组件对外暴露的实例类型
type Updatable = { update: (payload: any) => void };
type FontSizeControlsExposed = { updateFontSize: (payload: any) => void };

// ▼ [移植] 严格参考 app.vue，为所有子组件创建 ref
const fontSizeControls = ref<FontSizeControlsExposed | null>(null);
const worldMap = ref<Updatable | null>(null);
const incidents = ref<Updatable | null>(null);
const contentOthers = ref<Updatable | null>(null);
const contentBio = ref<Updatable | null>(null);
const contentSettings = ref<Updatable | null>(null);
// ▲ [移植] ref 创建结束

// ▼ [改造] 将 index.ts 中的 tab 切换逻辑改造成 Vue 的方式
const tabs = [
  { id: 'main', name: '正文' },
  { id: 'status', name: '世界' },
  { id: 'incidents', name: '异变啊异变！' },
  { id: 'others', name: '其他角色' },
  { id: 'bio', name: '履历与关系' },
  { id: 'settings', name: '设置' },
];
const activeTab = ref('main'); // 默认激活 '正文' 选项卡

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
 *              这个方法的核心逻辑来自于 index.ts 中对 era:writeDone 事件的响应。
 * @param {any} statWithoutMeta - 不包含元数据的状态对象，从 era:writeDone 事件的 detail 中传入。
 */
const update = (statWithoutMeta: any) => {
  const funcName = 'update';
  logger.log(funcName, `接收到更新请求，开始更新所有子组件...`, { statWithoutMeta });

  if (!statWithoutMeta) {
    logger.warn(funcName, '传入的 statWithoutMeta 为空，无法更新 UI。');
    return;
  }

  // [移植自 index.ts] 调用字号控制组件的更新函数
  if (fontSizeControls.value && typeof fontSizeControls.value.updateFontSize === 'function') {
    fontSizeControls.value.updateFontSize(statWithoutMeta);
    logger.debug(funcName, '已调用 FontSizeControls.updateFontSize');
  }

  // [移植自 index.ts] 调用世界地图组件的更新函数
  if (worldMap.value && typeof worldMap.value.update === 'function') {
    worldMap.value.update(statWithoutMeta);
    logger.debug(funcName, '已调用 WorldMap.update');
  }

  // [移植自 index.ts] 调用异变组件的更新函数
  // [改造] Incidents.vue 组件现在内部自己处理 runtime 逻辑，所以这里只需要调用 update 即可
  if (incidents.value && typeof incidents.value.update === 'function') {
    incidents.value.update(statWithoutMeta);
    logger.debug(funcName, '已调用 Incidents.update');
  }

  // [移植自 index.ts] 调用其他角色组件的更新函数
  if (contentOthers.value && typeof contentOthers.value.update === 'function') {
    contentOthers.value.update(statWithoutMeta);
    logger.debug(funcName, '已调用 ContentOthers.update');
  }

  // [移植自 index.ts] 调用履历与关系组件的更新函数
  if (contentBio.value && typeof contentBio.value.update === 'function') {
    contentBio.value.update(statWithoutMeta);
    logger.debug(funcName, '已调用 ContentBio.update');
  }

  // [移植自 index.ts] 调用设置组件的更新函数
  if (contentSettings.value && typeof contentSettings.value.update === 'function') {
    contentSettings.value.update(statWithoutMeta);
    logger.debug(funcName, '已调用 ContentSettings.update');
  }

  // [移植自 index.ts 的 MVU.render.mainColumns] 更新附加正文
  const mainExtraEl = document.getElementById('main-extra');
  if (mainExtraEl) {
    const contentString = getStr(statWithoutMeta, ERA_VARIABLE_PATH.EXTRA_MAIN, '');
    mainExtraEl.textContent = contentString;
    logger.debug(funcName, '已更新附加正文', { content: contentString.slice(0, 50) + '...' });
  }

  logger.log(funcName, '所有子组件更新完成。');
};
// ▲ [移植] update 方法结束

// 将 update 方法和所有子组件的 ref 暴露出去，以便父组件(app.vue)可以访问
defineExpose({
  update,
  worldMap,
  incidents,
  contentOthers,
  contentBio,
  contentSettings,
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
