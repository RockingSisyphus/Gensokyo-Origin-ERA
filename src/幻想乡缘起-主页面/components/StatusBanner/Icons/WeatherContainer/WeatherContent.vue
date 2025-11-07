<template>
  <div class="weather-content">
    <section v-if="current" class="current-weather">
      <header class="current-header">
        <div class="header-left">
          <span class="label">{{ current.label }}</span>
          <span class="date">{{ current.dateText }}</span>
        </div>
        <strong class="temperature">{{ formatTemperature(current) }}</strong>
      </header>

      <div class="current-body">
        <p class="condition">{{ current.condition.label }}</p>
        <p class="narrative">{{ current.narrative }}</p>
      </div>

      <ul class="current-stats">
        <li>
          <span>降水概率</span>
          <strong>{{ formatPercent(current.precipitationChance) }}</strong>
        </li>
        <li>
          <span>湿度</span>
          <strong>{{ formatPercent(current.humidity) }}</strong>
        </li>
        <li>
          <span>风力</span>
          <strong>{{ current.windLevel }}级</strong>
        </li>
      </ul>
    </section>

    <section v-if="forecast.length" class="forecast-list">
      <article v-for="item in forecast" :key="item.label + item.dateText" class="forecast-item">
        <div class="item-header">
          <span class="label">{{ item.label }}</span>
          <span class="date">{{ item.dateText }}</span>
        </div>
        <p class="condition">{{ item.condition.label }}</p>
        <p class="temp">{{ formatTemperature(item) }}</p>
        <p class="meta">
          降水 {{ formatPercent(item.precipitationChance) }} · 湿度 {{ formatPercent(item.humidity) }} · 风 {{ item.windLevel }}级
        </p>
      </article>
    </section>

    <p v-if="generatedLabel" class="generated-at">更新于 {{ generatedLabel }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WeatherDay } from '../../../../../GSKO-BASE/schema/weather';

type WeatherDisplay = WeatherDay & {
  label: string;
  dateText: string;
};

const props = defineProps<{
  current: WeatherDisplay | null;
  forecast: WeatherDisplay[];
  generatedAt: string | null;
}>();

const generatedLabel = computed(() => {
  if (!props.generatedAt) {
    return null;
  }
  const date = new Date(props.generatedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
});

function formatPercent(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return `${Math.round(value * 100)}%`;
}

function formatTemperature(day: WeatherDisplay): string {
  const { maxC, minC } = day.temperature;
  return `${maxC}° / ${minC}°`;
}
</script>

<style scoped>
.weather-content {
  width: 100%;
  padding: 16px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-top: 0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  color: var(--ink);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-weather {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.current-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.label {
  font-weight: 700;
}

.date {
  font-size: 0.85em;
  color: var(--muted);
}

.temperature {
  font-size: 1.1em;
  font-variant-numeric: tabular-nums;
}

.current-body .condition {
  font-size: 1em;
  font-weight: 600;
}

.current-body .narrative {
  margin-top: 2px;
  color: var(--muted);
  font-size: 0.9em;
}

.current-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.current-stats li {
  padding: 8px 10px;
  background: color-mix(in srgb, var(--tab-active) 15%, transparent);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85em;
}

.current-stats strong {
  font-size: 1.05em;
}

.forecast-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.forecast-item {
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: color-mix(in srgb, var(--paper) 80%, var(--tab-active) 20%);
}

.forecast-item .condition {
  font-weight: 600;
}

.forecast-item .temp {
  font-size: 0.95em;
}

.forecast-item .meta {
  font-size: 0.8em;
  color: var(--muted);
}

.generated-at {
  font-size: 0.78em;
  color: var(--muted);
  text-align: right;
}
</style>
