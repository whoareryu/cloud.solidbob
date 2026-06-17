import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 백엔드 CORS 가 localhost:3000 을 허용하므로 dev 서버 포트를 3000 으로 고정한다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '127.0.0.1',
  },
})
