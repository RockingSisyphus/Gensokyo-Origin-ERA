<template>
  <div class="font-size-controls">
    <button id="decrease-font" class="font-size-btn" @click="decreaseFont">−</button>
    <button id="increase-font" class="font-size-btn" @click="increaseFont">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { UiConfig } from '../../../../GSKO-BASE/schema/ui';
import { ERA_VARIABLE_PATH } from '../../../utils/constants';
import { updateEraVariable } from '../../../utils/eraWriter';
import { Logger } from '../../../utils/log';

interface FontSizeControlsProps {
  uiConfig: UiConfig | null | undefined;
}

const props = defineProps<FontSizeControlsProps>();

const logger = new Logger();

const currentPercent = ref(100); // 当前字号百分比
const stepPct = ref(10); // 步进值

// 应用字号到 DOM
const applyToDOM = (pct: number) => {
  const content = document.getElementById('content_main');
  if (content) {
    content.style.fontSize = `${pct}%`;
    logger.log('applyToDOM', `已应用字号: ${pct}%`);
  } else {
    logger.warn('applyToDOM', '未找到 #content_main 元素。');
  }
};

// 合法区间
const clamp = (n: number | undefined) => Math.max(60, Math.min(200, Math.floor(Number(n) || 100)));

const sanitizeStep = (value: number | undefined) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 10;
  }
  return Math.floor(numeric);
};

const syncFromConfig = (percent?: number, step?: number) => {
  const clampedPercent = clamp(percent);
  const sanitizedStep = sanitizeStep(step);

  stepPct.value = sanitizedStep;
  currentPercent.value = clampedPercent;
  applyToDOM(clampedPercent);
  logger.log('syncFromConfig', `初始化字号: ${clampedPercent}%（步进: ${sanitizedStep}%）`);
};

const hasSyncedInitial = ref(false);

watch(
  () => props.uiConfig,
  uiConfig => {
    if (!uiConfig) {
      hasSyncedInitial.value = false;
      return;
    }
    if (hasSyncedInitial.value) {
      return;
    }
    syncFromConfig(uiConfig.mainFontPercent, uiConfig.fontScaleStepPct);
    hasSyncedInitial.value = true;
  },
  { immediate: true },
);

const persistFontSize = (pct: number) => {
  currentPercent.value = pct;
  applyToDOM(pct);
  updateEraVariable(ERA_VARIABLE_PATH.MAIN_FONT_PERCENT, pct);
};

const increaseFont = () => {
  const newValue = clamp(currentPercent.value + stepPct.value);
  persistFontSize(newValue);
};

const decreaseFont = () => {
  const newValue = clamp(currentPercent.value - stepPct.value);
  persistFontSize(newValue);
};
</script>

<style lang="scss" scoped>
.font-size-controls {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-bottom: 10px;
}
.font-size-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--line);
  background: var(--paper);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
}
</style>
