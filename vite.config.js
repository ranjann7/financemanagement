import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: globalThis.process?.env?.GITHUB_ACTIONS ? '/financemanagement/' : '/',
})
