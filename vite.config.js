import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // node env is correct — all tests target pure logic (rsvp.js, pdf.js), no DOM
    environment: 'node'
  }
})
