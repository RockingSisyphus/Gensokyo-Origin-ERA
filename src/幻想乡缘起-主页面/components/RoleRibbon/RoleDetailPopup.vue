<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="role-detail-popup">
      <button class="close-btn" @click="$emit('close')">&times;</button>
      <div class="role-card-header">
        <div class="role-avatar">{{ character.name.slice(0, 1) }}</div>
        <div>
          <div class="role-name">{{ character.name }}</div>
          <div class="role-meta">{{ character['所在地区'] || '未知' }}</div>
        </div>
      </div>
      <div class="details-grid">
        <div class="detail-item"><strong>年龄:</strong> {{ toText(character['年龄']) }}</div>
        <div class="detail-item"><strong>性别:</strong> {{ toText(character['性别']) }}</div>
        <div class="detail-item"><strong>身份:</strong> {{ toText(character['身份']) }}</div>
        <div class="detail-item"><strong>居住地:</strong> {{ toText(character['居住地区']) }}</div>
        <div class="detail-item full-width"><strong>性格:</strong> {{ toText(character['性格']) }}</div>
        <div class="detail-item full-width"><strong>外貌:</strong> {{ toText(character['外貌']) }}</div>
        <div class="detail-item full-width"><strong>人际关系:</strong> {{ toText(character['人际关系']) }}</div>
        <div class="detail-item full-width"><strong>当前目标:</strong> {{ toText(character['当前目标']) }}</div>
      </div>
      <AffectionDisplay :character="character" :stat-without-meta="statWithoutMeta" size="large" />
    </div>
  </div>
</template>

<script setup lang="ts">
import AffectionDisplay from './AffectionDisplay.vue';

const props = defineProps<{
  character: any;
  statWithoutMeta: any;
}>();

defineEmits(['close']);

const toText = (v: any) => {
  if (Array.isArray(v)) return v.length ? v.join('；') : '—';
  if (v == null || v === '') return '—';
  return String(v);
};
</script>

<style lang="scss" scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.role-detail-popup {
  position: relative;
  width: 90vw;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: var(--muted);
}

/* Reusing styles from RoleCard for header */
.role-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.role-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--avatar-bg);
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 700;
  color: var(--muted);
  flex-shrink: 0;
}

.role-name {
  font-size: 1.5em;
  font-weight: 700;
}

.role-meta {
  font-size: 1em;
  color: var(--muted);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  background: var(--bg);
  padding: 8px;
  border-radius: 4px;
  font-size: 0.95em;

  strong {
    color: var(--muted);
    margin-right: 8px;
  }
}

.detail-item.full-width {
  grid-column: 1 / -1;
}
</style>
