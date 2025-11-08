<template>
  <div id="aya-news-popup" class="aya-news-popup" role="dialog">
    <h4><span class="emoji">📰</span>文文新闻</h4>
    <div id="aya-news-content-popup" class="news-body preserve-format">—</div>
  </div>
</template>

<script setup lang="ts">
import { defineExpose, onMounted } from 'vue';
import type { Stat } from '../../../GSKO-BASE/schema/stat';
import { text } from '../../utils/format';
import { Logger } from '../../utils/log';

defineEmits(['close']);

const logger = new Logger();

const updateNews = (stat: Stat) => {
  const funcName = 'updateNews';

  if (!stat || typeof stat !== 'object') {
    logger.warn(funcName, '调用失败：传入的 stat 无效。', stat);
    return;
  }

  try {
    const newsContent = stat.AyaNews ?? '';
    logger.log(funcName, '将更新新闻文本', { preview: String(newsContent).slice(0, 50) });
    text('aya-news-content-popup', newsContent);
    logger.debug(funcName, '新闻文本已写入 DOM 完成');
  } catch (e) {
    logger.error(funcName, '更新新闻内容时发生异常', e);
  }
};

defineExpose({
  updateNews,
});

onMounted(() => {
  // 组件挂载后，可能需要立即更新一次内容
  // 这取决于父组件的逻辑
});
</script>

<style lang="scss" scoped>
.aya-news-popup {
  /* 移除 position: absolute 和相关定位样式 */
  width: 100%; /* 宽度占满容器 */
  max-height: 60vh;
  overflow: auto;
  padding: 16px 20px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-top: none; /* 移除顶部边框，与按钮无缝衔接 */
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#aya-news-popup h4 {
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

#aya-news-popup h4 .emoji {
  font-size: 1em;
  line-height: 1;
  display: inline-grid;
  place-items: center;
  width: 1.25em;
  height: 1.25em;
  margin-right: 8px;
}

.news-body {
  flex: 1 1 auto;
  min-height: 0;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 10px;
  overflow: auto;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
