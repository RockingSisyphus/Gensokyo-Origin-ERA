<template>
  <div id="cal-pop" ref="calPop" class="cal-pop" role="dialog" aria-modal="false">
    <div class="cal-head">
      <div class="cal-title">
        <span id="cal-month" class="month">—月</span><span id="cal-year" class="year">—年</span>
      </div>
      <div class="cal-nav">
        <button id="cal-prev" class="cal-btn" title="上一月">◀</button>
        <button id="cal-today" class="cal-btn" title="回到今天">●</button>
        <button id="cal-next" class="cal-btn" title="下一月">▶</button>
      </div>
    </div>
    <div class="cal-body">
      <div class="cal-week">
        <div class="w">一</div>
        <div class="w">二</div>
        <div class="w">三</div>
        <div class="w">四</div>
        <div class="w">五</div>
        <div class="w">六</div>
        <div class="w">日</div>
      </div>
      <div id="cal-grid" class="cal-grid">
        <slot name="grid"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { ref, watchEffect } from 'vue';

const props = defineProps<{
  calendarDays: any[];
  onDayClick: (day: any, event: MouseEvent) => void;
}>();

const emit = defineEmits(['close']);

const calPop = ref<HTMLElement | null>(null);

onClickOutside(calPop, event => {
  const target = event.target as HTMLElement;
  if (!target.closest('#banner-time') && !target.closest('.day-popover')) {
    emit('close');
  }
});

watchEffect(() => {
  const timeBtn = document.getElementById('banner-time');
  if (timeBtn && calPop.value) {
    const isExpanded = timeBtn.getAttribute('aria-expanded') === 'true';
    calPop.value.classList.toggle('relative-layout', isExpanded);
  }
});
</script>

<style lang="scss" scoped>
.cal-pop[hidden] {
  display: none !important;
}
.cal-pop {
  position: absolute;
  left: 12px;
  top: calc(100% + 8px);
  z-index: 1000;
  width: min(92vw, 720px);
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.14),
    0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}
.cal-title {
  display: flex;
  align-items: baseline;
  gap: 0.5em;
  color: var(--ink);
}
.cal-title .month {
  font-size: 1.25em;
  font-weight: 800;
}
.cal-title .year {
  font-size: 0.95em;
  color: var(--muted);
}

.cal-nav {
  display: flex;
  gap: 6px;
}
.cal-btn {
  cursor: pointer;
  user-select: none;
  border: 1px solid var(--line);
  background: var(--paper);
  border-radius: 8px;
  padding: 6px 10px;
  font-weight: 700;
}
.cal-btn:active {
  transform: translateY(1px);
}

.cal-body {
  padding: 10px 12px 12px;
}
.cal-week {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 6px;
  color: var(--muted);
  font-weight: 700;
}
.cal-week .w {
  text-align: center;
  padding: 4px 0;
  border-bottom: 1px dashed var(--line);
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
  align-items: stretch;
  position: relative;
}

@media (max-width: 600px) {
  .cal-pop {
    width: min(96vw, 720px);
    left: 8px;
    right: 8px;
  }
}

:global(:root[data-theme='dark']) .cal-pop {
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.22);
}

.relative-layout {
  position: static !important; /* ← 关键：回到文档流 */
  left: auto !important;
  top: auto !important;
  z-index: auto !important;
  width: 100% !important;
  max-width: none !important;
  margin-top: 8px !important;
  overflow: visible !important; /* 展开时允许内部浮层（节日气泡）溢出 */
  flex: 1 1 100%; /* 作为 .status-banner 的子项时独占一整行 */
}
</style>
