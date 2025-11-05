<template>
  <div class="role-ribbon-container">
    <button id="ribbon-left" class="ribbon-arrow left" @click="scroll(-1)">‹</button>
    <button id="ribbon-right" class="ribbon-arrow right" @click="scroll(1)">›</button>
    <div id="role-ribbon" ref="ribbon" class="role-ribbon">
      <RoleCard
        v-for="char in nearbyCharacters"
        :key="char.name"
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
import { computed, ref, reactive } from 'vue';
import type { Stat } from '../../../GSKO-BASE/schema/stat';
import type { Runtime } from '../../../GSKO-BASE/schema/runtime';
import type { Character } from '../../../GSKO-BASE/schema/character';
import RoleCard from './RoleCard.vue';
import RoleDetailPopup from './RoleDetailPopup.vue';

const state = reactive({
  stat: null as Stat | null,
  runtime: null as Runtime | null,
});

const ribbon = ref<HTMLElement | null>(null);
const selectedCharacter = ref<any | null>(null);
const ribbonScrollStep = 320;

const nearbyCharacters = computed<(Character & { name: string })[]>(() => {
  const userLocation = state.stat?.user?.所在地区;
  if (!userLocation || !state.stat?.chars) {
    return [];
  }
  return Object.entries(state.stat.chars)
    .filter(([, char]) => char && String(char.所在地区 || '').trim() === userLocation)
    .map(([name, char]) => ({ ...char, name }));
});

const scroll = (direction: number) => {
  ribbon.value?.scrollBy({ left: direction * ribbonScrollStep, behavior: 'smooth' });
};

const updateRibbon = (context: { statWithoutMeta: Stat; runtime: Runtime }) => {
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
