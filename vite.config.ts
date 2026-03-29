/*
MODULE_CONTRACT: Define the Vite runtime contract for the frontend shell.
SCOPE: Dev server host/port, backend proxy, source alias, and Vitest defaults.
DEPENDS: package.json, tsconfig.json, src/env.d.ts
LINKS: [FrontendTooling][setup][BLOCK_DEFINE_TOOLCHAIN]
MODULE_MAP: default - Vite configuration for the frontend dev server, aliasing, and Vitest runtime.
START_BLOCK_IMPORTS
Shared toolchain imports and constants.
END_BLOCK_IMPORTS
START_BLOCK_SERVER_AND_ALIAS
Vite dev server, proxy, and alias configuration.
END_BLOCK_SERVER_AND_ALIAS
CHANGE_SUMMARY: Adds stable Vitest defaults for the full frontend suite under jsdom load.
*/
import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

const backendTarget = 'http://localhost:8000';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/v1': {
        changeOrigin: true,
        target: backendTarget,
      },
    },
  },
  test: {
    environment: 'jsdom',
    fileParallelism: false,
    globals: true,
    testTimeout: 15_000,
  },
});
