<template>
  <div class="weather-container">
    <WeatherButtonClosed v-if="!weatherVisible" @open-weather="weatherVisible = true" :weather="weather" />
    <WeatherButtonOpen v-else @close-weather="weatherVisible = false" />
    <WeatherContent v-show="weatherVisible" :weather="weather" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import WeatherButtonClosed from './WeatherButtonClosed.vue';
import WeatherButtonOpen from './WeatherButtonOpen.vue';
import WeatherContent from './WeatherContent.vue';
import type { Stat } from '../../../../../GSKO-BASE/schema/stat';

const props = defineProps({
  stat: {
    type: Object as PropType<Stat | null>,
    required: true,
  },
});

const weatherVisible = ref(false);

const weather = computed(() => props.stat?.weather ?? null);
</script>

<style scoped>
.weather-container {
  position: relative;
}
</style>
