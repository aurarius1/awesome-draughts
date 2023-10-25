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
            "@/store": ["useColorStore", "useLanguageStore", "useThemeStore"],
            "@/vite-env": ["Color", "ColorState", "LanguageState", "ThemeState"],
            "vue-toastification": ["useToast"]
          }
        ]
      })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./src"),
      '@draughts': path.resolve(__dirname, './src/draughts')
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
