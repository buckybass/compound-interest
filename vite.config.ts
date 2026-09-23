import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: repository && !repository.toLowerCase().endsWith('.github.io') ? `/${repository}/` : '/',
})
