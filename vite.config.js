export default {
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },

  build: {
    outDir: '../dist',      // Carpeta donde se exporta
    emptyOutDir: true,      // Limpia antes de generar
    sourcemap: true,        // Habilita el mapa de fuentes

    rollupOptions: {
      input: {
        main: 'src/index.html',
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
