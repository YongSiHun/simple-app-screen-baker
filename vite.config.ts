import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: true,
    watch: {
      // Windows 및 공유 폴더에서도 파일 변경을 안정적으로 감지한다.
      usePolling: true,
      interval: 100,
    },
  },
});
