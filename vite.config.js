export default {
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },

  build: {
    outDir: 'dist',   // NO uses ../dist porque rompe rutas
    emptyOutDir: true,
    sourcemap: true,

    rollupOptions: {
      input: {
        main: 'index.html',
        page2: 'gold.html',
        page3: 'whale.html',
        page4: 'anchoby.html'
      }
    }
  },

  optimizeDeps: {
    exclude: ['three', '@splinetool/loader']
  }
};
