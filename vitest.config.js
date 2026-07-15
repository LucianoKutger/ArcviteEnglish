import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupVitest.js',
    globals: true,
    css: true,

    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',

      include: ['src/**/*.{js,jsx}'],

      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/setupVitest.js',
        'src/main.jsx',
        'src/test-utils/**',

        // Derzeit nicht in der Anwendung verwendet.
        // Rolldown kann die unveränderte JSX-Datei bei der
        // Erfassung ungetesteter Dateien nicht instrumentieren.
        'src/components/visuals/ArcSystem.jsx',
      ],
    },
  },
});
