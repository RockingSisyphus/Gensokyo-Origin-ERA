<template>
  <div class="container">
    <h1>开局设定 · 录入史记</h1>
    <div class="launch-bar">
      <button id="btn_launch_ai" @click="onLaunch">设置完成，进入幻想乡</button>
    </div>
    <CharacterProfile />
    <StartTimeSettings />

    <!-- ===== 额外世界设定（写入世界书条目：额外世界设定） ===== -->
    <ExtraWorldSettings />

    <!-- ===== 幻想乡设定（动态生成自世界书 config） ===== -->
    <GensokyoSettings />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import ExtraWorldSettings from './components/ExtraWorldSettings.vue';
import CharacterProfile from './components/CharacterProfile.vue';
import StartTimeSettings from './components/StartTimeSettings.vue';
import GensokyoSettings from './components/GensokyoSettings.vue';

// ===== 0) 底层工具 · 通用 UTIL 兜底 =====
(function () {
  if ((window as any).__MVU_UTIL__) return;
  const dbg = (window as any).__MVU_DEBUG__;
  function get(o: any, p: string, fb: any) {
    try {
      const ks = String(p).split('.');
      let c = o;
      for (const k of ks) {
        if (!c || typeof c !== 'object' || !(k in c)) return fb;
        c = c[k];
      }
      return c === undefined ? fb : c;
    } catch (e) {
      alert('【UTIL/get】异常：' + String(e));
      return fb;
    }
  }
  function set(o: any, p: string | string[], v: any) {
    try {
      const ks = Array.isArray(p) ? p : String(p).split('.');
      let c = o;
      for (let i = 0; i < ks.length - 1; i++) {
        const k = ks[i];
        if (typeof c[k] !== 'object' || c[k] === null) c[k] = {};
        c = c[k];
      }
      c[ks[ks.length - 1]] = v;
      return o;
    } catch (e) {
      alert('【UTIL/set】异常：' + String(e));
      return o;
    }
  }
  function parseJSON(t: any, fb: any) {
    try {
      const o = typeof t === 'string' ? JSON.parse(t) : t;
      return o && typeof o === 'object' ? o : fb;
    } catch (_) {
      return fb;
    }
  }
  (window as any).__MVU_UTIL__ = { get, set, parseJSON };
})();

// ===== 3) 底层工具 · MVU 变量读写器（无外部依赖版） =====
(function () {
  // ... (内容与原版 script 相同, 稍作修改以适应 TS)
  function isObj(x: any) {
    return x && typeof x === 'object';
  }
  function getPath(o: any, p: string | string[], fb: any) {
    try {
      const ks = Array.isArray(p) ? [...p] : String(p).split('.');
      let c = o;
      for (const k of ks) {
        if (!isObj(c) || !(k in c)) return fb;
        c = c[k];
      }
      return c === undefined ? fb : c;
    } catch (e) {
      console.warn('【MVU_STATE/get】异常：' + String(e), { p });
      return fb;
    }
  }
  function setPath(o: any, p: string | string[], v: any) {
    try {
      const ks = Array.isArray(p) ? p : String(p).split('.');
      let c = o;
      for (let i = 0; i < ks.length - 1; i++) {
        const k = ks[i];
        if (typeof c[k] !== 'object' || c[k] === null) c[k] = {};
        c = c[k];
      }
      c[ks[ks.length - 1]] = v;
      return o;
    } catch (e) {
      console.warn('【MVU_STATE/set】异常：' + String(e), { p });
      return o;
    }
  }
  function parseJSON(t: any, fb: any) {
    try {
      const o = typeof t === 'string' ? JSON.parse(t) : t;
      return o && typeof o === 'object' ? o : fb;
    } catch (_) {
      return fb;
    }
  }

  function read() {
    const t0 = Date.now();
    try {
      if (typeof getVariables === 'function') {
        const mid_val = typeof getCurrentMessageId === 'function' ? getCurrentMessageId() : undefined;
        let message_id: number | 'latest' | undefined;
        const mid_str = mid_val !== undefined ? String(mid_val) : undefined;

        if (mid_str === 'latest') {
          message_id = 'latest';
        } else if (mid_str) {
          const parsed = parseInt(mid_str, 10);
          if (!isNaN(parsed)) {
            message_id = parsed;
          }
        }
        const v = getVariables({ type: 'message', message_id }) || {};
        const s = v.stat_data || {};
        console.log('【MVU_STATE/读取】已读取 stat_data。', { 消息ID: message_id, 顶层键数: Object.keys(s || {}).length });
        console.log('【MVU_STATE/读取】用时毫秒：', Date.now() - t0);
        return s;
      } else {
        console.warn('【MVU_STATE/读取】环境未暴露 getVariables，返回空对象。');
      }
    } catch (e) {
      console.error('【MVU_STATE/读取】异常：', String(e));
    }
    return {};
  }

  function getCharsPair(root: any) {
    const raw = getPath(root, 'chars', undefined);
    const isStr = typeof raw === 'string';
    const obj = isStr ? parseJSON(raw, {}) : isObj(raw) ? raw : {};
    return { obj, isStr };
  }

  async function applyPatches(patches: any[], { mirrorDisplay = true } = {}) {
    const where: { type: 'message'; message_id: 'latest' } = { type: 'message', message_id: 'latest' };

    function writeAll(v: any) {
      v = v || {};
      v.stat_data = isObj(v.stat_data) ? v.stat_data : {};
      v.display_data = isObj(v.display_data) ? v.display_data : mirrorDisplay ? {} : v.display_data;

      const sPair = getCharsPair(v.stat_data);
      const dPair = mirrorDisplay ? getCharsPair(v.display_data) : null;

      let wroteS = 0,
        wroteD = 0;

      for (const p of patches || []) {
        const rel = Array.isArray(p.path) ? [...p.path] : [];
        if (!rel.length) continue;

        if (rel[0] === 'chars') {
          setPath(sPair.obj, rel.slice(1), p.value);
          wroteS++;
          if (mirrorDisplay && dPair) {
            setPath(dPair.obj, rel.slice(1), p.value);
            wroteD++;
          }
          console.log('【MVU_STATE/写回】chars 路径写入。', { 路径: rel.join('.') });
        } else {
          setPath(v, ['stat_data', ...rel], p.value);
          wroteS++;
          if (mirrorDisplay) {
            setPath(v, ['display_data', ...rel], p.value);
            wroteD++;
          }
          console.log('【MVU_STATE/写回】普通路径写入。', { 路径: rel.join('.') });
        }
      }

      if (wroteS) {
        if (sPair.isStr) setPath(v, 'stat_data.chars', JSON.stringify(sPair.obj, null, 2));
        else setPath(v, 'stat_data.chars', sPair.obj);
        console.log(
          '【MVU_STATE/写回】stat_data.chars 已回写（保持原类型：' + (sPair.isStr ? '字符串' : '对象') + '）。',
        );
      }
      if (mirrorDisplay && wroteD && dPair) {
        if (dPair.isStr) setPath(v, 'display_data.chars', JSON.stringify(dPair.obj, null, 2));
        else setPath(v, 'display_data.chars', dPair.obj);
        console.log(
          '【MVU_STATE/写回】display_data.chars 已回写（保持原类型：' + (dPair.isStr ? '字符串' : '对象') + '）。',
        );
      }
      return v;
    }

    try {
      if (typeof updateVariablesWith === 'function') {
        console.log('【MVU_STATE/写回】updateVariablesWith 开始。', {
          镜像到display: !!mirrorDisplay,
          补丁数: (patches || []).length,
        });
        const result = await updateVariablesWith(writeAll, where);
        console.log('【MVU_STATE/写回】updateVariablesWith 完成。', { 返回键: Object.keys(result || {}).slice(0, 20) });
        return true;
      }

      if (typeof getVariables === 'function' && typeof replaceVariables === 'function') {
        console.warn('【MVU_STATE/写回】回退路径：getVariables + replaceVariables。');
        const cur = getVariables(where) || {};
        const next = writeAll(cur);
        await replaceVariables(next, where);
        console.log('【MVU_STATE/写回】replaceVariables 完成。', {
          补丁数: (patches || []).length,
          镜像到display: !!mirrorDisplay,
        });
        return true;
      }

      console.error('【MVU_STATE/写回】未发现可用写回 API（updateVariablesWith / replaceVariables 均缺失）。');
      return false;
    } catch (e) {
      console.error('【MVU_STATE/写回】异常：' + String(e));
      return false;
    }
  }

  (window as any).__MVU_STATE__ = { read, applyPatches, getCharsPair };
  if (
    !(window as any).mvuApplyPatches &&
    (window as any).__MVU_STATE__ &&
    typeof (window as any).__MVU_STATE__.applyPatches === 'function'
  ) {
    (window as any).mvuApplyPatches = (window as any).__MVU_STATE__.applyPatches;
  }
  console.log('【MVU_STATE】无外部依赖版模块就绪。');
})();

// ===== 2) 底层工具 · 世界书 读/写 一体化 =====
(function () {
  // ... (内容与原版 script 相同, 稍作修改以适应 TS)
  const D = (() => {
    const b = (window as any).__MVU_DEBUG__;
    return b
      ? {
          log: (...a: any[]) => b.log(...a),
          warn: (...a: any[]) => b.warn(...a),
          error: (...a: any[]) => b.error(...a),
          debug: (...a: any[]) => b.debug(...a),
          trace: (...a: any[]) => b.trace(...a),
          ts: () => (b.ts ? b.ts() : new Date().toLocaleTimeString()),
        }
      : {
          log: (...a: any[]) => console.log('【世界书】', ...a),
          warn: (...a: any[]) => console.warn('【世界书】', ...a),
          error: (...a: any[]) => console.error('【世界书】', ...a),
          debug: (...a: any[]) => console.debug('【世界书】', ...a),
          trace: (...a: any[]) => console.debug('【世界书】', ...a),
          ts: () => new Date().toLocaleTimeString(),
        };
  })();
  const DEF = {
    debug: { level: 'info', timing: true, validate: true, verboseGet: false, maxLines: 500 },
    ui: { firstRenderDelayMs: 1500, ribbonStep: 320, fontScaleStepPct: 10 },
    map: { lorebook: '幻想乡缘起MVU', comment: 'map_graph', legalPolicy: 'leaf_only' },
    mapAscii: { comment: 'map_ascii' },
    defaults: {
      fallbackPlace: '博丽神社',
      timeEpochISO: '2025-08-21T00:00:00+09:00',
      weatherPool: ['晴', '阴', '雨', '雪', '雾', '妖风', '灵雾'],
    },
    featureFlags: { mirrorDisplay: true, autoWeather: true },
    selectors: { nearbyTargetId: 'nearby-places' },
  };
  function deepMerge(a: any, b: any): any {
    if (Array.isArray(a) && Array.isArray(b)) return [...b];
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const o = { ...a };
      for (const k of Object.keys(b)) o[k] = deepMerge(a[k], b[k]);
      return o;
    }
    return b === undefined ? a : b;
  }
  function parseJSON(text: any, ctx: any) {
    try {
      const obj = typeof text === 'string' ? JSON.parse(text) : text || null;
      if (!obj || typeof obj !== 'object') {
        D.warn('【世界书/JSON】条目不是 JSON 对象：', ctx);
        return null;
      }
      return obj;
    } catch (e) {
      D.error('【世界书/JSON】解析失败：', { 错误: String(e), 上下文: ctx });
      return null;
    }
  }
  function setPath(obj: any, path: string, v: any) {
    const ks = String(path).split('.');
    let cur = obj;
    for (let i = 0; i < ks.length - 1; i++) {
      const k = ks[i];
      if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
      cur = cur[k];
    }
    cur[ks[ks.length - 1]] = v;
  }
  async function getEntry(lorebook: string, { comment }: { comment: string }) {
    const lb = String(lorebook || '幻想乡缘起MVU');
    const key = String(comment || '').trim();
    if (!key) {
      D.warn('【世界书/读取】缺少 comment 作为 name 关键字。');
      return null;
    }
    if (typeof (window as any).getWorldbook !== 'function') {
      D.error('【世界书/读取】环境未提供 getWorldbook API。');
      return null;
    }
    try {
      const list = await (window as any).getWorldbook(lb);
      const hit = (list || []).find((e: any) => String(e?.name || '').trim() === key) || null;
      if (hit) {
        D.log('【世界书/读取】命中条目：', { 世界书: lb, name: key, 内容长度: String(hit.content || '').length });
        return { ...hit, content: hit.content };
      } else {
        const names = Array.from(new Set((list || []).map((e: any) => String(e?.name || '').trim())))
          .filter(Boolean)
          .slice(0, 40);
        D.warn('【世界书/读取】未找到条目：', { 世界书: lb, nameWanted: key, 可用name示例: names });
        return null;
      }
    } catch (e) {
      D.error('【世界书/读取】异常：', { 错误: String(e), 世界书: lb, name: key });
      return null;
    }
  }
  async function getJSON(lorebook: string, { comment }: { comment: string }) {
    const hit = await getEntry(lorebook, { comment });
    if (!hit) return null;
    return parseJSON(hit.content, { 世界书: lorebook, name: comment });
  }
  async function loadConfig() {
    const lore = '幻想乡缘起MVU';
    const obj = await getJSON(lore, { comment: 'config' });
    const cfg = deepMerge(DEF, obj || {});
    try {
      (window as any).__MVU_CONFIG__ = cfg;
      if ((window as any).__MVU_DEBUG__) {
        const dbg = (window as any).__MVU_DEBUG__;
        dbg.cfg.level = cfg.debug.level;
        dbg.cfg.timing = !!cfg.debug.timing;
        dbg.cfg.validate = !!cfg.debug.validate;
        dbg.cfg.verboseGet = !!cfg.debug.verboseGet;
        dbg.cfg.maxLines = Number(cfg.debug.maxLines) || 500;
      }
      D.log('【配置】已装载并合并：', cfg);
      document.dispatchEvent(new CustomEvent('mvu:config-ready', { detail: { config: cfg } }));
    } catch (e) {
      D.error('【配置】写入全局失败：', String(e));
    }
    return cfg;
  }
  async function writeConfigPath(path: string, value: any, lorebook: string) {
    const lb = String(lorebook || '幻想乡缘起MVU');
    if (
      typeof (window as any).getWorldbook !== 'function' ||
      typeof (window as any).updateWorldbookWith !== 'function'
    ) {
      D.error('【世界书/写入】环境未提供所需 API（getWorldbook / updateWorldbookWith）。');
      return false;
    }
    D.log('【世界书/写入】准备更新 config 路径：', { 世界书: lb, 路径: path, 目标值: value });
    try {
      const list = await (window as any).getWorldbook(lb);
      const idx = (list || []).findIndex((e: any) => String(e?.name || '').trim() === 'config');
      if (idx < 0) {
        D.warn('【世界书/写入】未找到 config 条目：', { 世界书: lb });
        return false;
      }
      const entry = list[idx];
      const obj = parseJSON(entry.content, { 世界书: lb, name: 'config' });
      if (!obj) {
        D.warn('【世界书/写入】config 不是合法 JSON，已放弃写入。');
        return false;
      }
      setPath(obj, path, value);
      const afterStr = JSON.stringify(obj, null, 2);
      const changed = afterStr !== entry.content;
      if (!changed) {
        D.log('【世界书/写入】内容未变化（无需提交）。', { 世界书: lb, name: 'config', 路径: path });
        return false;
      }
      await (window as any).updateWorldbookWith(
        lb,
        (entries: any[]) => {
          const hit = entries.find(e => String(e?.name || '').trim() === 'config');
          if (hit) hit.content = afterStr;
          return entries;
        },
        { render: 'immediate' },
      );
      D.log('【世界书/写入】已提交并请求立刻渲染。', { 世界书: lb, name: 'config', 路径: path, 新值: value });
      return true;
    } catch (e) {
      D.error('【世界书/写入】提交失败：', String(e));
      return false;
    }
  }
  (window as any).__MVU_LORE__ = { getEntry, getJSON, loadConfig, defaults: DEF, writeConfigPath };
  document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
  });
  D.log('【世界书】读/写一体化模块就绪（简化版）。');
})();

// ===== 3) 基础逻辑 · map_graph 叶节点提取 =====



// ===== Launch Logic =====
function readUser() {
  try {
    const s = (window as any).__MVU_STATE__?.read?.() || {};
    const u = s.user || {};
    const pick = (k: string, fb = '未知') => (typeof u[k] === 'string' && u[k].trim() ? u[k].trim() : fb);
    return {
      姓名: pick('姓名', '{{user}}'),
      性别: pick('性别', '未知'),
      年龄: pick('年龄', '未知'),
      人际关系: pick('人际关系', '暂无'),
      特殊能力: pick('特殊能力', '在地上行走程度的能力'),
      身份: pick('身份', '外来者'),
      所在地区: pick('所在地区', '博丽神社'),
      居住地区: pick('居住地区', '未知'),
      重要经历: pick('重要经历', '因为未知的原因，来到了幻想乡'),
    };
  } catch (e) {
    console.error('读取 user 失败：', e);
    return null;
  }
}

function buildPayload(user: any) {
  const guidelines =
    '请基于上面的“角色设定”，写一段开场剧情；' +
    '若“身份”为“外来者”或“重要经历”包含“初到幻想乡”，请写成“初入幻想乡”的场景；' +
    '否则写成其在当前所在地区的日常开场。建议在开场剧情中引入一个可能在{{user}}当前所在区域出现的角色。';
  return { type: 'MVU_LAUNCH', user, guidelines };
}

function sendToAI(payload: any) {
  const msg = JSON.stringify(payload, null, 2);
  const cmd = `/send ${msg}|/trigger`;
  if (typeof window.triggerSlash === 'function') {
    window.triggerSlash(cmd);
  } else {
    console.warn('未检测到 triggerSlash，无法自动发送。将要发送的内容：\n', msg);
    alert('未检测到 triggerSlash，无法自动发送。内容已打印到控制台。');
  }
}

function onLaunch() {
  const user = readUser();
  if (!user) {
    alert('未读取到 user，请先点击“写入角色到 MVU 变量”。');
    return;
  }
  sendToAI(buildPayload(user));
}

onMounted(() => {
  document.addEventListener('mvu:config-ready', () => {
    // renderConfig((window as any).__MVU_CONFIG__);
  });

  if ((window as any).__MVU_CONFIG__) {
    // renderConfig((window as any).__MVU_CONFIG__);
  }
});
</script>
