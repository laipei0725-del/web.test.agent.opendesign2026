import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, 'src/dashboard/index.html'),
        portal: resolve(__dirname, 'src/portal/index.html')
      }
    }
  }
})
