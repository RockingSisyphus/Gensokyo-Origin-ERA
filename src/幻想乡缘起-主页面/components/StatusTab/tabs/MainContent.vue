<template>
  <div>
    <div class="tag-editor">
      <div class="tag-input-group">
        <label for="main-tags">主标签:</label>
        <input id="main-tags" v-model="mainTagsInput" type="text" placeholder="用 | 分隔标签" />
      </div>
      <div class="tag-input-group">
        <label for="exclude-tags">排除标签:</label>
        <input id="exclude-tags" v-model="excludeTagsInput" type="text" placeholder="用 | 分隔标签" />
      </div>
      <button class="save-btn" @click="saveTags">保存</button>
    </div>
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
.tag-editor {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
}
.tag-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 250px;
}
.tag-input-group label {
  font-weight: bold;
  white-space: nowrap;
}
.tag-input-group input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.save-btn {
  padding: 4px 12px;
  border: 1px solid #007bff;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.save-btn:hover {
  background-color: #0056b3;
}
</style>
