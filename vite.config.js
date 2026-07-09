import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Приложение само обновляет кэш при деплое
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Smart Flashcards Pro',
        short_name: 'Flashcards',
        description: 'Умные интервальные карточки для изучения слов',
        theme_color: '#faf5ff', // Наш нежный фирменный лавандовый цвет фона
        background_color: '#faf5ff',
        display: 'standalone', // КРИТИЧЕСКИ ВАЖНО: Прячет адресную строку браузера на телефоне!
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/FC_React/', 
})
