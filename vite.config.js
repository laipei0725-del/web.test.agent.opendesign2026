import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/web.test.agent.opendesign2026/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog.html'),
        dashboard: resolve(__dirname, 'shopee-ai-agent/dashboard.html'),
        booking: resolve(__dirname, 'shopee-ai-agent/booking.html'),
        agent_index: resolve(__dirname, 'shopee-ai-agent/index.html'),
        kit: resolve(__dirname, 'shopee-ai-agent/kit.html'),
        kit_dark: resolve(__dirname, 'shopee-ai-agent/kit.dark.html'),
        dance_dashboard: resolve(__dirname, 'dance-creator-os/src/dashboard/index.html'),
        dance_portal: resolve(__dirname, 'dance-creator-os/src/portal/index.html'),
      },
    },
  },
})
