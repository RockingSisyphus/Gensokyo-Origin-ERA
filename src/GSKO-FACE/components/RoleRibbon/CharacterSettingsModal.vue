<template>
  <Teleport to="body">
    <div v-if="open" class="role-settings-modal">
      <div class="role-settings-modal__backdrop" @click="emitClose"></div>
      <div class="role-settings-modal__panel" role="dialog" aria-modal="true">
        <header class="role-settings-modal__header">
          <div>
            <h2>角色设定</h2>
            <p class="role-settings-modal__subtitle" v-if="editableSettings">ID：{{ editableSettings.id }}</p>
            <p class="role-settings-modal__subtitle" v-else>runtime.characterSettings 中没有该角色的镜像。</p>
          </div>
          <button type="button" class="role-settings-modal__close" aria-label="关闭" @click="emitClose">×</button>
        </header>

        <div v-if="editableSettings" class="role-settings-modal__body">
          <section class="role-settings-modal__section">
            <h3>基础信息</h3>
            <div class="form-grid form-grid--two">
              <label>
                <span>角色 ID</span>
                <input type="text" :value="editableSettings.id" disabled />
              </label>
              <label>
                <span>角色名称</span>
                <input v-model="editableSettings.name" type="text" />
              </label>
            </div>
          </section>

          <details class="role-settings-modal__section collapsible-section">
            <summary class="section-heading">
              <h3>好感阶段</h3>
              <button type="button" class="ghost-btn" @click.prevent="addAffectionStage">新增阶段</button>
            </summary>
            <p v-if="!editableSettings.affectionStages.length" class="empty-hint">暂无阶段。</p>
            <details
              v-for="(stage, index) in editableSettings.affectionStages"
              :key="`stage-${index}`"
              class="card collapsible-section"
            >
              <summary class="card__header">
                <div>
                  <h4>{{ stage.name || `阶段 ${index + 1}` }}</h4>
                  <small>阈值 {{ stage.threshold }}</small>
                </div>
                <button type="button" class="ghost-btn ghost-btn--danger" @click.prevent="removeAffectionStage(index)">
                  移除
                </button>
              </summary>
              <div class="form-grid form-grid--two">
                <label>
                  <span>阶段名称</span>
                  <input v-model="stage.name" type="text" />
                </label>
                <label>
                  <span>触发阈值</span>
                  <input v-model.number="stage.threshold" type="number" />
                </label>
                <label>
                  <span>阶段描述</span>
                  <textarea v-model="stage.describe" rows="2" />
                </label>
                <label>
                  <span>耐心单位</span>
                  <select v-model="stage.patienceUnit">
                    <option value="">—</option>
                    <option v-for="unit in TIME_UNIT_OPTIONS" :key="unit" :value="unit">{{ unit }}</option>
                  </select>
                </label>
              </div>
              <details class="sub-card collapsible-section">
                <summary class="sub-card__header">
                  <h5>拜访规则</h5>
                  <label class="toggle" @click.prevent>
                    <input
                      type="checkbox"
                      :checked="Boolean(stage.visit)"
                      @change="toggleVisit(stage, ($event.target as HTMLInputElement).checked)"
                    />
                    <span>启用</span>
                  </label>
                </summary>
                <div v-if="stage.visit" class="form-grid form-grid--two form-grid--equal">
                  <label>
                    <span>是否尝试拜访</span>
                    <select v-model="stage.visit.enabled">
                      <option :value="true">会来访</option>
                      <option :value="false">不会来访</option>
                    </select>
                  </label>
                  <label>
                    <span>基础概率 (0-1)</span>
                    <input v-model.number="stage.visit.probBase" type="number" step="0.01" min="0" max="1" />
                  </label>
                  <label>
                    <span>好感影响系数</span>
                    <input v-model.number="stage.visit.probK" type="number" step="0.001" />
                  </label>
                  <label>
                    <span>冷却单位</span>
                    <select v-model="stage.visit.coolUnit">
                      <option value="">—</option>
                      <option v-for="unit in TIME_UNIT_OPTIONS" :key="unit" :value="unit">{{ unit }}</option>
                    </select>
                  </label>
                </div>
              </details>
              <details class="sub-card collapsible-section">
                <summary class="sub-card__header">
                  <h5>遗忘速度</h5>
                  <button type="button" class="ghost-btn ghost-btn--small" @click.prevent="addForgettingRule(stage)">
                    新增规则
                  </button>
                </summary>
                <p v-if="!stage.forgettingSpeed?.length" class="empty-hint">暂无遗忘规则。</p>
                <div
                  v-for="(rule, ruleIndex) in stage.forgettingSpeed"
                  :key="`rule-${index}-${ruleIndex}`"
                  class="rule-row"
                >
                  <label>
                    <span>触发 Flag</span>
                    <select
                      :value="rule.triggerFlag"
                      @change="handleTriggerFlagSelect(rule, ($event.target as HTMLSelectElement).value)"
                    >
                      <option value="">—</option>
                      <option v-for="flag in TRIGGER_FLAG_OPTIONS" :key="flag" :value="flag">
                        {{ formatFlagLabel(flag) }}
                      </option>
                    </select>
                  </label>
                  <label>
                    <span>减少值</span>
                    <input v-model.number="rule.decrease" type="number" />
                  </label>
                  <button
                    type="button"
                    class="ghost-btn ghost-btn--danger ghost-btn--small"
                    @click="removeForgettingRule(stage, ruleIndex)"
                  >
                    删除
                  </button>
                </div>
              </details>
              <details class="sub-card collapsible-section">
                <summary class="sub-card__header">
                  <h5>好感增长上限</h5>
                  <label class="toggle" @click.prevent>
                    <input
                      type="checkbox"
                      :checked="Boolean(stage.affectionGrowthLimit)"
                      @change="toggleGrowthLimit(stage, ($event.target as HTMLInputElement).checked)"
                    />
                    <span>启用</span>
                  </label>
                </summary>
                <div v-if="stage.affectionGrowthLimit" class="form-grid form-grid--two form-grid--equal">
                  <label>
                    <span>软上限</span>
                    <input v-model.number="stage.affectionGrowthLimit.max" type="number" />
                  </label>
                  <label>
                    <span>超额除数</span>
                    <input v-model.number="stage.affectionGrowthLimit.divisor" type="number" />
                  </label>
                </div>
              </details>
            </details>
          </details>

          <details class="role-settings-modal__section collapsible-section">
            <summary class="section-heading">
              <h3>特殊行动 (specials)</h3>
              <button type="button" class="ghost-btn" @click.prevent="addEntry('specials')">新增特殊行动</button>
            </summary>
            <p v-if="!editableSettings.specials.length" class="empty-hint">暂无特殊行动。</p>
            <details
              v-for="(entry, index) in editableSettings.specials"
              :key="`special-${index}`"
              class="card collapsible-section"
            >
              <summary class="card__header">
                <h4>{{ entry.action.do || `特殊行动 ${index + 1}` }}</h4>
                <button
                  type="button"
                  class="ghost-btn ghost-btn--danger"
                  @click.prevent="removeEntry('specials', index)"
                >
                  移除
                </button>
              </summary>
              <CharacterEntryEditor
                :entry="entry"
                :legal-locations="legalLocationOptions"
                :festival-options="festivalOptions"
                :list-key="`specials-${index}`"
                show-priority
              />
            </details>
          </details>

          <details class="role-settings-modal__section collapsible-section">
            <summary class="section-heading">
              <h3>日常行动 (routine)</h3>
              <button type="button" class="ghost-btn" @click.prevent="addEntry('routine')">新增日常行动</button>
            </summary>
            <p v-if="!editableSettings.routine.length" class="empty-hint">暂无日常行动。</p>
            <details
              v-for="(entry, index) in editableSettings.routine"
              :key="`routine-${index}`"
              class="card collapsible-section"
            >
              <summary class="card__header">
                <h4>{{ entry.action.do || `日常行动 ${index + 1}` }}</h4>
                <button
                  type="button"
                  class="ghost-btn ghost-btn--danger"
                  @click.prevent="removeEntry('routine', index)"
                >
                  移除
                </button>
              </summary>
              <CharacterEntryEditor
                :entry="entry"
                :legal-locations="legalLocationOptions"
                :festival-options="festivalOptions"
                :list-key="`routine-${index}`"
              />
            </details>
          </details>
        </div>

        <div v-else class="role-settings-modal__empty">
          <p>runtime.characterSettings 中未找到该角色数据。</p>
          <p class="empty-hint">保存或导出功能不可用。</p>
        </div>

        <footer class="role-settings-modal__footer">
          <button type="button" class="ghost-btn" :disabled="!editableSettings" @click="exportSettings">
            导出 JSON
          </button>
          <span class="footer-spacer"></span>
          <button type="button" class="ghost-btn" @click="emitClose">取消</button>
          <button type="button" class="primary-btn" :disabled="!editableSettings" @click="handleSave">保存</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { computed, ref, watch } from 'vue';
import type { PropType } from 'vue';
import CharacterEntryEditor from './CharacterEntryEditor.vue';
import type {
  CharacterSettings,
  AffectionStageWithForget,
  Entry,
  ForgettingRule,
} from '../../../GSKO-BASE/schema/character-settings';
import type { Stat } from '../../../GSKO-BASE/schema/stat';
import { formatFlagLabel, TIME_UNIT_OPTIONS, TRIGGER_FLAG_OPTIONS, isTriggerFlag } from './character-settings-helpers';

type EntryListKey = 'specials' | 'routine';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  settings: {
    type: Object as PropType<CharacterSettings | null>,
    default: null,
  },
  legalLocations: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  stat: {
    type: Object as PropType<Stat | null>,
    default: null,
  },
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: CharacterSettings): void;
}>();

const editableSettings = ref<CharacterSettings | null>(null);

watch(
  () => props.open,
  open => {
    if (open) {
      editableSettings.value = props.settings ? cloneDeep(props.settings) : null;
    }
  },
);

watch(
  () => props.settings,
  newSettings => {
    if (props.open) {
      editableSettings.value = newSettings ? cloneDeep(newSettings) : null;
    }
  },
);

const legalLocationOptions = computed(() => {
  const uniq = Array.from(new Set((props.legalLocations ?? []).filter(Boolean)));
  return uniq.sort((a, b) => a.localeCompare(b, 'zh-Hans'));
});

const festivalOptions = computed(() => {
  if (!props.stat?.festivals_list) return [];
  return Object.entries(props.stat.festivals_list).map(([key, festival]) => ({
    value: key,
    label: `${festival.name} (${key})`,
  }));
});

const addAffectionStage = () => {
  if (!editableSettings.value) return;
  editableSettings.value.affectionStages.push({
    threshold: 0,
    name: '未命名阶段',
    describe: '',
  });
};

const removeAffectionStage = (index: number) => {
  editableSettings.value?.affectionStages.splice(index, 1);
};

const toggleVisit = (stage: AffectionStageWithForget, enabled: boolean) => {
  if (enabled) {
    stage.visit = stage.visit ?? {
      enabled: true,
      probBase: 0,
      probK: 0,
      coolUnit: 'day',
    };
  } else {
    delete stage.visit;
  }
};

const addForgettingRule = (stage: AffectionStageWithForget) => {
  if (!stage.forgettingSpeed) stage.forgettingSpeed = [];
  stage.forgettingSpeed.push({
    triggerFlag: 'newDay',
    decrease: 1,
  });
};

const removeForgettingRule = (stage: AffectionStageWithForget, index: number) => {
  stage.forgettingSpeed?.splice(index, 1);
  if (!stage.forgettingSpeed?.length) delete stage.forgettingSpeed;
};

const toggleGrowthLimit = (stage: AffectionStageWithForget, enabled: boolean) => {
  if (enabled) {
    stage.affectionGrowthLimit = stage.affectionGrowthLimit ?? { max: 5, divisor: 2 };
  } else {
    delete stage.affectionGrowthLimit;
  }
};

const handleTriggerFlagSelect = (rule: ForgettingRule, value: string) => {
  rule.triggerFlag = value;
};

const addEntry = (list: EntryListKey) => {
  if (!editableSettings.value) return;
  editableSettings.value[list].push({
    when: {},
    action: { do: '' },
  });
};

const removeEntry = (list: EntryListKey, index: number) => {
  editableSettings.value?.[list].splice(index, 1);
};

const ensureWhen = (entry: Entry) => {
  if (!entry.when || typeof entry.when !== 'object') entry.when = {};
  return entry.when as Record<string, any>;
};

const sanitizeEntry = (entry: Entry): Entry => {
  const sanitized: Entry = {
    when: {},
    action: {
      do: entry.action.do?.trim() || '',
    },
  };
  if (entry.action.to && entry.action.to.trim()) sanitized.action.to = entry.action.to.trim();
  if (entry.action.from && entry.action.from.trim()) sanitized.action.from = entry.action.from.trim();
  if (entry.action.source && entry.action.source.trim()) sanitized.action.source = entry.action.source.trim();

  const when = ensureWhen(entry);
  if (when.byFlag?.length) sanitized.when.byFlag = Array.from(new Set(when.byFlag.filter(Boolean)));
  if (when.byNow) {
    const filtered: Record<string, any> = {};
    Object.entries(when.byNow).forEach(([key, value]) => {
      if (value === '' || value == null) return;
      filtered[key] = value;
    });
    if (Object.keys(filtered).length) sanitized.when.byNow = filtered;
  }
  if (when.byMonthDay && (when.byMonthDay.month != null || when.byMonthDay.day != null)) {
    sanitized.when.byMonthDay = { ...when.byMonthDay };
  }
  if (when.byFestival) {
    if (when.byFestival === 'ANY') sanitized.when.byFestival = 'ANY';
    else if (Array.isArray(when.byFestival)) {
      const list = when.byFestival.map(item => item.trim()).filter(Boolean);
      if (list.length) sanitized.when.byFestival = list;
    } else if (typeof when.byFestival === 'string') {
      const value = when.byFestival.trim();
      if (value) sanitized.when.byFestival = value;
    }
  }
  if (Object.keys(sanitized.when).length === 0) sanitized.when = {};

  if (typeof entry.priority === 'number' && !Number.isNaN(entry.priority)) {
    sanitized.priority = entry.priority;
  }
  return sanitized;
};

const sanitizeStage = (stage: AffectionStageWithForget): AffectionStageWithForget => {
  const next: AffectionStageWithForget = {
    threshold: Number(stage.threshold) || 0,
    name: stage.name?.trim() || '未命名阶段',
    describe: stage.describe?.toString().trim() || undefined,
  };
  if (stage.patienceUnit) next.patienceUnit = stage.patienceUnit;
  if (stage.visit) {
    next.visit = {
      enabled: stage.visit.enabled ?? true,
      probBase: stage.visit.probBase,
      probK: stage.visit.probK,
      coolUnit: stage.visit.coolUnit,
    };
  }
  if (stage.forgettingSpeed?.length) {
    next.forgettingSpeed = stage.forgettingSpeed
      .filter(rule => rule.triggerFlag && rule.decrease != null)
      .map(rule => ({
        triggerFlag: rule.triggerFlag.trim(),
        decrease: Number(rule.decrease) || 0,
      }))
      .filter(rule => rule.triggerFlag);
  }
  if (next.forgettingSpeed && !next.forgettingSpeed.length) delete next.forgettingSpeed;
  if (stage.affectionGrowthLimit) {
    const max = Number(stage.affectionGrowthLimit.max);
    const divisor = Number(stage.affectionGrowthLimit.divisor);
    if (!Number.isNaN(max) && !Number.isNaN(divisor)) next.affectionGrowthLimit = { max, divisor };
  }
  return next;
};

const sanitizeSettings = (settings: CharacterSettings): CharacterSettings => ({
  ...settings,
  name: settings.name?.trim() || settings.name || settings.id,
  affectionStages: settings.affectionStages.map(sanitizeStage),
  specials: settings.specials.map(sanitizeEntry),
  routine: settings.routine.map(sanitizeEntry),
});

const handleSave = () => {
  if (!editableSettings.value) return;
  emit('save', sanitizeSettings(editableSettings.value));
};

const exportSettings = () => {
  if (!editableSettings.value) return;
  const payload = sanitizeSettings(editableSettings.value);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${payload.id || 'character-settings'}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const emitClose = () => emit('close');
</script>

<style scoped>
.role-settings-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
}

.role-settings-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.role-settings-modal__panel {
  position: relative;
  background: var(--paper);
  border-radius: 16px;
  border: 1px solid var(--line);
  width: min(1080px, 96vw);
  max-height: 94vh;
  margin: 3vh auto;
  padding: 24px;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}

.role-settings-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.role-settings-modal__subtitle {
  margin-top: 4px;
  color: var(--muted);
  font-size: 0.9rem;
}

.role-settings-modal__close {
  border: none;
  background: transparent;
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--muted);
}

.role-settings-modal__body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.role-settings-modal__section {
  border: 1px dashed color-mix(in srgb, var(--line) 70%, transparent);
  border-radius: 12px;
  padding: 16px;
  background: color-mix(in srgb, var(--paper) 92%, var(--bg) 8%);
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.card {
  border: 1px solid color-mix(in srgb, var(--line) 80%, transparent);
  border-radius: 12px;
  padding: 0 16px 16px;
  background: var(--bg);
  margin-bottom: 12px;
}
details.card[open] {
  padding-top: 16px;
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
}
details.card > summary.card__header {
  padding: 16px 0;
  margin-bottom: 0;
}
details.card[open] > summary.card__header {
  margin-bottom: 12px;
}

.sub-card {
  border: 1px solid color-mix(in srgb, var(--line) 60%, transparent);
  border-radius: 10px;
  padding: 0 12px 12px;
  margin-top: 12px;
  background: color-mix(in srgb, var(--paper) 95%, transparent);
}
details.sub-card[open] {
  padding-top: 12px;
}

.sub-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
}
details.sub-card > summary.sub-card__header {
  padding: 12px 0;
  margin-bottom: 0;
}
details.sub-card[open] > summary.sub-card__header {
  margin-bottom: 8px;
}

.form-grid {
  display: grid;
  gap: 12px;
}

.form-grid--two {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.form-grid--equal label {
  display: flex;
  flex-direction: column;
}

label span {
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 4px;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 8px 10px;
  background: color-mix(in srgb, var(--paper) 95%, transparent);
  color: var(--ink);
}

textarea {
  resize: vertical;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--muted);
}

.ghost-btn {
  border: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  border-radius: 999px;
  background: transparent;
  padding: 6px 16px;
  cursor: pointer;
  color: var(--ink);
  font-weight: 600;
}

.ghost-btn--small {
  padding: 4px 12px;
  font-size: 0.85rem;
}

.ghost-btn--danger {
  color: #c0392b;
  border-color: color-mix(in srgb, #c0392b 40%, transparent);
}

.primary-btn {
  border: none;
  border-radius: 999px;
  padding: 10px 22px;
  background: linear-gradient(135deg, #c471ed, #f64f59);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.ghost-btn:disabled,
.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-hint {
  color: var(--muted);
  font-size: 0.9rem;
}

.rule-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  align-items: end;
  margin-bottom: 12px;
}

.role-settings-modal__footer {
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.footer-spacer {
  flex: 1;
}

.role-settings-modal__empty {
  border: 1px dashed var(--line);
  border-radius: 12px;
  padding: 24px;
  margin: 18px 0;
  text-align: center;
}
</style>
