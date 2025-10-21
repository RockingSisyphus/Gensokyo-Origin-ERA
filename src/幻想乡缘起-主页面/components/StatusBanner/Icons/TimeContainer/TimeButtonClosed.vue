<template>
  <button id="banner-time-closed" class="banner-chip" @click="$emit('open-calendar')">
    <span class="emoji">⏰</span>
    <span>{{ timeText }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  clockInfo: {
    hm: string;
    periodName: string;
    iso: string;
  } | null;
}>();

defineEmits(['open-calendar']);

const timeText = computed(() => {
  if (!props.clockInfo) return '—:—';
  return props.clockInfo.hm
    ? `${props.clockInfo.hm} · ${props.clockInfo.periodName || ''}`
    : props.clockInfo.iso || '—';
});
</script>

<style lang="scss" scoped>
.emoji {
  margin-right: 0;
  font-size: 1.1em;
}

.banner-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 6px 10px;
  background: color-mix(in srgb, var(--paper) 90%, var(--tab-active) 10%);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-weight: 700;
  color: var(--ink);
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.08s ease,
    box-shadow 0.12s ease,
    background 0.2s ease;
}
.banner-chip:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
.banner-chip:active {
  transform: translateY(1px) scale(0.99);
}
</style>
