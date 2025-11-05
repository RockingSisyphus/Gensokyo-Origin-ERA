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
        <div class="GensokyoOrigin-RoleDetailPopup-detail-item">
          <strong>居住地:</strong> {{ toText(character.居住地区) }}
        </div>
        <div class="GensokyoOrigin-RoleDetailPopup-detail-item full-width">
          <strong>当前决策:</strong> {{ decisionText }}
        </div>
      </div>

      <!-- Affection Details -->
      <div v-if="affectionStageInfo" class="GensokyoOrigin-RoleDetailPopup-section">
        <h3 class="GensokyoOrigin-RoleDetailPopup-section-title">好感度阶段: {{ affectionStageInfo.name }}</h3>
        <p class="GensokyoOrigin-RoleDetailPopup-section-desc">{{ affectionStageInfo.describe }}</p>
        <div class="GensokyoOrigin-RoleDetailPopup-details-grid">
          <div class="GensokyoOrigin-RoleDetailPopup-detail-item">
            <strong>耐心值:</strong> {{ toText(affectionStageInfo.patienceUnit) }}
          </div>
          <div v-if="affectionStageInfo.affectionGrowthLimit" class="GensokyoOrigin-RoleDetailPopup-detail-item">
            <strong>好感增长上限:</strong> 软上限 {{ affectionStageInfo.affectionGrowthLimit.max }}, 超出后除以 {{ affectionStageInfo.affectionGrowthLimit.divisor }}
          </div>
          <div v-if="affectionStageInfo.visit" class="GensokyoOrigin-RoleDetailPopup-detail-item full-width">
            <strong>拜访规则:</strong>
            {{ affectionStageInfo.visit.enabled ? '会' : '不会' }}拜访。基础概率 {{ ((affectionStageInfo.visit.probBase ?? 0) * 100).toFixed(0) }}%, 好感影响 {{ ((affectionStageInfo.visit.probK ?? 0) * 100).toFixed(0) }}%。冷却刷新于 {{ affectionStageInfo.visit.coolUnit }}
          </div>
          <div v-if="affectionStageInfo.forgettingSpeed?.length" class="GensokyoOrigin-RoleDetailPopup-detail-item full-width">
            <strong>遗忘规则:</strong>
            <span v-for="(rule, index) in affectionStageInfo.forgettingSpeed" :key="index">
              于 {{ rule.triggerFlag }} 触发, 降低 {{ rule.decrease }} 点好感。
            </span>
          </div>
        </div>
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

defineEmits(['close']);

const particleEmitter = ref<InstanceType<typeof ParticleEmitter> | null>(null);

const charRuntimeData = computed(() => {
  if (!props.runtime?.character?.chars || !props.character.name) return null;
  return props.runtime.character.chars[props.character.name];
});

const affectionStageInfo = computed(() => charRuntimeData.value?.affectionStage);

const decisionText = computed(() => {
  const decision = charRuntimeData.value?.decision;
  const companionDecision = charRuntimeData.value?.companionDecision;

  if (decision) {
    let text = `正在 ${toText(decision.do)}`;
    if (decision.to) text += ` 前往 ${toText(decision.to)}`;
    if (decision.from) text += ` (从 ${toText(decision.from)} 出发)`;
    return text;
  }
  if (companionDecision) {
    return `原本计划 ${toText(companionDecision.do)}, 但因与你同行而暂缓。`;
  }
  return '—';
});

const toText = (v: any) => {
  if (Array.isArray(v)) return v.length ? v.join('；') : '—';
  if (v == null || v === '') return '—';
  return String(v);
};

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

.GensokyoOrigin-RoleDetailPopup-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed var(--line);
}

.GensokyoOrigin-RoleDetailPopup-section-title {
  font-size: 1.1em;
  font-weight: 700;
  margin-bottom: 8px;
}

.GensokyoOrigin-RoleDetailPopup-section-desc {
  font-size: 0.9em;
  color: var(--muted);
  margin-bottom: 12px;
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
