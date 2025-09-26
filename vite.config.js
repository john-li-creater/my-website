import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/my-website/', // GitHub Pages 基础路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})