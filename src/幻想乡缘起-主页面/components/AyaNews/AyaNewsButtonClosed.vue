<template>
  <button class="aya-news-button-closed" @click="emit('open-news')">新闻</button>
</template>

<script setup lang="ts">
const emit = defineEmits(['open-news']);
</script>

<style lang="scss" scoped>
.aya-news-button-closed {
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background-color: var(--bg);
  color: var(--ink);
  cursor: pointer;
  width: 100%;

  &:hover {
    background-color: var(--paper);
  }
}
</style>
