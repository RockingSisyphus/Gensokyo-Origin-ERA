<template>
  <div class="font-size-controls">
    <button id="decrease-font" class="font-size-btn">−</button>
    <button id="increase-font" class="font-size-btn">+</button>
  </div>
</template>

<script setup lang="ts">
import { defineExpose, onMounted, ref } from 'vue';
import { ERA_VARIABLE_PATH } from '../../../utils/constants';
import { updateEraVariable } from '../../../utils/eraWriter';
import { get } from '../../../utils/format';
import { Logger } from '../../../utils/log';

const logger = new Logger();

// 内部状态，存储当前字号百分比
const currentPercent = ref(100);

// 步进值
const stepPct = ref(10);

// 合法区间
const clamp = (n: number) => Math.max(60, Math.min(200, Math.floor(Number(n) || 100)));

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

/**
 * @description 从 stat_data 更新字号。由 era:writeDone 事件触发。
 * @param {object} statWithoutMeta - 包含所有状态数据的根对象。
 */
const updateFontSize = (statWithoutMeta: object) => {
  const funcName = 'updateFontSize';
  if (!statWithoutMeta || typeof statWithoutMeta !== 'object') {
    logger.warn(funcName, '调用失败：传入的 statWithoutMeta 无效。', statWithoutMeta);
    return;
  }

  // 从 statWithoutMeta.config.ui.mainFontPercent 读取字号
  const newPercent = get(statWithoutMeta, ERA_VARIABLE_PATH.MAIN_FONT_PERCENT, 100);
  const clampedPercent = clamp(Number(newPercent));

  // 从 statWithoutMeta.config.ui.fontScaleStepPct 读取步进值
  stepPct.value = get(statWithoutMeta, ERA_VARIABLE_PATH.FONT_SCALE_STEP_PCT, 10);

  currentPercent.value = clampedPercent;
  applyToDOM(clampedPercent);
  logger.log(funcName, `从 statWithoutMeta 更新字号为: ${clampedPercent}%`);
};

onMounted(() => {
  const inc = document.getElementById('increase-font');
  const dec = document.getElementById('decrease-font');

  if (inc) {
    inc.onclick = () => {
      const newValue = clamp(currentPercent.value + stepPct.value);
      // 乐观更新 UI
      currentPercent.value = newValue;
      applyToDOM(newValue);
      // 通过 era 事件请求更新
      updateEraVariable(ERA_VARIABLE_PATH.MAIN_FONT_PERCENT, newValue);
    };
  }

  if (dec) {
    dec.onclick = () => {
      const newValue = clamp(currentPercent.value - stepPct.value);
      // 乐观更新 UI
      currentPercent.value = newValue;
      applyToDOM(newValue);
      // 通过 era 事件请求更新
      updateEraVariable(ERA_VARIABLE_PATH.MAIN_FONT_PERCENT, newValue);
    };
  }
  logger.log('onMounted', '按钮事件已绑定。');
});

// 暴露 updateFontSize 函数，以便外部可以调用。
defineExpose({
  updateFontSize,
});
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
