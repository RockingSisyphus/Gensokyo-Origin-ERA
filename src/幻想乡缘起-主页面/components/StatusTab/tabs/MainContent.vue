<template>
  <div id="main-content" class="preserve-format" v-html="displayHtml"></div>
</template>

<script setup lang="ts">
/**
 * @file MainContent.vue
 * @description
 * 该组件负责从传入的聊天消息对象中提取由 <content> 标签包裹的内容，并将其显示出来。
 */
import { ref, watch } from 'vue';
import { Logger } from '../../../utils/log';

/**
 * @interface MainContentProps
 * @description 组件接收的属性。
 * @property {ChatMessage | null | undefined} latestMessage - 当前最新的消息对象。
 * @property {number} refreshKey - 一个用于强制触发内容更新的 key。
 */
interface MainContentProps {
  latestMessage: ChatMessage | null | undefined;
  refreshKey: number;
}

// 定义组件的 props。
const props = withDefaults(defineProps<MainContentProps>(), {
  latestMessage: null,
  refreshKey: 0,
});

// 初始化日志记录器
const logger = new Logger('StatusTab/MainContent');

// 存储最终要显示在模板中的 HTML 内容。
const displayHtml = ref('');

// 用于从文本中提取 <content>...</content> 区块的正则表达式。
const CONTENT_REGEX = /<content>\s*(?=[\s\S]*?\S[\s\S]*?<\/content>)((?:(?!<content>)[\s\S])*?)\s*<\/content>/gi;

/**
 * @function extractAndDisplayContent
 * @description 从 props.latestMessage 中提取 <content> 内容并更新 displayHtml。
 */
const extractAndDisplayContent = () => {
  if (!props.latestMessage) {
    logger.log('extractAndDisplayContent', '传入的 message 为空，清空正文。');
    displayHtml.value = '';
    return;
  }

  const { message, message_id } = props.latestMessage;

  const regex = new RegExp(CONTENT_REGEX);
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  // 循环匹配所有 <content> 块
  while ((match = regex.exec(message)) !== null) {
    matches.push(match[1]?.trim() ?? '');
    // 防止在零长度匹配时陷入死循环
    if (regex.lastIndex === match.index) {
      regex.lastIndex += match[0].length;
    }
  }

  const chunks = matches.filter(chunk => chunk.length > 0);

  if (chunks.length > 0) {
    displayHtml.value = chunks.join('\n\n');
    logger.debug('extractAndDisplayContent', `已刷新正文，来源消息 ID: ${message_id}`);
  } else {
    logger.warn('extractAndDisplayContent', `消息 ${message_id} 中未找到 <content> 区块，清空正文。`);
    displayHtml.value = '';
  }
};

// 监听 props 的变化，当 latestMessage 或 refreshKey 改变时，重新更新内容。
watch(
  () => [props.latestMessage, props.refreshKey],
  extractAndDisplayContent,
  { immediate: true, deep: true }, // 立即执行一次，并在对象内部变化时触发
);
</script>
