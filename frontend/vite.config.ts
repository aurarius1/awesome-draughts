import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import {VitePWA} from 'vite-plugin-pwa'
export default defineConfig({
  plugins: [
      vue(),
      AutoImport({
        dts: './auto-import.d.ts',
        include: [
          /\.ts$/, // .ts, .tsx, .js, .jsx
          /\.tsx$/,
          /\.vue$/,
          /\.vue\?vue/, // .vue
        ],
        // global imports to register
        imports: [
          // presets
          'vue',
          'vue-router',
          {
            "@/store": [ "useLanguageStore", "useThemeStore", "useColorStore" ],
            "vue-toastification": ["useToast"]
          },
        ],
        vueTemplate: true
      }),
      VitePWA({
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: "ML Draughts",
        short_name: "MLD",
        description: "Simple draughts app developed for design patterns ku.",
        theme_color: "#64B5F6",
        display: "standalone",
        icons: [
          {
            "src": "android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "android-chrome-maskable-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "android-chrome-maskable-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./src"),
    }
  },
  server: {
    port: 3000,
  },
  css: {
    preprocessorOptions: {
      css: { charset: false },
      sass: {
        additionalData: [
          '@import "@/scss/variables.scss"',
        ].join('\n')
      }
    }
  }
})
