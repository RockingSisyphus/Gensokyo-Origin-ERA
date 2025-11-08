<template>
  <div class="card">
    <h2>额外世界设定</h2>
    <div class="hint">
      本区内容将被保存为世界书条目 <small class="code">“额外世界设定”</small> 的
      <small class="code">content</small>，用于补充世界背景/临时规则等。
    </div>
    <textarea
      id="extra_world_lore"
      placeholder="在此编写你的自定义幻想乡额外设定。建议以‘【额外世界设定】’开头，比如：【额外世界设定】幻想乡的大家都变得像灵梦一样贫穷了！"
    ></textarea>
    <div class="btn-bar">
      <button id="btn_load_extra" class="muted-btn" @click="loadExtraToTextarea">从世界书载入</button>
      <button id="btn_save_extra" @click="saveTextareaToExtra">保存到世界书</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

// ===== 额外世界设定 =====
function pickLorebook() {
  try {
    return (window as any).__MVU_CONFIG__?.map?.lorebook || '幻想乡缘起MVU';
  } catch (e) {
    return '幻想乡缘起MVU';
  }
}

async function loadExtraToTextarea() {
  const box = document.getElementById('extra_world_lore') as HTMLTextAreaElement;
  if (!box) return;
  const lb = pickLorebook();

  try {
    const hit = await (window as any).__MVU_LORE__?.getEntry?.(lb, { comment: '额外世界设定' });
    if (!hit) {
      box.value = '';
      alert('未找到世界书条目“额外世界设定”。如需新建，直接在文本框输入内容后点“保存到世界书”。');
      return;
    }
    const txt = String(hit.content ?? '');
    box.value = txt;
  } catch (e) {
    alert('载入失败：' + String(e));
  }
}

async function saveTextareaToExtra() {
  const box = document.getElementById('extra_world_lore') as HTMLTextAreaElement;
  if (!box) return;
  const lb = pickLorebook();
  const nextContent = String(box.value ?? '');

  if (typeof (window as any).getWorldbook !== 'function' || typeof (window as any).updateWorldbookWith !== 'function') {
    alert('保存失败：当前环境缺少世界书写入 API。');
    return;
  }

  try {
    await (window as any).updateWorldbookWith(
      lb,
      (entries: any[]) => {
        const nameWanted = '额外世界设定';
        const idx = (entries || []).findIndex(e => String(e?.name || '').trim() === nameWanted);
        if (idx >= 0) {
          entries[idx].content = nextContent;
        } else {
          entries.push({ name: nameWanted, content: nextContent });
        }
        return entries;
      },
      { render: 'immediate' },
    );
  } catch (e) {
    alert('保存失败：' + String(e));
  }
}

onMounted(() => {
  document.addEventListener('mvu:config-ready', () => {
    loadExtraToTextarea();
  });

  if ((window as any).__MVU_CONFIG__) {
    loadExtraToTextarea();
  }
});
</script>
