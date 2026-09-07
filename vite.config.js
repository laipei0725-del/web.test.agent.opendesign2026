import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/web.test.agent.opendesign2026/' : './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'shopee-ai-agent/dashboard.html'),
        booking: resolve(__dirname, 'shopee-ai-agent/booking.html'),
        agent_index: resolve(__dirname, 'shopee-ai-agent/index.html'),
        kit: resolve(__dirname, 'shopee-ai-agent/kit.html'),
        kit_dark: resolve(__dirname, 'shopee-ai-agent/kit.dark.html'),
        dance_dashboard: resolve(__dirname, 'dance-creator-os/src/dashboard/index.html'),
        dance_portal: resolve(__dirname, 'dance-creator-os/src/portal/index.html'),
        dance_journal_01: resolve(__dirname, 'dance-creator-os/src/portal/journal-01.html'),
        dance_journal_02: resolve(__dirname, 'dance-creator-os/src/portal/journal-02.html'),
      },
    },
  },
})
