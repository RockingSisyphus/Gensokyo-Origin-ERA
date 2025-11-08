<template>
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
    <div class="hint">
      每个字段右侧为当前值输入区：布尔=勾选，数字=数字框，字符串=文本框，数组=多行一项一行。对象会折叠成分组。
    </div>
    <div id="cfg_root" class="grid"></div>
    <div class="sep"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

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
      ta.value = value.map(v => String(v)).join('\n');
      return {
        el: wrap,
        getVal: () => {
          const lines = (ta.value || '')
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean);
          const allNum = lines.every(s => /^-?\d+(?:\.\d+)?$/.test(s));
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
  keys.forEach(k => {
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
  items.forEach(el => {
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
  document.querySelectorAll('#cfg_root details').forEach(d => ((d as HTMLDetailsElement).open = true));
}
function collapseAll() {
  document.querySelectorAll('#cfg_root details').forEach(d => ((d as HTMLDetailsElement).open = false));
}
async function reloadCfg() {
  const cfg = await (window as any).__MVU_LORE__?.loadConfig?.();
  renderConfig(cfg);
}

onMounted(() => {
  document.addEventListener('mvu:config-ready', () => {
    renderConfig((window as any).__MVU_CONFIG__);
  });

  if ((window as any).__MVU_CONFIG__) {
    renderConfig((window as any).__MVU_CONFIG__);
  }
});
</script>
