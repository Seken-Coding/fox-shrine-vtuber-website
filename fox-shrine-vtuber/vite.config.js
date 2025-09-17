import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use SWC instead of Babel for React transformation
      jsxRuntime: 'automatic',
      fastRefresh: true
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: true
  },
  publicDir: 'public'
})