import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const srcPath = path.resolve(__dirname, './src');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use 'sass:math';
          @import "${srcPath}/scss/variables.scss";
        `,
      },
    },
  },
});
