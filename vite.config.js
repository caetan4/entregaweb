export default {
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,

    rollupOptions: {
      input: {
        main: 'index.html',
        gold: 'gold.html',
        whale: 'whaleshark.html',
        anchoby: 'anchoby.html'
      }
    }
  },

  optimizeDeps: {
    exclude: ['three', '@splinetool/loader']
  }
};
