ybm
<template>
  <div>
    <section class="tag-editor-shell">
      <button
        class="tag-editor-toggle"
        type="button"
        :aria-expanded="showTagEditor"
        aria-controls="tag-editor-panel"
        @click="toggleTagEditor"
      >
        <span class="tag-editor-toggle-label">{{ showTagEditor ? '收起标签筛选' : '展开标签筛选' }}</span>
        <span class="tag-editor-toggle-icon" aria-hidden="true"></span>
      </button>
      <transition name="tag-editor-slide">
        <div v-show="showTagEditor" id="tag-editor-panel" class="tag-editor">
          <div class="tag-input-group">
            <label for="main-tags">正文标签:</label>
            <input id="main-tags" v-model="mainTagsInput" type="text" placeholder="比如content" />
          </div>
          <div class="tag-input-group">
            <label for="exclude-tags">排除标签:</label>
            <input id="exclude-tags" v-model="excludeTagsInput" type="text" placeholder="比如think" />
          </div>
          <button class="save-btn" @click="saveTags">保存</button>
        </div>
      </transition>
    </section>

    <div id="main-content" class="preserve-format" v-html="displayHtml"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file MainContent.vue
 * @description
 * 该组件负责从传入的聊天消息对象中提取由 <content> 标签包裹的内容，并将其显示出来。
 * 同时提供 UI 来编辑主内容和排除内容的标签。
 */
import { onMounted, ref, watch } from 'vue';
import { extractContentForMatching } from '../../../../GSKO-BASE/utils/message';
import { updateEraVariableByObject } from '../../../utils/eraWriter';
import { Logger } from '../../../utils/log';

// 初始化日志记录器
const logger = new Logger('StatusTab/MainContent');

// 本地存储当前消息
const latestMessage = ref<ChatMessage | null>(null);

// 存储最终要显示在模板中的 HTML 内容。
const displayHtml = ref('');

// 用于输入框双向绑定的 ref
const mainTagsInput = ref('');
const excludeTagsInput = ref('');
const showTagEditor = ref(false);

const tagsToString = (tags: string[]) => tags.join(' | ');

const stringToTags = (str: string) =>
  str
    .split('|')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

/**
 * @description 保存标签配置的更改。
 */
const saveTags = () => {
  const newMainBodyTags = stringToTags(mainTagsInput.value);
  const newExcludeBodyTags = stringToTags(excludeTagsInput.value);

  const patch = {
    config: {
      mainBodyTags: newMainBodyTags,
      excludeBodyTags: newExcludeBodyTags,
    },
  };

  logger.log('saveTags', '正在保存标签配置...', patch);
  updateEraVariableByObject(patch);
};

const toggleTagEditor = () => {
  showTagEditor.value = !showTagEditor.value;
};

const extractAndDisplayContent = () => {
  if (!latestMessage.value) {
    logger.log('extractAndDisplayContent', '本地 message 为空，清空正文。');
    displayHtml.value = '';
    return;
  }

  const { message_id } = latestMessage.value;

  // 直接在使用前获取最新的聊天变量
  const chatVars = getVariables({ type: 'chat' });
  let mainBodyTags: string[] = [];
  let excludeBodyTags: string[] = [];

  if (chatVars?.stat_data?.config) {
    mainBodyTags = chatVars.stat_data.config.mainBodyTags ?? [];
    excludeBodyTags = chatVars.stat_data.config.excludeBodyTags ?? [];
  } else {
    logger.warn('extractAndDisplayContent', '在聊天变量中未找到 stat_data.config。');
  }

  // 打印出将要使用的标签
  logger.log('extractAndDisplayContent', '使用的标签:', {
    mainBodyTags,
    excludeBodyTags,
  });

  // 使用新的工具函数来提取内容
  const extracted = extractContentForMatching([latestMessage.value], {
    mainBodyTags: mainBodyTags.includes('*') ? [] : mainBodyTags,
    excludeBodyTags,
  });

  if (extracted) {
    displayHtml.value = extracted;
    logger.debug('extractAndDisplayContent', `已刷新正文，来源消息 ID: ${message_id}`);
  } else {
    logger.warn(
      'extractAndDisplayContent',
      `消息 ${message_id} 中未找到指定的主内容区块 (main: ${mainBodyTags.join(
        ',',
      )}, exclude: ${excludeBodyTags.join(',')})，清空正文。`,
    );
    displayHtml.value = '';
  }
};

// 监听本地消息的变化，重新更新内容。
watch(latestMessage, extractAndDisplayContent, {
  immediate: true,
  deep: true,
});

/**
 * @description 获取并更新当前的消息。
 */
const fetchAndUpdateMessage = async () => {
  try {
    const currentMessageId = await getCurrentMessageId();
    if (currentMessageId === null || currentMessageId === undefined) {
      logger.warn('fetchAndUpdateMessage', '无法获取当前消息 ID。');
      latestMessage.value = null;
      return;
    }

    // getChatMessages 接收 number 或 string 类型的 range
    const messages = await getChatMessages(currentMessageId);
    const currentMessage = messages[0]; // 获取单个消息时，返回数组的第一个元素

    if (currentMessage) {
      latestMessage.value = currentMessage;
      logger.log('fetchAndUpdateMessage', `已成功获取并更新消息，ID: ${currentMessageId}`);
    } else {
      logger.warn('fetchAndUpdateMessage', `在消息列表中未找到 ID 为 ${currentMessageId} 的消息。`);
      latestMessage.value = null;
    }
  } catch (error) {
    logger.error('fetchAndUpdateMessage', '获取消息时发生错误:', error);
    latestMessage.value = null;
  }
};

// 在组件挂载时获取所有初始数据
onMounted(async () => {
  try {
    // 1. 获取聊天变量以填充 UI
    const chatVars = getVariables({ type: 'chat' });
    if (chatVars?.stat_data?.config) {
      mainTagsInput.value = tagsToString(chatVars.stat_data.config.mainBodyTags ?? []);
      excludeTagsInput.value = tagsToString(chatVars.stat_data.config.excludeBodyTags ?? []);
      logger.log('onMounted', '已成功解析并填充标签输入框。');
    } else {
      logger.warn('onMounted', '在聊天变量中未找到 stat_data.config。');
    }

    // 2. 获取当前消息
    await fetchAndUpdateMessage();
  } catch (error) {
    logger.error('onMounted', '在挂载过程中获取数据时发生错误:', error);
  }
});
</script>

<style scoped>
.tag-editor-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 22px;
}

.tag-editor-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 16px;
  border: 1px dashed color-mix(in srgb, var(--line) 70%, transparent);
  background: color-mix(in srgb, var(--paper) 94%, var(--bg) 6%);
  color: var(--muted);
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.tag-editor-toggle:hover {
  background: color-mix(in srgb, var(--paper) 88%, var(--bg) 12%);
  border-color: color-mix(in srgb, var(--line) 85%, transparent);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.08);
}

.tag-editor-toggle:focus-visible {
  outline: none;
  border-color: var(--control-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--control-focus) 28%, transparent);
}

:global(:root[data-theme='dark']) .tag-editor-toggle {
  background: color-mix(in srgb, var(--paper) 70%, transparent);
  border-color: color-mix(in srgb, var(--line) 75%, black 25%);
  color: var(--ink);
}

.tag-editor-toggle-label {
  flex: 1;
  text-align: left;
  font-size: 0.95rem;
}

.tag-editor-toggle-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--line) 65%, transparent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: var(--muted);
}

:global(:root[data-theme='dark']) .tag-editor-toggle-icon {
  color: var(--ink);
  border-color: color-mix(in srgb, var(--line) 75%, black 25%);
}

.tag-editor-toggle-icon::before {
  content: '';
  width: 8px;
  height: 8px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
  transition: transform 0.2s ease;
}

.tag-editor-toggle[aria-expanded='true'] .tag-editor-toggle-icon::before {
  transform: rotate(-135deg);
}

.tag-editor-slide-enter-active,
.tag-editor-slide-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
  transform-origin: top;
}

.tag-editor-slide-enter-from,
.tag-editor-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.tag-editor {
  --tag-panel-bg: color-mix(in srgb, var(--paper) 90%, var(--bg) 10%);
  --tag-panel-border: color-mix(in srgb, var(--line) 85%, transparent);
  --tag-panel-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px 20px;
  margin: 0;
  padding: 20px;
  border-radius: 18px;
  border: 1px solid var(--tag-panel-border);
  background: var(--tag-panel-bg);
  box-shadow: var(--tag-panel-shadow);
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}
:global(:root[data-theme='dark']) .tag-editor {
  --tag-panel-bg: color-mix(in srgb, var(--paper) 78%, black 22%);
  --tag-panel-border: color-mix(in srgb, var(--line) 60%, black 40%);
  --tag-panel-shadow: 0 18px 30px rgba(0, 0, 0, 0.55);
}

.tag-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  min-width: 0;
  background: color-mix(in srgb, var(--paper) 95%, var(--bg) 5%);
  border: 1px solid color-mix(in srgb, var(--line) 65%, transparent);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.tag-input-group:hover {
  border-color: color-mix(in srgb, var(--line) 80%, transparent);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

:global(:root[data-theme='dark']) .tag-input-group {
  background: color-mix(in srgb, var(--paper) 70%, transparent);
  border-color: color-mix(in srgb, var(--line) 80%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
:global(:root[data-theme='dark']) .tag-input-group:hover {
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.35);
}

.tag-input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--muted);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.tag-input-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--control-border);
  border-radius: 10px;
  background: var(--control-bg);
  color: var(--ink);
  font-size: 0.95rem;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.tag-input-group input::placeholder {
  color: color-mix(in srgb, var(--muted) 55%, transparent);
}

.tag-input-group input:focus-visible {
  outline: none;
  border-color: var(--control-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--control-focus) 30%, transparent);
  background: color-mix(in srgb, var(--control-bg) 92%, white 8%);
}

.save-btn {
  align-self: stretch;
  justify-self: end;
  height: 48px;
  padding: 0 26px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, var(--btn-accent), color-mix(in srgb, var(--btn-accent) 80%, white 20%));
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    filter 0.15s ease;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 32px rgba(0, 0, 0, 0.2);
  filter: brightness(1.03);
}

.save-btn:active {
  transform: translateY(1px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.2);
}

.save-btn:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--control-focus) 30%, transparent),
    0 16px 30px rgba(0, 0, 0, 0.2);
}

#main-content {
  border: 1px solid color-mix(in srgb, var(--line) 80%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--paper) 93%, var(--bg) 7%);
  padding: 20px;
  line-height: 1.7;
  font-size: clamp(0.95em, 0.4vw + 0.85em, 1.05em);
  max-height: clamp(260px, 55vh, 620px);
  overflow-y: auto;
  box-shadow: 0 24px 35px rgba(0, 0, 0, 0.06);
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

:global(:root[data-theme='dark']) #main-content {
  background: color-mix(in srgb, var(--paper) 75%, black 25%);
  border-color: color-mix(in srgb, var(--line) 70%, black 30%);
  box-shadow: 0 28px 40px rgba(0, 0, 0, 0.65);
}

#main-content::-webkit-scrollbar {
  width: 6px;
}

#main-content::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--muted) 60%, transparent);
  border-radius: 999px;
}

#main-content::-webkit-scrollbar-track {
  background: transparent;
}

@media (max-width: 640px) {
  .tag-editor {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 12px;
  }

  .tag-input-group {
    padding: 10px 12px;
  }

  .save-btn {
    width: 100%;
    justify-self: stretch;
  }
}
</style>
