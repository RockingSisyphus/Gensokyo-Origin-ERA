import { ERA_VARIABLE_PATH } from '../utils/constants';
import { Logger } from '../utils/logger';
import { get, getRaw } from '../utils/mvu';
import { getRuntimeVar, setRuntimeVar } from '../utils/runtime';

// —— 新增：一次性注入“仅作用于角色卡”的粒子与着色样式（保持内聚，避免全局污染）
const AFFECTION_STYLE_ID = 'era-affection-style'; // 唯一ID，避免重复注入

function ensureAffectionStyles() {
  if (document.getElementById(AFFECTION_STYLE_ID)) return; // 已注入则跳过

  // 说明：
  // 1) 所有选择器都包在 .role-card 下，只影响角色卡范围；
  // 2) 覆盖原来散落在模板里的关键帧与修饰类（negative/very-hate/very-love/rtl 以及 粒子动画）；
  // 3) 这样 ContentOthers.vue 的 scoped 样式不会冲掉这些全局注入规则。
  const css = `
/* ===== ERA affection (injected by affection.ts) ===== */
@keyframes affPop {
  0% { transform: translateY(0) scale(.85); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(-18px) scale(1.15); opacity: 0; }
}
@keyframes cardPop {
  0% { transform: translate(0,0) scale(.8) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(var(--dx,0), var(--dy,-40px)) scale(1.1) rotate(var(--rot,0deg)); opacity: 0; }
}

/* 仅作用于角色卡区域，避免全局污染 */
.role-card .aff-particle,
.role-card .card-particle{
  position:absolute; line-height:1; pointer-events:none; user-select:none; opacity:0;
  filter:drop-shadow(0 0 6px rgba(0,0,0,.25));
}
.role-card .aff-particle{ animation: affPop 1.1s ease-out forwards; }
.role-card .card-particle{ animation: cardPop 1.2s ease-out forwards; font-size:16px; }
.role-card .card-particle.heart{ color:#b65ff7; text-shadow:0 0 8px rgba(126,63,242,.5); }
.role-card .card-particle.skull{ color:#222; text-shadow:0 0 6px rgba(0,0,0,.5); }
.role-card .aff-particle.heart{ text-shadow:0 0 6px rgba(126,63,242,.45); }
.role-card .aff-particle.skull{ color:#000; text-shadow:0 0 6px rgba(0,0,0,.35); }

/* 进度条修饰：与原生逻辑一致 */
/* 让“朝向”绝对覆盖 scoped 的 left:0 */
.role-card .mini-bar .val.rtl{ left:auto !important; right:0 !important; }

/* 让配色绝对覆盖 scoped 的默认背景 */
.role-card .mini-bar .val.negative{
  background:#b00020 !important;
}
.role-card .mini-bar .val.very-hate{
  background:#000 !important;
}
.role-card .mini-bar .val.very-love{
  background:linear-gradient(90deg,#7e3ff2,#c084fc) !important;
}


/* （可选）深色主题下骷髅视觉微调，保持观感一致 */
:root[data-theme='dark'] .role-card .card-particle.skull,
:root[data-theme='dark'] .role-card .aff-particle.skull{
  color:#714f4f; text-shadow:0 0 6px rgba(185,88,88,.6);
}
`;

  const style = document.createElement('style');
  style.id = AFFECTION_STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * 好感等级计算 + 进度条着色（从 index.ts 严格抄录后适配）
 * - 配置改为从传入的 statWithoutMeta 读取（statWithoutMeta.config.affection.*）
 * - 原先写入世界书/变量的，通过 eraWriter.updateEraVariable 写入
 * - 原先从 window.xxx 读写的 runtime，改用 utils/runtime 提供的方法
 * - 保留大量中文注释与调试输出
 */

// —— 模块日志器
const logger = new Logger('backend-affection');

// —— 阶段文案（兜底，与 index.ts 中保持一致）
const STAGES_FALLBACK: Array<[number, string]> = [
  [-9999, '死敌'],
  [-99, '憎恨'],
  [-20, '厌恶'],
  [0, '不喜'],
  [10, '冷淡'],
  [20, '熟悉'],
  [40, '亲近'],
  [70, '亲密'],
  [99, '思慕'],
  [9999, '不渝'],
];

/**
 * 根据好感值计算阶段文案
 * 注意：配置优先取自 statWithoutMeta.config.affection.affectionStages
 */
function stageLabelFrom(statWithoutMeta: any, fav: number): string {
  try {
    // 按照用户要求，在函数开头输出完整的 statWithoutMeta 对象以供调试
    logger.debug('stageLabelFrom', '函数接收到的完整 statWithoutMeta 对象', {
      statWithoutMeta: JSON.parse(JSON.stringify(statWithoutMeta)),
    });

    const stages = getRaw(statWithoutMeta, ERA_VARIABLE_PATH.AFFECTION_STAGES, STAGES_FALLBACK) as Array<
      [number, string]
    >;

    // 按照用户的要求，添加详细的中文调试输出
    logger.debug('stageLabelFrom', '开始计算好感度等级', {
      当前好感度: fav,
      等级配置表: JSON.parse(JSON.stringify(stages)), // 使用深拷贝以安全地记录 stages 数组
    });

    // 修正：从后向前遍历，找到第一个小于等于当前好感度的阈值
    // 这是确定当前等级的正确逻辑
    for (let i = stages.length - 1; i >= 0; i--) {
      if (fav >= Number(stages[i][0])) {
        const label = String(stages[i][1] ?? '—');
        logger.debug('stageLabelFrom', '计算成功', {
          当前好感度: fav,
          匹配到的等级阈值: stages[i][0],
          最终等级名称: label,
        });
        return label;
      }
    }

    // 如果循环结束仍未找到（例如，好感度低于所有阈值），则返回第一个作为兜底
    const fallbackLabel = String(stages[0]?.[1] ?? '—');
    logger.debug('stageLabelFrom', '在配置表中未找到匹配，使用最低等级作为保底', {
      当前好感度: fav,
      保底等级名称: fallbackLabel,
    });
    return fallbackLabel;
  } catch (e) {
    logger.warn('stageLabelFrom', '阶段计算失败，使用兜底。', e);
    return '—';
  }
}

/**
 * 读取阈值（爱/恨），改为从 statWithoutMeta.config.affection 读取
 */
function loveThresholdOf(statWithoutMeta: any): number {
  return Number(get(statWithoutMeta, ERA_VARIABLE_PATH.AFFECTION_LOVE_THRESHOLD, 100));
}
function hateThresholdOf(statWithoutMeta: any): number {
  return Number(get(statWithoutMeta, ERA_VARIABLE_PATH.AFFECTION_HATE_THRESHOLD, -100));
}

// —— 记忆每张卡的上次状态，避免重复喷涌（与 index.ts 一致）
const CARD_STATE: WeakMap<Element, any> = new WeakMap();

// —— 给条着色 + 朝向
function paintBar(valEl: Element | null, fav: number, love: number, hate: number) {
  if (!valEl) return;
  (valEl as HTMLElement).classList.remove('negative', 'very-hate', 'very-love', 'rtl');
  if (fav < 0) (valEl as HTMLElement).classList.add('rtl');
  if (fav <= hate) (valEl as HTMLElement).classList.add('very-hate');
  else if (fav < 0) (valEl as HTMLElement).classList.add('negative');
  else if (fav >= love) (valEl as HTMLElement).classList.add('very-love');
  logger.debug('paintBar', '已着色进度条', { fav, className: (valEl as HTMLElement).className });
}

// —— 迷你条里冒粒子（❤/☠）
function burstBarParticles(valEl: Element | null, kind: 'heart' | 'skull' = 'heart', count = 5) {
  if (!valEl) return;
  const host = (valEl as HTMLElement).parentElement || (valEl as HTMLElement);
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'aff-particle ' + (kind === 'skull' ? 'skull' : 'heart');
    s.textContent = kind === 'skull' ? '☠' : '❤';
    s.style.left = 10 + Math.random() * 80 + '%';
    s.style.bottom = 2 + Math.random() * 4 + 'px';
    s.style.animationDelay = i * 0.06 + 's';
    host.appendChild(s);
    setTimeout(() => s.remove(), 1300);
  }
}

// —— 卡片范围撒粒子（❤/☠）
function burstCardParticles(card: Element, kind: 'heart' | 'skull' = 'heart', count = 10) {
  const nowTs = performance.now();
  const rec = CARD_STATE.get(card) || {};
  if (rec.lastBurstAt && nowTs - rec.lastBurstAt < 1000) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'card-particle ' + (kind === 'skull' ? 'skull' : 'heart');
    s.textContent = kind === 'skull' ? '☠' : '❤';
    s.style.left = 5 + Math.random() * 90 + '%';
    s.style.top = 10 + Math.random() * 80 + '%';
    s.style.setProperty('--dx', (Math.random() - 0.5) * 60 + 'px');
    s.style.setProperty('--dy', -40 - Math.random() * 40 + 'px');
    s.style.setProperty('--rot', (Math.random() - 0.5) * 40 + 'deg');
    s.style.animationDelay = i * 0.05 + 's';
    (card as HTMLElement).appendChild(s);
    setTimeout(() => s.remove(), 1500);
  }
  rec.lastBurstAt = nowTs;
  CARD_STATE.set(card, rec);
}

// —— 阶段 ticker（hate/love）
function ensureSkullTicker(card: Element, enabled: boolean) {
  const rec = CARD_STATE.get(card) || {};
  if (enabled) {
    if (!rec.skullTimer) {
      rec.skullTimer = setInterval(() => {
        try {
          const valEl = (card as HTMLElement).querySelector('.mini-bar .val');
          burstCardParticles(card, 'skull', 6);
          if (valEl) burstBarParticles(valEl, 'skull', 4);
        } catch (e) {
          logger.debug('ensureSkullTicker', '粒子渲染异常，忽略', e);
        }
      }, 1400);
      logger.debug('ensureSkullTicker', '骷髅续喷 开启');
    }
  } else if (rec.skullTimer) {
    clearInterval(rec.skullTimer);
    rec.skullTimer = null;
    logger.debug('ensureSkullTicker', '骷髅续喷 关闭');
  }
  CARD_STATE.set(card, rec);
}

function ensureLoveTicker(card: Element, enabled: boolean) {
  const rec = CARD_STATE.get(card) || {};
  if (enabled) {
    if (!rec.loveTimer) {
      rec.loveTimer = setInterval(() => {
        try {
          const valEl = (card as HTMLElement).querySelector('.mini-bar .val');
          burstCardParticles(card, 'heart', 6);
          if (valEl) burstBarParticles(valEl, 'heart', 4);
        } catch (e) {
          logger.debug('ensureLoveTicker', '粒子渲染异常，忽略', e);
        }
      }, 1600);
      logger.debug('ensureLoveTicker', '爱心续喷 开启');
    }
  } else if (rec.loveTimer) {
    clearInterval(rec.loveTimer);
    rec.loveTimer = null;
    logger.debug('ensureLoveTicker', '爱心续喷 关闭');
  }
  CARD_STATE.set(card, rec);
}

// —— 单张卡片处理（严格基于 index.ts 的逻辑）
function processCard(statWithoutMeta: any, card: Element) {
  try {
    const favRaw = (card as HTMLElement).querySelector('.aff-num')?.textContent || '0';
    const fav = parseInt(favRaw || '0', 10) || 0;
    const valEl = (card as HTMLElement).querySelector('.mini-bar .val');
    const lblEl = (card as HTMLElement).querySelector('.aff-stage') as HTMLElement | null;
    if (lblEl) lblEl.textContent = stageLabelFrom(statWithoutMeta, fav);
    const LOVE = loveThresholdOf(statWithoutMeta);
    const HATE = hateThresholdOf(statWithoutMeta);
    paintBar(valEl, fav, LOVE, HATE);

    let cur: 'neutral' | 'love' | 'hate' = 'neutral';
    if (fav <= HATE) cur = 'hate';
    else if (fav >= LOVE) cur = 'love';

    const rec = CARD_STATE.get(card) || {};
    const prev = rec.state as 'neutral' | 'love' | 'hate' | undefined;

    if (cur !== prev) {
      if (cur === 'love') {
        burstCardParticles(card, 'heart', 10);
        if (valEl) burstBarParticles(valEl, 'heart', 5);
      } else if (cur === 'hate') {
        burstCardParticles(card, 'skull', 8);
        if (valEl) burstBarParticles(valEl, 'skull', 5);
      }
    }

    if (cur === 'love') {
      const nowTs = performance.now();
      if (!rec.lastLoveAt || nowTs - rec.lastLoveAt > 1600) {
        if (valEl) burstBarParticles(valEl, 'heart', 3);
        rec.lastLoveAt = nowTs;
      }
    }
    ensureSkullTicker(card, cur === 'hate');
    ensureLoveTicker(card, cur === 'love');

    rec.state = cur;
    rec.lastFav = fav;
    CARD_STATE.set(card, rec);

    logger.debug('processCard', '处理完成', {
      名称: (card as HTMLElement).querySelector('.role-name')?.textContent || '—',
      fav,
      阶段: cur,
      阶段文案: lblEl?.textContent || '—',
      条类: (valEl as HTMLElement | null)?.className || '—',
    });
  } catch (e) {
    logger.warn('processCard', '处理异常', e);
  }
}

/**
 * 扫描页面上所有角色卡片并进行好感渲染/粒子效果
 */
function scanAll(statWithoutMeta: any) {
  const cards = document.querySelectorAll('.role-card');
  if (!cards.length) {
    logger.debug('scanAll', '暂无角色卡片可处理');
    return 0;
  }
  cards.forEach(card => processCard(statWithoutMeta, card));
  logger.log('scanAll', '好感渲染完成', {
    数量: cards.length,
    love: loveThresholdOf(statWithoutMeta),
    hate: hateThresholdOf(statWithoutMeta),
  });
  return cards.length;
}

/**
 * 后台入口：在 era:writeDone 中被调用
 * - 输入：statWithoutMeta（从事件传入）
 * - 副作用：必要时通过 eraWriter 写回变量；通过 runtime api 读写运行时
 */
export async function runAffectionPipeline(statWithoutMeta: any): Promise<void> {
  const funcName = 'runAffectionPipeline';

  try {
    // —— 新增：样式与监听（保证每次调用都已就绪，但只注入/绑定一次）
    ensureAffectionStyles(); // 注入 .role-card 局部样式（粒子+修饰类）

    logger.log(funcName, '开始执行好感流水线', {
      mk: (statWithoutMeta && (statWithoutMeta.$mk || statWithoutMeta.mk)) || '',
    });

    // 示例：读取/写入 runtime（如需记录最近一次好感渲染时间）
    const nowTs = Date.now();
    await setRuntimeVar('affection.lastRenderAt', nowTs);
    const prevTs = getRuntimeVar<number>('affection.lastRenderAt', 0);
    logger.debug(funcName, 'runtime 打点', { prevTs, nowTs });

    scanAll(statWithoutMeta);

    // 可选：将统计信息写回 ERA 变量（示例路径，可按需调整）
    //updateEraVariable('stats.affection.lastRenderAt', nowTs);
    logger.log(funcName, '好感流水线完成');
  } catch (e) {
    logger.warn(funcName, '好感流水线异常（非致命）', e);
  }
}
