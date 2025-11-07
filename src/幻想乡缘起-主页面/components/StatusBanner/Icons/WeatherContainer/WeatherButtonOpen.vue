<template>
  <button id="banner-weather-open" class="banner-chip-open" @click="$emit('close-weather')">
    <div class="open-left">
      <span class="emoji">☀️</span>
      <div class="open-text">
        <span class="title">天气详情</span>
        <small class="summary">{{ summary }}</small>
      </div>
    </div>
    <span class="close-icon">收起</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  summary: string;
}>();

defineEmits<{
  (event: 'close-weather'): void;
}>();
</script>

<style lang="scss" scoped>
.banner-chip-open {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: var(--tab-active);
  border: 1px solid var(--line);
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  font-weight: 700;
  color: var(--ink-bright);
  cursor: pointer;
  user-select: none;
}

.open-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.open-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.emoji {
  font-size: 1.2em;
}

.title {
  font-size: 1em;
}

.summary {
  font-size: 0.78em;
  color: color-mix(in srgb, var(--ink-bright) 70%, white 30%);
}

.close-icon {
  font-size: 0.9em;
  color: var(--ink);
}
</style>
