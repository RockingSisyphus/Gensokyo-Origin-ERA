<template>
  <div class="time-container">
    <TimeButtonClosed v-if="!calendarVisible" @open-calendar="calendarVisible = true" :clock-info="clockInfo" />
    <TimeButtonOpen v-else @close-calendar="calendarVisible = false" />
    <CalendarContent 
      v-show="calendarVisible" 
      :clock-info="clockInfo"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TimeButtonClosed from './TimeButtonClosed.vue';
import TimeButtonOpen from './TimeButtonOpen.vue';
import CalendarContent from './CalendarContent.vue';

defineProps<{
  clockInfo: object | null;
}>();

const calendarVisible = ref(false);
</script>

<style scoped>
.time-container {
  position: relative;
}
</style>
