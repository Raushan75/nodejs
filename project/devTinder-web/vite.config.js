import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Same setup as Nginx in production: /api/* goes to the backend with the
    // /api prefix removed (/api/feed -> http://localhost:3000/feed), so
    // BASE_URL = "/api" works in both places. ws: true also forwards the chat socket.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
