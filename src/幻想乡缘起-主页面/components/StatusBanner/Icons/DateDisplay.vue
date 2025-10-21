<template>
  <!-- 可点击：时间（脚本将填充文本，并控制下方弹层开合） -->
  <button id="banner-time" class="banner-chip" aria-expanded="false" aria-controls="cal-pop">
    <span class="emoji">⏰</span>
    <span id="banner-time-text">—:—</span>
  </button>

  <!-- 日历弹层（默认 hidden；脚本控制 hidden 与 aria-expanded） -->
  <div id="cal-pop" class="cal-pop" role="dialog" aria-modal="false" hidden>
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
      <div id="cal-grid" class="cal-grid"><!-- JS 动态填充 .cal-day --></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { defineExpose, onMounted } from 'vue';
import { Logger } from '../../../utils/logger';
import { text } from '../../../utils/mvu';

const logger = new Logger('components-DateDisplay');

// =================================================================
// 类型定义
// =================================================================

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

// =================================================================
// 模块级状态变量 (非响应式)
// =================================================================

let calendarYear: number | null = null;
let calendarMonth: number | null = null;
let todayKey: string | null = null;
let followWorld = true;
let festIdx = new Map<string, string[]>();
let lastClockInfo: ClockInfo | null = null;
let lastFestivals: Festival[] = [];
let isInitialized = false;

// =================================================================
// 核心逻辑：日历数据处理与渲染
// =================================================================

function buildFestIdx(festivals: Festival[]): Map<string, string[]> {
  const funcName = 'buildFestIdx';
  const idx = new Map<string, string[]>();
  const clamp = (val: any, min: number, max: number) => Math.min(Math.max(Number(val) || 0, min), max);

  festivals.forEach((festival, i) => {
    const month = clamp(festival?.month, 1, 12);
    let startDay = Number(festival?.start_day ?? 0) | 0;
    let endDay = Number(festival?.end_day ?? startDay) | 0;

    if (!month) return;

    const year = calendarYear ?? new Date().getFullYear();
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

function renderGrid() {
  const grid = document.getElementById('cal-grid');
  if (!grid || calendarYear === null || calendarMonth === null) return;

  const year = calendarYear;
  const month = calendarMonth;

  grid.innerHTML = '';
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cal-day-btn';
    let day,
      isCurrentMonth = false,
      isToday = false,
      festivalsOnDay: string[] = [];

    if (i < startWeekday) {
      day = daysInPrevMonth - (startWeekday - 1 - i);
    } else {
      const dayInMonth = i - startWeekday + 1;
      if (dayInMonth <= daysInMonth) {
        isCurrentMonth = true;
        day = dayInMonth;
        isToday = todayKey === `${year}-${String(month).padStart(2, '0')}-${String(dayInMonth).padStart(2, '0')}`;
        const festKey = `${month}-${dayInMonth}`;
        festivalsOnDay = festIdx.get(festKey) || [];
      } else {
        day = dayInMonth - daysInMonth;
      }
    }

    const numEl = document.createElement('span');
    numEl.className = 'dnum';
    numEl.textContent = String(day);
    cell.appendChild(numEl);

    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateKey = `${year}-${mm}-${dd}`;
    cell.dataset.date = isCurrentMonth ? dateKey : '';
    cell.dataset.fest = isCurrentMonth && festivalsOnDay.length ? JSON.stringify(festivalsOnDay) : '[]';
    if (!isCurrentMonth) cell.classList.add('out');
    if (isToday) cell.classList.add('today');
    if (isCurrentMonth && festivalsOnDay.length) cell.classList.add('has-fest');

    if (isCurrentMonth && festivalsOnDay.length) {
      const festBox = document.createElement('div');
      festBox.className = 'fest';
      festivalsOnDay.forEach(name => {
        const s = document.createElement('span');
        s.textContent = name;
        festBox.appendChild(s);
      });
      cell.appendChild(festBox);
    }

    grid.appendChild(cell);
  }
}

let dayPopoverEl: HTMLDivElement | null = null;

function hideDayPopover() {
  if (dayPopoverEl) {
    dayPopoverEl.remove();
    dayPopoverEl = null;
  }
}

function showDayPopover(anchorEl: HTMLElement, dateStr: string, fests: string[]) {
  hideDayPopover();
  const host = document.getElementById('cal-pop')!;
  const pop = document.createElement('div');
  pop.className = 'day-popover';
  pop.setAttribute('role', 'dialog');
  pop.innerHTML = `
    <div class="day-popover__head">
      <span class="day-popover__date">${dateStr || '—'}</span>
      <button class="day-popover__close" type="button" aria-label="关闭">×</button>
    </div>
    <div class="day-popover__body">
      ${fests.map(n => `<div class="fest-item">${_.escape(n)}</div>`).join('')}
    </div>
  `;

  host.appendChild(pop);
  dayPopoverEl = pop;
  pop.querySelector('.day-popover__close')?.addEventListener('click', e => {
    e.stopPropagation();
    hideDayPopover();
  });

  const hostRect = host.getBoundingClientRect();
  const btnRect = anchorEl.getBoundingClientRect();
  const top = btnRect.bottom - hostRect.top + 8;
  const left = btnRect.left - hostRect.left;
  const maxLeft = Math.max(12, Math.min(left, hostRect.width - pop.offsetWidth - 12));
  pop.style.left = `${Math.round(maxLeft)}px`;
  pop.style.top = `${Math.round(top)}px`;
}

// =================================================================
// UI 交互处理
// =================================================================

const bindUI = () => {
  if (isInitialized) return;
  isInitialized = true;

  const timeBtn = document.getElementById('banner-time');
  const calPop = document.getElementById('cal-pop');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  const todayBtn = document.getElementById('cal-today');

  if (timeBtn) {
    timeBtn.addEventListener('click', () => {
      if (calPop) {
        const isHidden = calPop.hasAttribute('hidden');
        calPop.toggleAttribute('hidden', !isHidden);
        timeBtn.setAttribute('aria-expanded', String(isHidden));
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      followWorld = false;
      if (calendarYear === null || calendarMonth === null) return;
      calendarMonth--;
      if (calendarMonth <= 0) {
        calendarYear--;
        calendarMonth = 12;
      }
      setTitle(calendarYear, calendarMonth);
      renderGrid();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      followWorld = false;
      if (calendarYear === null || calendarMonth === null) return;
      calendarMonth++;
      if (calendarMonth >= 13) {
        calendarYear++;
        calendarMonth = 1;
      }
      setTitle(calendarYear, calendarMonth);
      renderGrid();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      followWorld = true;
      if (lastClockInfo) {
        update(lastClockInfo, lastFestivals);
      }
    });
  }

  if (calPop) {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isClickOnTimeBtn = target.closest?.('#banner-time');
      const isClickInCalPop = target.closest?.('#cal-pop');
      if (!isClickOnTimeBtn && !isClickInCalPop) {
        if (!calPop.hasAttribute('hidden')) {
          calPop.setAttribute('hidden', '');
          document.getElementById('banner-time')?.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  const grid = document.getElementById('cal-grid');
  if (grid && !(grid as any).__dayBound) {
    (grid as any).__dayBound = true;
    grid.addEventListener('click', ev => {
      const btn = (ev.target as HTMLElement).closest?.('.cal-day-btn') as HTMLElement | null;
      if (!btn) return;
      const festRaw = btn.dataset.fest || '[]';
      let fests: string[] = [];
      try {
        fests = JSON.parse(festRaw) as string[];
      } catch (e) {
        logger.warn('解析节日数据失败', festRaw, e);
      }
      if (!fests.length) {
        hideDayPopover();
        return;
      }
      const dateStr = btn.dataset.date || '';
      showDayPopover(btn, dateStr, fests);
    });
  }

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') hideDayPopover();
  });
};

// =================================================================
// 数据同步与外部接口
// =================================================================

const update = (clockInfo: ClockInfo, festivals: Festival[]) => {
  bindUI(); // 确保UI事件已绑定

  lastClockInfo = clockInfo;
  lastFestivals = festivals;

  const year = Number(clockInfo.year) || 0;
  const month = Number(clockInfo.month) || 0;
  const day = Number(clockInfo.day) || 0;
  todayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const timeText = clockInfo.hm ? `${clockInfo.hm} · ${clockInfo.periodName || ''}` : clockInfo.iso || '—';

  text('banner-time-text', timeText);

  if (festivals && Array.isArray(festivals)) {
    festIdx = buildFestIdx(festivals);
  }

  if (followWorld && (calendarYear !== year || calendarMonth !== month)) {
    calendarYear = year;
    calendarMonth = month;
    setTitle(calendarYear, calendarMonth);
  }

  if (calendarYear && calendarMonth) {
    renderGrid();
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
/* 样式完全从 StatusBanner.vue 迁移 */
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

:deep(.cal-day-btn) {
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
:deep(.cal-day-btn:hover) {
  background: color-mix(in srgb, var(--paper) 92%, black 8%);
}
:deep(.cal-day-btn:active) {
  transform: translateY(1px);
}
:deep(.cal-day-btn.out) {
  opacity: 0.55;
}
:deep(.cal-day-btn.today) {
  outline: 2px solid var(--tab-active);
  outline-offset: 0;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--tab-active) 35%, transparent) inset;
}
:deep(.cal-day-btn.has-fest) {
  background: color-mix(in srgb, var(--tab-active) 14%, var(--paper) 86%);
  border-color: color-mix(in srgb, var(--tab-active) 50%, var(--line) 50%);
}

:deep(.cal-day-btn .dnum) {
  font-weight: 800;
  color: var(--ink);
  text-align: right;
  line-height: 1;
}

@media (max-width: 800px) {
  :deep(.cal-day-btn .fest) {
    display: none;
  }
}
@media (min-width: 801px) {
  :deep(.cal-day-btn .fest) {
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow: auto;
    scrollbar-gutter: stable;
  }
  :deep(.cal-day-btn .fest > span) {
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

:deep(.day-popover) {
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
:deep(.day-popover__head) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 2px 6px;
  border-bottom: 1px dashed var(--line);
  margin-bottom: 6px;
}
:deep(.day-popover__date) {
  font-weight: 800;
  color: var(--ink);
}
:deep(.day-popover__close) {
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--bg);
  font-weight: 800;
  line-height: 1;
  padding: 2px 8px;
  cursor: pointer;
}
:deep(.fest-item) {
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper) 88%, var(--tab-active) 12%);
  color: var(--ink);
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 0.92em;
  line-height: 1.35;
}
:deep(.fest-item + .fest-item) {
  margin-top: 6px;
}

@media (max-width: 600px) {
  .cal-pop {
    width: min(96vw, 720px);
    left: 8px;
    right: 8px;
  }
}

:global(:root[data-theme='dark']) .cal-pop,
:global(:root[data-theme='dark']) :deep(.day-popover) {
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.22);
}

/* 当时间按钮处于“展开”状态时（aria-expanded="true"），
   让 .cal-pop 从绝对定位切到文档流里（static），
   从而把页面高度“撑”起来；关闭时回到 absolute 悬浮层。 */
#banner-time[aria-expanded='true'] + .cal-pop:not([hidden]) {
  position: relative; /* 进入文档流，开始参与页面排版 */
  left: auto; /* 清除定位偏移 */
  top: auto; /* 清除定位偏移 */
  z-index: auto; /* 不需要层级覆盖了 */
  width: 100%; /* 占满横幅卡片宽度 */
  max-width: none; /* 不做额外限制，交由外层控制 */
  margin-top: 8px; /* 与横幅主体留出间距，保持原有观感 */
  overflow: visible; /* 展开时允许内部内容溢出显示，小弹窗不再被裁剪 */
}
</style>
