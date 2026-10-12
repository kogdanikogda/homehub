import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' — работает и на GitHub Pages (/homehub/), и локально
export default defineConfig({
  base: './',
  plugins: [react()],
})
