<template>
  <!-- ===== 开局 · 角色档案 ===== -->
  <div class="card">
    <h2>角色档案</h2>
    <div class="grid-2 grid">
      <div>
        <label for="u_name">姓名</label>
        <input id="u_name" type="text" placeholder="如：博丽某某" />
      </div>
      <div>
        <label for="u_identity">身份</label>
        <input id="u_identity" type="text" placeholder="如：外界来访者 / 里民 / 巫女见习" />
      </div>
      <div>
        <label>性别</label>
        <div class="row">
          <label class="inline"><input type="radio" name="u_gender" value="未知" checked /> 未知</label>
          <label class="inline"><input type="radio" name="u_gender" value="男" /> 男</label>
          <label class="inline"><input type="radio" name="u_gender" value="女" /> 女</label>
          <label class="inline"><input type="radio" name="u_gender" value="其他" /> 其他</label>
          <input id="u_gender_other" type="text" placeholder="选择“其他”时可填写" style="display: none" />
        </div>
      </div>
      <div>
        <label for="u_age">年龄</label>
        <input id="u_age" type="number" min="0" step="1" placeholder="数字（岁）" />
      </div>
    </div>

    <div class="grid-2 grid">
      <div>
        <label for="u_home">居住地区</label>
        <select id="u_home">
          <option value="" disabled selected>— 请选择 —</option>
        </select>
      </div>
      <div>
        <label for="u_current">所在地区</label>
        <select id="u_current">
          <option value="" disabled selected>— 请选择 —</option>
        </select>
      </div>
    </div>

    <div class="grid">
      <div>
        <label for="u_relationships">人际关系</label>
        <input id="u_relationships" type="text" placeholder="如：与灵梦相识 / 与魔理沙偶遇" />
      </div>
      <div>
        <label for="u_ability">特殊能力</label>
        <input id="u_ability" type="text" placeholder="如：在地上行走程度的能力" />
      </div>
      <div>
        <label for="u_notes">重要经历</label>
        <textarea id="u_notes" placeholder="因为未知的原因，来到了幻想乡"></textarea>
      </div>
    </div>

    <div class="btn-bar">
      <button id="btn_save_user" @click="writeUserToMVU">写入角色到 MVU 变量</button>
      <button id="btn_fill_demo" class="muted-btn" @click="fillDemo">填充示例</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

// ===== 3) 基础逻辑 · map_graph 叶节点提取 =====
async function loadPlaces() {
  try {
    const cfg = (window as any).__MVU_CONFIG__ || (await (window as any).__MVU_LORE__?.loadConfig?.());
    const lore = cfg?.map?.lorebook || '幻想乡缘起MVU';
    const comment = cfg?.map?.comment || 'map_graph';
    const obj = await (window as any).__MVU_LORE__?.getJSON?.(lore, { comment });
    const tree = obj?.tree && typeof obj.tree === 'object' ? obj.tree : null;
    if (!tree) {
      console.warn('【地点/加载】未找到 tree');
      return [];
    }

    const leaves: string[] = [];
    const visit = (node: any) => {
      if (Array.isArray(node)) {
        for (const v of node) {
          if (typeof v === 'string') leaves.push(v);
          else if (v && typeof v === 'object') Object.values(v).forEach(visit);
        }
      } else if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) visit(node[k]);
      } else if (typeof node === 'string') {
        leaves.push(node);
      }
    };
    visit(tree);
    const uniq = Array.from(new Set(leaves)).sort((a, b) => a.localeCompare(b, 'zh-Hans'));

    const homeSel = document.getElementById('u_home') as HTMLSelectElement;
    const currSel = document.getElementById('u_current') as HTMLSelectElement;
    const rebuild = (sel: HTMLSelectElement) => {
      if (!sel) return;
      sel.innerHTML = '<option value="" disabled selected>— 请选择 —</option>';
      for (const s of uniq) {
        const op = document.createElement('option');
        op.value = s;
        op.textContent = s;
        sel.appendChild(op);
      }
    };
    rebuild(homeSel);
    rebuild(currSel);

    (window as any).__MVU_PLACES__ = uniq;
    return uniq;
  } catch (e) {
    console.error('【地点/加载】异常：', e);
    return [];
  }
}

// ===== 5) 渲染模块 · 角色写入 =====
function pickGender() {
  const radios = document.querySelectorAll('input[name="u_gender"]');
  let v = '未知';
  radios.forEach(r => {
    if ((r as HTMLInputElement).checked) v = (r as HTMLInputElement).value;
  });
  if (v === '其他') {
    const alt = (document.getElementById('u_gender_other') as HTMLInputElement).value.trim();
    v = alt || '未知';
  }
  return v;
}

function bindGenderOtherToggle() {
  const radios = document.querySelectorAll('input[name="u_gender"]');
  const other = document.getElementById('u_gender_other') as HTMLInputElement;
  const sync = () => {
    const picked = Array.from(radios).find(r => (r as HTMLInputElement).checked) as HTMLInputElement | undefined;
    other.style.display = picked?.value === '其他' ? 'block' : 'none';
    if (picked?.value !== '其他') other.value = '';
  };
  radios.forEach(r => r.addEventListener('change', sync));
  sync();
}

function fillDemo() {
  const cfg = (window as any).__MVU_CONFIG__ || {};
  (document.getElementById('u_name') as HTMLInputElement).value = '{{user}}';
  (document.getElementById('u_identity') as HTMLInputElement).value = '外来者';
  (document.querySelector('input[name="u_gender"][value="未知"]') as HTMLInputElement).checked = true;
  (document.getElementById('u_age') as HTMLInputElement).value = '18';
  const selHome = document.getElementById('u_home') as HTMLSelectElement;
  const selCurr = document.getElementById('u_current') as HTMLSelectElement;
  const pick = (sel: HTMLSelectElement, preferred: string[] = []) => {
    const opts = Array.from(sel?.options || []);
    for (const v of preferred.filter(Boolean)) {
      const hit = opts.find(o => o.value === v);
      if (hit) {
        sel.value = v;
        return;
      }
    }
    if (opts.length > 1) sel.selectedIndex = 1;
  };

  pick(selHome, [cfg?.defaults?.fallbackPlace, '博丽神社']);
  pick(selCurr, ['博丽神社', cfg?.defaults?.fallbackPlace]);

  (document.getElementById('u_relationships') as HTMLInputElement).value = '暂无';
  (document.getElementById('u_ability') as HTMLInputElement).value = '在地上行走程度的能力';
  (document.getElementById('u_notes') as HTMLTextAreaElement).value = '因为未知的原因，来到了幻想乡';
}

async function writeUserToMVU() {
  const profile = {
    name: ((document.getElementById('u_name') as HTMLInputElement).value || '').trim() || '{{user}}',
    identity: ((document.getElementById('u_identity') as HTMLInputElement).value || '').trim(),
    gender: pickGender(),
    age: Number((document.getElementById('u_age') as HTMLInputElement).value || '0') || 0,
  };
  const ability = {
    summary: ((document.getElementById('u_ability') as HTMLInputElement).value || '').trim(),
  };
  const location = {
    home: ((document.getElementById('u_home') as HTMLSelectElement).value || '').trim(),
    current: ((document.getElementById('u_current') as HTMLSelectElement).value || '').trim(),
  };
  const relationships = ((document.getElementById('u_relationships') as HTMLInputElement).value || '').trim();
  const notes = ((document.getElementById('u_notes') as HTMLTextAreaElement).value || '').trim();

  const userObj = {
    姓名: profile.name,
    性别: profile.gender || '未知',
    年龄: profile.age ? String(profile.age) : '未知',
    人际关系: relationships || '暂无',
    特殊能力: (() => {
      const sum = ability.summary || '在地上行走程度的能力';
      return sum;
    })(),
    身份: profile.identity || '外来者',
    所在地区: location.current || '博丽神社',
    居住地区: location.home || '未知',
    重要经历: notes || '因为未知的原因，来到了幻想乡',
  };

  const writer = (v: any) => {
    v = v || {};
    v.stat_data = v.stat_data && typeof v.stat_data === 'object' ? v.stat_data : {};
    v.stat_data.user = userObj;

    const mirror =
      typeof (window as any).__MVU_CONFIG__?.featureFlags?.mirrorDisplay === 'boolean'
        ? (window as any).__MVU_CONFIG__.featureFlags.mirrorDisplay
        : true;
    if (mirror) {
      v.display_data = v.display_data && typeof v.display_data === 'object' ? v.display_data : {};
      v.display_data.user = userObj;
    }
    return v;
  };

  let ok = false;
  try {
    if (typeof updateVariablesWith === 'function') {
      await updateVariablesWith(writer, { type: 'message', message_id: 'latest' });
      ok = true;
    } else if (typeof getVariables === 'function' && typeof replaceVariables === 'function') {
      const where: { type: 'message'; message_id: 'latest' } = { type: 'message', message_id: 'latest' };
      const cur = getVariables(where) || {};
      await replaceVariables(writer(cur), where);
      ok = true;
    } else if (typeof triggerSlash === 'function') {
      await triggerSlash('/setvar stat_data ' + JSON.stringify({ user: userObj }));
      ok = true;
    } else {
      alert('【开局/写回】找不到任何写回 API。');
    }
  } catch (e) {
    alert('【开局/写回】异常：' + String(e));
  }

  if (!ok) {
    alert('写入失败：无法调用写回 API，请查看控制台。');
  }
}

onMounted(() => {
  document.addEventListener('mvu:config-ready', () => {
    loadPlaces();
  });

  if ((window as any).__MVU_CONFIG__) {
    loadPlaces();
  }

  bindGenderOtherToggle();
});
</script>
