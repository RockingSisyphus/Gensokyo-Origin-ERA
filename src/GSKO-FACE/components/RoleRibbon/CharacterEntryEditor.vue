<template>
  <div class="GensokyoOrigin-CharacterEntryEditor-container">
    <div class="GensokyoOrigin-CharacterEntryEditor-grid GensokyoOrigin-CharacterEntryEditor-grid--two">
      <label>
        <span>行动描述 (do)</span>
        <input v-model="entry.action.do" type="text" />
      </label>
      <label>
        <span>来源 (source)</span>
        <input v-model="entry.action.source" type="text" />
      </label>
      <label>
        <span>出发地 (from)</span>
        <input v-model="entry.action.from" type="text" />
      </label>
      <label v-if="showPriority">
        <span>优先级</span>
        <input v-model.number="entry.priority" type="number" />
      </label>
    </div>

    <div class="GensokyoOrigin-CharacterEntryEditor-grid GensokyoOrigin-CharacterEntryEditor-grid--two">
      <label>
        <span>目的地 (to)</span>
        <select :value="actionToSelection" @change="selectActionTo(($event.target as HTMLSelectElement).value)">
          <option :value="ACTION_TO_STAY">保持所在地区</option>
          <option v-for="opt in ACTION_TO_SPECIALS" :key="`entry-${opt}`" :value="opt">{{ opt }}</option>
          <option disabled>────────</option>
          <option v-for="loc in locationOptions" :key="`loc-${loc}`" :value="loc">{{ loc }}</option>
          <option :value="ACTION_TO_CUSTOM">自定义</option>
        </select>
      </label>
      <label v-if="actionToSelection === ACTION_TO_CUSTOM">
        <span>自定义目的地</span>
        <input v-model="customDestination" type="text" @input="updateCustomDestination" />
      </label>
    </div>

    <details class="GensokyoOrigin-CharacterEntryEditor-details collapsible-section">
      <summary>触发条件</summary>
      <div class="GensokyoOrigin-CharacterEntryEditor-conditions-wrapper">
        <div class="GensokyoOrigin-CharacterEntryEditor-condition-group">
          <div class="GensokyoOrigin-CharacterEntryEditor-flag-groups">
            <div v-for="group in FLAG_GROUPS" :key="group.title" class="GensokyoOrigin-CharacterEntryEditor-flag-group">
              <div class="GensokyoOrigin-CharacterEntryEditor-flag-group__title">{{ group.title }}</div>
              <div class="GensokyoOrigin-CharacterEntryEditor-flag-group__options">
                <label v-for="flag in group.options" :key="flag">
                  <input type="checkbox" :checked="hasFlag(flag)" @change="toggleFlag(flag)" />
                  <span>{{ formatFlagLabel(flag) }}</span>
                </label>
              </div>
            </div>
          </div>
          <div v-if="entry.when?.byFlag?.length" class="GensokyoOrigin-CharacterEntryEditor-selected-flags">
            <span
              v-for="flag in entry.when.byFlag"
              :key="flag"
              class="GensokyoOrigin-CharacterEntryEditor-selected-flag"
            >
              {{ formatFlagLabel(flag) }}
              <button type="button" @click="removeFlag(flag)">×</button>
            </span>
          </div>
        </div>

        <div class="GensokyoOrigin-CharacterEntryEditor-condition-group">
          <div
            class="GensokyoOrigin-CharacterEntryEditor-grid GensokyoOrigin-CharacterEntryEditor-grid--two GensokyoOrigin-CharacterEntryEditor-grid--equal"
          >
            <label v-for="field in BY_NOW_SELECT_FIELDS" :key="field.key">
              <span>{{ field.label }}</span>
              <select
                :value="entry.when?.byNow?.[field.key] ?? ''"
                @change="setByNowField(field.key, ($event.target as HTMLSelectElement).value || '')"
              >
                <option value="">—</option>
                <option v-for="option in field.options" :key="`select-${field.key}-${option}`" :value="option">
                  {{ option }}
                </option>
              </select>
            </label>
            <label v-for="field in BY_NOW_TEXT_FIELDS" :key="field.key">
              <span>{{ field.label }}</span>
              <input
                type="text"
                :placeholder="field.placeholder"
                :value="entry.when?.byNow?.[field.key] ?? ''"
                @input="setByNowField(field.key, ($event.target as HTMLInputElement).value)"
              />
            </label>
            <label v-for="field in BY_NOW_NUMERIC_FIELDS" :key="field.key">
              <span>{{ field.label }}</span>
              <input
                type="number"
                :value="entry.when?.byNow?.[field.key] ?? ''"
                @input="setByNowField(field.key, ($event.target as HTMLInputElement).value)"
              />
            </label>
          </div>
        </div>

        <div class="GensokyoOrigin-CharacterEntryEditor-condition-group">
          <div class="GensokyoOrigin-CharacterEntryEditor-grid GensokyoOrigin-CharacterEntryEditor-grid--three">
            <label>
              <span>指定月份</span>
              <input
                type="number"
                min="1"
                max="12"
                :value="entry.when?.byMonthDay?.month ?? ''"
                @input="setByMonthDayField('month', ($event.target as HTMLInputElement).value)"
              />
            </label>
            <label>
              <span>指定日期</span>
              <input
                type="number"
                min="1"
                max="31"
                :value="entry.when?.byMonthDay?.day ?? ''"
                @input="setByMonthDayField('day', ($event.target as HTMLInputElement).value)"
              />
            </label>
            <button type="button" class="ghost-btn ghost-btn--small" @click="clearByMonthDay">清空</button>
          </div>
        </div>

        <div class="GensokyoOrigin-CharacterEntryEditor-condition-group">
          <label>
            <span>节日限定</span>
            <select :value="festivalSelection" multiple @change="handleFestivalSelect($event)">
              <option value="__ANY__">任意节日</option>
              <option disabled>────────</option>
              <option v-for="option in festivalOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <p class="GensokyoOrigin-CharacterEntryEditor-hint">
            按住 Ctrl 或 Shift 可选择多个节日。不选择则代表不限定节日。
          </p>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, ref, watch } from 'vue';
import type { Entry } from '../../../GSKO-BASE/schema/character-settings';
import {
  ACTION_TO_CUSTOM,
  ACTION_TO_SPECIALS,
  ACTION_TO_STAY,
  BY_NOW_NUMERIC_FIELDS,
  BY_NOW_SELECT_FIELDS,
  BY_NOW_TEXT_FIELDS,
  FLAG_GROUPS,
  formatFlagLabel,
  isNumericByNowKey,
  type ByNowFieldKey,
} from './character-settings-helpers';

const props = defineProps({
  entry: {
    type: Object as PropType<Entry>,
    required: true,
  },
  legalLocations: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  listKey: {
    type: String,
    required: true,
  },
  showPriority: {
    type: Boolean,
    default: false,
  },
  festivalOptions: {
    type: Array as PropType<{ value: string; label: string }[]>,
    default: () => [],
  },
});

const entry = computed(() => props.entry);

const locationOptions = computed(() => {
  const uniq = Array.from(new Set((props.legalLocations ?? []).filter(Boolean)));
  return uniq.sort((a, b) => a.localeCompare(b, 'zh-Hans'));
});

const isSpecialDestination = (value: string): value is (typeof ACTION_TO_SPECIALS)[number] =>
  ACTION_TO_SPECIALS.includes(value as (typeof ACTION_TO_SPECIALS)[number]);

const customDestination = ref('');

const ensureWhen = () => {
  if (!entry.value.when || typeof entry.value.when !== 'object') {
    entry.value.when = {};
  }
  return entry.value.when;
};

const hasFlag = (flag: string) => Array.isArray(entry.value.when?.byFlag) && entry.value.when!.byFlag.includes(flag);

const toggleFlag = (flag: string) => {
  const when = ensureWhen();
  const arr = Array.isArray(when.byFlag) ? when.byFlag : (when.byFlag = []);
  const idx = arr.indexOf(flag);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(flag);
};

const removeFlag = (flag: string) => {
  const when = ensureWhen();
  if (!Array.isArray(when.byFlag)) return;
  when.byFlag = when.byFlag.filter((item: string) => item !== flag);
  if (!when.byFlag.length) delete when.byFlag;
};

const setByNowField = (key: ByNowFieldKey, rawValue: string) => {
  const when = ensureWhen();
  const byNow = (when.byNow = when.byNow ?? {});
  const value = rawValue.trim();
  if (!value) {
    delete byNow[key];
  } else if (isNumericByNowKey(key)) {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) byNow[key] = numeric;
  } else {
    byNow[key] = value;
  }
  if (!Object.keys(byNow).length) delete when.byNow;
};

const setByMonthDayField = (key: 'month' | 'day', rawValue: string) => {
  const when = ensureWhen();
  const value = rawValue.trim();
  if (!value) {
    if (when.byMonthDay) {
      delete when.byMonthDay[key];
      if (when.byMonthDay.month == null && when.byMonthDay.day == null) delete when.byMonthDay;
    }
    return;
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return;
  when.byMonthDay = when.byMonthDay ?? { month: 1, day: 1 };
  when.byMonthDay[key] = numeric;
};

const clearByMonthDay = () => {
  const when = ensureWhen();
  delete when.byMonthDay;
};

const festivalSelection = computed(() => {
  const value = entry.value.when?.byFestival;
  if (!value) return [];
  if (value === 'ANY') return ['__ANY__'];
  if (Array.isArray(value)) return value;
  return [value];
});

const handleFestivalSelect = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const selected = Array.from(target.selectedOptions).map(opt => opt.value);
  const when = ensureWhen();

  if (!selected.length) {
    delete when.byFestival;
    return;
  }

  if (selected.includes('__ANY__')) {
    when.byFestival = 'ANY';
    return;
  }

  if (selected.length === 1) {
    when.byFestival = selected[0];
  } else {
    when.byFestival = selected;
  }
};

const actionToSelection = computed(() => {
  const toValue = entry.value.action.to;
  if (!toValue) return ACTION_TO_STAY;
  if (isSpecialDestination(toValue)) return toValue;
  if (locationOptions.value.includes(toValue)) return toValue;
  return ACTION_TO_CUSTOM;
});

watch(
  actionToSelection,
  selection => {
    if (selection === ACTION_TO_CUSTOM) {
      customDestination.value = entry.value.action.to ?? '';
    } else {
      customDestination.value = '';
    }
  },
  { immediate: true },
);

const selectActionTo = (value: string) => {
  if (value === ACTION_TO_STAY) {
    delete entry.value.action.to;
    customDestination.value = '';
    return;
  }
  if (value === ACTION_TO_CUSTOM) {
    if (!entry.value.action.to) entry.value.action.to = '';
    customDestination.value = entry.value.action.to;
    return;
  }
  entry.value.action.to = value;
  customDestination.value = '';
};

const updateCustomDestination = () => {
  entry.value.action.to = customDestination.value.trim();
};
</script>

<style lang="scss">
.GensokyoOrigin-CharacterEntryEditor-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.GensokyoOrigin-CharacterEntryEditor-grid {
  display: grid;
  gap: 12px;
}

.GensokyoOrigin-CharacterEntryEditor-grid--two {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.GensokyoOrigin-CharacterEntryEditor-grid--three {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  align-items: end;
}

.GensokyoOrigin-CharacterEntryEditor-grid--equal label {
  display: flex;
  flex-direction: column;
}

.GensokyoOrigin-CharacterEntryEditor-details {
  border: 1px dashed color-mix(in srgb, var(--line) 70%, transparent);
  border-radius: 10px;
  padding: 12px;
  background: color-mix(in srgb, var(--paper) 96%, transparent);

  & > summary {
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 12px;
  }
}

.GensokyoOrigin-CharacterEntryEditor-conditions-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.GensokyoOrigin-CharacterEntryEditor-condition-group {
  padding: 12px;
  border: 1px solid color-mix(in srgb, var(--line) 50%, transparent);
  border-radius: 8px;
  background: var(--bg);
}

.GensokyoOrigin-CharacterEntryEditor-flag-groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.GensokyoOrigin-CharacterEntryEditor-flag-group__title {
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 4px;
}

.GensokyoOrigin-CharacterEntryEditor-flag-group__options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
  }
}

.GensokyoOrigin-CharacterEntryEditor-selected-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.GensokyoOrigin-CharacterEntryEditor-selected-flag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--line) 10%, transparent);
  font-size: 0.8rem;

  button {
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--muted);
  }
}

.GensokyoOrigin-CharacterEntryEditor-hint {
  font-size: 0.85rem;
  color: var(--muted);
  margin-top: 6px;
}
</style>
