<template>
  <TimeDisplayIcon
    ref="timeDisplayIcon"
    :clock-info="lastClockInfo"
    :is-calendar-visible="calendarVisible"
    @toggle-calendar="calendarVisible = !calendarVisible"
  />
  <CalendarPopup
    v-show="calendarVisible"
    :calendar-days="calendarDays"
    :on-day-click="onDayClick"
    @close="calendarVisible = false"
  >
    <template #grid>
      <CalendarDay
        v-for="(day, index) in calendarDays"
        :key="index"
        :day="day.day"
        :is-current-month="day.isCurrentMonth"
        :is-today="day.isToday"
        :festivals="day.festivalsOnDay"
        :date-key="day.dateKey"
        @click="onDayClick(day, $event)"
      />
    </template>
  </CalendarPopup>
  <div v-if="dayPopover.visible" class="day-popover" :style="dayPopover.style" role="dialog">
    <div class="day-popover__head">
      <span class="day-popover__date">{{ dayPopover.dateStr }}</span>
      <button class="day-popover__close" type="button" aria-label="关闭" @click="hideDayPopover">×</button>
    </div>
    <div class="day-popover__body">
      <div v-for="fest in dayPopover.fests" :key="fest" class="fest-item">{{ fest }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { Logger } from '../../../utils/logger';
import { text } from '../../../utils/mvu';
import CalendarDay from './TimeContainer/CalendarDay.vue';
import CalendarPopup from './TimeContainer/CalendarPopup.vue';
import TimeDisplayIcon from './TimeContainer/TimeDisplayIcon.vue';

const logger = new Logger('components-DateDisplay');

interface Festival {
  month: number;
  start_day: number;
  end_day: number;
  name: string;
  [key: string]: any;
}

interface ClockInfo {
  year: number;
  month: number;
  day: number;
  hm: string;
  periodName: string;
  iso: string;
}

const calendarYear = ref<number | null>(null);
const calendarMonth = ref<number | null>(null);
const todayKey = ref<string | null>(null);
const followWorld = ref(true);
const festIdx = ref(new Map<string, string[]>());
const lastClockInfo = ref<ClockInfo | null>(null);
const lastFestivals = ref<Festival[]>([]);
const isInitialized = ref(false);
const calendarVisible = ref(false);

const timeDisplayIcon = ref();

const dayPopover = reactive({
  visible: false,
  dateStr: '',
  fests: [] as string[],
  style: {},
});

function buildFestIdx(festivals: Festival[]): Map<string, string[]> {
  const idx = new Map<string, string[]>();
  const clamp = (val: any, min: number, max: number) => Math.min(Math.max(Number(val) || 0, min), max);

  festivals.forEach((festival, i) => {
    const month = clamp(festival?.month, 1, 12);
    let startDay = Number(festival?.start_day ?? 0) | 0;
    let endDay = Number(festival?.end_day ?? startDay) | 0;

    if (!month) return;

    const year = calendarYear.value ?? new Date().getFullYear();
    const daysInMonth = new Date(year, month, 0).getDate();
    startDay = clamp(Math.min(startDay, endDay), 1, daysInMonth);
    endDay = clamp(Math.max(startDay, endDay), 1, daysInMonth);

    for (let day = startDay; day <= endDay; day++) {
      const key = `${month}-${day}`;
      const festivalsOnDay = idx.get(key) || [];
      festivalsOnDay.push(String(festival?.name || `节日#${i + 1}`));
      idx.set(key, festivalsOnDay);
    }
  });
  return idx;
}

function setTitle(year: number, month: number) {
  text('cal-month', `${month}月`);
  text('cal-year', `${year}年`);
}

const calendarDays = computed(() => {
  if (calendarYear.value === null || calendarMonth.value === null) return [];

  const year = calendarYear.value;
  const month = calendarMonth.value;

  const days = [];
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    let day,
      isCurrentMonth = false,
      isToday = false,
      festivalsOnDay: string[] = [];

    let currentYear = year;
    let currentMonth = month;

    if (i < startWeekday) {
      day = daysInPrevMonth - (startWeekday - 1 - i);
      currentMonth = month - 1;
      if (currentMonth === 0) {
        currentMonth = 12;
        currentYear = year - 1;
      }
    } else {
      const dayInMonth = i - startWeekday + 1;
      if (dayInMonth <= daysInMonth) {
        isCurrentMonth = true;
        day = dayInMonth;
        isToday = todayKey.value === `${year}-${String(month).padStart(2, '0')}-${String(dayInMonth).padStart(2, '0')}`;
        const festKey = `${month}-${dayInMonth}`;
        festivalsOnDay = festIdx.value.get(festKey) || [];
      } else {
        day = dayInMonth - daysInMonth;
        currentMonth = month + 1;
        if (currentMonth === 13) {
          currentMonth = 1;
          currentYear = year + 1;
        }
      }
    }
    const mm = String(currentMonth).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateKey = `${currentYear}-${mm}-${dd}`;

    days.push({
      day,
      isCurrentMonth,
      isToday,
      festivalsOnDay,
      dateKey: isCurrentMonth ? dateKey : '',
    });
  }
  return days;
});

function hideDayPopover() {
  dayPopover.visible = false;
}

function showDayPopover(anchorEl: HTMLElement, dateStr: string, fests: string[]) {
  hideDayPopover();
  const host = document.getElementById('cal-pop')!;
  if (!host) return;

  dayPopover.dateStr = dateStr;
  dayPopover.fests = fests;
  dayPopover.visible = true;

  const hostRect = host.getBoundingClientRect();
  const btnRect = anchorEl.getBoundingClientRect();
  const top = btnRect.bottom - hostRect.top + 8;
  const left = btnRect.left - hostRect.left;

  // Wait for popover to be rendered to get its width
  nextTick(() => {
    const popEl = document.querySelector('.day-popover') as HTMLElement;
    if (popEl) {
      const maxLeft = Math.max(12, Math.min(left, hostRect.width - popEl.offsetWidth - 12));
      dayPopover.style = {
        left: `${Math.round(maxLeft)}px`,
        top: `${Math.round(top)}px`,
      };
    }
  });
}

function onDayClick(day: any, event: MouseEvent) {
  const btn = (event.target as HTMLElement).closest('.cal-day-btn') as HTMLElement;
  if (!btn) return;

  if (!day.festivalsOnDay.length) {
    hideDayPopover();
    return;
  }
  showDayPopover(btn, day.dateKey, day.festivalsOnDay);
}

const bindUI = () => {
  if (isInitialized.value) return;
  isInitialized.value = true;

  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  const todayBtn = document.getElementById('cal-today');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      followWorld.value = false;
      if (calendarYear.value === null || calendarMonth.value === null) return;
      calendarMonth.value--;
      if (calendarMonth.value <= 0) {
        calendarYear.value--;
        calendarMonth.value = 12;
      }
      setTitle(calendarYear.value, calendarMonth.value);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      followWorld.value = false;
      if (calendarYear.value === null || calendarMonth.value === null) return;
      calendarMonth.value++;
      if (calendarMonth.value >= 13) {
        calendarYear.value++;
        calendarMonth.value = 1;
      }
      setTitle(calendarYear.value, calendarMonth.value);
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      followWorld.value = true;
      if (lastClockInfo.value) {
        update(lastClockInfo.value, lastFestivals.value);
      }
    });
  }

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') hideDayPopover();
  });
};

const update = (clockInfo: ClockInfo, festivals: Festival[]) => {
  bindUI();

  lastClockInfo.value = clockInfo;
  lastFestivals.value = festivals;

  const year = Number(clockInfo.year) || 0;
  const month = Number(clockInfo.month) || 0;
  const day = Number(clockInfo.day) || 0;
  todayKey.value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  if (timeDisplayIcon.value) {
    timeDisplayIcon.value.update(clockInfo);
  }

  if (festivals && Array.isArray(festivals)) {
    festIdx.value = buildFestIdx(festivals);
  }

  if (followWorld.value && (calendarYear.value !== year || calendarMonth.value !== month)) {
    calendarYear.value = year;
    calendarMonth.value = month;
    setTitle(calendarYear.value, calendarMonth.value);
  }
};

onMounted(() => {
  bindUI();
});

defineExpose({
  update,
});
</script>

<style lang="scss" scoped>
.day-popover {
  position: absolute;
  z-index: 1200;
  width: min(280px, calc(100% - 24px));
  max-height: 60vh;
  overflow: auto;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.14),
    0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 8px;
}
.day-popover__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 2px 6px;
  border-bottom: 1px dashed var(--line);
  margin-bottom: 6px;
}
.day-popover__date {
  font-weight: 800;
  color: var(--ink);
}
.day-popover__close {
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--bg);
  font-weight: 800;
  line-height: 1;
  padding: 2px 8px;
  cursor: pointer;
}
.fest-item {
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper) 88%, var(--tab-active) 12%);
  color: var(--ink);
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 0.92em;
  line-height: 1.35;
}
.fest-item + .fest-item {
  margin-top: 6px;
}

:global(:root[data-theme='dark']) .day-popover {
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.22);
}
</style>
