import { Hono } from 'hono'
import { cors } from 'hono/cors'
import generateRoutes from './routes/generate.js'
import sessionsRoutes from './routes/sessions.js'
import fontsRoutes from './routes/fonts.js'

const app = new Hono()

app.use('*', cors({
  origin: (origin) => (origin?.includes('localhost') || origin?.endsWith('.workers.dev') || origin?.endsWith('.pages.dev')) ? origin : null,
}))

app.route('/api', generateRoutes)
app.route('/api/sessions', sessionsRoutes)
app.route('/fonts', fontsRoutes)

export default app
