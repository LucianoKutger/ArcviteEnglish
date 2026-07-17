import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { qrcode } from 'vite-plugin-qrcode';

const legacyTargets = ['>0.2%', 'not dead', 'not op_mini all'];

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: legacyTargets,
    }),
    qrcode(),
  ],

  server: {
    host: true,
    port: 3001,
  },

  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
});
