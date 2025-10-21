<template>
  <div class="role-card-wrapper" @click="$emit('show-details', character)">
    <div class="role-card-header">
      <div class="role-avatar">{{ character.name.slice(0, 1) }}</div>
      <div>
        <div class="role-name">{{ character.name }}</div>
        <div class="role-meta">{{ character['所在地区'] || '未知' }}</div>
      </div>
    </div>
    <AffectionDisplay :character="character" :stat-without-meta="statWithoutMeta" size="small" />
  </div>
</template>

<script setup lang="ts">
import AffectionDisplay from './AffectionDisplay.vue';

defineProps<{
  character: any;
  statWithoutMeta: any;
}>();

defineEmits(['show-details']);
</script>

<style lang="scss" scoped>
.role-card-wrapper {
  flex: 0 0 220px;
  min-width: 0;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 10px;
  scroll-snap-align: start;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: color-mix(in srgb, var(--bg) 90%, var(--ink) 10%);
  }
}

.role-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--line);
}

.role-avatar {
  width: 36px;
  height: 36px;
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
  font-size: 0.95em;
}

.role-meta {
  font-size: 0.8em;
  color: var(--muted);
}
</style>
