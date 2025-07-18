import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/smart-lock-endurance-test/',
  server: {
    port: 8080,
    host: '0.0.0.0',
    strictPort: true,
    cors: true
  },
  build: {
    outDir: 'dist'
  }
})