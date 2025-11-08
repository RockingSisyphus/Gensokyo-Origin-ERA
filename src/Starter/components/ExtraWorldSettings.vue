<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { readFromWorldbook, writeToWorldbook } from '../utils/worldbook';

const ENTRY_NAME = '额外世界设定';

const extraLore = ref('');
const isLoading = ref(false);
const isSaving = ref(false);

async function loadExtra() {
  isLoading.value = true;
  const content = await readFromWorldbook(ENTRY_NAME);
  if (content !== null) {
    extraLore.value = content;
  }
  isLoading.value = false;
}

async function saveExtra() {
  isSaving.value = true;
  await writeToWorldbook(ENTRY_NAME, extraLore.value);
  isSaving.value = false;
}

onMounted(() => {
  loadExtra();
});
</script>

<template>
  <div id="extra-world-settings" class="rounded-lg border-2 border-gray-400 p-4">
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
      :disabled="isLoading"
    ></textarea>
    <div class="mt-2 flex justify-end gap-2">
      <button
        class="muted-btn"
        :disabled="isLoading || isSaving"
        @click="loadExtra"
      >
        {{ isLoading ? '载入中...' : '从世界书载入' }}
      </button>
      <button :disabled="isLoading || isSaving" @click="saveExtra">
        {{ isSaving ? '保存中...' : '保存到世界书' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
#extra-world-settings button {
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

#extra-world-settings button:hover {
  background: #7a6a5a;
  border-color: #6b5a4b;
}

#extra-world-settings .muted-btn {
  background: #e9e1d6;
  color: #5a4f43;
  border-color: #d3c8b8;
}

#extra-world-settings .muted-btn:hover {
  background: #dcd1c4;
}
</style>
