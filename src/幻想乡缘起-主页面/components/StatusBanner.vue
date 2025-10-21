<template>
  <!-- ===== 状态横幅：时间（可点弹日历） | 天气（预留点击） ===== -->
  <div id="status-banner" class="status-banner">
    <div class="banner-title"><span class="emoji">📡</span><span>世界状态</span></div>

    <!-- 可点击：时间（脚本将填充文本，并控制下方弹层开合） -->
    <button id="banner-time" class="banner-chip" aria-expanded="false" aria-controls="cal-pop">
      <span class="emoji">⏰</span>
      <span id="banner-time-text">—:—</span>
    </button>

    <span class="banner-sep" aria-hidden="true"></span>

    <!-- 可点击：天气（脚本预留，先占位） -->
    <button id="banner-weather" class="banner-chip" aria-expanded="false">
      <span class="emoji">☀️</span>
      <span id="banner-weather-text">—</span>
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
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { defineExpose, onMounted } from 'vue';
import { Logger } from '../utils/logger';
import { get, getRaw, text } from '../utils/mvu';

const logger = new Logger('components-StatusBanner');

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
// 用于存储日历UI的当前状态，例如正在查看的年月。
// =================================================================

/** @description 日历当前显示的年份 */
let calendarYear: number | null = null;
/** @description 日历当前显示的月份 */
let calendarMonth: number | null = null;
/** @description “今天”的日期字符串（YYYY-MM-DD），用于高亮 */
let todayKey: string | null = null;
/** @description 日历是否跟随游戏世界时间。手动翻页时设为 false */
let followWorld = true;
/** @description 预先计算好的节日索引，键为“月-日”，值为节日名称数组 */
let festIdx = new Map<string, string[]>();
/** @description 缓存收到的最新状态对象，用于“回到今天”功能 */
let lastState: object | null = null;
/** @description 标记UI事件是否已绑定，确保只绑定一次 */
let isInitialized = false;

// =================================================================
// 核心逻辑：日历数据处理与渲染
// =================================================================

/**
 * @description 根据传入的节日数组，构建一个用于快速查找的节日索引。
 * @param festivals - 从外部传入的节日数据数组。
 * @returns 一个 Map，键是 '月-日' 格式，值是当天的节日名称列表。
 */
function buildFestIdx(festivals: Festival[]): Map<string, string[]> {
  const funcName = 'buildFestIdx';
  logger.log(funcName, '调用', festivals);
  const idx = new Map<string, string[]>();
  // 辅助函数：确保数字在指定范围内
  const clamp = (val: any, min: number, max: number) => Math.min(Math.max(Number(val) || 0, min), max);

  festivals.forEach((festival, i) => {
    const month = clamp(festival?.month, 1, 12);
    let startDay = Number(festival?.start_day ?? 0) | 0;
    let endDay = Number(festival?.end_day ?? startDay) | 0;

    if (!month) {
      logger.warn(funcName, '跳过节日，月份无效:', festival);
      return;
    }

    // 获取当月天数，以校正非法的日期
    const year = calendarYear ?? new Date().getFullYear();
    const daysInMonth = new Date(year, month, 0).getDate();
    startDay = clamp(Math.min(startDay, endDay), 1, daysInMonth);
    endDay = clamp(Math.max(startDay, endDay), 1, daysInMonth);

    //logger.log(funcName, `处理节日: ${festival.name}`, { month, startDay, endDay });

    // 遍历节日持续的每一天，将其添加到索引中
    for (let day = startDay; day <= endDay; day++) {
      const key = `${month}-${day}`;
      const festivalsOnDay = idx.get(key) || [];
      festivalsOnDay.push(String(festival?.name || `节日#${i + 1}`));
      idx.set(key, festivalsOnDay);
    }
  });
  logger.log(funcName, '完成，生成索引:', idx);
  return idx;
}

/**
 * @description 设置日历头部的年月标题。
 */
function setTitle(year: number, month: number) {
  text('cal-month', `${month}月`);
  text('cal-year', `${year}年`);
}

/**
 * @description 渲染指定年月的日历网格。
 *              它直接使用模块级的 `calendarYear`, `calendarMonth` 等变量来渲染。
 */
function renderGrid() {
  const funcName = 'renderGrid';
  const grid = document.getElementById('cal-grid');
  if (!grid || calendarYear === null || calendarMonth === null) {
    logger.warn(funcName, '无法渲染日历：grid元素不存在或年月未设置。');
    return;
  }

  logger.log(funcName, '开始渲染网格，当前节日索引:', festIdx);

  const year = calendarYear;
  const month = calendarMonth;

  grid.innerHTML = ''; // 清空旧网格
  const firstDayOfMonth = new Date(year, month - 1, 1); // 当月第一天
  const daysInMonth = new Date(year, month, 0).getDate(); // 当月总天数
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate(); // 上月总天数
  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7; // 当月第一天是周几 (0=周一)
  const totalCells = 42; // 日历总共显示 6 行 * 7 列 = 42 个格子

  // 遍历42个格子并填充内容
  for (let i = 0; i < totalCells; i++) {
    // 新：创建 button.cal-day-btn（可聚焦/可点击）                                  // ← 改为按钮元素
    const cell = document.createElement('button'); // 创建按钮元素
    cell.type = 'button'; // 明确按钮类型
    cell.className = 'cal-day-btn'; // 使用新的按钮类
    let day,
      isCurrentMonth = false,
      isToday = false,
      festivalsOnDay: string[] = []; // 日期与状态标记

    if (i < startWeekday) {
      // 填充上个月的尾巴
      day = daysInPrevMonth - (startWeekday - 1 - i);
    } else {
      const dayInMonth = i - startWeekday + 1;
      if (dayInMonth <= daysInMonth) {
        // 填充本月的日期
        isCurrentMonth = true;
        day = dayInMonth;
        // 检查是否是“今天”
        isToday = todayKey === `${year}-${String(month).padStart(2, '0')}-${String(dayInMonth).padStart(2, '0')}`;
        // 查找当天是否有节日
        const festKey = `${month}-${dayInMonth}`;
        logger.log(funcName, `正在为 ${year}-${month}-${day} 检查节日，使用键:`, festKey);
        festivalsOnDay = festIdx.get(festKey) || [];
        if (festivalsOnDay.length > 0) {
          logger.log(funcName, `找到键 ${festKey} 的节日:`, festivalsOnDay);
        }
      } else {
        // 填充下个月的开头
        day = dayInMonth - daysInMonth;
      }
    }

    // 语义化/可达性：只显示日期数字，节日信息放 data-* 与大屏展示用的 .fest 块         // 小屏只露日期
    const numEl = document.createElement('span'); // 数字容器
    numEl.className = 'dnum'; // 数字样式
    numEl.textContent = String(day); // 设置日期数字
    cell.appendChild(numEl); // 加入按钮

    // 数据标注：写入 data-*，供弹窗查询                                               // 为弹窗准备数据
    const mm = String(month).padStart(2, '0'); // 补零
    const dd = String(isCurrentMonth ? day : day).padStart(2, '0'); // 补零
    const dateKey = `${year}-${mm}-${dd}`; // 形如 2025-10-21
    cell.dataset.date = isCurrentMonth ? dateKey : ''; // 仅当月日期才写
    cell.dataset.fest = isCurrentMonth && festivalsOnDay.length ? JSON.stringify(festivalsOnDay) : '[]'; // 节日数组JSON
    if (!isCurrentMonth) cell.classList.add('out'); // 非本月弱化
    if (isToday) cell.classList.add('today'); // 今日高亮
    if (isCurrentMonth && festivalsOnDay.length) cell.classList.add('has-fest'); // 有节日的着色

    // （可选）大屏仍在格内显示节日，供宽屏直观浏览                                  // 保持原有体验
    if (isCurrentMonth && festivalsOnDay.length) {
      const festBox = document.createElement('div');
      festBox.className = 'fest'; // 创建节日容器
      festivalsOnDay.forEach(name => {
        const s = document.createElement('span');
        s.textContent = name;
        festBox.appendChild(s);
      }); // 枚举节日
      cell.appendChild(festBox); // 放入按钮
    }

    grid.appendChild(cell); // 插入网格
  }
}

/** 弹窗单例节点（放在 .cal-pop 内部） */ // 弹窗DOM缓存
let dayPopoverEl: HTMLDivElement | null = null; // 弹窗元素引用

/** 关闭日期弹窗 */ // 关闭函数
function hideDayPopover() {
  // 定义关闭
  if (dayPopoverEl) {
    dayPopoverEl.remove();
    dayPopoverEl = null;
  } // 移除并清空引用
} // 函数结束

/** 显示日期弹窗（相对按钮定位） */ // 打开函数
function showDayPopover(anchorEl: HTMLElement, dateStr: string, fests: string[]) {
  // 定义显示
  hideDayPopover(); // 先清一次
  const host = document.getElementById('cal-pop')!; // 弹出层容器
  const pop = document.createElement('div'); // 建立弹窗
  pop.className = 'day-popover'; // 弹窗样式类
  pop.setAttribute('role', 'dialog'); // 可达性语义
  pop.innerHTML = `
    <div class="day-popover__head">
      <span class="day-popover__date">${dateStr || '—'}</span>
      <button class="day-popover__close" type="button" aria-label="关闭">×</button>
    </div>
    <div class="day-popover__body">
      ${fests.map(n => `<div class="fest-item">${_.escape(n)}</div>`).join('')}
    </div>
  `; // 填写内容

  host.appendChild(pop); // 插入到 cal-pop
  dayPopoverEl = pop; // 记录引用
  // 关闭按钮
  pop.querySelector('.day-popover__close')?.addEventListener('click', hideDayPopover); // 绑定关闭

  // 定位计算：把弹窗放在按钮之上或之下，避免溢出                                   // 位置算法
  const hostRect = host.getBoundingClientRect(); // cal-pop 区域
  const btnRect = anchorEl.getBoundingClientRect(); // 按钮矩形
  const top = btnRect.bottom - hostRect.top + 8; // 默认在按钮下方 8px
  const left = btnRect.left - hostRect.left; // 左对齐按钮
  // 设置位置（留出 12px 边距）
  const maxLeft = Math.max(12, Math.min(left, hostRect.width - pop.offsetWidth - 12)); // 水平不越界
  pop.style.left = `${Math.round(maxLeft)}px`; // 应用 left
  pop.style.top = `${Math.round(top)}px`; // 应用 top
} // 函数结束

// =================================================================
// UI 交互处理
// =================================================================

/**
 * @description 绑定日历弹层的所有交互事件（按钮点击、外部点击关闭等）。
 *              此函数应在组件挂载后由外部调用一次。
 */
const bindUI = () => {
  const timeBtn = document.getElementById('banner-time');
  const calPop = document.getElementById('cal-pop');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  const todayBtn = document.getElementById('cal-today');

  // 时间按钮：点击切换日历弹层的显示/隐藏
  if (timeBtn) {
    timeBtn.addEventListener('click', () => {
      if (calPop) {
        const isHidden = calPop.hasAttribute('hidden');
        calPop.toggleAttribute('hidden', !isHidden);
        timeBtn.setAttribute('aria-expanded', String(isHidden));
      }
    });
  }

  // 上一月按钮
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      followWorld = false; // 用户手动翻页，不再跟随世界时间
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

  // 下一月按钮
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      followWorld = false; // 用户手动翻页，不再跟随世界时间
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

  // 回到今天按钮
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      followWorld = true; // 恢复跟随世界时间
      if (lastState) {
        syncFromClock(lastState); // 使用缓存的最新状态进行同步
      }
    });
  }

  // 点击日历外部区域时，关闭弹层
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

  // === 新增：在网格上做事件代理，点击任意日期按钮时弹出小窗 ===================== //
  const grid = document.getElementById('cal-grid'); // 取得网格容器
  if (grid && !(grid as any).__dayBound) {
    // 避免重复绑定
    (grid as any).__dayBound = true; // 记一次绑定标记
    grid.addEventListener('click', ev => {
      // 监听点击
      const btn = (ev.target as HTMLElement).closest?.('.cal-day-btn') as HTMLElement | null; // 找到按钮
      if (!btn) return; // 非按钮则忽略
      const festRaw = btn.dataset.fest || '[]'; // 读取节日JSON
      let fests: string[] = []; // 节日数组
      try {
        fests = JSON.parse(festRaw) as string[];
      } catch {} // 安全解析
      if (!fests.length) {
        hideDayPopover();
        return;
      } // 无节日则关闭弹窗（或不弹）
      const dateStr = btn.dataset.date || ''; // 读取日期
      showDayPopover(btn, dateStr, fests); // 显示弹窗
    });
  }

  // 允许按 ESC 关闭小窗（体验友好）                                                 // 关闭快捷键
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') hideDayPopover();
  }); // ESC 关闭
};

// =================================================================
// 数据同步与外部接口
// =================================================================

/**
 * @description 从传入的 state 对象中提取时钟信息，并更新横幅和日历。
 */
function syncFromClock(state: object) {
  const clockNow = _.get(state, 'runtime.clock.now', null) as ClockInfo | null;
  if (!clockNow) {
    logger.warn('syncFromClock', '未在 state 中找到 runtime.clock.now');
    return;
  }

  const year = Number(clockNow.year) || 0;
  const month = Number(clockNow.month) || 0;
  const day = Number(clockNow.day) || 0;
  todayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const timeText = clockNow.hm ? `${clockNow.hm} · ${clockNow.periodName || ''}` : clockNow.iso || '—';

  // 更新横幅上的时间文本
  text('banner-time-text', timeText);

  // 如果处于“跟随世界”模式，则更新日历的年月
  if (followWorld && (calendarYear !== year || calendarMonth !== month)) {
    calendarYear = year;
    calendarMonth = month;
    setTitle(calendarYear, calendarMonth);
  }

  // 只要日历的年月已设定，就重新渲染网格
  if (calendarYear && calendarMonth) {
    renderGrid();
  }
}

/**
 * @description 【暴露给外部的唯一入口】更新整个状态横幅。
 *              首次调用时会负责初始化（绑定UI事件）。
 * @param statWithoutMeta - 包含天气、时钟和节日列表的完整状态对象。
 */
const updateStatusBanner = (statWithoutMeta: object) => {
  const funcName = 'updateStatusBanner';

  // 首次调用时，执行一次性的UI事件绑定
  if (!isInitialized) {
    logger.log(funcName, '首次调用，正在执行初始化...');
    bindUI();
    isInitialized = true;
    logger.log(funcName, '初始化完成。');
  }

  logger.log(funcName, '状态横幅开始更新，接收到的statWithoutMeta：', statWithoutMeta);
  if (!statWithoutMeta || typeof statWithoutMeta !== 'object') {
    logger.warn(funcName, '调用失败：传入的 statWithoutMeta 无效。', statWithoutMeta);
    return;
  }
  // 缓存最新状态，供“回到今天”按钮使用
  lastState = statWithoutMeta;

  // 从状态对象中获取节日列表
  const festivals = getRaw(statWithoutMeta, 'festivals_list') as Festival[] | undefined;

  // 如果获取到节日列表，则重新构建索引
  if (festivals && Array.isArray(festivals)) {
    logger.log(funcName, '收到新的节日数据，正在重建索引。', festivals);
    festIdx = buildFestIdx(festivals);
  }

  // 更新天气显示
  const weather = get(statWithoutMeta, '世界.天气', '—');
  text('banner-weather-text', weather);

  // 根据时钟数据更新时间和日历
  syncFromClock(statWithoutMeta);
};

// =================================================================
// 生命周期钩子
// =================================================================

onMounted(() => {
  // onMounted 留空。所有初始化和更新都由 updateStatusBanner 触发。
});

// 暴露唯一接口给外部使用
defineExpose({
  updateStatusBanner,
});
</script>

<!-- ===== 状态横幅（时间 | 天气） + 弹出日历：样式（独立精简版） ===== -->
<style lang="scss" scoped>
.emoji {
  margin-right: 8px;
  font-size: 1.1em;
}

/* 横幅容器：卡片 + 轻浮雕 */
.status-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 8px 10px 6px;
  padding: 10px 12px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.03),
    0 6px 18px rgba(0, 0, 0, 0.05);
  position: relative; /* 作为日历弹层定位参考 */
}

/* 左侧标题/图标 */
.status-banner .banner-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-weight: 700;
  margin-right: 6px;
}
.status-banner .banner-title .emoji {
  margin-right: 0;
}

/* 可点击的状态“胶囊” */
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

/* 小分隔符 */
.banner-sep {
  width: 1px;
  height: 18px;
  background: var(--line);
  align-self: center;
  margin: 0 2px;
}

/* 日历弹层：卡片 + 阴影；默认隐藏（由脚本控制 hidden 属性） */
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

/* 弹层头：月份标题 + 翻页按钮 */
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

/* 周栏与网格（7 列） */
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
}

/* 单日格 */
:deep(.cal-day) {
  position: relative;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  aspect-ratio: 1/1;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}
:deep(.cal-day:hover) {
  background: color-mix(in srgb, var(--paper) 92%, black 8%);
}
:deep(.cal-day.out) {
  opacity: 0.55;
}
:deep(.cal-day.today) {
  outline: 2px solid var(--tab-active);
  outline-offset: 0;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--tab-active) 35%, transparent) inset;
}
:deep(.cal-day .dnum) {
  font-weight: 800;
  color: var(--ink);
  text-align: right;
  line-height: 1;
}
:deep(.cal-day .fest) {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: auto;
  scrollbar-gutter: stable;
}
:deep(.cal-day .fest > span) {
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

/* 小屏适配：弹层占宽度 96vw 并左对齐到横幅边缘 */
@media (max-width: 600px) {
  .cal-pop {
    width: min(96vw, 720px);
    left: 8px;
    right: 8px;
  }
}

:global(:root[data-theme='dark']) .status-banner {
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.1),
    0 6px 18px rgba(0, 0, 0, 0.2);
}
:global(:root[data-theme='dark']) .cal-pop {
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.2);
}

/* 当时间按钮处于“展开”状态时（aria-expanded="true"），
   让 .cal-pop 从绝对定位切到文档流里（static），
   从而把页面高度“撑”起来；关闭时回到 absolute 悬浮层。 */
.status-banner:has(#banner-time[aria-expanded='true']) .cal-pop:not([hidden]) {
  position: static; /* 进入文档流，开始参与页面排版 */
  left: auto; /* 清除定位偏移 */
  top: auto; /* 清除定位偏移 */
  z-index: auto; /* 不需要层级覆盖了 */
  width: 100%; /* 占满横幅卡片宽度 */
  max-width: none; /* 不做额外限制，交由外层控制 */
  margin-top: 8px; /* 与横幅主体留出间距，保持原有观感 */
  /* 可选：如果你希望日历内部也能溢出展示，可解除裁剪（按需打开）
   overflow: visible;
  */
}

/* === 日期按钮：替代原 .cal-day 容器 === */
.cal-grid {
  position: relative;
} /* 作为相对定位参照（弹窗定位计算更稳定） */

.cal-day-btn {
  /* 结构：一个可点击的小卡片按钮，仅显示数字；大屏仍显示 .fest （下方有） */
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
/* 有节日：着色区分（轻底+描边强化） */
.cal-day-btn.has-fest {
  background: color-mix(in srgb, var(--tab-active) 14%, var(--paper) 86%);
  border-color: color-mix(in srgb, var(--tab-active) 50%, var(--line) 50%);
}

/* 数字角标 */
.cal-day-btn .dnum {
  font-weight: 800;
  color: var(--ink);
  text-align: right;
  line-height: 1;
}

/* 宽屏时仍在格内显示节日；小屏隐藏，改为点击弹窗查看 */
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

/* === 日期详情弹窗（附着在 .cal-pop 内） === */
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
  & + .fest-item {
    margin-top: 6px;
  }
}

/* 暗黑模式阴影加强些 */
:global(:root[data-theme='dark']) .day-popover {
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.22);
}
</style>
