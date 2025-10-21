<template>
  <div class="role-ribbon-container">
    <button id="ribbon-left" class="ribbon-arrow left" @click="scroll(-1)">‹</button>
    <button id="ribbon-right" class="ribbon-arrow right" @click="scroll(1)">›</button>
    <div id="role-ribbon" ref="ribbon" class="role-ribbon">
      <RoleCard 
        v-for="char in nearbyCharacters" 
        :key="char.name" 
        :character="char"
        :stat-without-meta="statWithoutMeta"
        @show-details="selectedCharacter = $event"
      />
      <div v-if="!nearbyCharacters.length" class="role-card-placeholder">
        附近暂无角色
      </div>
    </div>

    <RoleDetailPopup 
      v-if="selectedCharacter" 
      :character="selectedCharacter"
      :stat-without-meta="statWithoutMeta"
      @close="selectedCharacter = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ERA_VARIABLE_PATH } from '../../utils/constants';
import { get } from '../../utils/mvu';
import RoleCard from './RoleCard.vue';
import RoleDetailPopup from './RoleDetailPopup.vue';

const ribbon = ref<HTMLElement | null>(null);
const allCharacters = ref<any>({});
const userLocation = ref('');
const ribbonScrollStep = ref(320);
const selectedCharacter = ref<any | null>(null);
const statWithoutMeta = ref<any>({});

const nearbyCharacters = computed(() => {
  if (!userLocation.value || !Object.keys(allCharacters.value).length) {
    return [];
  }
  return Object.entries(allCharacters.value)
    .filter(([, v]: any) => v && typeof v === 'object' && String(get(v, ERA_VARIABLE_PATH.CHAR_LOCATION, '')).trim() === userLocation.value)
    .map(([name, data]) => Object.assign({ name }, data));
});

const scroll = (direction: number) => {
  ribbon.value?.scrollBy({ left: direction * ribbonScrollStep.value, behavior: 'smooth' });
};

const updateRibbon = (newStat: any) => {
  if (!newStat || typeof newStat !== 'object') return;
  statWithoutMeta.value = newStat;
  
  userLocation.value = String(get(newStat, ERA_VARIABLE_PATH.USER_LOCATION, '')).trim();
  
  let chars: any = newStat?.[ERA_VARIABLE_PATH.CHARS as any];
  try {
    if (typeof chars === 'string') chars = JSON.parse(chars);
  } catch {
    chars = {};
  }
  allCharacters.value = chars || {};

  ribbonScrollStep.value = Number(get(newStat, ERA_VARIABLE_PATH.UI_RIBBON_STEP, 320)) || 320;
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
.ribbon-arrow.left { left: 8px; }
.ribbon-arrow.right { right: 8px; }

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
