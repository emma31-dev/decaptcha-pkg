import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Some dependencies reference `process.env` at runtime which breaks in the browser.
  // Provide a safe empty object during the build/dev to avoid `process is not defined`.
  define: {
    'process.env': {},
  },
})