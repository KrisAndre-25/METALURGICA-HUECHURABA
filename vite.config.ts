import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Sirve `netlify/functions/*.ts` en `npm run dev` bajo `/.netlify/functions/<nombre>`,
 * igual que en producción, sin necesitar Netlify CLI. Cada request recarga el
 * módulo con `ssrLoadModule`, así los cambios a la función se ven al instante.
 */
function netlifyFunctionsDev(): Plugin {
  return {
    name: 'netlify-functions-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/.netlify/functions', async (req, res, next) => {
        const name = req.url?.split('?')[0].replace(/^\//, '')
        if (!name || !/^[\w-]+$/.test(name)) return next()
        try {
          const mod = await server.ssrLoadModule(`/netlify/functions/${name}.ts`)
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value)
          }
          const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
          const request = new Request(`http://localhost${req.originalUrl ?? req.url}`, {
            method: req.method,
            headers,
            body: hasBody ? Buffer.concat(chunks) : undefined,
          })
          const response: Response = await mod.default(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Las funciones leen `process.env` (como en Netlify); en dev se toman de `.env.local`.
  // Vite no expone estas variables al navegador: no llevan el prefijo `VITE_`.
  // Vite reinicia el server en el MISMO proceso al editar `.env.local`: se borran
  // primero las variables que inyectamos antes, o quedaría pegado el valor viejo
  // (loadEnv le da prioridad a process.env sobre los archivos .env).
  const INJECTED = '__DMAIX_INJECTED_ENV'
  for (const key of (process.env[INJECTED] ?? '').split(',').filter(Boolean)) delete process.env[key]
  const env = loadEnv(mode, process.cwd(), '')
  const injected: string[] = []
  for (const key of ['GEMINI_API_KEY', 'GEMINI_MODEL', 'ANTHROPIC_API_KEY', 'BI_AI_MODEL']) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key]
      injected.push(key)
    }
  }
  process.env[INJECTED] = injected.join(',')

  return {
    plugins: [react(), tailwindcss(), netlifyFunctionsDev()],
  }
})
