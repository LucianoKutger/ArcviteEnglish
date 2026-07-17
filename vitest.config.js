import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  test: {
    environment: 'jsdom',
    setupFiles: './src/setupVitest.js',
    globals: true,
    css: true,

    include: ['src/**/*.test.{js,jsx}'],

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
        'src/components/dashboards/BiometricSlider.jsx',
        'src/components/visuals/ArcSystem.jsx',
      ],

      thresholds: {
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90,
      },
    },
  },
});
