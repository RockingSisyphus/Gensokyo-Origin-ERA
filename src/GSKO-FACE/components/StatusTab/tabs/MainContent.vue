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
import { computed, ref, watch } from 'vue';
import type { Stat } from '../../../../GSKO-BASE/schema/stat';
import { updateEraVariableByObject } from '../../../utils/eraWriter';
import { Logger } from '../../../utils/log';

/**
 * @interface MainContentProps
 * @description 组件接收的属性。
 */
interface MainContentProps {
  /**
   * @property {ChatMessage | null | undefined} latestMessage - 当前最新的消息对象。
   */
  latestMessage?: ChatMessage | null | undefined;
  /**
   * @property {number} refreshKey - 一个用于强制触发内容更新的 key。
   */
  refreshKey?: number;
  /**
   * @property {Stat | null} stat - 状态对象，用于读取配置。
   */
  stat?: Stat | null;
}

// 定义组件的 props。
const props = withDefaults(defineProps<MainContentProps>(), {
  latestMessage: null,
  refreshKey: 0,
  stat: null,
});

// 初始化日志记录器
const logger = new Logger('StatusTab/MainContent');

// 存储最终要显示在模板中的 HTML 内容。
const displayHtml = ref('');

// 从 stat.config 中安全地获取标签配置
const mainBodyTags = computed(() => props.stat?.config?.mainBodyTags ?? []);
const excludeBodyTags = computed(() => props.stat?.config?.excludeBodyTags ?? []);

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

// 监听 props 的变化，当 stat 对象变化时，更新输入框的内容
watch(
  () => props.stat,
  newStat => {
    if (newStat?.config) {
      mainTagsInput.value = tagsToString(newStat.config.mainBodyTags ?? []);
      excludeTagsInput.value = tagsToString(newStat.config.excludeBodyTags ?? []);
    }
  },
  { immediate: true, deep: true },
);

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

const buildContentRegex = (tags: string[]): RegExp => {
  if (tags.length === 0) {
    // 如果没有提供标签，则返回一个永远不会匹配的正则表达式
    return new RegExp('(?!)');
  }
  // 将标签名数组转换为 (tag1|tag2|...) 的形式
  const tagGroup = tags.join('|');
  // 构建正则表达式，匹配 <tag>...</tag> 结构
  return new RegExp(
    `<(${tagGroup})>\\s*(?=[\\s\\S]*?\\S[\\s\\S]*?<\\/\\1>)((?:(?!<\\1>)[\\s\\S])*?)\\s*<\\/\\1>`,
    'gi',
  );
};

const extractAndDisplayContent = () => {
  if (!props.latestMessage) {
    logger.log('extractAndDisplayContent', '传入的 message 为空，清空正文。');
    displayHtml.value = '';
    return;
  }

  const { message, message_id } = props.latestMessage;
  let contentToProcess = message;
  let chunks: string[] = [];

  // 首先处理排除标签
  if (excludeBodyTags.value.length > 0) {
    const excludeRegex = buildContentRegex(excludeBodyTags.value);
    contentToProcess = contentToProcess.replace(excludeRegex, '');
  }

  // 根据主内容标签规则提取内容
  const useMainRegex = mainBodyTags.value.length > 0 && !mainBodyTags.value.includes('*');

  if (useMainRegex) {
    // 如果定义了具体的主内容标签，则使用正则表达式提取
    const mainRegex = buildContentRegex(mainBodyTags.value);
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = mainRegex.exec(contentToProcess)) !== null) {
      matches.push(match[2]?.trim() ?? '');
      if (mainRegex.lastIndex === match.index) {
        mainRegex.lastIndex += match[0].length;
      }
    }
    chunks = matches.filter(chunk => chunk.length > 0);
  } else {
    // 如果主内容标签为空或为'*'，则将排除后的全部内容作为结果
    const trimmedContent = contentToProcess.trim();
    if (trimmedContent) {
      chunks = [trimmedContent];
    }
  }

  if (chunks.length > 0) {
    displayHtml.value = chunks.join('\n\n');
    logger.debug('extractAndDisplayContent', `已刷新正文，来源消息 ID: ${message_id}`);
  } else {
    logger.warn(
      'extractAndDisplayContent',
      `消息 ${message_id} 中未找到指定的主内容区块 (main: ${mainBodyTags.value.join(
        ',',
      )}, exclude: ${excludeBodyTags.value.join(',')})，清空正文。`,
    );
    displayHtml.value = '';
  }
};

// 监听 props 的变化，当 latestMessage 或 refreshKey 改变时，重新更新内容。
watch(
  () => [props.latestMessage, props.refreshKey, props.stat],
  extractAndDisplayContent,
  { immediate: true, deep: true }, // 立即执行一次，并在对象内部变化时触发
);
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
