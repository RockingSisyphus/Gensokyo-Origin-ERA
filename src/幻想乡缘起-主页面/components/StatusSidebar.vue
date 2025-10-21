<template>
  <div id="status-sidebar" class="status-sidebar">
    <div class="status-section user-status">
      <h4><span class="emoji">👤</span>用户状态</h4>
      <p>
        <span class="label"><span class="emoji">📝</span>姓名:</span> <span id="user-name">—</span>
      </p>
      <p>
        <span class="label"><span class="emoji">🪪</span>身份:</span> <span id="user-identity">—</span>
      </p>
      <p>
        <span class="label"><span class="emoji">⚧️</span>性别:</span> <span id="user-gender">—</span>
      </p>
      <p>
        <span class="label"><span class="emoji">🎂</span>年龄:</span> <span id="user-age">—</span>
      </p>
      <p>
        <span class="label"><span class="emoji">✨</span>特殊能力:</span> <span id="user-abilities">—</span>
      </p>
      <p>
        <span class="label"><span class="emoji">📍</span>所在地区:</span> <span id="user-location">—</span>
      </p>
      <p>
        <span class="label"><span class="emoji">🏠</span>居住地区:</span> <span id="user-home">—</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineExpose } from 'vue';
import { get, text } from '../utils/mvu';
import { Logger } from '../utils/logger';

const logger = new Logger('components-StatusSidebar');

/**
 * @description 更新侧边栏的用户状态信息。
 *              这个函数被设计为可从外部调用，它接收一个用户数据对象，
 *              然后使用导入的工具函数来更新侧边栏的显示内容。
 *
 * @param {object} userData - 包含用户状态数据的对象。
 *                            例如：{ '姓名': '博丽灵梦', '身份': '巫女', ... }
 *
 * @example
 * // 在父组件或其它脚本中:
 * // 假设 sidebarComponent 是 StatusSidebar 组件的 ref 引用
 * const sampleUserData = { '姓名': '博丽灵梦', '身份': '巫女', '年龄': 18 };
 * sidebarComponent.value.updateUserStatus(sampleUserData);
 */
const updateUserStatus = (userData: object) => {
  const funcName = 'updateUserStatus';
  logger.debug(funcName, '函数入口，接收到的 userData:', userData);

  // 校验传入的 userData 是否有效。如果为空或不是对象，则不执行更新。
  if (!userData || typeof userData !== 'object') {
    logger.warn(funcName, '调用失败：传入的 userData 无效。', userData);
    return;
  }

  // 定义一个映射关系表（map）。
  // 这个数组清晰地将 HTML 元素的 ID 与数据对象中的键（或路径）关联起来。
  // 这样做的好处是，当需要增删字段时，只需修改这个数组，而无需改动核心逻辑。
  // 格式：['DOM元素ID', '数据对象中的键名']
  const map = [
    ['user-name', '姓名'],
    ['user-identity', '身份'],
    ['user-gender', '性别'],
    ['user-age', '年龄'],
    ['user-abilities', '特殊能力'],
    ['user-location', '所在地区'],
    ['user-home', '居住地区'],
  ];

  // 遍历映射表，为每个条目执行更新操作。
  map.forEach(([id, key]) => {
    // 使用 get 函数从 userData 对象中安全地读取数据。
    // 第三个参数 '—' 是一个默认值，如果数据对象中不存在对应的键，将使用这个默认值。
    // 这可以防止界面上出现 "undefined" 或 "null" 等不友好的文本。
    const value = get(userData, key, '—');
    logger.debug(funcName, `[数据获取] 从 key '${key}' 获取到 value:`, value);

    // 使用 text 函数将获取到的值更新到 ID 对应的 DOM 元素中。
    // 这个函数内部会处理 null、undefined 等情况，确保界面显示的一致性。
    logger.debug(funcName, `[写入DOM] 准备向 #${id} 写入内容:`, value);
    text(id, value);
  });
  logger.debug(funcName, '所有字段更新完成。');
};

// 使用 defineExpose 将 updateUserStatus 函数暴露给父组件。
// 这样，父组件就可以通过 ref 引用来调用这个方法，实现了父子组件之间的通信。
// 例如，在父组件中：<StatusSidebar ref="sidebarRef" />
// 然后就可以通过 sidebarRef.value.updateUserStatus(data) 来调用。
defineExpose({
  updateUserStatus,
});
</script>

<!-- ===== 侧边栏内部样式 ===== -->
<style lang="scss" scoped>
.status-sidebar {
  /* 外部布局：作为 flex item 的行为 */
  flex: 0 0 350px;
  max-width: none;

  /* 内部视觉样式 */
  padding: 16px;
  background: var(--paper);
  border-right: 1px solid var(--line);
}

/* 标题外观（从 style.scss 迁移） */
h4 {
  display: flex;
  align-items: center;
  height: var(--duo-head-h);
  margin: 0 0 10px;
  padding: 0;
  line-height: 1;
  font-size: 1.1em;
  color: var(--muted);
  border-bottom: 1px solid var(--line);
}

/* 标题中的 emoji（从 style.scss 迁移） */
h4 .emoji {
  font-size: 1em;
  line-height: 1;
  display: inline-grid;
  place-items: center;
  width: 1.25em;
  height: 1.25em;
  margin-right: 8px;
}

/* 左栏内容 */
p {
  margin: 8px 0;
  font-size: 0.9em;
  line-height: 1.5;
}

/* 用户状态里“值”允许换行 */
.user-status p > span:last-child {
  flex: 1 1 auto;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
