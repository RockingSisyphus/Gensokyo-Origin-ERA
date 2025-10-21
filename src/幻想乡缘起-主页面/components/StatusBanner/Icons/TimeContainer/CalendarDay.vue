<template>
  <button
    type="button"
    class="cal-day-btn"
    :class="{ out: !isCurrentMonth, today: isToday, 'has-fest': hasFestivals }"
    :data-date="dateKey"
    :data-fest="festivalsJSON"
  >
    <span class="dnum">{{ day }}</span>
    <div v-if="hasFestivals" class="fest">
      <span v-for="fest in festivals" :key="fest">{{ fest }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  festivals: string[];
  dateKey: string;
}>();

const hasFestivals = computed(() => props.festivals && props.festivals.length > 0);
const festivalsJSON = computed(() => JSON.stringify(props.festivals));
</script>

<style lang="scss" scoped>
.cal-day-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
  justify-content: flex-start;
  padding: 6px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper);
  aspect-ratio: 1/1;
  min-width: 0;
  min-height: 0;
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
.cal-day-btn.out {
  opacity: 0.55;
}
.cal-day-btn.today {
  outline: 2px solid var(--tab-active);
  outline-offset: 0;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--tab-active) 35%, transparent) inset;
}
.cal-day-btn.has-fest {
  background: color-mix(in srgb, var(--tab-active) 14%, var(--paper) 86%);
  border-color: color-mix(in srgb, var(--tab-active) 50%, var(--line) 50%);
}

.dnum {
  font-weight: 800;
  color: var(--ink);
  text-align: right;
  line-height: 1;
}

@media (max-width: 800px) {
  .fest {
    display: none;
  }
}
@media (min-width: 801px) {
  .fest {
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow: auto;
    scrollbar-gutter: stable;
  }
  .fest > span {
    display: block;
    font-size: 0.82em;
    line-height: 1.25;
    border: 1px solid var(--line);
    background: color-mix(in srgb, var(--paper) 88%, var(--tab-active) 12%);
    color: var(--ink);
    border-radius: 6px;
    padding: 2px 6px;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
}
</style>
