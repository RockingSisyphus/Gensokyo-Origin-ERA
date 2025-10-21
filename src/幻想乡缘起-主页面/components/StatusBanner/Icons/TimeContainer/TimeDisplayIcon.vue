<template>
  <button id="banner-time" class="banner-chip" aria-expanded="false" aria-controls="cal-pop">
    <span class="emoji">⏰</span>
    <span id="banner-time-text">—:—</span>
  </button>
</template>

<script setup lang="ts">
import { onMounted, defineEmits, watch, toRefs } from 'vue';
import { text } from '../../../../utils/mvu';

const props = defineProps<{
  clockInfo: {
    hm: string;
    periodName: string;
    iso: string;
  } | null;
  isCalendarVisible: boolean;
}>();

const { isCalendarVisible } = toRefs(props);

const emit = defineEmits(['toggle-calendar']);

watch(isCalendarVisible, (newValue) => {
  const timeBtn = document.getElementById('banner-time');
  if (timeBtn) {
    timeBtn.setAttribute('aria-expanded', String(newValue));
  }
});

onMounted(() => {
  const timeBtn = document.getElementById('banner-time');
  if (timeBtn) {
    timeBtn.addEventListener('click', () => {
      emit('toggle-calendar');
    });
  }
});

function update(clockInfo: any) {
  if (!clockInfo) return;
  const timeText = clockInfo.hm ? `${clockInfo.hm} · ${clockInfo.periodName || ''}` : clockInfo.iso || '—';
  text('banner-time-text', timeText);
}

defineExpose({
  update,
});
</script>

<style lang="scss" scoped>
.emoji {
  margin-right: 0;
  font-size: 1.1em;
}

.banner-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 6px 10px;
  background: color-mix(in srgb, var(--paper) 90%, var(--tab-active) 10%);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-weight: 700;
  color: var(--ink);
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.08s ease,
    box-shadow 0.12s ease,
    background 0.2s ease;
}
.banner-chip:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
.banner-chip:active {
  transform: translateY(1px) scale(0.99);
}
</style>
