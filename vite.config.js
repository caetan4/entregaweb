export default {
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },

  build: {
    rollupOptions: {
      input: 'index.html'
    }
  },

  optimizeDeps: {
    exclude: ['three', '@splinetool/loader']
  }
};
