import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

const legacyTargets = [
  '>0.2%',
  'not dead',
  'not op_mini all',
];

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: legacyTargets,
    }),
  ],
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
});
