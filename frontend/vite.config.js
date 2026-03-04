import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['it-admin.yes.com.sv'],
    proxy: {
      '/api': {
        target: 'http://it-inv-backend:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://it-inv-backend:3000',
        changeOrigin: true
      }
    }
  }
})
