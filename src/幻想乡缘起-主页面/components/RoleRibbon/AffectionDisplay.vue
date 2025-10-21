<template>
  <div ref="root" class="affection-display role-card">
    <strong>好感度：</strong>
    <span class="aff-num">{{ affectionValue }}</span>
    <span class="aff-stage">{{ affectionStage }}</span>
    <div class="mini-bar" :class="{ 'small-bar': size === 'small' }">
      <div ref="valEl" class="val" :style="{ width: barWidth }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  stageLabelFrom,
  loveThresholdOf,
  hateThresholdOf,
  paintBar,
  burstBarParticles,
  burstCardParticles,
  ensureLoveTicker,
  ensureSkullTicker,
} from '../../backend/affection';

const props = defineProps<{
  character: any;
  statWithoutMeta: any;
  size: 'small' | 'large';
}>();

const root = ref<HTMLElement | null>(null);
const valEl = ref<HTMLElement | null>(null);

const affectionValue = computed(() => props.character?.['好感度'] || 0);
const loveThreshold = computed(() => loveThresholdOf(props.statWithoutMeta));
const hateThreshold = computed(() => hateThresholdOf(props.statWithoutMeta));

const affectionStage = computed(() => stageLabelFrom(props.statWithoutMeta, affectionValue.value));
const barWidth = computed(() => `${Math.min(Math.abs(affectionValue.value), 100)}%`);

let previousState: 'neutral' | 'love' | 'hate' = 'neutral';

const updateAffectionVisuals = () => {
  if (!root.value || !valEl.value) return;

  paintBar(valEl.value, affectionValue.value, loveThreshold.value, hateThreshold.value);

  let currentState: 'neutral' | 'love' | 'hate' = 'neutral';
  if (affectionValue.value >= loveThreshold.value) {
    currentState = 'love';
  } else if (affectionValue.value <= hateThreshold.value) {
    currentState = 'hate';
  }

  if (currentState !== previousState) {
    if (currentState === 'love') {
      burstCardParticles(root.value, 'heart', 10);
      burstBarParticles(valEl.value, 'heart', 5);
    } else if (currentState === 'hate') {
      burstCardParticles(root.value, 'skull', 8);
      burstBarParticles(valEl.value, 'skull', 5);
    }
  }
  
  ensureLoveTicker(root.value, currentState === 'love');
  ensureSkullTicker(root.value, currentState === 'hate');

  previousState = currentState;
};

watch(
  () => [props.character, props.statWithoutMeta],
  () => {
    updateAffectionVisuals();
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  updateAffectionVisuals();
});

onUnmounted(() => {
  if (root.value) {
    ensureLoveTicker(root.value, false);
    ensureSkullTicker(root.value, false);
  }
});
</script>

<style lang="scss" scoped>
.affection-display {
  position: relative; /* This is the key fix to contain the absolute positioned particles */
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
}

.aff-stage {
  font-size: 0.9em;
  color: var(--muted);
}

.mini-bar {
  height: 10px;
  background: var(--bar-bg);
  border: 1px solid var(--line);
  border-radius: 5px;
  overflow: hidden;
  position: relative;
  flex-grow: 1;
}

.mini-bar.small-bar {
  height: 8px;
  max-width: 80px;
}

.mini-bar .val {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #c0a58a, #8c7b6a);
  transition: width 0.3s ease;
}
</style>
