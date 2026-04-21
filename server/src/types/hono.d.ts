import 'hono'

declare module 'hono' {
  interface ContextVariableMap {
    user: {
      sub: string
      username: string
      name?: string
      role?: string
    }
  }
}
