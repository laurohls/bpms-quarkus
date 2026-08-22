import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'bpms-frontend-master': path.resolve(__dirname, './src/vendor/master'),
    },
  },
  server: {
    host: 'localhost',
    port: 3003,
    strictPort: true,
  },
})
