<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { StatSchema } from '../../GSKO-BASE/schema/stat';
import { updateEraVariable } from '../utils/eraWriter';

const props = defineProps<{
  detail: any;
}>();

// 用于 v-model 的响应式变量
const epochDate = ref('');
const epochTime = ref('');
const originalEpochISO = ref('');

// 从 props.detail 解析出 stat 对象
const parsedStat = computed(() => {
  if (!props.detail || !props.detail.statWithoutMeta) return null;
  const parseResult = StatSchema.safeParse(props.detail.statWithoutMeta);
  if (parseResult.success) {
    return parseResult.data;
  }
  console.error('StartTimeSettings: 解析 stat 数据失败', parseResult.error);
  return null;
});

// 监听解析后的 stat 对象，并更新本地的 ref
watch(
  parsedStat,
  newStat => {
    const isoString = newStat?.config?.time?.epochISO;
    originalEpochISO.value = isoString || '';
    if (isoString) {
      try {
        const date = new Date(isoString);
        // 格式化为 YYYY-MM-DD
        epochDate.value = date.toISOString().split('T')[0];
        // 格式化为 HH:mm
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        epochTime.value = `${hours}:${minutes}`;
      } catch (e) {
        console.error('StartTimeSettings: 解析 epochISO 失败', e);
        epochDate.value = '';
        epochTime.value = '';
      }
    } else {
      epochDate.value = '';
      epochTime.value = '';
    }
  },
  { immediate: true, deep: true },
);

const isoFromInputs = computed(() => {
  if (!epochDate.value || !epochTime.value) return null;
  const candidate = `${epochDate.value}T${epochTime.value}:00`;
  const date = new Date(candidate);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
});

const hasChanges = computed(() => !!isoFromInputs.value && isoFromInputs.value !== originalEpochISO.value);
const canSave = computed(() => hasChanges.value);
const canReset = computed(() => Boolean(originalEpochISO.value || epochDate.value || epochTime.value));

const resetEpochInputs = () => {
  if (originalEpochISO.value) {
    try {
      const date = new Date(originalEpochISO.value);
      if (Number.isNaN(date.getTime())) throw new Error('Invalid epoch ISO value');
      epochDate.value = date.toISOString().split('T')[0];
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      epochTime.value = `${hours}:${minutes}`;
      return;
    } catch (e) {
      console.error('StartTimeSettings: reset epochISO failed', e);
    }
  }
  epochDate.value = '';
  epochTime.value = '';
};

const writeEpochToEra = () => {
  const isoString = isoFromInputs.value;
  if (!isoString) {
    toastr.warning('选择的日期不合法.');
    return;
  }
  if (isoString === originalEpochISO.value) {
    //alert('The current value is unchanged.');
    return;
  }
  try {
    updateEraVariable('config.time.epochISO', isoString);
    originalEpochISO.value = isoString;
    toastr.info('开局日期修改成功');
  } catch (e) {
    toastr.error('写入出错' + String(e));
  }
};

// 预览计算属性
const epochPreview = computed(() => {
  if (!epochDate.value && !epochTime.value) return '—';
  return `${epochDate.value || 'YYYY-MM-DD'}T${epochTime.value || 'HH:mm'}`;
});

// 注意：保存逻辑已移除，因为该组件现在只负责显示。
// 数据更新应由父组件或全局状态管理器通过事件来触发。
</script>

<template>
  <div id="start-time-settings" class="rounded-lg border-2 border-gray-400 p-4">
    <h2 class="mb-2 text-xl font-bold">设置开局时间</h2>
    <div v-if="parsedStat" class="grid grid-cols-2 gap-4">
      <div>
        <label for="epoch_date" class="block text-sm font-medium text-gray-700">日期 (YYYY-MM-DD)</label>
        <input
          id="epoch_date"
          v-model="epochDate"
          type="date"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label for="epoch_time" class="block text-sm font-medium text-gray-700">时分 (HH:mm)</label>
        <input
          id="epoch_time"
          v-model="epochTime"
          type="time"
          step="60"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm">
        预览: <span class="font-mono">{{ epochPreview }}</span>
      </div>
      <div class="flex gap-2">
        <button
          class="muted-btn"
          :class="{ 'cursor-not-allowed opacity-50': !canReset }"
          :disabled="!canReset"
          @click="resetEpochInputs"
        >
          从配置读取
        </button>
        <button :class="{ 'cursor-not-allowed opacity-50': !canSave }" :disabled="!canSave" @click="writeEpochToEra">
          保存到配置
        </button>
      </div>
    </div>
    <div v-if="!parsedStat" class="mt-4 text-center">
      <p>正在加载或解析时间数据...</p>
    </div>
  </div>
</template>

<style scoped>
#start-time-settings button {
  padding: 12px 18px;
  background: #8c7b6a;
  color: #fcfaf5;
  border: 1px solid #7a6a5a;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

#start-time-settings button:hover {
  background: #7a6a5a;
  border-color: #6b5a4b;
}

#start-time-settings .muted-btn {
  background: #e9e1d6;
  color: #5a4f43;
  border-color: #d3c8b8;
}

#start-time-settings .muted-btn:hover {
  background: #dcd1c4;
}
</style>
