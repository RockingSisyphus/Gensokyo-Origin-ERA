<template>
  <div id="status-news" class="status-news">
    <h4><span class="emoji">📰</span>文文新闻</h4>
    <!-- 保留你原来的新闻容器 id，后续脚本无需改动数据写入目标 -->
    <div id="news-content" class="news-body preserve-format">—</div>
  </div>
</template>

<script setup lang="ts">
import { defineExpose } from 'vue';
import { ERA_VARIABLE_PATH } from '../utils/constants';
import { Logger } from '../utils/logger';
import { get, text } from '../utils/mvu';

// 初始化模块日志器
const logger = new Logger('components-StatusNews');

/**
 * @description 更新新闻区域的内容。
 *              该函数接收一个包含所有状态数据的对象，并从中提取新闻数据进行渲染。
 *
 * @param {object} state - 包含所有状态数据的根对象 (stat_data)。
 *
 * @example
 * // 在父组件或其它脚本中:
 * // 假设 newsComponent 是 StatusNews 组件的 ref 引用
 * const sampleState = { '文文新闻': '今天天气不错！' };
 * newsComponent.value.updateNews(sampleState);
 */
const updateNews = (state: object) => {
  const funcName = 'updateNews';
  if (!state || typeof state !== 'object') {
    logger.warn(funcName, '调用失败：传入的 state 无效。', state);
    return;
  }

  try {
    // 从 state 对象中获取 '文文新闻' 字段，如果不存在则使用空字符串作为默认值。
    const newsContent = get(state, ERA_VARIABLE_PATH.NEWS_TEXT, '');
    logger.log(funcName, '将更新新闻文本', { preview: String(newsContent).slice(0, 50) });

    // 使用 text 工具函数将新闻内容更新到 #news-content 元素中。
    text('news-content', newsContent);
    logger.debug(funcName, '新闻文本已写入 DOM 完成');
  } catch (e) {
    logger.error(funcName, '更新新闻内容时发生异常', e);
  }
};

// 暴露 updateNews 函数，以便外部可以调用。
defineExpose({
  updateNews,
});
</script>

<!-- ===== 新闻组件内部样式 ===== -->
<style lang="scss">
/*
  为了实现高内聚，将原本在 style.scss 中与本组件相关的样式全部迁移至此。
  通过将所有样式基于组件的根 ID 选择器 #status-news 进行重写，
  我们可以在不使用 scoped 的情况下，有效防止样式泄漏到全局，同时保持与父容器 .status-duo 的布局关系。
*/

/*
  定义组件在父容器 .status-duo 中的布局行为。
  这个选择器保持了对父级的依赖，这是布局所必需的。
*/
.status-duo > #status-news.status-news {
  flex: 1 1 auto;
  min-width: 320px;
  max-width: none;
  padding: 16px 20px;
  background: var(--paper);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 组件内部元素的样式，通过 #status-news 前缀来限定作用域 */
#status-news h4 {
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

#status-news h4 .emoji {
  font-size: 1em;
  line-height: 1;
  display: inline-grid;
  place-items: center;
  width: 1.25em;
  height: 1.25em;
  margin-right: 8px;
}

#status-news .news-body {
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
  max-height: 40vh;
}

/* 宽屏布局下的适应性调整 */
@media (min-width: 1100px) {
  .status-duo > #status-news.status-news {
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
  }

  #status-news .news-body {
    flex: 1 1 auto;
    max-height: none;
    overflow: auto;
  }
}
</style>
