import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { siteHtml } from './scripts/site-html.mjs';

export default defineConfig({
  plugins: [react(), tailwindcss(), siteHtml()],
  server: {
    hmr: true,
    watch: {
      // FS 변경 이벤트 미지원 시에만 폴링
      usePolling: process.env.VITE_USE_POLLING === 'true',
      interval: 300,
    },
  },
});
