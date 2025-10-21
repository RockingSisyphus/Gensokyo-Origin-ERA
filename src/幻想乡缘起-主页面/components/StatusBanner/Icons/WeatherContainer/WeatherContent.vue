<template>
  <div class="weather-content">
    <p>当前天气: {{ weather || '未知' }}</p>
    <p><em>(未来可扩充天气预报等详细信息)</em></p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  weather: string | null;
}>();
</script>

<style lang="scss" scoped>
.weather-content {
  position: static;
  width: 100%;
  padding: 16px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-top: 0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  color: var(--ink);
}

p {
  margin: 4px 0;
}

em {
  color: var(--muted);
  font-size: 0.9em;
}
</style>
