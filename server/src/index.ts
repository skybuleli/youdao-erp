import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authMiddleware } from './middleware/auth'
import { authRouter } from './routes/auth'
import { productRouter } from './routes/product'
import { partnerRouter } from './routes/partner'
import { orderRouter } from './routes/order'
import { inventoryRouter } from './routes/inventory'
import { financeRouter } from './routes/finance'
import { reportRouter } from './routes/report'

export interface Env {
  DB: D1Database
  CACHE: KVNamespace
  FILES: R2Bucket
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://youdao-erp.pages.dev', 'https://*.youdao-erp.pages.dev'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}))

// Health check
app.get('/', (c) => c.json({ message: 'Youdao ERP API', version: '0.1.0' }))
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Routes
app.use('/api/auth/me', authMiddleware) // me endpoint requires auth
app.route('/api/auth', authRouter)
app.use('/api/products/*', authMiddleware)
app.route('/api/products', productRouter)
app.use('/api/partners/*', authMiddleware)
app.route('/api/partners', partnerRouter)
app.use('/api/orders/*', authMiddleware)
app.route('/api/orders', orderRouter)
app.use('/api/inventory/*', authMiddleware)
app.route('/api/inventory', inventoryRouter)
app.use('/api/finance/*', authMiddleware)
app.route('/api/finance', financeRouter)
app.use('/api/reports/*', authMiddleware)
app.route('/api/reports', reportRouter)

// Error handler
app.onError((err, c) => {
  console.error(`${err}`)
  return c.json({ error: 'Internal Server Error', message: err.message }, 500)
})

export default app
