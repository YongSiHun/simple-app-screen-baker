import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: true,
    watch: {
      // Enable polling only for file systems that cannot deliver change events.
      usePolling: process.env.VITE_USE_POLLING === 'true',
      interval: 300,
    },
  },
});
