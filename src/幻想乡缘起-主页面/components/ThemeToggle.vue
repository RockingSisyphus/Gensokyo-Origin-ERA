<template>
  <!-- 主题切换按钮 -->
  <button id="theme-toggle" class="theme-toggle" :aria-label="ariaLabel" :title="title" :aria-pressed="isDark">
    {{ icon }}
  </button>
</template>

<script setup lang="ts">
import { defineExpose, onMounted, ref, computed } from 'vue';
import { Logger } from '../utils/logger';
import { get } from '../utils/mvu';
import { updateEraVariable } from '../utils/eraWriter';
import { ERA_VARIABLE_PATH } from '../utils/constants';

// 初始化日志记录器
const logger = new Logger('components-ThemeToggle');

// 定义主题的可能值
const LIGHT = 'light';
const DARK = 'dark';

// 使用 ref 来存储当前的主题状态，默认为 light
const currentTheme = ref(LIGHT);

// -- 计算属性，根据当前主题动态生成按钮的文本和 ARIA 属性 --

// 按钮上显示的图标 (月亮或太阳)
const icon = computed(() => (currentTheme.value === LIGHT ? '🌙' : '🌞'));

// 按钮的 aria-label 属性，用于辅助技术
const ariaLabel = computed(() => (currentTheme.value === LIGHT ? '切换为黑夜模式' : '切换为白日模式'));

// 按钮的 title 属性，鼠标悬停时显示
const title = computed(() => (currentTheme.value === LIGHT ? '切换为黑夜模式' : '切换为白日模式'));

// 按钮的 aria-pressed 状态，表示是否处于“按下”（黑暗模式）状态
const isDark = computed(() => currentTheme.value === DARK);

/**
 * @description 将指定的主题应用到页面的根元素上。
 * @param {string} theme - 要应用的主题 ('light' 或 'dark')。
 */
const applyThemeToDOM = (theme: string) => {
  // 获取 <html> 元素
  const root = document.documentElement;
  if (root) {
    // 设置 data-theme 属性，CSS 会根据这个属性来切换样式
    root.setAttribute('data-theme', theme);
    logger.log('applyThemeToDOM', `已将主题应用到 DOM: ${theme}`);
  } else {
    logger.warn('applyThemeToDOM', '未找到 document.documentElement 元素。');
  }
};

/**
 * @description 从 stat_data 更新主题。此函数应由 era:writeDone 事件触发。
 * @param {object} statWithoutMeta - 包含所有状态数据的根对象。
 */
const updateTheme = (statWithoutMeta: object) => {
  const funcName = 'updateTheme';
  if (!statWithoutMeta || typeof statWithoutMeta !== 'object') {
    logger.warn(funcName, '调用失败：传入的 statWithoutMeta 无效。', statWithoutMeta);
    return;
  }

  // 从 statWithoutMeta.config.ui.theme 读取主题设置，如果不存在则默认为 'light'
  const newTheme = get(statWithoutMeta, ERA_VARIABLE_PATH.UI_THEME, LIGHT);

  // 校验主题值是否合法
  const validatedTheme = newTheme === DARK ? DARK : LIGHT;

  // 更新组件内部状态
  currentTheme.value = validatedTheme;
  // 将新主题应用到 DOM
  applyThemeToDOM(validatedTheme);

  logger.log(funcName, `从 statWithoutMeta 更新主题为: ${validatedTheme}`);
};

// onMounted 生命周期钩子，在组件挂载到 DOM 后执行
onMounted(() => {
  const funcName = 'onMounted';
  const btn = document.getElementById('theme-toggle');

  if (btn) {
    // 为按钮添加点击事件监听器
    btn.onclick = () => {
      // 计算下一个主题状态
      const nextTheme = currentTheme.value === DARK ? LIGHT : DARK;
      logger.log(`${funcName}:onclick`, `按钮被点击，准备切换到主题: ${nextTheme}`);

      // 乐观更新 UI：立即应用新主题，提供即时反馈
      currentTheme.value = nextTheme;
      applyThemeToDOM(nextTheme);

      // 通过 eraWriter 发送事件，请求后端更新世界书中的变量
      updateEraVariable(ERA_VARIABLE_PATH.UI_THEME, nextTheme);
      logger.log(`${funcName}:onclick`, `已通过 eraWriter 请求更新主题变量为: ${nextTheme}`);
    };
    logger.log(funcName, '主题切换按钮的点击事件已成功绑定。');
  } else {
    logger.warn(funcName, '未找到 #theme-toggle 按钮元素，事件绑定失败。');
  }
});

// 使用 defineExpose 暴露 updateTheme 函数，以便父组件或外部脚本可以调用
defineExpose({
  updateTheme,
});
</script>

<!-- ===== 8) 主题按钮 ===== -->
<style lang="scss" scoped>
.theme-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--paper);
  color: var(--muted);
  font-size: 18px;
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.05s ease,
    box-shadow 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
  z-index: 20;
}
.theme-toggle:active {
  transform: translateY(1px);
}
.theme-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--control-focus) 25%, transparent);
  border-color: var(--control-focus);
}

:global(:root[data-theme='light']) .theme-toggle,
:global(:root:not([data-theme])) .theme-toggle {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
:global(:root[data-theme='light']) .theme-toggle:hover,
:global(:root:not([data-theme])) .theme-toggle:hover {
  background: color-mix(in srgb, var(--paper) 88%, black 12%);
}

:global(:root[data-theme='dark']) .theme-toggle {
  border-color: color-mix(in srgb, var(--line) 70%, white 30%);
  background: color-mix(in srgb, var(--paper) 85%, white 0%);
  color: var(--ink);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}
:global(:root[data-theme='dark']) .theme-toggle:hover {
  background: color-mix(in srgb, var(--paper) 75%, white 0%);
}
</style>
