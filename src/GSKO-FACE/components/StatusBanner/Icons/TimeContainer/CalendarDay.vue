<template>
  <div class="cal-day-container">
    <button
      v-if="!day.isPlaceholder"
      type="button"
      class="cal-day-btn"
      :class="{ today: day.isToday, 'has-fest': hasFestivals }"
      :data-importance="highestImportance"
      @mouseenter="showPopover = hasFestivals"
      @mouseleave="showPopover = false"
    >
      <span class="dnum">{{ day.date }}</span>
    </button>
    <div v-else class="cal-day-placeholder"></div>

    <div v-if="showPopover && hasFestivals" class="fest-popover">
      <div v-for="fest in day.festivals" :key="fest.name" class="fest-item">
        <div class="fest-header">
          <strong>{{ fest.name }}</strong>
          <span v-if="fest.host" class="fest-host">@ {{ fest.host }}</span>
        </div>
        <ul v-if="fest.customs?.length" class="fest-customs">
          <li v-for="(custom, index) in fest.customs" :key="index">{{ custom }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Festival } from '../../../../../GSKO-BASE/schema/festival';

const props = defineProps<{
  day: {
    date?: number;
    isToday?: boolean;
    isPlaceholder: boolean;
    festivals?: Festival[];
  };
}>();

const hasFestivals = computed(() => !!(props.day.festivals && props.day.festivals.length > 0));
const showPopover = ref(false);

const highestImportance = computed(() => {
  if (!hasFestivals.value || !props.day.festivals) return 0;
  return Math.max(...props.day.festivals.map(f => f.importance ?? 0));
});
</script>

<style lang="scss" scoped>
.cal-day-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  aspect-ratio: 1/1;
  min-width: 0;
  min-height: 0;
}

.cal-day-btn {
  width: 100%;
  height: 100%;
  padding: 6px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper);
  cursor: pointer;
  user-select: none;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.06s ease;
}
.cal-day-btn:hover {
  background: color-mix(in srgb, var(--paper) 92%, black 8%);
}
.cal-day-btn:active {
  transform: translateY(1px);
}
.cal-day-btn.today {
  outline: 2px solid var(--tab-active);
  outline-offset: 0;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--tab-active) 35%, transparent) inset;
}
.cal-day-btn.has-fest {
  --fest-color: color-mix(in srgb, var(--tab-active) calc(var(--importance, 1) * 20%), transparent);
  background: color-mix(in srgb, var(--fest-color) 50%, var(--paper) 50%);
  border-color: var(--fest-color);
}
.cal-day-btn[data-importance='5'] {
  --importance: 5;
}
.cal-day-btn[data-importance='4'] {
  --importance: 4;
}
.cal-day-btn[data-importance='3'] {
  --importance: 3;
}
.cal-day-btn[data-importance='2'] {
  --importance: 2;
}
.cal-day-btn[data-importance='1'] {
  --importance: 1;
}

.dnum {
  font-weight: 800;
  color: var(--ink);
  text-align: right;
  line-height: 1;
}

.cal-day-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: color-mix(in srgb, var(--paper) 95%, black 5%);
}

.fest-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  padding: 12px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fest-item {
  border-top: 1px solid var(--line);
  padding-top: 8px;
}
.fest-item:first-child {
  border-top: none;
  padding-top: 0;
}

.fest-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}

.fest-header strong {
  font-weight: bold;
  color: var(--ink-bright);
}

.fest-host {
  font-size: 0.85em;
  color: var(--muted);
}

.fest-customs {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
  font-size: 0.9em;
  color: var(--ink);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
