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
import type { PropType } from 'vue';
import type { Stat } from '../../../GSKO-BASE/schema/stat';
import type { Runtime } from '../../../GSKO-BASE/schema/runtime';
import type { Character } from '../../../GSKO-BASE/schema/character';
import StyledProgressBar from '../common/StyledProgressBar.vue';

const props = defineProps({
  character: {
    type: Object as PropType<Character & { name: string }>,
    required: true,
  },
  statWithoutMeta: {
    type: Object as PropType<Stat | null>,
    required: true,
  },
  runtime: {
    type: Object as PropType<Runtime | null>,
    required: true,
  },
  size: {
    type: String as PropType<'small' | 'large'>,
    required: true,
  },
});

// --- 数据计算 ---
const affectionValue = computed(() => props.character?.好感度 || 0);
const loveThreshold = computed(() => Number(props.statWithoutMeta?.config?.affection?.loveThreshold) || 100);
const hateThreshold = computed(() => Number(props.statWithoutMeta?.config?.affection?.hateThreshold) || -100);

const affectionStage = computed(() => {
  if (!props.runtime || !props.character?.name) return '—';
  return props.runtime.character?.chars[props.character.name]?.affectionStage?.name || '—';
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
