import Fastify from 'fastify'
import cors from '@fastify/cors'
import { jwtPlugin } from './plugins/jwt.plugin.js'
import { authRoutes } from './modules/auth/auth.routes.js'

export async function buildApp() {
  const fastify = Fastify({ logger: true })

  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'development' ? true : ['https://girlyup.app'],
    credentials: true,
  })

  await fastify.register(jwtPlugin)
  await fastify.register(authRoutes, { prefix: '/api/v1' })

  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date() }))

  return fastify
}