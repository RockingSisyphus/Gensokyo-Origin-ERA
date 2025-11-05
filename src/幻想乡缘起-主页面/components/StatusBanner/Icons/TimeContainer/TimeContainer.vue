<template>
  <div class="time-container">
    <TimeButtonClosed v-if="!calendarVisible" @open-calendar="calendarVisible = true" :clock-info="clockInfo" />
    <TimeButtonOpen v-else @close-calendar="calendarVisible = false" />
    <CalendarContent v-show="calendarVisible" :clock-info="clockInfo" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ClockInfo } from '../../../../utils/constants';
import TimeButtonClosed from './TimeButtonClosed.vue';
import TimeButtonOpen from './TimeButtonOpen.vue';
import CalendarContent from './CalendarContent.vue';
import type { Stat } from '../../../../../GSKO-BASE/schema/stat';
import type { Runtime } from '../../../../../GSKO-BASE/schema/runtime';

const props = defineProps<{
  stat: Stat | null;
  runtime: Runtime | null;
}>();

const calendarVisible = ref(false);

const clockInfo = computed<ClockInfo | null>(() => {
  const clockNow = props.runtime?.clock?.now;
  const festivals = props.stat?.festivals_list;

  if (clockNow && festivals) {
    // 类型断言，因为 clockNow 已经是 object
    return { ...(clockNow as object), festivals } as ClockInfo;
  }
  return null;
});
</script>

<style scoped>
.time-container {
  position: relative;
}
</style>
