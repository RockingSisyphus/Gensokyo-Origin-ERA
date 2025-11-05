<template>
  <div>
    <h4><span class="emoji">🧭</span>重要经历</h4>
    <div ref="userEvents" class="preserve-format">—</div>

    <hr class="dashed" />

    <h4><span class="emoji">🤝</span>人际关系</h4>
    <div ref="userRelationships" class="preserve-format">—</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Stat } from '../../../../GSKO-BASE/schema/stat';
import { toText } from '../../../utils/format';
import { Logger } from '../../../utils/log';

// 初始化日志记录器，方便调试
const logger = new Logger();

// 创建 ref 来引用 DOM 元素，这是 Vue 推荐的操作 DOM 的方式
const userEvents = ref<HTMLElement | null>(null);
const userRelationships = ref<HTMLElement | null>(null);

/**
 * @description 更新“履历与关系”选项卡的内容。
 *              该函数由 index.ts 中的 era:writeDone 事件监听器调用。
 * @param {Stat} stat - 从 era:writeDone 事件中获取的、经过 Zod 解析的最新状态对象。
 */
function update({ statWithoutMeta: stat }: { statWithoutMeta: Stat }) {
  const funcName = 'update';
  logger.log(funcName, '接收到更新指令，开始更新履历与关系', { stat });

  // 直接从类型安全的 stat 对象中访问 user 数据
  const userData = stat.user;
  logger.debug(funcName, '提取的用户数据', { userData });

  // 直接访问“重要经历”和“人际关系”，并使用 toText 统一格式化
  const eventsText = toText(userData.重要经历);
  const relationshipsText = toText(userData.人际关系);

  logger.debug(funcName, '处理后的待显示文本', { eventsText, relationshipsText });

  // 更新“重要经历”的 DOM 内容
  if (userEvents.value) {
    userEvents.value.textContent = eventsText;
    logger.log(funcName, '成功更新“重要经历”内容。');
  } else {
    // 如果在组件挂载后仍然找不到 DOM 元素，发出警告
    logger.warn(funcName, '无法找到“重要经历”的 DOM 元素 (userEvents ref)，请检查模板。');
  }

  // 更新“人际关系”的 DOM 内容
  if (userRelationships.value) {
    userRelationships.value.textContent = relationshipsText;
    logger.log(funcName, '成功更新“人际关系”内容。');
  } else {
    logger.warn(funcName, '无法找到“人际关系”的 DOM 元素 (userRelationships ref)，请检查模板。');
  }
}

// 通过 defineExpose 将 update 方法暴露出去，
// 这样父组件或外部脚本就能通过 ref 调用这个方法。
defineExpose({
  update,
});
</script>

<style lang="scss" scoped>
/* 标题样式 */
h4 {
  display: flex;
  align-items: center;
  font-size: 1.1em;
  color: var(--muted);
  margin: 0 0 10px;

  .emoji {
    margin-right: 8px;
    font-size: 1.1em;
  }
}

/* 内容区域样式，保留格式 */
.preserve-format {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.6;
  font-size: 0.95em;
}

/* 分隔线样式 */
hr.dashed {
  border: none;
  border-top: 1px dashed var(--line);
  margin: 20px 0;
}
</style>
