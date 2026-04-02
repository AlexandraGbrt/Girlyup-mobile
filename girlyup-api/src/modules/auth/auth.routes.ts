import type { FastifyInstance } from 'fastify'
import { registerSchema, loginSchema } from './auth.schema.js'
import { registerUser, loginUser } from './auth.service.js'

export async function authRoutes(fastify: FastifyInstance) {

  fastify.post('/auth/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      })
    }
    try {
      const { user, profile } = await registerUser(parsed.data)
      const token = fastify.jwt.sign(
        { userId: user.id },
        { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
      )
      return reply.status(201).send({
        token,
        user: {
          id:          user.id,
          email:       user.email,
          displayName: profile.displayName,
          birthYear:   profile.birthYear,
          city:        profile.city,
        },
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'EMAIL_ALREADY_EXISTS') {
        return reply.status(409).send({ error: 'Cet email est déjà utilisé' })
      }
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Erreur serveur' })
    }
  })

  fastify.post('/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      })
    }
    try {
      const { user, profile } = await loginUser(parsed.data)
      const token = fastify.jwt.sign(
        { userId: user.id },
        { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
      )
      return reply.send({
        token,
        user: {
          id:          user.id,
          email:       user.email,
          displayName: profile?.displayName,
          city:        profile?.city,
        },
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
        return reply.status(401).send({ error: 'Email ou mot de passe incorrect' })
      }
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Erreur serveur' })
    }
  })

  fastify.get('/auth/me', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    return reply.send({ userId: (request.user as { userId: string }).userId })
  })
}