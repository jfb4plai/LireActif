import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  content: [
    path.join(__dirname, './index.html'),
    path.join(__dirname, './src/**/*.{js,jsx}'),
  ],
  theme: {
    extend: {
      colors: {
        'p-noir':    '#1a1a1a',
        'p-noir2':   '#2e2e2e',
        'p-rose':    '#FF3399',
        'p-rose-dk': '#CC0070',
        'p-beige':   '#F5F0E8',
        'p-gris':    '#5a5a5a',
        'p-gris2':   '#909090',
        'p-bord':    '#e8e8e8',
        'p-bg':      '#f9f9f7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
