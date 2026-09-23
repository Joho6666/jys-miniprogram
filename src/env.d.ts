/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_USE_MOCK?: string;
  readonly VITE_DEMO_MODE?: string;
  readonly VITE_WECHAT_APPID?: string;
}
