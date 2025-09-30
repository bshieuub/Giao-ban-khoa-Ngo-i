import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure assets in the build output are not prefixed with an underscore,
    // which can cause them to be hidden on some hosting platforms.
    assetsDir: 'assets'
  }
})
