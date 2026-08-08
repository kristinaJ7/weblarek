/*import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [
          './src/scss'
        ],
      },
    },
  },
})*/

import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ['./src/scss'],
      },
    },
  },
  // GITHUB PAGES:
  base: '/weblarek/', 
})
