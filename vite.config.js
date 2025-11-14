import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: false,
    allowedHosts: true,
    hmr: {
      timeout: 120000,
      overlay: true,
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        t50: resolve(__dirname, "dji-agras-t50.html"),
        t100: resolve(__dirname, "DJI-Agras-T100.html"),
        mavic3: resolve(__dirname, "dji-mavic-3.html"),
        firmware: resolve(__dirname, "firmware-generador.html"),
        privacidad: resolve(__dirname, "privacidad.html"),
        terminos: resolve(__dirname, "terminos.html"),
      },
    },
  },
});