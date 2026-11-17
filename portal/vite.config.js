import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// El portal vive en integriai.cl/app/. Para moverlo a un subdominio (app.integriai.cl)
// basta cambiar `base` a '/' y el `basename` del router en src/main.jsx (usa BASE_URL).
export default defineConfig({
  base: '/app/',
  plugins: [react(), tailwindcss()],
  build: {
    // Sale dentro del sitio publicado: el build del sitio (Astro) corre primero y este lo completa.
    outDir: '../dist/app',
    emptyOutDir: true,
    chunkSizeWarningLimit: 700,
  },
  server: { port: 5174 },
})
