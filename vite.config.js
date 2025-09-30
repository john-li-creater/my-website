import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // GitHub Pages 项目页，base 使用仓库名
  base: '/my-website/',
  build: {
    // 直接输出到 docs，便于 GitHub Pages 选择 /docs 目录发布
    outDir: 'dist',
    assetsDir: 'assets'
  }
})