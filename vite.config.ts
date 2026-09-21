import path from 'node:path';
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

// 设计令牌与混入：以绝对路径注入，保证任意目录下的组件样式都能直接使用 $primary 等变量
const stylesDir = path.resolve(__dirname, 'src/styles').replace(/\\/g, '/');
const designTokens = `@import "${stylesDir}/variables.scss";\n@import "${stylesDir}/mixins.scss";\n`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: designTokens,
      },
    },
  },
});
