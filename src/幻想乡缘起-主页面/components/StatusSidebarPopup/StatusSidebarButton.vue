<template>
  <button class="status-sidebar-button" :class="{ expanded: props.expanded }" @click="emit('toggle-sidebar')">
    用户信息
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits(['toggle-sidebar']);
const props = defineProps<{ expanded?: boolean }>();
</script>

<style lang="scss" scoped>
.status-sidebar-button {
  /* 在这里添加按钮样式 */
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background-color: var(--bg);
  color: var(--ink);
  cursor: pointer;

  &:hover {
    background-color: var(--paper);
  }
}
.status-sidebar-button.expanded {
  padding: 12px 14px; /* 展开时按钮“变大” */
  border-bottom-left-radius: 0; /* 去底部圆角以与下方卡片无缝衔接 */
  border-bottom-right-radius: 0;
  box-shadow: 0 2px 0 var(--line) inset; /* 轻分隔感 */
  transition: padding 0.15s ease;
}
</style>
