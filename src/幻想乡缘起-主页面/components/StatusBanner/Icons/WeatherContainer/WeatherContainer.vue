<template>
  <div class="weather-container">
    <WeatherButtonClosed
      v-if="!weatherVisible"
      :summary="currentSummary"
      :disabled="!hasWeather"
      @open-weather="handleOpen"
    />
    <WeatherButtonOpen v-else :summary="currentSummary" @close-weather="handleClose" />

    <WeatherContent
      v-if="hasWeather"
      v-show="weatherVisible"
      :current="currentWeather"
      :forecast="upcomingForecast"
      :generated-at="generatedAtISO"
    />
    <div v-else class="weather-empty" v-show="weatherVisible">暂未生成天气数据，请等待下一次时间推进。</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue';
import WeatherButtonClosed from './WeatherButtonClosed.vue';
import WeatherButtonOpen from './WeatherButtonOpen.vue';
import WeatherContent from './WeatherContent.vue';
import type { Runtime } from '../../../../../GSKO-BASE/schema/runtime';
import type { WeatherDay, WeatherRuntime } from '../../../../../GSKO-BASE/schema/weather';

type WeatherDisplay = WeatherDay & {
  label: string;
  dateText: string;
};

const props = defineProps({
  runtime: {
    type: Object as PropType<Runtime | null>,
    required: true,
  },
});

const weatherVisible = ref(false);
const weatherRuntime = computed(() => props.runtime?.weather ?? null);
const generatedAtISO = computed(() => weatherRuntime.value?.generatedAtISO ?? null);
const anchorDate = computed(() => parseAnchorDate(weatherRuntime.value?.anchorDayISO));

const forecastWithLabels = computed<WeatherDisplay[]>(() => decorateForecast(weatherRuntime.value, anchorDate.value));
const currentWeather = computed(() => forecastWithLabels.value[0] ?? null);
const upcomingForecast = computed(() =>
  forecastWithLabels.value.length > 1 ? forecastWithLabels.value.slice(1, 6) : [],
);
const hasWeather = computed(() => Boolean(currentWeather.value));

const currentSummary = computed(() => currentWeather.value?.condition.label ?? '天气未刷新');

const handleOpen = () => {
  if (!hasWeather.value) {
    return;
  }
  weatherVisible.value = true;
};

const handleClose = () => {
  weatherVisible.value = false;
};

watch(hasWeather, ready => {
  if (!ready) {
    weatherVisible.value = false;
  }
});

function parseAnchorDate(anchorISO: string | undefined | null): Date | null {
  if (!anchorISO) {
    return null;
  }
  const date = new Date(`${anchorISO}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function decorateForecast(runtime: WeatherRuntime | null, baseDate: Date | null): WeatherDisplay[] {
  const days = runtime?.days ?? [];
  return days.map((day, index) => {
    const date = baseDate ? new Date(baseDate.getTime() + index * 86400000) : null;
    return {
      ...day,
      label: labelForIndex(index, date),
      dateText: formatDateLabel(date, index),
    };
  });
}

function labelForIndex(index: number, date: Date | null): string {
  if (index === 0) return '今天';
  if (index === 1) return '明天';
  if (index === 2) return '后天';
  return date ? date.toLocaleDateString('zh-CN', { weekday: 'short' }) : `+${index}天`;
}

function formatDateLabel(date: Date | null, index: number): string {
  if (!date) {
    return `+${index}天`;
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
</script>

<style scoped>
.weather-container {
  position: relative;
}

.weather-empty {
  padding: 16px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-top: 0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  color: var(--muted);
  font-size: 0.95em;
}
</style>
