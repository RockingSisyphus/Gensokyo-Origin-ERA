<template>
  <div class="status-sidebar-container" :class="{ expanded: sidebarVisible }">
    <StatusSidebarButton :expanded="sidebarVisible" @toggle-sidebar="toggleSidebar" />
    <StatusSidebarPopup v-show="sidebarVisible" ref="statusSidebarPopup" @close="sidebarVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import StatusSidebarButton from './StatusSidebarButton.vue';
import StatusSidebarPopup from './StatusSidebarPopup.vue';

const sidebarVisible = ref(false);
const statusSidebarPopup = ref<InstanceType<typeof StatusSidebarPopup> | null>(null);

const toggleSidebar = (event: MouseEvent) => {
  sidebarVisible.value = !sidebarVisible.value;
};

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
