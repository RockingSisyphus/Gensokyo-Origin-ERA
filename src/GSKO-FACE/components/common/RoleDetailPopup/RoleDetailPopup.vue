<template>
  <div class="GensokyoOrigin-RoleDetailPopup-overlay" @click.self="$emit('close')">
    <div class="GensokyoOrigin-RoleDetailPopup-popup">
      <button class="GensokyoOrigin-RoleDetailPopup-close-btn" @click="$emit('close')">&times;</button>

      <!-- Left Column: Portrait -->
      <div class="GensokyoOrigin-RoleDetailPopup-portrait-section">
        <img
          v-if="character.pic"
          :src="character.pic"
          :alt="character.name"
          class="GensokyoOrigin-RoleDetailPopup-portrait-image"
        />
        <div v-else class="GensokyoOrigin-RoleDetailPopup-portrait-placeholder">
          <span>{{ character.name.slice(0, 1) }}</span>
        </div>
      </div>

      <!-- Right Column: Content -->
      <div class="GensokyoOrigin-RoleDetailPopup-content-section">
        <div class="GensokyoOrigin-RoleDetailPopup-header">
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
            <strong>目标:</strong> {{ decisionText }}
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
              <strong>好感增长上限:</strong> 软上限 {{ affectionStageInfo.affectionGrowthLimit.max }}, 超出后除以
              {{ affectionStageInfo.affectionGrowthLimit.divisor }}
            </div>
            <div v-if="affectionStageInfo.visit" class="GensokyoOrigin-RoleDetailPopup-detail-item full-width">
              <strong>拜访规则:</strong>
              {{ affectionStageInfo.visit.enabled ? '会' : '不会' }}拜访。基础概率
              {{ ((affectionStageInfo.visit.probBase ?? 0) * 100).toFixed(0) }}%, 好感影响
              {{ ((affectionStageInfo.visit.probK ?? 0) * 100).toFixed(0) }}%。冷却刷新于
              {{ affectionStageInfo.visit.coolUnit }}
            </div>
            <div
              v-if="affectionStageInfo.forgettingSpeed?.length"
              class="GensokyoOrigin-RoleDetailPopup-detail-item full-width"
            >
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
        <div class="role-detail-popup-actions">
          <button class="role-settings-btn" :disabled="!characterSettings" @click="openSettingsModal">角色设定</button>
        </div>
      </div>
    </div>
  </div>
  <CharacterSettingsModal
    :open="showSettingsModal"
    :settings="characterSettings"
    :legal-locations="legalLocations"
    :stat="statWithoutMeta"
    @close="closeSettingsModal"
    @save="handleRoleSettingsSave"
  />
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, ref, watch } from 'vue';
import type { Character } from '../../../../GSKO-BASE/schema/character';
import type { CharacterSettings } from '../../../../GSKO-BASE/schema/character-settings';
import type { Runtime } from '../../../../GSKO-BASE/schema/runtime';
import type { Stat } from '../../../../GSKO-BASE/schema/stat';
import { updateEraVariable } from '../../../utils/eraWriter';
import AffectionDisplay from '../../RoleRibbon/AffectionDisplay.vue';
import ParticleEmitter from '../ParticleEmitter.vue';
import CharacterSettingsModal from './CharacterSettingsModal.vue';

const props = defineProps({
  character: {
    type: Object as PropType<Character & { name: string; id: string }>,
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
const showSettingsModal = ref(false);

// 获取 runtime 里的角色运行数据，使用角色 ID 作为 key，避免显示名的变化影响取值

const charRuntimeData = computed(() => {
  if (!props.runtime?.character?.chars || !props.character.id) return null;
  return props.runtime.character.chars[props.character.id];
});

const affectionStageInfo = computed(() => charRuntimeData.value?.affectionStage);
const characterSettings = computed(() => props.runtime?.characterSettings?.[props.character.id] ?? null);
const legalLocations = computed(() => {
  const locations = props.runtime?.area?.legal_locations ?? [];
  const names = locations.map(loc => loc.name).filter(Boolean);
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, 'zh-Hans'));
});

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

const openSettingsModal = () => {
  if (!characterSettings.value) {
    if (typeof toastr !== 'undefined') toastr.warning('runtime 中暂未找到该角色的设定镜像');
    return;
  }
  showSettingsModal.value = true;
};

const closeSettingsModal = () => {
  showSettingsModal.value = false;
};

const handleRoleSettingsSave = (payload: CharacterSettings) => {
  try {
    updateEraVariable(`runtime.characterSettings.${payload.id}`, payload);
    showSettingsModal.value = false;
    if (typeof toastr !== 'undefined') toastr.success('角色设定已提交写入请求');
  } catch (error) {
    console.error('写入角色设定失败', error);
    if (typeof toastr !== 'undefined') toastr.error('写入角色设定失败');
  }
};

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
  max-width: 800px; /* Increased max-width for two-column layout */
  max-height: 80vh;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  overflow: hidden; /* Hide overflow on the main container */
}

.GensokyoOrigin-RoleDetailPopup-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border: none;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  font-size: 20px;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
  color: white;
  z-index: 10;
  transition: background 0.2s ease;
  &:hover {
    background: rgba(0, 0, 0, 0.6);
  }
}

.GensokyoOrigin-RoleDetailPopup-portrait-section {
  flex: 0 0 300px; /* Fixed width for the portrait */
  position: relative;
  background-color: var(--bg);
}

.GensokyoOrigin-RoleDetailPopup-portrait-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.GensokyoOrigin-RoleDetailPopup-portrait-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 6rem;
  font-weight: 800;
  color: color-mix(in srgb, var(--muted) 50%, transparent);
}

.GensokyoOrigin-RoleDetailPopup-content-section {
  flex: 1;
  min-width: 0;
  padding: 24px;
  overflow-y: auto; /* Allow content to scroll */
}

.GensokyoOrigin-RoleDetailPopup-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.GensokyoOrigin-RoleDetailPopup-name {
  font-size: 1.8em;
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

.role-detail-popup-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.role-settings-btn {
  padding: 10px 20px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  background: linear-gradient(135deg, var(--btn-accent), color-mix(in srgb, var(--btn-accent) 85%, white 15%));
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.role-settings-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.role-settings-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 26px rgba(0, 0, 0, 0.2);
}

@media (max-width: 640px) {
  .GensokyoOrigin-RoleDetailPopup-popup {
    flex-direction: column;
    width: 95vw;
    max-height: 90vh;
  }

  .GensokyoOrigin-RoleDetailPopup-portrait-section {
    flex: 0 0 auto; /* Allow it to size based on content */
    width: 100%;
    aspect-ratio: 4 / 3; /* Adjust aspect ratio for smaller view */
  }

  .GensokyoOrigin-RoleDetailPopup-content-section {
    padding: 16px; /* Reduce padding on small screens */
  }

  .GensokyoOrigin-RoleDetailPopup-name {
    font-size: 1.5em;
  }
}
</style>
