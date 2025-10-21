<template>
  <div id="user-state-popup" class="user-state-popup" role="region" aria-label="用户状态">
    <h4><span class="emoji">👤</span>用户状态</h4>
    <div class="sidebar-content">
      <p>
        <span class="label"><span class="emoji">📝</span>姓名:</span> <span id="user-name-popup">—</span>
      </p>
      <p>
        <span class="label"><span class="emoji">🪪</span>身份:</span> <span id="user-identity-popup">—</span>
      </p>
      <p>
        <span class="label"><span class="emoji">⚧️</span>性别:</span> <span id="user-gender-popup">—</span>
      </p>
      <p>
        <span class="label"><span class="emoji">🎂</span>年龄:</span> <span id="user-age-popup">—</span>
      </p>
      <p>
        <span class="label"><span class="emoji">✨</span>特殊能力:</span> <span id="user-abilities-popup">—</span>
      </p>
      <p>
        <span class="label"><span class="emoji">📍</span>所在地区:</span> <span id="user-location-popup">—</span>
      </p>
      <p>
        <span class="label"><span class="emoji">🏠</span>居住地区:</span> <span id="user-home-popup">—</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineExpose, ref } from 'vue';
import { get, text } from '../../utils/format';
import { Logger } from '../../utils/logger';

defineEmits(['close']);

const logger = new Logger();

const style = ref({});

const positionPopup = (_anchorEl: HTMLElement) => {
  // 内联模式无需定位；保留空实现以保证 API 兼容
  style.value = {}; // 清空内联样式，遵循文档流
};

const updateUserStatus = (userData: object, anchorEl?: HTMLElement) => {
  if (anchorEl) {
    positionPopup(anchorEl);
  }
  const funcName = 'updateUserStatus';
  logger.debug(funcName, '函数入口，接收到的 userData:', userData);

  if (!userData || typeof userData !== 'object') {
    logger.warn(funcName, '调用失败：传入的 userData 无效。', userData);
    return;
  }

  const map = [
    ['user-name-popup', '姓名'],
    ['user-identity-popup', '身份'],
    ['user-gender-popup', '性别'],
    ['user-age-popup', '年龄'],
    ['user-abilities-popup', '特殊能力'],
    ['user-location-popup', '所在地区'],
    ['user-home-popup', '居住地区'],
  ];

  map.forEach(([id, key]) => {
    const value = get(userData, key, '—');
    logger.debug(funcName, `[数据获取] 从 key '${key}' 获取到 value:`, value);
    logger.debug(funcName, `[写入DOM] 准备向 #${id} 写入内容:`, value);
    text(id, value);
  });
  logger.debug(funcName, '所有字段更新完成。');
};

defineExpose({
  updateUserStatus,
  positionPopup,
});
</script>

<style lang="scss" scoped>
.user-state-popup {
  position: static; /* 进入普通文档流 */
  width: 100%; /* 跟随父容器宽度 */
  max-height: none; /* 放开高度限制，优先撑高页面 */
  margin-top: -1px; /* 与按钮边框对齐，去重线 */
  padding: 16px; /* 原内边距保留 */
  background: var(--paper); /* 卡片底色 */
  border: 1px solid var(--line); /* 细边框 */
  border-top: 0; /* 顶部去边与按钮衔接 */
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  box-shadow: none; /* 去大阴影（不再悬浮） */
  display: flex; /* 列布局 */
  flex-direction: column;
}

.sidebar-content {
  overflow: visible; /* 优先撑高整体；超长时由页面滚动 */
}

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

h4 .emoji {
  font-size: 1em;
  line-height: 1;
  display: inline-grid;
  place-items: center;
  width: 1.25em;
  height: 1.25em;
  margin-right: 8px;
}

p {
  margin: 8px 0;
  font-size: 0.9em;
  line-height: 1.5;
}

p > span:last-child {
  flex: 1 1 auto;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
