<template>
  <div>
    <h4><span class="emoji">🧑‍🤝‍🧑</span>其他角色</h4>
    <!-- ===== 其他角色工具条 ===== -->
    <div id="others-toolbar" class="debug-toolbar" style="margin: 6px 0 10px">
      <span class="debug-switch" title="config.mvuLifeMeet.rules.incident.skipVisitHunters">
        <input id="life-skip-visit-hunters" v-model="skipVisitHunters" type="checkbox" @change="onSkipVisitChange" />
        异变中退治者不拜访
      </span>
      <span class="debug-switch" title="config.mvuLifeMeet.rules.incident.skipSleepHunters">
        <input id="life-skip-sleep-hunters" v-model="skipSleepHunters" type="checkbox" @change="onSkipSleepChange" />
        异变中退治者不睡觉
      </span>
    </div>

    <div id="other-roles-list" class="incident-list" @click="handleToggle">
      <template v-if="otherRoles.length">
        <div v-for="role in otherRoles" :key="role.name" class="role-card collapsed" :data-name="role.name">
          <div class="role-card-header">
            <div class="role-avatar">{{ role.name.slice(0, 1) }}</div>
            <div>
              <div class="role-name">{{ role.name }}</div>
              <div class="role-meta">{{ role.location }}</div>
            </div>
            <button class="card-toggle" aria-expanded="false" aria-label="展开/收起">▼</button>
          </div>
          <div class="role-body">
            <div v-for="field in role.fields" :key="field.label" class="role-line">
              <strong>{{ field.label }}：</strong>{{ field.value }}
            </div>
            <div class="role-line">
              <strong>好感度：</strong>
              <span class="aff-num">{{ role.affection.value }}</span>
              <span class="aff-stage" style="margin-left: 6px; color: var(--muted); font-size: 0.85em">—</span>
              <div class="mini-bar"><div class="val" :style="{ width: role.affection.barWidth }"></div></div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="role-card">
          <div class="role-card-header">
            <div class="role-avatar">✔</div>
            <div>
              <div class="role-name">当前无“其他角色”</div>
              <div class="role-meta">与玩家不同区的角色为 0</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineExpose, ref } from 'vue';
import { ERA_VARIABLE_PATH } from '../../../utils/constants';
import { updateEraVariable } from '../../../utils/eraWriter';
import { get, toText } from '../../../utils/format';
import { Logger } from '../../../utils/log';

const logger = new Logger();

// 存储非同区角色的列表
const otherRoles = ref<any[]>([]);
// 工具条勾选框的状态
const skipVisitHunters = ref(false);
const skipSleepHunters = ref(false);

/**
 * @description 从 stat_data 更新“其他角色”列表和工具条状态。由 era:writeDone 事件触发。
 * @param {object} statWithoutMeta - 包含所有状态数据的根对象。
 */
const update = (statWithoutMeta: object) => {
  const funcName = 'update';
  logger.log(funcName, `开始更新“其他角色”组件`, { statWithoutMeta });

  if (!statWithoutMeta || typeof statWithoutMeta !== 'object') {
    logger.warn(funcName, '调用失败：传入的 statWithoutMeta 无效。');
    return;
  }

  // 1. 更新工具条状态
  try {
    skipVisitHunters.value = !!get(statWithoutMeta, ERA_VARIABLE_PATH.SKIP_VISIT_HUNTERS, false);
    skipSleepHunters.value = !!get(statWithoutMeta, ERA_VARIABLE_PATH.SKIP_SLEEP_HUNTERS, false);
    logger.log(funcName, `工具条状态已更新`, { visit: skipVisitHunters.value, sleep: skipSleepHunters.value });
  } catch (e) {
    logger.error(funcName, `更新工具条状态时出错`, e);
  }

  // 2. 更新其他角色列表
  try {
    const uLoc = String(get(statWithoutMeta, ERA_VARIABLE_PATH.USER_LOCATION, '')).trim();
    let chars = get(statWithoutMeta, ERA_VARIABLE_PATH.CHARS, {});

    // 兼容 chars 为 JSON 字符串的情况
    if (typeof chars === 'string') {
      try {
        chars = JSON.parse(chars);
      } catch (e) {
        logger.error(funcName, '解析 chars JSON 字符串失败', e);
        chars = {};
      }
    }

    if (!chars || typeof chars !== 'object') {
      logger.warn(funcName, 'stat_data.chars 无效或不存在。');
      otherRoles.value = [];
      return;
    }

    const entries: [string, any][] = Object.entries(chars).filter(
      ([k, v]) => !String(k).startsWith('$') && v && typeof v === 'object' && !Array.isArray(v),
    );

    const others = entries.filter(([, obj]: [string, any]) => {
      const cLoc = String(get(obj, ERA_VARIABLE_PATH.CHAR_LOCATION, '')).trim();
      return !(uLoc && cLoc && cLoc === uLoc);
    });

    // 排序：按“所在地区”+ 名称
    others.sort((a: [string, any], b: [string, any]) => {
      const la = String(get(a[1], ERA_VARIABLE_PATH.CHAR_LOCATION, '')).localeCompare(
        String(get(b[1], ERA_VARIABLE_PATH.CHAR_LOCATION, '')),
        'zh-Hans-CN',
      );
      if (la !== 0) return la;
      return String(a[0]).localeCompare(String(b[0]), 'zh-Hans-CN');
    });

    // 格式化为模板所需的数据结构
    otherRoles.value = others.map(([name, obj]: [string, any]) => {
      const fields = [
        ['年龄', '年龄'],
        ['性别', '性别'],
        ['身份', '身份'],
        ['性格', '性格'],
        ['外貌', '外貌'],
        ['衣着', '衣着'],
        ['人际关系', '人际关系'],
        ['性经验', '性经验'],
        ['性知识', '性知识'],
        ['特殊能力', '特殊能力'],
        ['身体状况', '身体状况'],
        ['目标', '当前目标'],
        ['所想', '当前所想'],
        ['居住地区', '居住地区'],
      ];
      const fav = get(obj, ERA_VARIABLE_PATH.CHAR_AFFECTION, 0);
      return {
        name,
        location: toText(get(obj, ERA_VARIABLE_PATH.CHAR_LOCATION, '未知')),
        fields: fields.map(([label, key]) => ({ label, value: toText(get(obj, key, '—')) })),
        affection: {
          value: toText(fav),
          barWidth: `${Math.min(Math.abs(Number(fav) || 0), 100)}%`,
        },
      };
    });

    logger.log(funcName, `“其他角色”列表已更新，共 ${otherRoles.value.length} 人。`);
  } catch (e) {
    logger.error(funcName, `更新“其他角色”列表时出错`, e);
    otherRoles.value = [];
  }
};

// 勾选框变化时，通过 era 事件请求写回
const onSkipVisitChange = () => {
  logger.log('onSkipVisitChange', `请求更新 skipVisitHunters: ${skipVisitHunters.value}`);
  updateEraVariable(ERA_VARIABLE_PATH.SKIP_VISIT_HUNTERS, skipVisitHunters.value);
};

const onSkipSleepChange = () => {
  logger.log('onSkipSleepChange', `请求更新 skipSleepHunters: ${skipSleepHunters.value}`);
  updateEraVariable(ERA_VARIABLE_PATH.SKIP_SLEEP_HUNTERS, skipSleepHunters.value);
};

// 使用事件委托处理卡片的展开/收起
const handleToggle = (e: MouseEvent) => {
  const btn = (e.target as HTMLElement).closest('.card-toggle');
  if (!btn) return;

  const card = btn.closest('.role-card');
  if (!card) return;

  const expand = !card.classList.contains('expanded');
  card.classList.toggle('expanded', expand);
  card.classList.toggle('collapsed', !expand);
  btn.setAttribute('aria-expanded', String(expand));
  btn.textContent = expand ? '▲' : '▼';

  const roleName = card.getAttribute('data-name') || '未知角色';
  logger.log('handleToggle', `切换角色卡片展开状态`, { 角色: roleName, 展开: expand });
};

// 暴露 update 函数，以便在 index.ts 中可以调用
defineExpose({
  update,
});
</script>

<style lang="scss" scoped>
// From style.scss: .debug-toolbar and .incident-list
:deep(.debug-toolbar) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
:deep(.debug-switch) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9em;
  padding: 4px 8px;
  border: 1px dashed var(--line);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
}
:deep(.incident-list) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// From style_modeled.scss (section 3) for .role-card used in this component
:deep(#other-roles-list) {
  .role-card {
    flex: 1 1 auto; // Use flex for responsiveness
    min-width: 0;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: var(--pad);
    position: relative;
    overflow: hidden;
    transition:
      box-shadow 0.2s ease,
      transform 0.02s ease;
  }
  .role-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px dashed var(--line);
    > div:nth-child(2) {
      flex: 1 1 auto;
      min-width: 0;
    }
  }
  .role-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--line);
    background: var(--avatar-bg);
    display: grid;
    place-items: center;
    font-weight: 700;
    color: var(--muted);
    flex-shrink: 0;
  }
  .role-name {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .role-meta {
    font-size: 0.85em;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .card-toggle {
    margin-left: auto;
    border: 1px solid var(--line);
    background: var(--paper);
    border-radius: 6px;
    padding: 4px 8px;
    font-weight: 700;
    cursor: pointer;
    flex: 0 0 auto;
  }
  .role-body {
    margin-top: 8px;
    border-top: 1px dashed var(--line);
    padding-top: 8px;
  }
  .role-line {
    margin: 6px 0;
    font-size: 0.9em;
    display: flex;
    flex-wrap: wrap;
  }
  .mini-bar {
    height: 8px;
    background: var(--bar-bg);
    border: 1px solid var(--line);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    flex-grow: 1;
    margin-left: 8px;
    min-width: 50px;
  }
  .mini-bar .val {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #c0a58a, #8c7b6a);
    transition: width 0.3s ease;
  }
  // Collapse/Expand styles
  .role-card.collapsed {
    padding-bottom: 8px;
    .role-body {
      display: none;
    }
    .role-card-header {
      margin-bottom: 0;
      padding-bottom: 6px;
    }
  }
  .role-card.expanded {
    padding-bottom: calc(var(--pad) + 8px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    max-height: none;
    overflow: visible;
  }
}

// Dark theme overrides
:global(:root[data-theme='dark']) .debug-switch {
  background: rgba(255, 255, 255, 0.05);
}
:global(:root[data-theme='dark']) #other-roles-list .role-card.expanded {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}
</style>
