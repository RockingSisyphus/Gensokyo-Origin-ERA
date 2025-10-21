<template>
  <button class="aya-news-button-open" @click="emit('close-news')">
    新闻
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits(['close-news']);
</script>

<style lang="scss" scoped>
.aya-news-button-open {
  padding: 12px 14px; /* 展开时按钮“变大” */
  border: 1px solid var(--line);
  border-bottom-left-radius: 0; /* 去底部圆角以与下方卡片无缝衔接 */
  border-bottom-right-radius: 0;
  background-color: var(--bg);
  color: var(--ink);
  cursor: pointer;
  width: 100%;
  box-shadow: 0 2px 0 var(--line) inset; /* 轻分隔感 */
  transition: padding 0.15s ease;

  &:hover {
    background-color: var(--paper);
  }
}
</style>
