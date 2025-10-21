<template>
  <div class="status-news-container" :class="{ expanded: popupVisible }">
    <StatusNewsButton :expanded="popupVisible" @toggle-popup="togglePopup" />
    <StatusNewsPopup v-show="popupVisible" ref="statusNewsPopup" @close="popupVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import StatusNewsButton from './StatusNewsButton.vue';
import StatusNewsPopup from './StatusNewsPopup.vue';

const popupVisible = ref(false);
const statusNewsPopup = ref<InstanceType<typeof StatusNewsPopup> | null>(null);

const togglePopup = () => {
  popupVisible.value = !popupVisible.value;
};

// 暴露内部 popup 的 ref，以便 app.vue 可以调用 updateNews
defineExpose({
  updateNews: (state: object) => {
    statusNewsPopup.value?.updateNews(state);
  },
});
</script>

<style scoped>
.status-news-container {
  position: relative;
}
</style>
