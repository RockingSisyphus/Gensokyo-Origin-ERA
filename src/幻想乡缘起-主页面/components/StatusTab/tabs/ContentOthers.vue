<template>
  <div>
    <h4><span class="emoji">🧑‍🤝‍🧑</span>其他角色</h4>
    <!-- ===== 其他角色工具条 ===== -->
    <div id="others-toolbar" class="GensokyoOrigin-ContentOthers-debug-toolbar" style="margin: 6px 0 10px">
      <span class="GensokyoOrigin-ContentOthers-debug-switch" title="config.mvuLifeMeet.rules.incident.skipVisitHunters">
        <input id="life-skip-visit-hunters" v-model="skipVisitHunters" type="checkbox" @change="onSkipVisitChange" />
        异变中退治者不拜访
      </span>
      <span class="GensokyoOrigin-ContentOthers-debug-switch" title="config.mvuLifeMeet.rules.incident.skipSleepHunters">
        <input id="life-skip-sleep-hunters" v-model="skipSleepHunters" type="checkbox" @change="onSkipSleepChange" />
        异变中退治者不睡觉
      </span>
    </div>

    <div id="other-roles-list" class="GensokyoOrigin-ContentOthers-incident-list" @click="handleToggle">
      <template v-if="otherRoles.length">
        <div
          v-for="(role, index) in otherRoles"
          :key="role.name"
          class="GensokyoOrigin-ContentOthers-role-card collapsed"
          :data-name="role.name"
        >
          <div class="GensokyoOrigin-ContentOthers-role-card-header">
            <div class="GensokyoOrigin-ContentOthers-role-avatar">{{ role.name.slice(0, 1) }}</div>
            <div>
              <div class="GensokyoOrigin-ContentOthers-role-name">{{ role.name }}</div>
              <div class="GensokyoOrigin-ContentOthers-role-meta">{{ role.location }}</div>
            </div>
            <button class="GensokyoOrigin-ContentOthers-card-toggle" aria-expanded="false" aria-label="展开/收起">▼</button>
          </div>
          <div class="GensokyoOrigin-ContentOthers-role-body">
            <div v-for="field in role.fields" :key="field.label" class="GensokyoOrigin-ContentOthers-role-line">
              <strong>{{ field.label }}：</strong>{{ field.value }}
            </div>
            <AffectionDisplay :character="role.raw" :stat-without-meta="stat" :runtime="runtime" size="large" />
            <ParticleEmitter
              :ref="el => (particleEmitters[index] = el)"
              :active="role.affectionState === 'love' || role.affectionState === 'hate'"
              :particle-type="role.affectionState === 'hate' ? 'skull' : 'heart'"
              :emission-rate="2"
            />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="GensokyoOrigin-ContentOthers-role-card">
          <div class="GensokyoOrigin-ContentOthers-role-card-header">
            <div class="GensokyoOrigin-ContentOthers-role-avatar">✔</div>
            <div>
              <div class="GensokyoOrigin-ContentOthers-role-name">当前无“其他角色”</div>
              <div class="GensokyoOrigin-ContentOthers-role-meta">与玩家不同区的角色为 0</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineExpose, ref, watch } from 'vue';
import { ERA_VARIABLE_PATH } from '../../../utils/constants';
import { updateEraVariable } from '../../../utils/eraWriter';
import { get, toText } from '../../../utils/format';
import { Logger } from '../../../utils/log';
import AffectionDisplay from '../../RoleRibbon/AffectionDisplay.vue';
import ParticleEmitter from '../../common/ParticleEmitter.vue';

const logger = new Logger();

const otherRoles = ref<any[]>([]);
const stat = ref<any>({});
const runtime = ref<any>({});
const skipVisitHunters = ref(false);
const skipSleepHunters = ref(false);
const particleEmitters = ref<any[]>([]);

const update = (context: { statWithoutMeta: any; runtime: any }) => {
  const funcName = 'update';
  const { statWithoutMeta, runtime: newRuntime } = context || {};
  logger.log(funcName, `开始更新“其他角色”组件`, { statWithoutMeta, newRuntime });

  if (!statWithoutMeta || typeof statWithoutMeta !== 'object') {
    logger.warn(funcName, '调用失败：传入的 statWithoutMeta 无效。');
    return;
  }

  stat.value = statWithoutMeta;
  runtime.value = newRuntime || {};

  try {
    skipVisitHunters.value = !!get(statWithoutMeta, ERA_VARIABLE_PATH.SKIP_VISIT_HUNTERS, false);
    skipSleepHunters.value = !!get(statWithoutMeta, ERA_VARIABLE_PATH.SKIP_SLEEP_HUNTERS, false);
  } catch (e) {
    logger.error(funcName, `更新工具条状态时出错`, e);
  }

  try {
    const uLoc = String(get(statWithoutMeta, ERA_VARIABLE_PATH.USER_LOCATION, '')).trim();
    let chars = get(statWithoutMeta, ERA_VARIABLE_PATH.CHARS, {});

    if (typeof chars === 'string') {
      try {
        chars = JSON.parse(chars);
      } catch (e) {
        logger.error(funcName, '解析 chars JSON 字符串失败', e);
        chars = {};
      }
    }

    if (!chars || typeof chars !== 'object') {
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

    others.sort((a: [string, any], b: [string, any]) => {
      const la = String(get(a[1], ERA_VARIABLE_PATH.CHAR_LOCATION, '')).localeCompare(
        String(get(b[1], ERA_VARIABLE_PATH.CHAR_LOCATION, '')),
        'zh-Hans-CN',
      );
      if (la !== 0) return la;
      return String(a[0]).localeCompare(String(b[0]), 'zh-Hans-CN');
    });

    const loveThreshold = Number(get(statWithoutMeta, ERA_VARIABLE_PATH.AFFECTION_LOVE_THRESHOLD, 100));
    const hateThreshold = Number(get(statWithoutMeta, ERA_VARIABLE_PATH.AFFECTION_HATE_THRESHOLD, -100));

    const newRoles = others.map(([name, obj]: [string, any]) => {
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
      const affectionValue = get(obj, ERA_VARIABLE_PATH.CHAR_AFFECTION, 0);
      let affectionState: 'neutral' | 'love' | 'hate' = 'neutral';
      if (affectionValue >= loveThreshold) affectionState = 'love';
      if (affectionValue <= hateThreshold) affectionState = 'hate';

      return {
        name,
        location: toText(get(obj, ERA_VARIABLE_PATH.CHAR_LOCATION, '未知')),
        fields: fields.map(([label, key]) => ({ label, value: toText(get(obj, key, '—')) })),
        raw: { name, ...obj },
        affectionState,
      };
    });

    // 监视好感度状态变化以触发粒子爆发
    watch(
      newRoles,
      (currentRoles, oldRoles) => {
        currentRoles.forEach((role, index) => {
          const oldRole = oldRoles?.find(r => r.name === role.name);
          if (oldRole && role.affectionState !== oldRole.affectionState) {
            const emitter = particleEmitters.value[index];
            if (emitter) {
              if (role.affectionState === 'love') emitter.burst('heart', 10);
              else if (role.affectionState === 'hate') emitter.burst('skull', 8);
            }
          }
        });
      },
      { deep: true },
    );

    otherRoles.value = newRoles;
    particleEmitters.value = new Array(newRoles.length);
  } catch (e) {
    logger.error(funcName, `更新“其他角色”列表时出错`, e);
    otherRoles.value = [];
  }
};

const onSkipVisitChange = () => {
  updateEraVariable(ERA_VARIABLE_PATH.SKIP_VISIT_HUNTERS, skipVisitHunters.value);
};

const onSkipSleepChange = () => {
  updateEraVariable(ERA_VARIABLE_PATH.SKIP_SLEEP_HUNTERS, skipSleepHunters.value);
};

const handleToggle = (e: MouseEvent) => {
  const btn = (e.target as HTMLElement).closest('.GensokyoOrigin-ContentOthers-card-toggle');
  if (!btn) return;
  const card = btn.closest('.GensokyoOrigin-ContentOthers-role-card');
  if (!card) return;
  const expand = !card.classList.contains('expanded');
  card.classList.toggle('expanded', expand);
  card.classList.toggle('collapsed', !expand);
  btn.setAttribute('aria-expanded', String(expand));
  btn.textContent = expand ? '▲' : '▼';
};

defineExpose({
  update,
});
</script>

<style lang="scss">
.GensokyoOrigin-ContentOthers-debug-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.GensokyoOrigin-ContentOthers-debug-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9em;
  padding: 4px 8px;
  border: 1px dashed var(--line);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
}
.GensokyoOrigin-ContentOthers-incident-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.GensokyoOrigin-ContentOthers-incident-list {
  .GensokyoOrigin-ContentOthers-role-card {
    flex: 1 1 auto;
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
  .GensokyoOrigin-ContentOthers-role-card-header {
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
  .GensokyoOrigin-ContentOthers-role-avatar {
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
  .GensokyoOrigin-ContentOthers-role-name {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .GensokyoOrigin-ContentOthers-role-meta {
    font-size: 0.85em;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .GensokyoOrigin-ContentOthers-card-toggle {
    margin-left: auto;
    border: 1px solid var(--line);
    background: var(--paper);
    border-radius: 6px;
    padding: 4px 8px;
    font-weight: 700;
    cursor: pointer;
    flex: 0 0 auto;
  }
  .GensokyoOrigin-ContentOthers-role-body {
    margin-top: 8px;
    border-top: 1px dashed var(--line);
    padding-top: 8px;
    position: relative; /* For ParticleEmitter */
  }
  .GensokyoOrigin-ContentOthers-role-line {
    margin: 6px 0;
    font-size: 0.9em;
    display: flex;
    flex-wrap: wrap;
  }
  .GensokyoOrigin-ContentOthers-role-card.collapsed {
    padding-bottom: 8px;
    .GensokyoOrigin-ContentOthers-role-body {
      display: none;
    }
    .GensokyoOrigin-ContentOthers-role-card-header {
      margin-bottom: 0;
      padding-bottom: 6px;
    }
  }
  .GensokyoOrigin-ContentOthers-role-card.expanded {
    padding-bottom: calc(var(--pad) + 8px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    max-height: none;
    overflow: visible;
  }
}

:root[data-theme='dark'] .GensokyoOrigin-ContentOthers-debug-switch {
  background: rgba(255, 255, 255, 0.05);
}
:root[data-theme='dark'] .GensokyoOrigin-ContentOthers-incident-list .GensokyoOrigin-ContentOthers-role-card.expanded {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}
</style>
