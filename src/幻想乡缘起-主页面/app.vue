<template>
  <div id="status-container" class="status-ui-container">
    <!-- ▼ 新增：右上角主题切换按钮 -->
    <ThemeToggle ref="themeToggle" />
    <!-- ▲ 新增 -->
    <div id="status-duo" class="status-duo">
      <UserStateContainer ref="userState" />
      <AyaNewsContainer ref="ayaNews" />
    </div>

    <div class="status-main-content">
      <RoleRibbonContainer ref="roleRibbon" />

      <StatusBanner ref="statusBanner" />

      <!-- ▼ [重构] 选项卡区域已被封装到 StatusTabContent 组件中 -->
      <StatusTabContent ref="statusTabContent" />
      <!-- ▲ [重构] -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
});
</script>

<script setup lang="ts">
import { ref } from 'vue';
// [重构] 导入新的 StatusTabContent 组件
import StatusTabContent from './components/StatusTab/StatusTabContent.vue';
// [重构] 其他子组件的导入已移至 StatusTabContent.vue，此处不再需要
import RoleRibbonContainer from './components/RoleRibbon/RoleRibbonContainer.vue';
import StatusBanner from './components/StatusBanner/StatusBannerContent.vue';
import AyaNewsContainer from './components/AyaNews/AyaNewsContainer.vue';
import UserStateContainer from './components/UserState/UserStateContainer.vue';
import ThemeToggle from './components/ThemeToggle.vue';

// 为 ThemeToggle 组件创建一个 ref
const themeToggle = ref<InstanceType<typeof ThemeToggle> | null>(null);
// 为 UserState 组件创建一个 ref，以便在 index.ts 中可以访问到它
const userState = ref<InstanceType<typeof UserStateContainer> | null>(null);
// 为 AyaNews 组件创建一个 ref
const ayaNews = ref<InstanceType<typeof AyaNewsContainer> | null>(null);
// 为 StatusBanner 组件创建一个 ref
const statusBanner = ref<InstanceType<typeof StatusBanner> | null>(null);
// [重构] 为新的 StatusTabContent 组件创建一个 ref
const statusTabContent = ref<InstanceType<typeof StatusTabContent> | null>(null);
const roleRibbon = ref<InstanceType<typeof RoleRibbonContainer> | null>(null);

// [重构] 只暴露 index.ts 仍然需要直接访问的组件 ref
defineExpose({
  themeToggle,
  userState,
  ayaNews,
  statusBanner,
  statusTabContent, // 暴露新组件的 ref
  roleRibbon,
});
</script>

<style lang="scss">
/* 容器骨架 */
.status-ui-container {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 10px;
  border: 1px solid var(--line);
  border-radius: 4px;
  /* 仅横向裁剪，纵向允许溢出，让绝对定位的日历弹层能把整页“撑长”或自然溢出到页面滚动 */
  overflow-x: hidden;
  overflow-y: visible;
  background: var(--bg);
}
.status-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 防止 Grid 子项因最小高度导致内部滚动与锁高 */
  overflow: visible; /* 明确允许可见溢出（配合弹窗策略更稳） */
}

/* 整行：并排 + 可横向滚动 + 下方分隔线 */
.status-duo {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 10px;
  overflow-x: auto;
  overflow-y: visible; /* 不在本容器里纵向滚动 */
  border-bottom: 1px dashed var(--line);
  padding: 12px;
  margin-bottom: 12px;
  width: 100%;
}

/* ===== 宽屏布局：左侧边栏（上：用户信息，下：文文新闻），右侧为主内容 ===== */
@media (min-width: 1100px) {
  /* 整体改为双列网格：左 380px 固定列，右自适应 */
  .status-ui-container {
    display: grid; /* 两列网格 */
    grid-template-columns: 380px minmax(0, 1fr); /* 左固定、右自适应 */
    grid-template-rows: auto; /* 单行，随内容自然增高 */
    grid-auto-rows: auto; /* 如产生隐式行，也随内容增高 */
  }
  /* 左列：把 duo 改为竖排，并占据左侧整列；右侧就是原本的 .status-main-content */
  .status-duo {
    grid-column: 1;
    grid-row: 1; /* 只占第一行，避免隐式行与行高计算的副作用 */
    flex-direction: column; /* 竖排：上 users，下 news */
    align-items: stretch;
    overflow-y: visible;
    overflow-x: hidden;
    border-right: 1px dashed var(--line);
    border-bottom: none; /* 顶部边线换成右侧分隔线 */
    padding: 12px;
    margin-bottom: 0;
    max-height: none; /* 明确不限制高度 */
  }
  .status-main-content {
    grid-column: 2;
  }

  /* 左侧两块在竖排时的分隔线与弹性 */
  .status-duo > .user-state-container {
    flex: 0 0 auto;
    border-right: none;
    border-bottom: 1px solid var(--line);
  }
}

@media (max-width: 768px) {
  .status-ui-container {
    flex-direction: column;
    margin: 5px;
  }
}
</style>
