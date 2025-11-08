import { createApp } from 'vue';
import App from './app.vue';
$(() => {
  const app = createApp(App).mount('#app');

  eventOn('GSKO:showUI', (detail: any) => {
    if (detail) {
      (app as any).update(detail);
    }
  });
});
