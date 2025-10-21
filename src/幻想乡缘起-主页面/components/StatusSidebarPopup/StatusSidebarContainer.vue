<template>
  <div class="status-sidebar-container">
    <StatusSidebarButtonClosed v-if="!sidebarVisible" @open-sidebar="sidebarVisible = true" />
    <StatusSidebarButtonOpen v-else @close-sidebar="sidebarVisible = false" />
    <StatusSidebarPopup v-show="sidebarVisible" ref="statusSidebarPopup" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import StatusSidebarButtonClosed from './StatusSidebarButtonClosed.vue';
import StatusSidebarButtonOpen from './StatusSidebarButtonOpen.vue';
import StatusSidebarPopup from './StatusSidebarPopup.vue';

const sidebarVisible = ref(false);
const statusSidebarPopup = ref<InstanceType<typeof StatusSidebarPopup> | null>(null);

// 暴露内部 popup 的 ref，以便 app.vue 可以调用 updateUserStatus
defineExpose({
  updateUserStatus: (userData: object) => {
    console.debug('StatusSidebarContainer.vue - updateUserStatus - userData:', userData);
    statusSidebarPopup.value?.updateUserStatus(userData);
  },
});
</script>

<style scoped>
.status-sidebar-container {
  position: relative;
}
</style>
