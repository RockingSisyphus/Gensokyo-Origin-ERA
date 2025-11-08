<template>
  <div>
    <h4><span class="emoji">⚙️</span>设置</h4>
    <div class="row" style="display: flex; gap: 8px; align-items: center; margin: 8px 0 12px">
      <span id="cfg_status" class="tag">{{ loadStatus }}</span>
      <button id="btn_expand_all" @click="expandAll">展开全部</button>
      <button id="btn_collapse_all" @click="collapseAll">折叠全部</button>
      <button id="btn_save_cfg" @click="save">保存更改</button>
    </div>
    <div class="hint">布尔=勾选，数字=数字框，字符串=文本框，数组=每行一项。对象会折叠为分组。</div>
    <div id="cfg_root" ref="configRoot"></div>
  </div>
</template>

<script setup lang="ts">
import { cloneDeep, isEqual } from 'lodash';
import { onMounted, ref, watch } from 'vue';
import { updateEraVariableByObject } from '../../../utils/eraWriter';
import { Logger } from '../../../utils/log';

interface ConfigChange {
  path: string[];
  pathLabel: string;
  from: any;
  to: any;
}

interface ContentSettingsProps {
  config: Record<string, any> | null | undefined;
}

const props = defineProps<ContentSettingsProps>();
const emit = defineEmits<{
  (e: 'saved', payload: { ok: number; fail: number; patch: Record<string, any> }): void;
}>();

const logger = new Logger();

const loadStatus = ref('未载入');
const configRoot = ref<HTMLElement | null>(null); // 用于挂载动态生成的 DOM

let initialConfig: any = null; // 深拷贝的原始配置，用于比较
let editedConfig: any = null; // 当前正在编辑的配置副本

let leafCount = 0; // 叶子节点数量
let groupCount = 0; // 分组节点数量
let pendingConfig: Record<string, any> | null | undefined; // 在 DOM 未就绪时暂存配置

const isObj = (o: any) => o && typeof o === 'object' && !Array.isArray(o);

const handleConfigUpdate = (config: Record<string, any> | null | undefined) => {
  if (!configRoot.value) {
    pendingConfig = config;
    return;
  }

  if (!config) {
    configRoot.value.innerHTML = '';
    loadStatus.value = '未载入';
    initialConfig = null;
    editedConfig = null;
    return;
  }

  if (typeof config !== 'object') {
    logger.warn('handleConfigUpdate', '配置对象无效，期望为 object。');
    configRoot.value.innerHTML = '';
    loadStatus.value = '配置无效';
    initialConfig = null;
    editedConfig = null;
    return;
  }

  render(config);
};

watch(
  () => props.config,
  config => {
    handleConfigUpdate(config);
  },
  { immediate: true },
);

onMounted(() => {
  if (pendingConfig !== undefined) {
    const config = pendingConfig;
    pendingConfig = undefined;
    handleConfigUpdate(config);
  }
});

const pathLabel = (segments: string[]) => (segments.length ? segments.join('.') : 'config');

const getValueAtPath = (root: any, segments: string[]) =>
  segments.reduce((acc, key) => (acc != null ? acc[key] : undefined), root);

const setValueAtPath = (root: any, segments: string[], value: any) => {
  if (!segments.length) {
    return;
  }
  let current = root;
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    if (!isObj(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }
  current[segments[segments.length - 1]] = value;
};

function createControl(segments: string[], parent: Record<string, any>, key: string, value: any, docText?: string) {
  const wrap = document.createElement('div');
  const keyEl = document.createElement('div');
  const box = document.createElement('div');
  wrap.style.margin = '10px 0';
  keyEl.style.fontWeight = '600';
  keyEl.style.color = '#5e5042';
  keyEl.textContent = pathLabel(segments);
  wrap.appendChild(keyEl);

  if (docText) {
    const docEl = document.createElement('div');
    docEl.style.color = '#857664';
    docEl.style.fontSize = '.9em';
    docEl.style.margin = '6px 0 10px';
    docEl.textContent = docText;
    wrap.appendChild(docEl);
  }

  wrap.appendChild(box);

  let getDomValue: () => any;

  if (typeof value === 'boolean') {
    const el = document.createElement('input');
    el.type = 'checkbox';
    el.checked = !!value;
    box.appendChild(el);
    getDomValue = () => !!el.checked;
  } else if (typeof value === 'number') {
    const el = document.createElement('input');
    el.type = 'number';
    el.value = String(value);
    el.style.width = '100%';
    box.appendChild(el);
    getDomValue = () => Number(el.value);
  } else if (Array.isArray(value)) {
    const isPrimitiveArray = value.every(v => v === null || ['string', 'number', 'boolean'].includes(typeof v));
    const el = document.createElement('textarea');
    el.style.width = '100%';
    el.style.minHeight = '100px';
    box.appendChild(el);

    if (isPrimitiveArray) {
      el.value = value.map(v => String(v)).join('\n');
      getDomValue = () => {
        const lines = (el.value || '')
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean);
        const allNumbers = lines.every(s => /^-?\d+(?:\.\d+)?$/.test(s));
        return allNumbers ? lines.map(Number) : lines;
      };
    } else {
      el.value = JSON.stringify(value, null, 2);
      getDomValue = () => {
        try {
          const text = el.value.trim();
          return text ? JSON.parse(text) : [];
        } catch (e) {
          logger.error('createControl', `解析 JSON 失败，路径: ${pathLabel(segments)}`, e);
          return value; // 解析失败时返回原始值，防止破坏数据
        }
      };
    }
  } else {
    const el = document.createElement('input');
    el.type = 'text';
    el.value = value == null ? '' : String(value);
    el.style.width = '100%';
    box.appendChild(el);
    getDomValue = () => el.value;
  }

  leafCount++;

  const initialValue = cloneDeep(getValueAtPath(initialConfig, segments));

  (wrap as any).__getDomValue = getDomValue;
  (wrap as any).__applyValue = (next: any) => {
    parent[key] = next;
  };
  (wrap as any).__initialValue = initialValue;
  (wrap as any).__pathSegments = segments.slice();
  (wrap as any).__pathLabel = pathLabel(segments);

  wrap.dataset.path = pathLabel(segments);

  return wrap;
}

/**
 * @description 为对象类型的配置项创建可折叠的分组
 * @param obj - 配置对象
 * @param basePath - 当前的基础路径
 * @param docText - 该分组的文档/说明文本
 * @returns {HTMLDetailsElement} 创建的 details 元素
 */
function createGroup(obj: any, segments: string[], docText?: string, summaryLabel?: string) {
  const box = document.createElement('details');
  box.open = false;
  const sum = document.createElement('summary');
  sum.textContent = summaryLabel ?? (segments.length ? segments[segments.length - 1] : '(root)');
  box.appendChild(sum);

  if (docText) {
    const d = document.createElement('div');
    d.style.color = '#857664';
    d.style.fontSize = '.9em';
    d.style.margin = '6px 0 10px';
    d.textContent = docText;
    box.appendChild(d);
  }

  groupCount++;

  Object.keys(obj).forEach(k => {
    if (k === '__doc' || k === '_doc' || k.endsWith('__doc') || k.startsWith('_')) return;
    const v = obj[k];
    const nextSegments = [...segments, k];
    if (isObj(v)) {
      const child = createGroup(v, nextSegments, v?._doc || obj[`${k}__doc`], k);
      box.appendChild(child);
    } else {
      const leafDoc = obj[`${k}__doc`];
      const controlElement = createControl(nextSegments, obj, k, v, leafDoc);
      box.appendChild(controlElement);
    }
  });

  return box;
}

/**
 * @description 渲染整个配置表单
 * @param config - 传入的配置对象
 */
function render(config: Record<string, any>) {
  if (!configRoot.value) {
    logger.warn('render', '#cfg_root 容器尚未就绪，推迟渲染。');
    pendingConfig = config;
    return;
  }
  const t0 = performance.now();

  initialConfig = cloneDeep(config);
  editedConfig = cloneDeep(config);

  leafCount = 0;
  groupCount = 0;
  configRoot.value.innerHTML = '';

  const view = createGroup(editedConfig, [], editedConfig?._doc, 'config');
  view.open = false;
  configRoot.value.appendChild(view);
  loadStatus.value = '已载入';

  const ms = (performance.now() - t0).toFixed(1);
  logger.log('render', `配置渲染完成`, { groups: groupCount, leaves: leafCount, ms });
}

/**
 * @description 收集表单中已发生变化的值
 * @returns {Array<{path: string, from: any, to: any}>} 变化的配置项数组
 */
function collectChanges(): ConfigChange[] {
  const t0 = performance.now();
  const items = configRoot.value?.querySelectorAll('[data-path]') || [];
  const changes: ConfigChange[] = [];
  let scanned = 0;

  items.forEach(el => {
    scanned++;
    const getDomValue = (el as any).__getDomValue as (() => any) | undefined;
    const applyValue = (el as any).__applyValue as ((next: any) => void) | undefined;
    const initialValue = (el as any).__initialValue;
    const pathSegments = (el as any).__pathSegments as string[] | undefined;
    const label = (el as any).__pathLabel as string | undefined;
    if (!getDomValue || !applyValue || !pathSegments || !label) return;

    const currentValue = getDomValue();
    applyValue(cloneDeep(currentValue));

    if (!isEqual(currentValue, initialValue)) {
      changes.push({
        path: pathSegments,
        pathLabel: label,
        from: initialValue,
        to: cloneDeep(currentValue),
      });
    }
  });

  logger.log('collectChanges', `差异收集完成`, {
    scanned,
    changed: changes.length,
    ms: (performance.now() - t0).toFixed(1),
    sample: changes.slice(0, 5).map(item => ({ path: item.pathLabel, to: item.to })),
  });
  return changes;
}

const buildPatchObject = (changes: ConfigChange[]) => {
  const patch: Record<string, any> = {};
  changes.forEach(change => {
    setValueAtPath(patch, change.path, cloneDeep(change.to));
  });
  return patch;
};

async function save() {
  const funcName = 'save';
  try {
    const changes = collectChanges();
    if (!changes.length) {
      logger.log(funcName, '无变化，无需保存。');
      toastr.info('没有检测到任何更改。');
      return;
    }

    logger.log(funcName, `准备写入 ${changes.length} 项更改...`);
    toastr.info(`正在保存 ${changes.length} 项更改...`);

    const patch = buildPatchObject(changes);
    let ok = 0;
    let fail = 0;

    try {
      updateEraVariableByObject({ config: patch });
      ok = changes.length;
      logger.log(funcName, `已发送 era:updateByObject`, { patch });
      toastr.success(`保存成功 ${ok} 项。`);
      emit('saved', { ok, fail, patch });
      if (editedConfig && typeof editedConfig === 'object') {
        render(editedConfig);
        loadStatus.value = '已保存';
      } else {
        loadStatus.value = '已保存';
      }
    } catch (error) {
      fail = changes.length;
      logger.error(funcName, `写入失败`, error);
      toastr.error('保存过程中发生未知错误。');
      emit('saved', { ok, fail, patch });
    }
  } catch (e) {
    logger.error(funcName, `保存过程出现异常`, e);
    toastr.error('保存过程中发生未知错误。');
  }
}

/**
 * @description 展开所有可折叠的分组
 */
function expandAll() {
  const list = configRoot.value?.querySelectorAll('details');
  list?.forEach(d => (d.open = true));
  logger.log('expandAll', `展开了 ${list?.length || 0} 个分组。`);
}

/**
 * @description 折叠所有可折叠的分组
 */
function collapseAll() {
  const list = configRoot.value?.querySelectorAll('details');
  list?.forEach(d => (d.open = false));
  logger.log('collapseAll', `折叠了 ${list?.length || 0} 个分组。`);
}
</script>

<!-- ===== 12) 设置界面控件（仅限 #content_settings 作用域） ===== -->
<style lang="scss" scoped>
/* 每个配置项外层容器（JS 会渲染 data-path） */
:deep([data-path]) {
  background: rgba(255, 247, 232, 0.06);
  border: 1px dashed var(--line);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 10px 0;
}

/* 表单控件：输入框、数字框、文本域、下拉框 */
:deep(input[type='text']),
:deep(input[type='number']),
:deep(textarea),
:deep(select) {
  width: 100%;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 6px;
  padding: 9px 11px;
  font-size: 14px;
  color: var(--ink);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03) inset;
}

/* 聚焦反馈 */
:deep(input:focus),
:deep(textarea:focus),
:deep(select:focus) {
  outline: none;
  border-color: var(--control-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--control-focus) 28%, transparent);
}

/* 复选框主色（配合暖色系主题） */
:deep(input[type='checkbox']) {
  accent-color: var(--control-focus);
}

/* 操作按钮（重载/展开/折叠/保存） */
:deep(button) {
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 10px 14px;
  font-weight: 700;
  background: var(--btn-accent);
  color: #fff;
  transition:
    background 0.2s,
    box-shadow 0.2s,
    border-color 0.2s,
    transform 0.02s;
}
:deep(button:hover) {
  background: var(--btn-accent-hover);
}
:deep(button:active) {
  transform: translateY(1px);
}

/* 次要按钮（若有使用 .muted-btn 类） */
:deep(.muted-btn) {
  background: var(--btn-muted);
  color: var(--muted);
  border-color: var(--btn-muted-border);
}
:deep(.muted-btn:hover) {
  filter: brightness(0.97);
}

/* 折叠分组（details/summary） */
:deep(details) {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper);
  margin: 10px 0;
  padding: 8px 10px 10px;
}
:deep(summary) {
  font-weight: 700;
  color: var(--muted);
  background: color-mix(in srgb, var(--paper) 88%, black 0%);
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
  user-select: none;
}
:deep(details[open] > summary) {
  background: color-mix(in srgb, var(--paper) 78%, black 0%);
}

/* 顶部状态徽章（“未载入/已载入”等） */
:deep(#cfg_status) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border: 1px solid color-mix(in srgb, var(--control-focus) 35%, white 65%);
  background: color-mix(in srgb, var(--control-focus) 10%, white 90%);
  color: color-mix(in srgb, var(--control-focus) 70%, black 30%);
  border-radius: 999px;
  font-weight: 700;
  line-height: 1.8;
}
</style>
