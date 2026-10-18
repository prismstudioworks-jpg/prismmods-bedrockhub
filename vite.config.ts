import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        manifest: {
          id: '/',
          name: 'PrismMods Bedrock Hub',
          short_name: 'PrismMods',
          description: 'Discover and download curated Minecraft Bedrock addons, texture packs, maps, and shaders.',
          theme_color: '#0f172a',
          background_color: '#020617',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          orientation: 'portrait',
          categories: ['education', 'utilities', 'games'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
          ],
          screenshots: [
            {
              src: '/screenshot-wide.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
            },
            {
              src: '/screenshot-narrow.png',
              sizes: '720x1280',
              type: 'image/png',
              form_factor: 'narrow',
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
