import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog.html'),
        dashboard: resolve(__dirname, 'shopee-ai-agent/dashboard.html'),
        agent_index: resolve(__dirname, 'shopee-ai-agent/index.html'),
        kit: resolve(__dirname, 'shopee-ai-agent/kit.html'),
        kit_dark: resolve(__dirname, 'shopee-ai-agent/kit.dark.html'),
      },
    },
  },
})
