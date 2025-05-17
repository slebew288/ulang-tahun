import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/happy-birtday/',  // <-- nama repo kamu, harus sesuai!
  plugins: [react()],
})
