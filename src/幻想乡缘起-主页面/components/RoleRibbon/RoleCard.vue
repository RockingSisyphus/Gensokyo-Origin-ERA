<template>
  <div class="GensokyoOrigin-RoleCard-wrapper" @click="$emit('show-details', character)">
    <div class="GensokyoOrigin-RoleCard-header">
      <div class="GensokyoOrigin-RoleCard-avatar">{{ character.name.slice(0, 1) }}</div>
      <div>
        <div class="GensokyoOrigin-RoleCard-name">{{ character.name }}</div>
        <div class="GensokyoOrigin-RoleCard-meta">{{ character['所在地区'] || '未知' }}</div>
      </div>
    </div>
    <AffectionDisplay :character="character" :stat-without-meta="statWithoutMeta" :runtime="runtime" size="small" />
    <ParticleEmitter
      ref="particleEmitter"
      :active="affectionState === 'love' || affectionState === 'hate'"
      :particle-type="affectionState === 'hate' ? 'skull' : 'heart'"
      :emission-rate="2"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PropType } from 'vue';
import type { Stat } from '../../../GSKO-BASE/schema/stat';
import type { Runtime } from '../../../GSKO-BASE/schema/runtime';
import type { Character } from '../../../GSKO-BASE/schema/character';
import AffectionDisplay from './AffectionDisplay.vue';
import ParticleEmitter from '../common/ParticleEmitter.vue';

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
});

defineEmits(['show-details']);

const particleEmitter = ref<InstanceType<typeof ParticleEmitter> | null>(null);

// --- 数据计算 (与粒子效果相关) ---
const affectionValue = computed(() => props.character?.好感度 || 0);
const loveThreshold = computed(() => Number(props.statWithoutMeta?.config?.affection?.loveThreshold) || 100);
const hateThreshold = computed(() => Number(props.statWithoutMeta?.config?.affection?.hateThreshold) || -100);

const affectionState = computed<'neutral' | 'love' | 'hate'>(() => {
  if (affectionValue.value >= loveThreshold.value) return 'love';
  if (affectionValue.value <= hateThreshold.value) return 'hate';
  return 'neutral';
});

// --- 效果触发 ---
watch(affectionState, (newState, oldState) => {
  if (newState !== oldState && particleEmitter.value) {
    if (newState === 'love') {
      particleEmitter.value.burst('heart', 10);
    } else if (newState === 'hate') {
      particleEmitter.value.burst('skull', 8);
    }
  }
});
</script>

<style lang="scss">
.GensokyoOrigin-RoleCard-wrapper {
  position: relative; /* 确保粒子发射器能正确定位 */
  flex: 0 0 220px;
  min-width: 0;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 10px;
  scroll-snap-align: start;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: color-mix(in srgb, var(--bg) 90%, var(--ink) 10%);
  }
}

.GensokyoOrigin-RoleCard-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--line);
}

.GensokyoOrigin-RoleCard-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--avatar-bg);
  display: grid;
  place-items: center;
  font-weight: 700;
  color: var(--muted);
  flex-shrink: 0;
}

.GensokyoOrigin-RoleCard-name {
  font-weight: 700;
  font-size: 0.95em;
}

.GensokyoOrigin-RoleCard-meta {
  font-size: 0.8em;
  color: var(--muted);
}
</style>
