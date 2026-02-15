// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import PWA from '@vite-pwa/astro';

const site = process.env.SITE_URL ?? 'https://mtgvim.github.io';
const base = (() => {
  const raw = process.env.BASE_PATH ?? '/';
  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
})();

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [
    vue(),
    PWA({
      injectRegister: false,
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        id: base,
        name: 'Pick-A-nimal',
        short_name: 'Pick-A-nimal',
        description: '카드 두 장을 선택해 뒤집으세요. 모든 쌍을 찾으세요!',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#34495e',
        icons: [
          {
            src: `${base}pwa-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: `${base}pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,json,txt}'],
        navigateFallback: `${base}index.html`,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
