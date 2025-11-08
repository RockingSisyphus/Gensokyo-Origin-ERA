<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { defineExpose, ref } from 'vue';
import CharacterProfile from './components/CharacterProfile.vue';
import ExtraWorldSettings from './components/ExtraWorldSettings.vue';
import StartTimeSettings from './components/StartTimeSettings.vue';

// 用于存储从事件接收到的运行时数据
const runtimeData = ref<any | null>(null);

/**
 * @description: 更新组件的运行时数据
 * @param {any} detail 从 GSKO:showUI 事件接收到的数据
 */
const update = (detail: any) => {
  runtimeData.value = cloneDeep(detail);
};

// 暴露 update 方法，以便在 index.ts 中可以调用
defineExpose({
  update,
});
</script>

<script lang="ts">
export default {};
</script>

<template>
  <div class="flex flex-col gap-2">
    <div v-if="runtimeData" class="flex flex-col gap-2">
      <CharacterProfile :detail="runtimeData" />
      <StartTimeSettings :detail="runtimeData" />
      <ExtraWorldSettings :detail="runtimeData" />
    </div>
    <div v-else class="flex items-center justify-center p-4">
      <p>正在等待 GSKO:showUI 事件来加载设置面板...</p>
    </div>
  </div>
</template>

<style lang="scss">
/* ===== 样式：参考你给的风格（纸质感 + 宋体），仅做轻度精简 ===== */
@import url('https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');
:root {
  --bg: #f5f1e8;
  --paper: #fffdf7;
  --ink: #4a3f35;
  --muted: #6b5a4b;
  --line: #d3c8b8;
}
html,
body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Noto Serif SC', serif;
  line-height: 1.6;
}
body {
  background-image:
    linear-gradient(rgba(224, 213, 196, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(224, 213, 196, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  padding: 20px;
}
h1,
h2 {
  color: var(--muted);
  border-bottom: 2px solid var(--line);
  padding-bottom: 10px;
  margin: 20px auto;
  max-width: 940px;
}
h1 {
  font-size: 2.2em;
}
h2 {
  font-size: 1.6em;
}
.container {
  max-width: 940px;
  margin: 0 auto;
}
.card {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 6px;
  box-shadow:
    3px 3px 8px rgba(107, 90, 75, 0.2),
    inset 0 0 10px rgba(255, 253, 247, 0.5);
  padding: 24px;
  margin: 18px 0;
}
.grid {
  display: grid;
  gap: 16px;
}
.grid-2 {
  grid-template-columns: 1fr 1fr;
}
.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}
label {
  font-weight: 700;
  color: var(--muted);
  display: block;
  margin-bottom: 6px;
}
.hint {
  font-style: italic;
  color: #7b6d5f;
  font-size: 0.9em;
}
input[type='text'],
input[type='number'],
textarea,
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: #fcfaf5;
  color: var(--ink);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  font-size: 1em;
  box-sizing: border-box;
}
input:focus,
textarea:focus,
select:focus {
  border-color: #a89883;
  outline: none;
  box-shadow: 0 0 5px rgba(168, 152, 131, 0.3);
}
textarea {
  min-height: 100px;
  resize: vertical;
}
.row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.row > * {
  flex: 1;
}
.inline {
  display: inline-block;
  margin-right: 12px;
}
.checkbox-line {
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-bar {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}
button {
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
button:hover {
  background: #7a6a5a;
  border-color: #6b5a4b;
}
.muted-btn {
  background: #e9e1d6;
  color: #5a4f43;
  border-color: #d3c8b8;
}
.muted-btn:hover {
  background: #dcd1c4;
}
details {
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 10px 12px;
  background: #fffdfa;
}
details + details {
  margin-top: 12px;
}
summary {
  cursor: pointer;
  font-weight: 700;
  color: #6b5a4b;
}
.kdoc {
  color: #857664;
  font-size: 0.9em;
  margin: 6px 0 10px;
}
.kv {
  margin: 10px 0;
}
.kv .key {
  font-weight: 600;
  color: #5e5042;
}
.kv .control {
  margin-top: 6px;
}
.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 0.85em;
  color: #6b5a4b;
  background: #faf5ee;
  margin-right: 6px;
}
.sep {
  height: 1px;
  background: var(--line);
  margin: 16px 0;
}
small.code {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  color: #5e5042;
}

/* === 启动按钮（显眼） === */
.launch-bar {
  display: flex;
  justify-content: center;
  margin: 10px auto 0;
  max-width: 940px;
}
#btn_launch_ai {
  padding: 14px 22px;
  font-size: 1.12em;
  border-radius: 999px;
  letter-spacing: 0.02em;
  background: #b76e2b;
  color: #fffdf7;
  border: 1px solid #a95f1e;
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.08),
    inset 0 0 10px rgba(255, 253, 247, 0.4);
}
#btn_launch_ai:hover {
  background: #a95f1e;
  border-color: #8f4f18;
}
</style>
