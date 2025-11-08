<template>
  <div class="role-ribbon-container">
    <button id="ribbon-left" class="ribbon-arrow left" @click="scroll(-1)">‹</button>
    <button id="ribbon-right" class="ribbon-arrow right" @click="scroll(1)">›</button>
    <div id="role-ribbon" ref="ribbon" class="role-ribbon">
      <RoleCard
        v-for="char in nearbyCharacters"
        :key="char.id"
        :character="char"
        :stat-without-meta="state.stat"
        :runtime="state.runtime"
        @show-details="selectedCharacter = $event"
      />
      <div v-if="!nearbyCharacters.length" class="role-card-placeholder">附近暂无角色</div>
    </div>

    <RoleDetailPopup
      v-if="selectedCharacter"
      :character="selectedCharacter"
      :stat-without-meta="state.stat"
      :runtime="state.runtime"
      @close="selectedCharacter = null"
    />
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, reactive, ref } from 'vue';
import type { Character } from '../../../GSKO-BASE/schema/character';
import type { Runtime } from '../../../GSKO-BASE/schema/runtime';
import type { Stat } from '../../../GSKO-BASE/schema/stat';
import { Logger } from '../../utils/log';
import RoleCard from './RoleCard.vue';
import RoleDetailPopup from '../common/RoleDetailPopup/RoleDetailPopup.vue';

const logger = new Logger('RoleRibbon');

const state = reactive({
  stat: null as Stat | null,
  runtime: null as Runtime | null,
});

const ribbon = ref<HTMLElement | null>(null);
const selectedCharacter = ref<any | null>(null);
const ribbonScrollStep = 320;

// nearbyCharacters ��ǰ����ͬλ�ø�����ɫ������չ� ID �Ա��� runtime �еĲ�������
const nearbyCharacters = computed<(Character & { name: string; id: string })[]>(() => {
  const funcName = 'nearbyCharacters';
  const coLocatedIds = state.runtime?.character?.partitions?.coLocated;
  logger.debug(funcName, 'coLocatedIds:', _.cloneDeep(coLocatedIds));

  if (!coLocatedIds || !state.stat?.chars || !state.runtime?.character?.chars) {
    logger.debug(funcName, '依赖数据不完整，返回空数组。');
    return [];
  }

  return coLocatedIds
    .map(charId => {
      const charStat = state.stat?.chars?.[charId];
      const charRuntime = state.runtime?.character?.chars?.[charId];

      logger.debug(funcName, `[${charId}] charStat:`, _.cloneDeep(charStat));
      logger.debug(funcName, `[${charId}] charRuntime:`, _.cloneDeep(charRuntime));

      if (!charStat) {
        logger.warn(funcName, `在 stat.chars 中未找到角色 ${charId} 的数据，已跳过。`);
        return null;
      }

      // 优先使用 runtime 中定义的 name，如果不存在，则回退到使用角色 ID
      const displayName = charRuntime?.name || charId;
      logger.debug(funcName, `[${charId}] 最终显示名称: ${displayName}`);

      return {
        id: charId,
        ...charStat,
        ...charRuntime,
        name: displayName,
      };
    })
    .filter(Boolean) as (Character & { name: string; id: string })[];
});

const scroll = (direction: number) => {
  ribbon.value?.scrollBy({ left: direction * ribbonScrollStep, behavior: 'smooth' });
};

const updateRibbon = (context: { statWithoutMeta: Stat; runtime: Runtime }) => {
  const funcName = 'updateRibbon';
  logger.debug(funcName, '接收到新的上下文数据', {
    stat: _.cloneDeep(context.statWithoutMeta),
    runtime: _.cloneDeep(context.runtime),
  });
  state.stat = context.statWithoutMeta;
  state.runtime = context.runtime;
};

defineExpose({
  updateRibbon,
});
</script>

<style lang="scss" scoped>
/* Styles from old RoleRibbon.vue, slightly adapted */
.role-ribbon-container {
  position: relative;
  background: var(--paper);
  border-bottom: 1px solid var(--line);
  padding: 10px 40px;
  max-width: 100%;
  overflow-x: hidden;
}

.role-ribbon {
  display: flex;
  gap: 12px;
  overflow: auto hidden;
  scroll-snap-type: x proximity;
  padding-bottom: 6px;
}

.ribbon-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  background: var(--bg);
  border-radius: 4px;
  cursor: pointer;
  z-index: 10;
}
.ribbon-arrow.left {
  left: 8px;
}
.ribbon-arrow.right {
  right: 8px;
}

.role-card-placeholder {
  flex: 0 0 260px;
  padding: 16px;
  background: var(--bg);
  border: 1px dashed var(--line);
  border-radius: 6px;
  color: var(--muted);
  display: grid;
  place-items: center;
}
</style>
