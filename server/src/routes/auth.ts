import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import * as schema from '../schema'
import type { Env } from '../index'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

export const authRouter = new Hono<{ Bindings: Env }>()

authRouter.post('/login', async (c) => {
  const body = await c.req.json()
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid input' }, 400)
  }

  const db = drizzle(c.env.DB, { schema })
  const user = await db.select().from(schema.users)
    .where(eq(schema.users.username, result.data.username))
    .get()

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const valid = await bcrypt.compare(result.data.password, user.passwordHash)
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const secret = new TextEncoder().encode(c.env.JWT_SECRET || 'youdao-erp-secret-key')
  const token = await new SignJWT({ sub: String(user.id), username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  return c.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  })
})

authRouter.get('/me', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = drizzle(c.env.DB, { schema })
  const dbUser = await db.select().from(schema.users)
    .where(eq(schema.users.id, Number(user.sub)))
    .get()

  if (!dbUser) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({
    id: dbUser.id,
    username: dbUser.username,
    name: dbUser.name,
    role: dbUser.role,
    phone: dbUser.phone,
    createdAt: dbUser.createdAt
  })
})
