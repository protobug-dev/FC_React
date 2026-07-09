import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    // 🧠 ИСПРАВЛЕНО: Привязали PWA-манифест к гарантированно существующей иконке favicon.ico
    VitePWA({
      registerType: 'autoUpdate', 
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Smart Flashcards Pro',
        short_name: 'Flashcards',
        description: 'Умные интервальные карточки для изучения слов',
        theme_color: '#faf5ff', 
        background_color: '#faf5ff',
        display: 'standalone', // Скрывает адресную строку браузера на телефонах!
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          },
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/x-icon',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/FC_React/', 
})
