import { createApp } from 'vue';
import App from './app.vue';
import './style.scss';

$(() => {
  const app = createApp(App);
  app.mount('#app');
});
