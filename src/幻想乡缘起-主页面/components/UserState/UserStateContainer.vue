<template>
  <div class="user-state-container">
    <UserStateButtonClosed v-if="!sidebarVisible" @open-sidebar="sidebarVisible = true" />
    <UserStateButtonOpen v-else @close-sidebar="sidebarVisible = false" />
    <UserStatePopup v-show="sidebarVisible" ref="userStatePopup" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserStateButtonClosed from './UserStateButtonClosed.vue';
import UserStateButtonOpen from './UserStateButtonOpen.vue';
import UserStatePopup from './UserStatePopup.vue';
import { Logger } from '../../utils/logger';

const logger = new Logger();
const sidebarVisible = ref(false);
const userStatePopup = ref<InstanceType<typeof UserStatePopup> | null>(null);

// 暴露内部 popup 的 ref，以便 app.vue 可以调用 updateUserStatus
defineExpose({
  updateUserStatus: (userData: object) => {
    logger.debug('updateUserStatus', '更新用户状态数据', userData);
    userStatePopup.value?.updateUserStatus(userData);
  },
});
</script>

<style scoped>
.user-state-container {
  position: relative;
}
</style>
