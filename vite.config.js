import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Relative base so the build works from any folder (GitHub Pages, sub-path…)
export default defineConfig({
  base: './',
  plugins: [vue()]
})
