<template>
  <div id="cal-content" class="cal-content" role="region">
    <div class="cal-head">
      <div class="cal-title">
        <span id="cal-month" class="month">—月</span><span id="cal-year" class="year">—年</span>
      </div>
      <div class="cal-nav">
        <button id="cal-prev" class="cal-btn" title="上一月" @click="updateMonth('prev')">◀</button>
        <button id="cal-today" class="cal-btn" title="回到今天" @click="resetMonth">●</button>
        <button id="cal-next" class="cal-btn" title="下一月" @click="updateMonth('next')">▶</button>
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
        <CalendarDay v-for="(day, index) in calendarDays" :key="index" :day="day" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { text } from '../../../../utils/mvu';
import CalendarDay from './CalendarDay.vue';

const props = defineProps<{
  clockInfo: any | null;
}>();

const displayMonth = ref(new Date());

const festivals = computed(() => props.clockInfo?.festivals || []);

const updateMonth = (direction: 'prev' | 'next') => {
  const newMonth = new Date(displayMonth.value);
  newMonth.setMonth(newMonth.getMonth() + (direction === 'prev' ? -1 : 1));
  displayMonth.value = newMonth;
};

const resetMonth = () => {
  displayMonth.value = props.clockInfo?.iso ? new Date(props.clockInfo.iso) : new Date();
};

const calendarDays = computed(() => {
  if (!props.clockInfo) return [];

  const year = displayMonth.value.getFullYear();
  const month = displayMonth.value.getMonth();
  const today = props.clockInfo.iso ? new Date(props.clockInfo.iso) : new Date();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0=Monday

  const days = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ isPlaceholder: true });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    // Corrected festival matching logic
    const dayFestivals = festivals.value.filter((f: any) => {
      return f.month === month + 1 && i >= f.start_day && i <= f.end_day;
    });

    const isToday = year === today.getFullYear() && month === today.getMonth() && i === today.getDate();

    days.push({
      date: i,
      isToday: isToday,
      isPlaceholder: false,
      festivals: dayFestivals,
    });
  }
  return days;
});

watch(
  displayMonth,
  newDate => {
    const monthStr = `${newDate.getMonth() + 1}月`;
    const yearStr = `${newDate.getFullYear()}年`;
    text('cal-month', monthStr);
    text('cal-year', yearStr);
  },
  { immediate: true },
);

watch(
  () => props.clockInfo,
  newClockInfo => {
    if (newClockInfo?.iso) {
      displayMonth.value = new Date(newClockInfo.iso);
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.cal-content {
  position: static;
  width: 100%;
  max-height: none;
  margin-top: -1px;
  padding: 12px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-top: 0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  box-shadow: none;
  overflow: visible;
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
  /* 在文档流中，不再需要特定的媒体查询来调整宽度和位置 */
}
</style>
