<template>
  <div id="main-content" class="preserve-format" v-html="displayHtml"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { Logger } from '../../../utils/log';

// 模块级变量，用于存储首次更新时的消息 ID
let initialMessageId: number | null = null;

interface MainContentProps {
  messageId: number | null | undefined;
  refreshKey: number;
}

const props = withDefaults(defineProps<MainContentProps>(), {
  messageId: null,
  refreshKey: 0,
});

const logger = new Logger('StatusTab/MainContent');

const displayHtml = ref('');
const lastResolvedMessageId = ref<number | null>(null);
const pendingTimer = ref<ReturnType<typeof window.setTimeout> | null>(null);

const MAX_RETRY = 5;
const RETRY_DELAY_MS = 200;

const CONTENT_REGEX = /<content>\s*(?=[\s\S]*?\S[\s\S]*?<\/content>)((?:(?!<content>)[\s\S])*?)\s*<\/content>/gi;

const clearPendingTimer = () => {
  if (pendingTimer.value !== null) {
    window.clearTimeout(pendingTimer.value);
    pendingTimer.value = null;
  }
};

const extractContentChunks = (source: string | null | undefined): string[] => {
  if (!source || typeof source !== 'string') {
    return [];
  }
  const regex = new RegExp(CONTENT_REGEX);
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(source)) !== null) {
    matches.push(match[1]?.trim() ?? '');
    if (regex.lastIndex === match.index) {
      regex.lastIndex += match[0].length;
    }
  }
  return matches.filter(chunk => chunk.length > 0);
};

const getGlobalWithSt = () =>
  window as typeof window & {
    SillyTavern?: {
      chat?: Array<{ mes?: string } & Record<string, any>>;
    };
    retrieveDisplayedMessage?: (messageId: number) => any;
  };

const getRawMessageText = (messageId: number): string | null => {
  try {
    const globalWithSt = getGlobalWithSt();
    const chatArray = globalWithSt.SillyTavern?.chat;
    const target = Array.isArray(chatArray) ? chatArray[messageId] : null;
    if (target && typeof target.mes === 'string') {
      return target.mes;
    }
  } catch (error) {
    logger.warn('getRawMessageText', `读取 SillyTavern.chat[${messageId}] 失败。`, error);
  }
  return null;
};

const getRenderedMessageHtml = (messageId: number): string | null => {
  try {
    const globalWithSt = getGlobalWithSt();
    const retrieveDisplayedMessage = globalWithSt.retrieveDisplayedMessage;
    if (typeof retrieveDisplayedMessage === 'function') {
      const result = retrieveDisplayedMessage(messageId);
      if (result) {
        if (typeof result.html === 'function') {
          return result.html();
        }
        if ('innerHTML' in result && typeof result.innerHTML === 'string') {
          return result.innerHTML;
        }
      }
    }
  } catch (error) {
    logger.warn('getRenderedMessageHtml', 'retrieveDisplayedMessage 调用失败。', error);
  }

  try {
    const selector = `[data-mid="${messageId}"] .mes_text`;
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement) {
      return element.innerHTML;
    }
  } catch (error) {
    logger.warn('getRenderedMessageHtml', '直接查询 DOM 失败。', error);
  }

  return null;
};

const resolveTargetMessageId = (): number | null => {
  if (typeof props.messageId === 'number' && props.messageId >= 0) {
    return props.messageId;
  }
  try {
    const globalWithSt = getGlobalWithSt();
    const chatArray = globalWithSt.SillyTavern?.chat;
    if (Array.isArray(chatArray) && chatArray.length > 0) {
      return chatArray.length - 1;
    }
  } catch (error) {
    logger.warn('resolveTargetMessageId', '推断最新消息 ID 失败。', error);
  }
  return null;
};

const mergeChunks = (chunks: string[]): string => {
  if (chunks.length === 0) {
    return '';
  }
  return chunks.join('\n\n');
};

const applyContent = (messageId: number, chunks: string[]) => {
  displayHtml.value = mergeChunks(chunks);
  lastResolvedMessageId.value = messageId;
  logger.debug('applyContent', `已刷新正文，来源消息 ID: ${messageId}`);
};

const attemptUpdate = (attempt = 1) => {
  clearPendingTimer();
  const targetId = resolveTargetMessageId();

  // 如果 initialMessageId 尚未设置，则将其设置为当前 targetId
  if (initialMessageId === null && typeof targetId === 'number') {
    initialMessageId = targetId;
    logger.log('attemptUpdate', `记录首次消息 ID: ${initialMessageId}`);
  }

  // 如果当前 targetId 与首次记录的 ID 不匹配，则不执行更新
  if (targetId !== initialMessageId) {
    logger.log('attemptUpdate', `当前消息 ID (${targetId}) 与首次记录的 ID (${initialMessageId}) 不匹配，跳过更新。`);
    return;
  }

  if (targetId === null) {
    if (attempt < MAX_RETRY) {
      pendingTimer.value = window.setTimeout(() => attemptUpdate(attempt + 1), RETRY_DELAY_MS);
    } else {
      logger.warn('attemptUpdate', '无法确定当前消息 ID，正文内容已清空。');
      displayHtml.value = '';
      lastResolvedMessageId.value = null;
    }
    return;
  }

  const rawMessage = getRawMessageText(targetId);
  const rawChunks = extractContentChunks(rawMessage);
  if (rawChunks.length > 0) {
    applyContent(targetId, rawChunks);
    return;
  }

  const renderedHtml = getRenderedMessageHtml(targetId);
  const renderedChunks = extractContentChunks(renderedHtml);
  if (renderedChunks.length > 0) {
    applyContent(targetId, renderedChunks);
    return;
  }

  if (attempt < MAX_RETRY) {
    pendingTimer.value = window.setTimeout(() => attemptUpdate(attempt + 1), RETRY_DELAY_MS);
    return;
  }

  logger.warn('attemptUpdate', `消息 ${targetId} 中未找到 <content> 区块，清空正文。`);
  displayHtml.value = '';
  lastResolvedMessageId.value = targetId;
};

const restartUpdateCycle = () => {
  attemptUpdate(1);
};

watch(
  () => [props.messageId, props.refreshKey],
  () => {
    restartUpdateCycle();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearPendingTimer();
});
</script>
