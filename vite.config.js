/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const usdaKey = env.VITE_USDA_API_KEY || env.USDA_API_KEY
  const clarifaiKey = env.VITE_CLARIFAI_PAT || env.CLARIFAI_PAT
  const clarifaiModel =
    env.VITE_CLARIFAI_MODEL || env.CLARIFAI_MODEL || 'food-item-recognition'
  const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY
  const geminiModel = env.VITE_GEMINI_MODEL || env.GEMINI_MODEL || 'gemini-2.0-flash'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/clarifai': {
          target: 'https://api.clarifai.com',
          changeOrigin: true,
          secure: true,
          rewrite: () => `/v2/models/${clarifaiModel}/outputs`,
          headers: clarifaiKey ? { Authorization: `Key ${clarifaiKey}` } : {},
        },
        '/api/usda': {
          target: 'https://api.nal.usda.gov',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const [, query = ''] = path.split('?')
            const joiner = query ? `&${query}` : ''
            return `/fdc/v1/foods/search?api_key=${usdaKey || ''}${joiner}`
          },
        },
        '/api/gemini': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const [, query = ''] = path.split('?')
            const joiner = query ? `&${query}` : ''
            return `/v1beta/models/${geminiModel}:generateContent?key=${geminiKey || ''}${joiner}`
          },
        },
      },
    },
  }
})
