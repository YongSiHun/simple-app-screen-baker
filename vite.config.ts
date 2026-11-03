import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { siteHtml } from './scripts/site-html.mjs';

export default defineConfig({
  plugins: [react(), tailwindcss(), siteHtml()],
  server: {
    hmr: true,
    watch: {
      // Enable polling only for file systems that cannot deliver change events.
      usePolling: process.env.VITE_USE_POLLING === 'true',
      interval: 300,
    },
  },
});
