<template>
  <div class="container">
    <h1>开局设定 · 录入史记</h1>
    <div class="launch-bar">
      <button id="btn_launch_ai" @click="onLaunch">设置完成，进入幻想乡</button>
    </div>
    <!-- ===== 开局 · 角色档案 ===== -->
    <div class="card">
      <h2>角色档案</h2>
      <div class="grid-2 grid">
        <div>
          <label for="u_name">姓名</label>
          <input id="u_name" type="text" placeholder="如：博丽某某" />
        </div>
        <div>
          <label for="u_identity">身份</label>
          <input id="u_identity" type="text" placeholder="如：外界来访者 / 里民 / 巫女见习" />
        </div>
        <div>
          <label>性别</label>
          <div class="row">
            <label class="inline"><input type="radio" name="u_gender" value="未知" checked /> 未知</label>
            <label class="inline"><input type="radio" name="u_gender" value="男" /> 男</label>
            <label class="inline"><input type="radio" name="u_gender" value="女" /> 女</label>
            <label class="inline"><input type="radio" name="u_gender" value="其他" /> 其他</label>
            <input id="u_gender_other" type="text" placeholder="选择“其他”时可填写" style="display: none" />
          </div>
        </div>
        <div>
          <label for="u_age">年龄</label>
          <input id="u_age" type="number" min="0" step="1" placeholder="数字（岁）" />
        </div>
      </div>

      <div class="grid-2 grid">
        <div>
          <label for="u_home">居住地区</label>
          <select id="u_home">
            <option value="" disabled selected>— 请选择 —</option>
          </select>
        </div>
        <div>
          <label for="u_current">所在地区</label>
          <select id="u_current">
            <option value="" disabled selected>— 请选择 —</option>
          </select>
        </div>
      </div>

      <div class="grid">
        <div>
          <label for="u_relationships">人际关系</label>
          <input id="u_relationships" type="text" placeholder="如：与灵梦相识 / 与魔理沙偶遇" />
        </div>
        <div>
          <label for="u_ability">特殊能力</label>
          <input id="u_ability" type="text" placeholder="如：在地上行走程度的能力" />
        </div>
        <div>
          <label for="u_notes">重要经历</label>
          <textarea id="u_notes" placeholder="因为未知的原因，来到了幻想乡"></textarea>
        </div>
      </div>

      <div class="btn-bar">
        <button id="btn_save_user" @click="writeUserToMVU">写入角色到 MVU 变量</button>
        <button id="btn_fill_demo" class="muted-btn" @click="fillDemo">填充示例</button>
      </div>
    </div>
    <!-- ===== 开局时间设置（显示 YYYY-MM-DD + HH:mm；偏移隐藏保存） ===== -->
    <div class="card">
      <h2>设置开局时间</h2>
      <div class="grid-2 grid" id="epoch_holder" data-offset="+09:00">
        <div>
          <label for="epoch_date">日期（YYYY-MM-DD）</label>
          <input id="epoch_date" type="date" placeholder="2025-08-21" @input="syncPreview" />
        </div>
        <div>
          <label for="epoch_time">时分（HH:mm）</label>
          <input id="epoch_time" type="time" step="60" placeholder="08:00" @input="syncPreview" />
        </div>
      </div>

      <div class="row" style="margin-top: 10px">
        <div class="tag">预览：<span id="epoch_preview">—</span></div>
        <div class="btn-bar" style="margin: 0">
          <button id="btn_epoch_reload" class="muted-btn" @click="fillUI">从配置读取</button>
          <button id="btn_epoch_save" @click="saveEpoch">保存到配置</button>
        </div>
      </div>
    </div>

    <!-- ===== 额外世界设定（写入世界书条目：额外世界设定） ===== -->
    <div class="card">
      <h2>额外世界设定</h2>
      <div class="hint">
        本区内容将被保存为世界书条目 <small class="code">“额外世界设定”</small> 的 <small class="code">content</small>，用于补充世界背景/临时规则等。
      </div>
      <textarea id="extra_world_lore" placeholder="在此编写你的自定义幻想乡额外设定。建议以‘【额外世界设定】’开头，比如：【额外世界设定】幻想乡的大家都变得像灵梦一样贫穷了！"></textarea>
      <div class="btn-bar">
        <button id="btn_load_extra" class="muted-btn" @click="loadExtraToTextarea">从世界书载入</button>
        <button id="btn_save_extra" @click="saveTextareaToExtra">保存到世界书</button>
      </div>
    </div>

    <!-- ===== 幻想乡设定（动态生成自世界书 config） ===== -->
    <div class="card">
      <h2>幻想乡设定（注意：请慎重修改设定，乱改可能会导致bug）</h2>
      <div class="row" style="margin-bottom: 10px">
        <span class="tag" id="cfg_status">未载入</span>
        <button id="btn_reload_cfg" class="muted-btn" @click="reloadCfg">重载配置</button>
        <button id="btn_expand_all" class="muted-btn" @click="expandAll">展开全部</button>
        <button id="btn_collapse_all" class="muted-btn" @click="collapseAll">折叠全部</button>
        <button id="btn_save_cfg" @click="saveChanges">保存更改到世界书</button>
      </div>
      <div class="hint">每个字段右侧为当前值输入区：布尔=勾选，数字=数字框，字符串=文本框，数组=多行一项一行。对象会折叠成分组。</div>
      <div id="cfg_root" class="grid"></div>
      <div class="sep"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

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
        const mid_str = typeof getCurrentMessageId === 'function' ? getCurrentMessageId() : undefined;
        const mid = mid_str ? parseInt(mid_str, 10) : undefined;
        const v = getVariables({ type: 'message', message_id: mid as any }) || {};
        const s = v.stat_data || {};
        console.log('【MVU_STATE/读取】已读取 stat_data。', { 消息ID: mid, 顶层键数: Object.keys(s || {}).length });
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
    const where = { type: 'message' as const, message_id: 'latest' };

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
        console.log('【MVU_STATE/写回】stat_data.chars 已回写（保持原类型：' + (sPair.isStr ? '字符串' : '对象') + '）。');
      }
      if (mirrorDisplay && wroteD && dPair) {
        if (dPair.isStr) setPath(v, 'display_data.chars', JSON.stringify(dPair.obj, null, 2));
        else setPath(v, 'display_data.chars', dPair.obj);
        console.log('【MVU_STATE/写回】display_data.chars 已回写（保持原类型：' + (dPair.isStr ? '字符串' : '对象') + '）。');
      }
      return v;
    }

    try {
      if (typeof updateVariablesWith === 'function') {
        console.log('【MVU_STATE/写回】updateVariablesWith 开始。', { 镜像到display: !!mirrorDisplay, 补丁数: (patches || []).length });
        const result = await updateVariablesWith(writeAll, where);
        console.log('【MVU_STATE/写回】updateVariablesWith 完成。', { 返回键: Object.keys(result || {}).slice(0, 20) });
        return true;
      }

      if (typeof getVariables === 'function' && typeof replaceVariables === 'function') {
        console.warn('【MVU_STATE/写回】回退路径：getVariables + replaceVariables。');
        const cur = getVariables(where) || {};
        const next = writeAll(cur);
        await replaceVariables(next, where);
        console.log('【MVU_STATE/写回】replaceVariables 完成。', { 补丁数: (patches || []).length, 镜像到display: !!mirrorDisplay });
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
  if (!(window as any).mvuApplyPatches && (window as any).__MVU_STATE__ && typeof (window as any).__MVU_STATE__.applyPatches === 'function') {
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
    defaults: { fallbackPlace: '博丽神社', timeEpochISO: '2025-08-21T00:00:00+09:00', weatherPool: ['晴', '阴', '雨', '雪', '雾', '妖风', '灵雾'] },
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
    if (typeof (window as any).getWorldbook !== 'function' || typeof (window as any).updateWorldbookWith !== 'function') {
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
          const hit = entries.find((e) => String(e?.name || '').trim() === 'config');
          if (hit) hit.content = afterStr;
          return entries;
        },
        { render: 'immediate' }
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
async function loadPlaces() {
  try {
    const cfg = (window as any).__MVU_CONFIG__ || (await (window as any).__MVU_LORE__?.loadConfig?.());
    const lore = cfg?.map?.lorebook || '幻想乡缘起MVU';
    const comment = cfg?.map?.comment || 'map_graph';
    const obj = await (window as any).__MVU_LORE__?.getJSON?.(lore, { comment });
    const tree = obj?.tree && typeof obj.tree === 'object' ? obj.tree : null;
    if (!tree) {
      console.warn('【地点/加载】未找到 tree');
      return [];
    }

    const leaves: string[] = [];
    const visit = (node: any) => {
      if (Array.isArray(node)) {
        for (const v of node) {
          if (typeof v === 'string') leaves.push(v);
          else if (v && typeof v === 'object') Object.values(v).forEach(visit);
        }
      } else if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) visit(node[k]);
      } else if (typeof node === 'string') {
        leaves.push(node);
      }
    };
    visit(tree);
    const uniq = Array.from(new Set(leaves)).sort((a, b) => a.localeCompare(b, 'zh-Hans'));

    const homeSel = document.getElementById('u_home') as HTMLSelectElement;
    const currSel = document.getElementById('u_current') as HTMLSelectElement;
    const rebuild = (sel: HTMLSelectElement) => {
      if (!sel) return;
      sel.innerHTML = '<option value="" disabled selected>— 请选择 —</option>';
      for (const s of uniq) {
        const op = document.createElement('option');
        op.value = s;
        op.textContent = s;
        sel.appendChild(op);
      }
    };
    rebuild(homeSel);
    rebuild(currSel);

    (window as any).__MVU_PLACES__ = uniq;
    return uniq;
  } catch (e) {
    console.error('【地点/加载】异常：', e);
    return [];
  }
}

// ===== 4) 基础逻辑 · 幻想乡设定 动态渲染 + 差异保存 =====
let CFG_INIT: any = null;

function isPlainObject(o: any) {
  return o && typeof o === 'object' && !Array.isArray(o);
}

function pathJoin(base: string, key: string) {
  return base ? base + '.' + key : key;
}

function createControl(path: string, value: any) {
  const wrap = document.createElement('div');
  wrap.className = 'kv';
  const label = document.createElement('div');
  label.className = 'key';
  label.textContent = path;
  const control = document.createElement('div');
  control.className = 'control';
  wrap.appendChild(label);
  wrap.appendChild(control);

  if (typeof value === 'boolean') {
    const ck = document.createElement('input');
    ck.type = 'checkbox';
    ck.checked = !!value;
    control.appendChild(ck);
    return { el: wrap, getVal: () => !!ck.checked };
  }
  if (typeof value === 'number') {
    const num = document.createElement('input');
    num.type = 'number';
    num.value = String(value);
    control.appendChild(num);
    return { el: wrap, getVal: () => Number(num.value) };
  }
  if (Array.isArray(value)) {
    const isPrim = (v: any) => v == null || ['string', 'number', 'boolean'].includes(typeof v);
    const arrIsPrim = value.every(isPrim);

    const ta = document.createElement('textarea');
    ta.style.width = '100%';
    ta.style.minHeight = '100px';
    control.appendChild(ta);

    if (arrIsPrim) {
      ta.value = value.map((v) => String(v)).join('\n');
      return {
        el: wrap,
        getVal: () => {
          const lines = (ta.value || '').split('\n').map((s) => s.trim()).filter(Boolean);
          const allNum = lines.every((s) => /^-?\d+(?:\.\d+)?$/.test(s));
          return allNum ? lines.map(Number) : lines;
        },
      };
    } else {
      ta.value = (() => {
        try {
          return JSON.stringify(value, null, 2);
        } catch (e) {
          return '[]';
        }
      })();
      return {
        el: wrap,
        getVal: () => {
          try {
            const txt = ta.value && ta.value.trim();
            return txt ? JSON.parse(txt) : [];
          } catch (e) {
            return value;
          }
        },
      };
    }
  }

  const txt = document.createElement('input');
  txt.type = 'text';
  txt.value = String(value);
  control.appendChild(txt);
  return { el: wrap, getVal: () => txt.value };
}

function renderObject(container: HTMLElement, obj: any, basePath: string, docText: string) {
  const group = document.createElement('details');
  group.open = false;
  const sum = document.createElement('summary');
  sum.textContent = basePath || '(root)';
  group.appendChild(sum);
  if (docText) {
    const kd = document.createElement('div');
    kd.className = 'kdoc';
    kd.textContent = docText;
    group.appendChild(kd);
  }

  const keys = Object.keys(obj);
  keys.forEach((k) => {
    if (k === '__doc' || k === '_doc' || k.endsWith('__doc') || k.startsWith('_')) return;
    const v = obj[k];
    const p = pathJoin(basePath, k);
    if (isPlainObject(v)) {
      const groupDoc = v._doc || obj[k + '__doc'];
      const child = renderObject(container, v, p, groupDoc);
      group.appendChild(child);
    } else {
      const leafDoc = obj[k + '__doc'];
      const { el, getVal } = createControl(p, v);
      if (leafDoc) {
        const kd = document.createElement('div');
        kd.className = 'kdoc';
        kd.textContent = leafDoc;
        el.insertBefore(kd, el.children[1]);
      }
      el.dataset.path = p;
      try {
        el.dataset.init = JSON.stringify(v);
      } catch (_) {
        // JSON.stringify on circular objects will throw, but we can ignore it
      }
      (el as any).__getVal = getVal;
      group.appendChild(el);
    }
  });
  return group;
}

function renderConfig(cfg: any) {
  const root = document.getElementById('cfg_root');
  if (!root) return;
  root.innerHTML = '';
  CFG_INIT = cfg;
  const view = renderObject(root, cfg, '', cfg && cfg._doc ? cfg._doc : '');
  view.open = false;
  root.appendChild(view);
  const tag = document.getElementById('cfg_status');
  if (tag) {
    tag.textContent = '已载入';
    tag.style.background = '#eef7ea';
    tag.style.borderColor = '#b7d6b3';
  }
}

function collectChanges() {
  const root = document.getElementById('cfg_root');
  if (!root) return [];
  const items = root.querySelectorAll('[data-path]');
  const changes: any[] = [];
  items.forEach((el) => {
    const path = (el as HTMLElement).dataset.path;
    const getVal = (el as any).__getVal;
    if (!getVal || !path) return;
    const cur = getVal();
    let initVal = null;
    try {
      initVal = JSON.parse((el as HTMLElement).dataset.init || 'null');
    } catch (_) {
      // Ignore parsing errors
    }
    const a = JSON.stringify(cur);
    const b = JSON.stringify(initVal);
    if (a !== b) {
      changes.push({ path, from: initVal, to: cur });
    }
  });
  return changes;
}

async function saveChanges() {
  const changes = collectChanges();
  for (const c of changes) {
    try {
      await (window as any).__MVU_LORE__?.writeConfigPath?.(c.path, c.to);
    } catch (e) {
      alert('【开局/设定】写入失败：' + String(e));
    }
  }
  await (window as any).__MVU_LORE__?.loadConfig?.();
}

function expandAll() {
  document.querySelectorAll('#cfg_root details').forEach((d) => ((d as HTMLDetailsElement).open = true));
}
function collapseAll() {
  document.querySelectorAll('#cfg_root details').forEach((d) => ((d as HTMLDetailsElement).open = false));
}
async function reloadCfg() {
  const cfg = await (window as any).__MVU_LORE__?.loadConfig?.();
  renderConfig(cfg);
}

// ===== 5) 渲染模块 · 角色写入 =====
function pickGender() {
  const radios = document.querySelectorAll('input[name="u_gender"]');
  let v = '未知';
  radios.forEach((r) => {
    if ((r as HTMLInputElement).checked) v = (r as HTMLInputElement).value;
  });
  if (v === '其他') {
    const alt = (document.getElementById('u_gender_other') as HTMLInputElement).value.trim();
    v = alt || '未知';
  }
  return v;
}

function bindGenderOtherToggle() {
  const radios = document.querySelectorAll('input[name="u_gender"]');
  const other = document.getElementById('u_gender_other') as HTMLInputElement;
  const sync = () => {
    const picked = Array.from(radios).find((r) => (r as HTMLInputElement).checked) as HTMLInputElement | undefined;
    other.style.display = picked?.value === '其他' ? 'block' : 'none';
    if (picked?.value !== '其他') other.value = '';
  };
  radios.forEach((r) => r.addEventListener('change', sync));
  sync();
}

function fillDemo() {
  const cfg = (window as any).__MVU_CONFIG__ || {};
  (document.getElementById('u_name') as HTMLInputElement).value = '{{user}}';
  (document.getElementById('u_identity') as HTMLInputElement).value = '外来者';
  (document.querySelector('input[name="u_gender"][value="未知"]') as HTMLInputElement).checked = true;
  (document.getElementById('u_age') as HTMLInputElement).value = '18';
  const selHome = document.getElementById('u_home') as HTMLSelectElement;
  const selCurr = document.getElementById('u_current') as HTMLSelectElement;
  const pick = (sel: HTMLSelectElement, preferred: string[] = []) => {
    const opts = Array.from(sel?.options || []);
    for (const v of preferred.filter(Boolean)) {
      const hit = opts.find((o) => o.value === v);
      if (hit) {
        sel.value = v;
        return;
      }
    }
    if (opts.length > 1) sel.selectedIndex = 1;
  };

  pick(selHome, [cfg?.defaults?.fallbackPlace, '博丽神社']);
  pick(selCurr, ['博丽神社', cfg?.defaults?.fallbackPlace]);

  (document.getElementById('u_relationships') as HTMLInputElement).value = '暂无';
  (document.getElementById('u_ability') as HTMLInputElement).value = '在地上行走程度的能力';
  (document.getElementById('u_notes') as HTMLTextAreaElement).value = '因为未知的原因，来到了幻想乡';
}

async function writeUserToMVU() {
  const profile = {
    name: ((document.getElementById('u_name') as HTMLInputElement).value || '').trim() || '{{user}}',
    identity: ((document.getElementById('u_identity') as HTMLInputElement).value || '').trim(),
    gender: pickGender(),
    age: Number((document.getElementById('u_age') as HTMLInputElement).value || '0') || 0,
  };
  const ability = {
    summary: ((document.getElementById('u_ability') as HTMLInputElement).value || '').trim(),
  };
  const location = {
    home: ((document.getElementById('u_home') as HTMLSelectElement).value || '').trim(),
    current: ((document.getElementById('u_current') as HTMLSelectElement).value || '').trim(),
  };
  const relationships = ((document.getElementById('u_relationships') as HTMLInputElement).value || '').trim();
  const notes = ((document.getElementById('u_notes') as HTMLTextAreaElement).value || '').trim();

  const userObj = {
    姓名: profile.name,
    性别: profile.gender || '未知',
    年龄: profile.age ? String(profile.age) : '未知',
    人际关系: relationships || '暂无',
    特殊能力: (() => {
      const sum = ability.summary || '在地上行走程度的能力';
      return sum;
    })(),
    身份: profile.identity || '外来者',
    所在地区: location.current || '博丽神社',
    居住地区: location.home || '未知',
    重要经历: notes || '因为未知的原因，来到了幻想乡',
  };

  const writer = (v: any) => {
    v = v || {};
    v.stat_data = v.stat_data && typeof v.stat_data === 'object' ? v.stat_data : {};
    v.stat_data.user = userObj;

    const mirror = typeof (window as any).__MVU_CONFIG__?.featureFlags?.mirrorDisplay === 'boolean' ? (window as any).__MVU_CONFIG__.featureFlags.mirrorDisplay : true;
    if (mirror) {
      v.display_data = v.display_data && typeof v.display_data === 'object' ? v.display_data : {};
      v.display_data.user = userObj;
    }
    return v;
  };

  let ok = false;
  try {
    if (typeof updateVariablesWith === 'function') {
      await updateVariablesWith(writer, { type: 'message' as const, message_id: 'latest' });
      ok = true;
    } else if (typeof getVariables === 'function' && typeof replaceVariables === 'function') {
      const where = { type: 'message' as const, message_id: 'latest' };
      const cur = getVariables(where) || {};
      await replaceVariables(writer(cur), where);
      ok = true;
    } else if (typeof triggerSlash === 'function') {
      await triggerSlash('/setvar stat_data ' + JSON.stringify({ user: userObj }));
      ok = true;
    } else {
      alert('【开局/写回】找不到任何写回 API。');
    }
  } catch (e) {
    alert('【开局/写回】异常：' + String(e));
  }

  if (!ok) {
    alert('写入失败：无法调用写回 API，请查看控制台。');
  }
}

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
  const guidelines = '请基于上面的“角色设定”，写一段开场剧情；' + '若“身份”为“外来者”或“重要经历”包含“初到幻想乡”，请写成“初入幻想乡”的场景；' + '否则写成其在当前所在地区的日常开场。建议在开场剧情中引入一个可能在{{user}}当前所在区域出现的角色。';
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

// ===== 额外世界设定 =====
function pickLorebook() {
  try {
    return (window as any).__MVU_CONFIG__?.map?.lorebook || '幻想乡缘起MVU';
  } catch (e) {
    return '幻想乡缘起MVU';
  }
}

async function loadExtraToTextarea() {
  const box = document.getElementById('extra_world_lore') as HTMLTextAreaElement;
  if (!box) return;
  const lb = pickLorebook();

  try {
    const hit = await (window as any).__MVU_LORE__?.getEntry?.(lb, { comment: '额外世界设定' });
    if (!hit) {
      box.value = '';
      alert('未找到世界书条目“额外世界设定”。如需新建，直接在文本框输入内容后点“保存到世界书”。');
      return;
    }
    const txt = String(hit.content ?? '');
    box.value = txt;
  } catch (e) {
    alert('载入失败：' + String(e));
  }
}

async function saveTextareaToExtra() {
  const box = document.getElementById('extra_world_lore') as HTMLTextAreaElement;
  if (!box) return;
  const lb = pickLorebook();
  const nextContent = String(box.value ?? '');

  if (typeof (window as any).getWorldbook !== 'function' || typeof (window as any).updateWorldbookWith !== 'function') {
    alert('保存失败：当前环境缺少世界书写入 API。');
    return;
  }

  try {
    await (window as any).updateWorldbookWith(
      lb,
      (entries: any[]) => {
        const nameWanted = '额外世界设定';
        const idx = (entries || []).findIndex((e) => String(e?.name || '').trim() === nameWanted);
        if (idx >= 0) {
          entries[idx].content = nextContent;
        } else {
          entries.push({ name: nameWanted, content: nextContent });
        }
        return entries;
      },
      { render: 'immediate' }
    );
  } catch (e) {
    alert('保存失败：' + String(e));
  }
}

// ===== 开局时间设置 =====
function zz(n: string | number) {
  n = String(n || '');
  return n.length === 1 ? '0' + n : n;
}

async function readEpochFromConfig() {
  try {
    const cfg = (window as any).__MVU_CONFIG__ || (await (window as any).__MVU_LORE__?.loadConfig?.());
    const raw = cfg?.defaults?.timeEpochISO || '2025-08-21T08:00:00+09:00';
    const src = raw && typeof raw === 'string' && raw.trim() ? raw.trim() : '2025-08-21T08:00:00+09:00';
    const m = src.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?(Z|[+-]\d{2}:\d{2})?$/);
    const date = m ? m[1] : '2025-08-21';
    const hh = m ? m[2] : '08';
    const mi = m ? m[3] : '00';
    const ss = m && m[4] ? m[4] : '00';
    const off = m && m[5] ? m[5] : /(?:\+|-|Z)/.test(src) ? (src.match(/(Z|[+-]\d{2}:\d{2})$/) || ['+09:00'])[0] : '+09:00';
    return { date, hh, mi, ss, off };
  } catch (e) {
    return { date: '2025-08-21', hh: '08', mi: '00', ss: '00', off: '+09:00' };
  }
}

async function fillUI() {
  const hit = await readEpochFromConfig();
  const date = document.getElementById('epoch_date') as HTMLInputElement;
  const time = document.getElementById('epoch_time') as HTMLInputElement;
  const prev = document.getElementById('epoch_preview') as HTMLSpanElement;
  const hold = document.getElementById('epoch_holder') as HTMLElement;

  if (!date || !time || !prev || !hold) return;

  date.value = hit.date;
  time.value = `${zz(hit.hh)}:${zz(hit.mi)}`;
  hold.dataset.offset = hit.off || '+09:00';
  prev.textContent = `${date.value}T${time.value}`;
}

async function saveEpoch() {
  const dateValue = (document.getElementById('epoch_date') as HTMLInputElement)?.value || '';
  const timeValue = (document.getElementById('epoch_time') as HTMLInputElement)?.value || '';
  const off = (document.getElementById('epoch_holder') as HTMLElement)?.dataset?.offset || '+09:00';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    alert('请先选择有效日期。');
    return;
  }
  if (!/^\d{2}:\d{2}$/.test(timeValue)) {
    alert('请先输入有效时间（HH:mm）。');
    return;
  }

  const shown = `${dateValue}T${timeValue}`;
  const iso = `${dateValue}T${timeValue}:00${off}`;

  try {
    const ok = await (window as any).__MVU_LORE__?.writeConfigPath?.('defaults.timeEpochISO', iso);
    if (ok) {
      (document.getElementById('epoch_preview') as HTMLSpanElement).textContent = shown;
      await (window as any).__MVU_LORE__?.loadConfig?.();
      alert('开局时间已保存到配置。');
    } else {
      alert('未发生变化或写入失败。请查看控制台日志。');
    }
  } catch (e) {
    alert('保存失败：' + String(e));
  }
}

function syncPreview() {
  const d = (document.getElementById('epoch_date') as HTMLInputElement)?.value || '--------';
  const t = (document.getElementById('epoch_time') as HTMLInputElement)?.value || '--:--';
  (document.getElementById('epoch_preview') as HTMLSpanElement).textContent = `${d}T${t}`;
}

onMounted(() => {
  document.addEventListener('mvu:config-ready', () => {
    loadPlaces();
    renderConfig((window as any).__MVU_CONFIG__);
    loadExtraToTextarea();
    fillUI();
  });

  if ((window as any).__MVU_CONFIG__) {
    loadPlaces();
    renderConfig((window as any).__MVU_CONFIG__);
    loadExtraToTextarea();
    fillUI();
  }

  bindGenderOtherToggle();
});
</script>
