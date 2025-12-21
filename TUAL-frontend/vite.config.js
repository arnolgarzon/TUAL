import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/TUAL/', // Asegura que las rutas de los archivos estáticos apunten a la subcarpeta del repo
})