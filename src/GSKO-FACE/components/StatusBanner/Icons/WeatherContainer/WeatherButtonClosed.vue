<template>
  <button
    id="banner-weather-closed"
    class="banner-chip"
    :class="{ 'banner-chip--disabled': disabled }"
    :disabled="disabled"
    @click="$emit('open-weather')"
  >
    <span class="emoji">🌤️</span>
    <span class="summary">{{ summary }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  summary: string;
  disabled?: boolean;
}>();

defineEmits<{
  (event: 'open-weather'): void;
}>();
</script>

<style lang="scss" scoped>
.banner-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.65em;
  padding: 8px 14px;
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
  min-width: 150px;
}

.banner-chip:hover:not(.banner-chip--disabled) {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
.banner-chip:active:not(.banner-chip--disabled) {
  transform: translateY(1px) scale(0.99);
}
.banner-chip--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.emoji {
  font-size: 1.2em;
}

.summary {
  font-size: 1em;
}
</style>
