import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // регистрируем SW вручную в main.jsx (с проверкой обновления при возврате)
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      pwaAssets: {
        config: true,
        overrideManifestIcons: true,
        // theme-color уже есть в index.html и меняется вместе с темой.
        // Второй тег от генератора оставался светлым и сбивал Safari.
        injectThemeColor: false,
      },
      manifest: {
        // id закрепляет тождество приложения. Без него браузер опознаёт PWA
        // по start_url, и любая его правка выглядит как новое приложение —
        // установленное остаётся сиротой со старым кешем.
        id: '/',
        name: 'Расписание ШКИ',
        short_name: 'РасписаШКИ',
        description: 'Расписание Школы креативных индустрий г. Строитель',
        lang: 'ru',
        dir: 'ltr',
        theme_color: '#e9e9e9',
        background_color: '#e9e9e9',
        display: 'standalone',
        // Запасной режим, если standalone недоступен: minimal-ui оставляет
        // тонкую строку браузера, но приложение всё равно открывается окном,
        // а не полноценной вкладкой.
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
      },
      workbox: {
        navigateFallback: '/index.html',
        // Запросы к API не должны подменяться на index.html: без этого
        // открытый напрямую /api/... отдавал бы страницу вместо данных.
        navigateFallbackDenylist: [/^\/api\//],
        globIgnores: ['**/exceljs*.js'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        importScripts: ['/push-sw.js'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Шрифт Inter грузится с серверов Google (см. import в index.css).
            // В предкеш он не попадает — без этого правила офлайн приложение
            // откатывалось на системный шрифт и заметно меняло вид.
            urlPattern: ({ url }) =>
              url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
