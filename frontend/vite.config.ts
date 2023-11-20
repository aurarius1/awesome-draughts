import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/





export default defineConfig({
  plugins: [
      vue(),
      AutoImport({
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
