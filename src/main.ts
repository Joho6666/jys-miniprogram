import { createSSRApp } from 'vue';
import * as Pinia from 'pinia';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);
  app.use(Pinia.createPinia());
  return {
    app,
    // uni-app 小程序端要求把 Pinia 一并返回,以保证状态在页面间共享
    Pinia,
  };
}
