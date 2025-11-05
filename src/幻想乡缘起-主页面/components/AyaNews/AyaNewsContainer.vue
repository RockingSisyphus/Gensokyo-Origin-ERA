<template>
  <div class="aya-news-container">
    <AyaNewsButtonClosed v-if="!newsVisible" @open-news="newsVisible = true" />
    <AyaNewsButtonOpen v-else @close-news="newsVisible = false" />
    <AyaNewsPopup v-show="newsVisible" ref="ayaNewsPopup" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Stat } from '../../../GSKO-BASE/schema/stat';
import AyaNewsButtonClosed from './AyaNewsButtonClosed.vue';
import AyaNewsButtonOpen from './AyaNewsButtonOpen.vue';
import AyaNewsPopup from './AyaNewsPopup.vue';

const newsVisible = ref(false);
const ayaNewsPopup = ref<InstanceType<typeof AyaNewsPopup> | null>(null);

// 暴露内部 popup 的 ref，以便 app.vue 可以调用 updateNews
defineExpose({
  updateNews: (stat: Stat) => {
    ayaNewsPopup.value?.updateNews(stat);
  },
});
</script>

<style scoped>
.aya-news-container {
  position: relative;
}
</style>
