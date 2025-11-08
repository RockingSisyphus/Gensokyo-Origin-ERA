<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { StatSchema } from '../../GSKO-BASE/schema/stat';

const props = defineProps<{
  detail: any;
}>();

// 用于 v-model 的响应式变量
const extraLore = ref('');

// 从 props.detail 解析出 stat 对象
const parsedStat = computed(() => {
  if (!props.detail || !props.detail.statWithoutMeta) return null;
  const parseResult = StatSchema.safeParse(props.detail.statWithoutMeta);
  if (parseResult.success) {
    return parseResult.data;
  }
  console.error('ExtraWorldSettings: 解析 stat 数据失败', parseResult.error);
  return null;
});

// 监听解析后的 stat 对象，并更新本地的 ref
watch(
  parsedStat,
  (newStat) => {
    // "附加正文" 字段用于存放额外世界设定
    extraLore.value = newStat?.附加正文 ?? '';
  },
  { immediate: true, deep: true },
);

// 注意：保存逻辑已移除，因为该组件现在只负责显示。
</script>

<template>
  <div class="rounded-lg border-2 border-gray-400 p-4">
    <h2 class="mb-2 text-xl font-bold">额外世界设定</h2>
    <div class="text-sm text-gray-600">
      本区内容将被保存为世界书条目 <code class="text-xs font-semibold">“额外世界设定”</code> 的
      <code class="text-xs font-semibold">content</code>，用于补充世界背景/临时规则等。
    </div>
    <textarea
      v-model="extraLore"
      class="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      rows="4"
      placeholder="在此编写你的自定义幻想乡额外设定。建议以‘【额外世界设定】’开头，比如：【额外世界设定】幻想乡的大家都变得像灵梦一样贫穷了！"
    ></textarea>
    <div class="mt-2 flex justify-end gap-2">
      <button class="muted-btn cursor-not-allowed opacity-50" disabled>从世界书载入</button>
      <button class="cursor-not-allowed opacity-50" disabled>保存到世界书</button>
    </div>
  </div>
</template>
