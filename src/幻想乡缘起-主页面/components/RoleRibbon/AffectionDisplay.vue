<template>
  <div class="affection-display">
    <div class="info-line">
      <strong>好感度：</strong>
      <span class="aff-num">{{ affectionValue }}</span>
      <span class="aff-stage">{{ affectionStage }}</span>
    </div>
    <StyledProgressBar
      :value="affectionValue"
      :love-threshold="loveThreshold"
      :hate-threshold="hateThreshold"
      :size="size"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { get } from '../../utils/format';
import { ERA_VARIABLE_PATH } from '../../utils/constants';
import StyledProgressBar from '../common/StyledProgressBar.vue';

const props = defineProps<{
  character: any;
  statWithoutMeta: any;
  runtime: any;
  size: 'small' | 'large';
}>();

// --- 数据计算 ---
const affectionValue = computed(() => props.character?.['好感度'] || 0);
const loveThreshold = computed(() =>
  Number(get(props.statWithoutMeta, ERA_VARIABLE_PATH.AFFECTION_LOVE_THRESHOLD, 100)),
);
const hateThreshold = computed(() =>
  Number(get(props.statWithoutMeta, ERA_VARIABLE_PATH.AFFECTION_HATE_THRESHOLD, -100)),
);

const affectionStage = computed(() => {
  if (!props.runtime || !props.character?.name) return '—';
  return get(props.runtime, `chars.${props.character.name}.好感度等级`, '—');
});
</script>

<style lang="scss" scoped>
.affection-display {
  width: 100%;
}

.info-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
  margin-bottom: 4px;
}

.aff-stage {
  font-size: 0.9em;
  color: var(--muted);
  margin-left: auto;
}
</style>
