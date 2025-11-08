<template>
  <button id="banner-time-open" class="banner-chip-open" @click="$emit('close-calendar')">
    <span class="emoji">📅</span>
    <span>日历</span>
    <span class="close-icon">收起</span>
  </button>
</template>

<script setup lang="ts">
defineEmits(['close-calendar']);
</script>

<style lang="scss" scoped>
.banner-chip-open {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  background: var(--tab-active);
  border: 1px solid var(--line);
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  font-weight: 700;
  color: var(--ink-bright);
  cursor: pointer;
  user-select: none;
}

.emoji {
  font-size: 1.2em;
  margin-right: 8px;
}

.close-icon {
  font-size: 0.9em;
  color: var(--ink);
}
</style>
