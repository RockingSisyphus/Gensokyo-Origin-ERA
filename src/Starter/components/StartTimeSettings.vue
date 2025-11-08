<template>
  <!-- ===== 开局时间设置（显示 YYYY-MM-DD + HH:mm；偏移隐藏保存） ===== -->
  <div class="card">
    <h2>设置开局时间</h2>
    <div class="grid-2 grid" id="epoch_holder" data-offset="+09:00">
      <div>
        <label for="epoch_date">日期（YYYY-MM-DD）</label>
        <input id="epoch_date" type="date" placeholder="2025-08-21" @input="syncPreview" />
      </div>
      <div>
        <label for="epoch_time">时分（HH:mm）</label>
        <input id="epoch_time" type="time" step="60" placeholder="08:00" @input="syncPreview" />
      </div>
    </div>

    <div class="row" style="margin-top: 10px">
      <div class="tag">预览：<span id="epoch_preview">—</span></div>
      <div class="btn-bar" style="margin: 0">
        <button id="btn_epoch_reload" class="muted-btn" @click="fillUI">从配置读取</button>
        <button id="btn_epoch_save" @click="saveEpoch">保存到配置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

// ===== 开局时间设置 =====
function zz(n: string | number) {
  n = String(n || '');
  return n.length === 1 ? '0' + n : n;
}

async function readEpochFromConfig() {
  try {
    const cfg = (window as any).__MVU_CONFIG__ || (await (window as any).__MVU_LORE__?.loadConfig?.());
    const raw = cfg?.defaults?.timeEpochISO || '2025-08-21T08:00:00+09:00';
    const src = raw && typeof raw === 'string' && raw.trim() ? raw.trim() : '2025-08-21T08:00:00+09:00';
    const m = src.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?(Z|[+-]\d{2}:\d{2})?$/);
    const date = m ? m[1] : '2025-08-21';
    const hh = m ? m[2] : '08';
    const mi = m ? m[3] : '00';
    const ss = m && m[4] ? m[4] : '00';
    const off =
      m && m[5] ? m[5] : /(?:\+|-|Z)/.test(src) ? (src.match(/(Z|[+-]\d{2}:\d{2})$/) || ['+09:00'])[0] : '+09:00';
    return { date, hh, mi, ss, off };
  } catch (e) {
    return { date: '2025-08-21', hh: '08', mi: '00', ss: '00', off: '+09:00' };
  }
}

async function fillUI() {
  const hit = await readEpochFromConfig();
  const date = document.getElementById('epoch_date') as HTMLInputElement;
  const time = document.getElementById('epoch_time') as HTMLInputElement;
  const prev = document.getElementById('epoch_preview') as HTMLSpanElement;
  const hold = document.getElementById('epoch_holder') as HTMLElement;

  if (!date || !time || !prev || !hold) return;

  date.value = hit.date;
  time.value = `${zz(hit.hh)}:${zz(hit.mi)}`;
  hold.dataset.offset = hit.off || '+09:00';
  prev.textContent = `${date.value}T${time.value}`;
}

async function saveEpoch() {
  const dateValue = (document.getElementById('epoch_date') as HTMLInputElement)?.value || '';
  const timeValue = (document.getElementById('epoch_time') as HTMLInputElement)?.value || '';
  const off = (document.getElementById('epoch_holder') as HTMLElement)?.dataset?.offset || '+09:00';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    alert('请先选择有效日期。');
    return;
  }
  if (!/^\d{2}:\d{2}$/.test(timeValue)) {
    alert('请先输入有效时间（HH:mm）。');
    return;
  }

  const shown = `${dateValue}T${timeValue}`;
  const iso = `${dateValue}T${timeValue}:00${off}`;

  try {
    const ok = await (window as any).__MVU_LORE__?.writeConfigPath?.('defaults.timeEpochISO', iso);
    if (ok) {
      (document.getElementById('epoch_preview') as HTMLSpanElement).textContent = shown;
      await (window as any).__MVU_LORE__?.loadConfig?.();
      alert('开局时间已保存到配置。');
    } else {
      alert('未发生变化或写入失败。请查看控制台日志。');
    }
  } catch (e) {
    alert('保存失败：' + String(e));
  }
}

function syncPreview() {
  const d = (document.getElementById('epoch_date') as HTMLInputElement)?.value || '--------';
  const t = (document.getElementById('epoch_time') as HTMLInputElement)?.value || '--:--';
  (document.getElementById('epoch_preview') as HTMLSpanElement).textContent = `${d}T${t}`;
}

onMounted(() => {
  // The original `app.vue` listens for 'mvu:config-ready' to render the config table
  // and fill the UI. We should do the same here for the time settings.
  document.addEventListener('mvu:config-ready', () => {
    fillUI();
  });

  // If the config is already loaded when this component mounts, fill the UI immediately.
  if ((window as any).__MVU_CONFIG__) {
    fillUI();
  }
});
</script>
