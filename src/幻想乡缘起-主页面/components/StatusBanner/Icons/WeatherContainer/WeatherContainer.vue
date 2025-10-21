<template>
  <div class="weather-container">
    <WeatherButtonClosed v-if="!weatherVisible" @open-weather="weatherVisible = true" :weather="weather" />
    <WeatherButtonOpen v-else @close-weather="weatherVisible = false" />
    <WeatherContent v-show="weatherVisible" :weather="weather" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WeatherButtonClosed from './WeatherButtonClosed.vue';
import WeatherButtonOpen from './WeatherButtonOpen.vue';
import WeatherContent from './WeatherContent.vue';

defineProps<{
  weather: string | null;
}>();

const weatherVisible = ref(false);
</script>

<style scoped>
.weather-container {
  position: relative;
}
</style>
