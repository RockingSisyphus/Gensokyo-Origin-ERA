import { createApp } from 'vue';
import App from './app.vue';
$(() => {
  const app = createApp(App).mount('#app');
  let hasReceivedData = false;

  eventOn('GSKO:showUI', (detail: any) => {
    hasReceivedData = true;
    if (detail) {
      (app as any).update(detail);
    }
  });

  // 设置一个短暂的延迟来检查是否已收到初始数据
  setTimeout(() => {
    // 如果在延迟后仍未收到数据，则主动请求
    if (!hasReceivedData) {
      eventEmit('GSKO:requireData');
    }
  }, 500); // 500ms 的延迟，可以根据实际情况调整
});
