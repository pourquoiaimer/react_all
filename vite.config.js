import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/react_all/', // 如果你的 repo 名是 color-grid-game
  plugins: [react()],
})
