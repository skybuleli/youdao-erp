import { jwtVerify } from 'jose'
import type { MiddlewareHandler } from 'hono'
import type { Env } from '../index'

export const authMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header' }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET || 'youdao-erp-secret-key')
    const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 })
    c.set('user', payload as { sub: string; username: string; name?: string; role?: string })
    await next()
  } catch {
    return c.json({ error: 'Unauthorized', message: 'Invalid or expired token' }, 401)
  }
}
