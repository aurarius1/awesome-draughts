import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      vue(),
      AutoImport({
        // global imports to register
        imports: [
          // presets
          'vue',
          'vue-router',
          {
            "@/store": ["useColorStore", "useLanguageStore", "useThemeStore"]
          }
        ]
      })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./src"),
    }
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "localhost:32768",
        changeOrigin: true
      }
    }
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
