import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

export const jwtPlugin = fp(async (fastify: FastifyInstance) => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET manquant dans .env')

  await fastify.register(jwt, { secret })

  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify()
      } catch {
        return reply.status(401).send({ error: 'Token invalide ou expiré' })
      }
    }
  )
})