// ─── Imports ──────────────────────────────────────────────────────────────────

// Fastify = fonction principale qui crée l'instance du serveur
import Fastify from 'fastify'

// @fastify/cors = plugin qui gère les autorisations cross-origin
// Nécessaire pour que l'app mobile (localhost:8081) puisse appeler
// le backend (onrender.com) sans être bloquée par le navigateur
import cors from '@fastify/cors'

// @fastify/multipart = plugin qui permet de recevoir des fichiers
// uploadés en multipart/form-data (format standard HTML pour les fichiers)
import multipart from '@fastify/multipart'

// @fastify/rate-limit = plugin qui limite le nombre de requêtes
// Protection contre les attaques par force brute (essayer des milliers de mdp)
import rateLimit from '@fastify/rate-limit'

// @fastify/helmet = plugin qui ajoute des headers HTTP de sécurité
// Ex: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security
import helmet from '@fastify/helmet'

// Notre plugin JWT — gère la vérification des tokens
import { jwtPlugin } from './plugins/jwt.plugin.js'

// Notre plugin Cloudinary — configure le SDK d'upload d'images
import { cloudinaryPlugin } from './plugins/cloudinary.plugin.js'

// Les routes d'authentification (login, register, me)
import { authRoutes } from './modules/auth/auth.routes.js'

// Les routes de profil (get, update, upload photo)
import { profileRoutes } from './modules/profiles/profiles.routes.js'

// ─── Construction de l'app ────────────────────────────────────────────────────

export async function buildApp() {

  // Fastify() = crée l'instance du serveur
  // logger: true = active les logs JSON pour chaque requête
  const fastify = Fastify({ logger: true })

  // ── Sécurité — helmet ────────────────────────────────────────────────────────
  // À enregistrer EN PREMIER pour que les headers soient sur toutes les réponses
  // contentSecurityPolicy: false = on désactive CSP pour l'instant
  // (on l'activera plus tard avec une config précise)
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  })

  // ── Sécurité — rate limiting ─────────────────────────────────────────────────
  // max: 100 = maximum 100 requêtes par fenêtre de temps
  // timeWindow: '1 minute' = fenêtre de 1 minute
  // Les routes auth ont leur propre limite plus stricte (voir auth.routes.ts)
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      error: 'Trop de requêtes, réessaie dans 1 minute',
    }),
  })

  // ── CORS ─────────────────────────────────────────────────────────────────────
  // Cross-Origin Resource Sharing
  // En développement : on accepte toutes les origines (origin: true)
  // En production : on restreint aux domaines autorisés
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://girlyup.app']
      : true,
    credentials: true,
  })

  // ── Multipart ────────────────────────────────────────────────────────────────
  // Permet de recevoir des fichiers dans les requêtes
  // limits.fileSize = taille max des fichiers : 10 MB
  // (on vérifie aussi côté route : 5 MB max par photo)
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB en octets
    },
  })

  // ── JWT ──────────────────────────────────────────────────────────────────────
  // Notre plugin custom qui configure @fastify/jwt
  // et crée le décorateur fastify.authenticate
  await fastify.register(jwtPlugin)

  // ── Cloudinary ───────────────────────────────────────────────────────────────
  // Notre plugin custom qui configure le SDK Cloudinary
  // avec les variables d'environnement
  await fastify.register(cloudinaryPlugin)

  // ── Routes ───────────────────────────────────────────────────────────────────
  // prefix: '/api/v1' = toutes les routes commencent par /api/v1
  // Ex: authRoutes définit POST /auth/login → accessible sur POST /api/v1/auth/login
  // Le versionning /v1 permet de créer une /v2 plus tard sans casser l'existant
  await fastify.register(authRoutes,    { prefix: '/api/v1' })
  await fastify.register(profileRoutes, { prefix: '/api/v1' })

  // ── Health check ─────────────────────────────────────────────────────────────
  // Route simple pour vérifier que le serveur tourne
  // Utilisée par Render pour les health checks automatiques
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date(),
  }))

  // On retourne l'instance configurée
  // server.ts appellera app.listen() dessus
  return fastify
}