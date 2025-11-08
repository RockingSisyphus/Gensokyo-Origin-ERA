<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { computed, ref, watch } from 'vue';
import { Config, ConfigSchema } from '../../GSKO-BASE/schema/config';
import { Stat, StatSchema } from '../../GSKO-BASE/schema/stat';

const props = defineProps<{
  detail: any;
}>();

const configData = ref<Config | null>(null);

// statWithoutMeta 就是完整的 stat 对象，可以直接用 StatSchema 解析
const parsedStat = computed(() => {
  if (!props.detail || !props.detail.statWithoutMeta) return null;

  const parseResult = StatSchema.safeParse(props.detail.statWithoutMeta);
  if (parseResult.success) {
    return parseResult.data;
  }
  console.error('GensokyoSettings: 解析 stat 数据失败', parseResult.error);
  return null;
});

watch(
  parsedStat,
  (newStat) => {
    if (newStat && newStat.config) {
      // newStat.config 已经是经过解析和验证的，可以直接使用
      // 使用 cloneDeep 避免意外修改原始 prop 数据
      configData.value = cloneDeep(newStat.config);
    } else {
      configData.value = null;
    }
  },
  { immediate: true, deep: true },
);

/**
 * 将数组转换为字符串，用于 textarea 显示
 * @param arr 数组
 */
const arrayToString = (arr: any[] | undefined) => {
  if (!arr) return '';
  return arr.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join('\n');
};

/**
 * 将字符串转换回数组，用于数据更新
 * @param str 字符串
 */
const stringToArray = (str: string) => {
  if (!str.trim()) return [];
  return str.split('\n').map((line) => {
    try {
      // 尝试解析为 JSON，如果失败则作为普通字符串
      return JSON.parse(line);
    } catch {
      return line;
    }
  });
};

const specialsString = computed({
  get: () => arrayToString(configData.value?.specials),
  set: (value) => {
    if (configData.value) {
      configData.value.specials = stringToArray(value);
    }
  },
});

const routineString = computed({
  get: () => arrayToString(configData.value?.routine),
  set: (value) => {
    if (configData.value) {
      configData.value.routine = stringToArray(value);
    }
  },
});
</script>

<template>
  <div class="rounded-lg border-2 border-gray-400 p-4">
    <h2 class="mb-2 text-xl font-bold">幻想乡缘起设定</h2>
    <div v-if="configData" class="flex flex-col gap-4">
      <div>
        <h3 class="font-semibold">特殊日程(specials)</h3>
        <textarea
          v-model="specialsString"
          class="mt-1 h-32 w-full rounded border p-2 font-mono text-sm"
          placeholder="每行一个日程条目,可以是字符串或JSON"
        ></textarea>
      </div>
      <div>
        <h3 class="font-semibold">固定日程(routine)</h3>
        <textarea
          v-model="routineString"
          class="mt-1 h-32 w-full rounded border p-2 font-mono text-sm"
          placeholder="每行一个日程条目,可以是字符串或JSON"
        ></textarea>
      </div>
    </div>
    <div v-else>
      <p>正在加载或解析设定数据...</p>
    </div>
  </div>
</template>
