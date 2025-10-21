<template>
  <button class="status-sidebar-button-closed" @click="emit('open-sidebar')">用户信息</button>
</template>

<script setup lang="ts">
const emit = defineEmits(['open-sidebar']);
</script>

<style lang="scss" scoped>
.status-sidebar-button-closed {
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
