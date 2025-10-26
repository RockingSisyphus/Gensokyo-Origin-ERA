<template>
  <div>
    <h4><span class="emoji">⚙️</span>设置</h4>
    <div class="row" style="display: flex; gap: 8px; align-items: center; margin: 8px 0 12px">
      <span id="cfg_status" class="tag">{{ loadStatus }}</span>
      <button id="btn_expand_all" @click="expandAll">展开全部</button>
      <button id="btn_collapse_all" @click="collapseAll">折叠全部</button>
      <button id="btn_save_cfg" @click="save">保存更改到世界书</button>
    </div>
    <div class="hint">布尔=勾选，数字=数字框，字符串=文本框，数组=每行一项。对象会折叠为分组。</div>
    <div id="cfg_root" ref="configRoot"></div>
  </div>
</template>

<script setup lang="ts">
import { get as _get, cloneDeep, isEqual } from 'lodash';
import { ref } from 'vue';
import { updateEraVariable } from '../../../utils/eraWriter';
import { Logger } from '../../../utils/log';

// 日志记录器
const logger = new Logger();

// 响应式变量
const loadStatus = ref('未载入');
const configRoot = ref<HTMLElement | null>(null); // 用于挂载动态生成的DOM

// 存储从 ERA 加载的原始配置，用于后续比较
let initialConfig: any = null;

// 定义一个接口来描述配置更改的结构
interface ConfigChange {
  path: string;
  from: any;
  to: any;
}

// 存储叶子节点的数量
let leafCount = 0;
// 存储分组节点的数量
let groupCount = 0;

/**
 * @description 判断一个值是否为纯对象
 * @param o - 要检查的值
 * @returns {boolean} 如果是纯对象则返回 true
 */
const isObj = (o: any) => o && typeof o === 'object' && !Array.isArray(o);

/**
 * @description 连接路径片段
 * @param base - 基础路径
 * @param k - 要添加的键
 * @returns {string} 拼接后的完整路径
 */
const join = (base: string, k: string) => (base ? `${base}.${k}` : k);

/**
 * @description 为配置项创建对应的 HTML 输入控件
 * @param path - 配置项的路径
 * @param value - 配置项的值
 * @returns {{el: HTMLDivElement, getVal: Function}} 包含控件元素和获取其值的函数的对象
 */
function createControl(path: string, value: any) {
  const wrap = document.createElement('div');
  const key = document.createElement('div');
  const box = document.createElement('div');
  wrap.style.margin = '10px 0';
  key.style.fontWeight = '600';
  key.style.color = '#5e5042';
  key.textContent = path;
  wrap.appendChild(key);
  wrap.appendChild(box);

  let getVal: () => any;

  if (typeof value === 'boolean') {
    const el = document.createElement('input');
    el.type = 'checkbox';
    el.checked = !!value;
    box.appendChild(el);
    getVal = () => !!el.checked;
  } else if (typeof value === 'number') {
    const el = document.createElement('input');
    el.type = 'number';
    el.value = String(value);
    el.style.width = '100%';
    box.appendChild(el);
    getVal = () => Number(el.value);
  } else if (Array.isArray(value)) {
    const isPrimitiveArray = value.every(v => v === null || ['string', 'number', 'boolean'].includes(typeof v));
    const el = document.createElement('textarea');
    el.style.width = '100%';
    el.style.minHeight = '100px';
    box.appendChild(el);

    if (isPrimitiveArray) {
      el.value = value.map(v => String(v)).join('\n');
      getVal = () => {
        const lines = (el.value || '')
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean);
        const allNumbers = lines.every(s => /^-?\d+(?:\.\d+)?$/.test(s));
        return allNumbers ? lines.map(Number) : lines;
      };
    } else {
      el.value = JSON.stringify(value, null, 2);
      getVal = () => {
        try {
          const text = el.value.trim();
          return text ? JSON.parse(text) : [];
        } catch (e) {
          logger.error('createControl', `解析JSON失败，路径: ${path}`, e);
          return value; // 解析失败时返回原始值，防止破坏数据
        }
      };
    }
  } else {
    const el = document.createElement('input');
    el.type = 'text';
    el.value = String(value);
    el.style.width = '100%';
    box.appendChild(el);
    getVal = () => el.value;
  }

  leafCount++;
  // 在控件的 wrapper 上附加获取值的函数和路径/初始值信息
  (wrap as any).__getVal = getVal;
  wrap.dataset.path = path;
  try {
    wrap.dataset.init = JSON.stringify(value);
  } catch {
    wrap.dataset.init = '';
  }

  return wrap;
}

/**
 * @description 为对象类型的配置项创建可折叠的分组
 * @param obj - 配置对象
 * @param basePath - 当前的基础路径
 * @param docText - 该分组的文档/说明文本
 * @returns {HTMLDetailsElement} 创建的 details 元素
 */
function createGroup(obj: any, basePath: string, docText?: string) {
  const box = document.createElement('details');
  box.open = false;
  const sum = document.createElement('summary');
  sum.textContent = basePath || '(root)';
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
    const p = join(basePath, k);
    if (isObj(v)) {
      const child = createGroup(v, p, v._doc || obj[`${k}__doc`]);
      box.appendChild(child);
    } else {
      const leafDoc = obj[`${k}__doc`];
      const controlElement = createControl(p, v);
      if (leafDoc) {
        const d = document.createElement('div');
        d.style.color = '#857664';
        d.style.fontSize = '.9em';
        d.style.margin = '6px 0 10px';
        d.textContent = leafDoc;
        controlElement.insertBefore(d, controlElement.children[1]);
      }
      box.appendChild(controlElement);
    }
  });

  return box;
}

/**
 * @description 渲染整个配置表单
 * @param cfg - 从 statWithoutMeta 中获取的配置对象
 */
function render(cfg: any) {
  if (!configRoot.value) {
    logger.warn('render', '无法渲染，因为 #cfg_root 容器不存在。');
    return;
  }
  const t0 = performance.now();
  leafCount = 0;
  groupCount = 0;
  configRoot.value.innerHTML = '';
  initialConfig = cloneDeep(cfg); // 深拷贝一份初始配置用于比较

  const view = createGroup(cfg, '', cfg?._doc);
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
    const path = (el as HTMLElement).dataset.path;
    const getVal = (el as any).__getVal;
    if (!path || !getVal) return;

    const currentValue = getVal();
    let initialValue = null;
    try {
      initialValue = JSON.parse((el as HTMLElement).dataset.init || 'null');
    } catch {
      // 忽略解析错误，initialValue 将保持 null
    }

    if (!isEqual(currentValue, initialValue)) {
      changes.push({ path, from: initialValue, to: currentValue });
    }
  });

  logger.log('collectChanges', `差异收集完成`, {
    scanned,
    changed: changes.length,
    ms: (performance.now() - t0).toFixed(1),
    sample: changes.slice(0, 5),
  });
  return changes;
}

/**
 * @description 保存更改到 ERA 变量
 */
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

    let ok = 0,
      fail = 0;
    for (const change of changes) {
      try {
        // 使用 eraWriter 更新变量
        updateEraVariable(`config.${change.path}`, change.to);
        ok++;
        logger.log(funcName, `已通过 era:updateByPath 请求更新`, { path: `config.${change.path}` });
      } catch (e) {
        fail++;
        logger.error(funcName, `写入失败`, { path: change.path, error: e });
      }
    }

    // 更新完成后，重新加载配置以同步UI
    logger.log(funcName, `保存完成`, { ok, fail });
    toastr.success(`保存成功 ${ok} 项，失败 ${fail} 项。`);
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

/**
 * @description 外部调用的更新函数
 * @param statWithoutMeta - 从 era:writeDone 事件中获取的 stat 数据
 */
function update(statWithoutMeta: any) {
  const funcName = 'update';
  logger.log(funcName, '接收到更新请求', { keys: Object.keys(statWithoutMeta || {}).length });
  const config = _get(statWithoutMeta, 'config');
  if (config && typeof config === 'object') {
    render(config);
  } else {
    logger.warn(funcName, '在 statWithoutMeta 中未找到有效的 config 对象。');
    loadStatus.value = '配置无效';
  }
}

// 暴露 update 方法给父组件
defineExpose({
  update,
});
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
