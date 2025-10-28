<template>
  <div class="GensokyoOrigin-RoleDetailPopup-overlay" @click.self="$emit('close')">
    <div class="GensokyoOrigin-RoleDetailPopup-popup">
      <button class="GensokyoOrigin-RoleDetailPopup-close-btn" @click="$emit('close')">&times;</button>
      <div class="GensokyoOrigin-RoleDetailPopup-header">
        <div class="GensokyoOrigin-RoleDetailPopup-avatar">{{ character.name.slice(0, 1) }}</div>
        <div>
          <div class="GensokyoOrigin-RoleDetailPopup-name">{{ character.name }}</div>
          <div class="GensokyoOrigin-RoleDetailPopup-meta">{{ character['所在地区'] || '未知' }}</div>
        </div>
      </div>
      <div class="GensokyoOrigin-RoleDetailPopup-details-grid">
        <div class="GensokyoOrigin-RoleDetailPopup-detail-item"><strong>年龄:</strong> {{ toText(character['年龄']) }}</div>
        <div class="GensokyoOrigin-RoleDetailPopup-detail-item"><strong>性别:</strong> {{ toText(character['性别']) }}</div>
        <div class="GensokyoOrigin-RoleDetailPopup-detail-item"><strong>身份:</strong> {{ toText(character['身份']) }}</div>
        <div class="GensokyoOrigin-RoleDetailPopup-detail-item"><strong>居住地:</strong> {{ toText(character['居住地区']) }}</div>
        <div class="GensokyoOrigin-RoleDetailPopup-detail-item full-width"><strong>性格:</strong> {{ toText(character['性格']) }}</div>
        <div class="GensokyoOrigin-RoleDetailPopup-detail-item full-width"><strong>外貌:</strong> {{ toText(character['外貌']) }}</div>
        <div class="GensokyoOrigin-RoleDetailPopup-detail-item full-width"><strong>人际关系:</strong> {{ toText(character['人际关系']) }}</div>
        <div class="GensokyoOrigin-RoleDetailPopup-detail-item full-width"><strong>当前目标:</strong> {{ toText(character['当前目标']) }}</div>
      </div>
      <AffectionDisplay :character="character" :stat-without-meta="statWithoutMeta" :runtime="runtime" size="large" />
      <ParticleEmitter
        ref="particleEmitter"
        :active="affectionState === 'love' || affectionState === 'hate'"
        :particle-type="affectionState === 'hate' ? 'skull' : 'heart'"
        :emission-rate="3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import AffectionDisplay from './AffectionDisplay.vue';
import ParticleEmitter from '../common/ParticleEmitter.vue';
import { get } from '../../utils/format';
import { ERA_VARIABLE_PATH } from '../../utils/constants';

const props = defineProps<{
  character: any;
  statWithoutMeta: any;
  runtime: any;
}>();

defineEmits(['close']);

const particleEmitter = ref<InstanceType<typeof ParticleEmitter> | null>(null);

const toText = (v: any) => {
  if (Array.isArray(v)) return v.length ? v.join('；') : '—';
  if (v == null || v === '') return '—';
  return String(v);
};

// --- 数据计算 (与粒子效果相关) ---
const affectionValue = computed(() => props.character?.['好感度'] || 0);
const loveThreshold = computed(() => Number(get(props.statWithoutMeta, ERA_VARIABLE_PATH.AFFECTION_LOVE_THRESHOLD, 100)));
const hateThreshold = computed(() => Number(get(props.statWithoutMeta, ERA_VARIABLE_PATH.AFFECTION_HATE_THRESHOLD, -100)));

const affectionState = computed<'neutral' | 'love' | 'hate'>(() => {
  if (affectionValue.value >= loveThreshold.value) return 'love';
  if (affectionValue.value <= hateThreshold.value) return 'hate';
  return 'neutral';
});

// --- 效果触发 ---
watch(affectionState, (newState, oldState) => {
  if (newState !== oldState && particleEmitter.value) {
    if (newState === 'love') {
      particleEmitter.value.burst('heart', 15);
    } else if (newState === 'hate') {
      particleEmitter.value.burst('skull', 12);
    }
  }
});
</script>

<style lang="scss">
.GensokyoOrigin-RoleDetailPopup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.GensokyoOrigin-RoleDetailPopup-popup {
  position: relative;
  width: 90vw;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.GensokyoOrigin-RoleDetailPopup-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: var(--muted);
}

.GensokyoOrigin-RoleDetailPopup-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.GensokyoOrigin-RoleDetailPopup-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--avatar-bg);
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 700;
  color: var(--muted);
  flex-shrink: 0;
}

.GensokyoOrigin-RoleDetailPopup-name {
  font-size: 1.5em;
  font-weight: 700;
}

.GensokyoOrigin-RoleDetailPopup-meta {
  font-size: 1em;
  color: var(--muted);
}

.GensokyoOrigin-RoleDetailPopup-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.GensokyoOrigin-RoleDetailPopup-detail-item {
  background: var(--bg);
  padding: 8px;
  border-radius: 4px;
  font-size: 0.95em;

  strong {
    color: var(--muted);
    margin-right: 8px;
  }
}

.GensokyoOrigin-RoleDetailPopup-detail-item.full-width {
  grid-column: 1 / -1;
}
</style>
