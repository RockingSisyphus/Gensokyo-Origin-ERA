<template>
  <!-- 可点击：天气（脚本预留，先占位） -->
  <button id="banner-weather" class="banner-chip" aria-expanded="false">
    <span class="emoji">☀️</span>
    <span id="banner-weather-text">—</span>
  </button>
</template>

<script setup lang="ts">
import { defineExpose } from 'vue';
import { text } from '../../../utils/mvu';

/**
 * @description 更新天气显示。
 * @param weather - 要显示的天气字符串。
 */
const update = (weather: string) => {
  text('banner-weather-text', weather || '—');
};

// 暴露 update 方法
defineExpose({
  update,
});
</script>

<style lang="scss" scoped>
/* 可点击的状态“胶囊” */
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

.emoji {
  margin-right: 0; /* 在父组件中已经有gap，这里不需要额外margin */
  font-size: 1.1em;
}
</style>
