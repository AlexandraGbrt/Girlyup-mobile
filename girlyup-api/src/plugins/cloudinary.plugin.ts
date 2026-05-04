// ─── Imports ──────────────────────────────────────────────────────────────────

// v2 est la version moderne du SDK Cloudinary
// On importe uniquement uploader et config pour garder le bundle léger
import { v2 as cloudinary } from 'cloudinary'

// fp = "fastify-plugin" — rend le plugin accessible dans toute l'app
// Sans fp, le plugin serait encapsulé et invisible depuis les autres routes
import fp from 'fastify-plugin'

// FastifyInstance = type TypeScript représentant l'instance Fastify
import type { FastifyInstance } from 'fastify'

// ─── Plugin ───────────────────────────────────────────────────────────────────

// On exporte le plugin enveloppé dans fp()
// async (fastify) => {} = fonction qui configure le plugin au démarrage
export const cloudinaryPlugin = fp(async (fastify: FastifyInstance) => {

  // Récupère les variables d'environnement depuis .env
  // process.env = objet Node.js contenant toutes les variables d'environnement
  const cloudName  = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey     = process.env.CLOUDINARY_API_KEY
  const apiSecret  = process.env.CLOUDINARY_API_SECRET

  // Vérifie que les 3 variables sont bien présentes
  // Si une manque, le serveur s'arrête immédiatement avec un message clair
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Variables CLOUDINARY_* manquantes dans .env')
  }

  // Configure le SDK Cloudinary avec nos credentials
  // cloudinary.config() = fonction d'initialisation globale du SDK
  // Une fois configuré, on peut utiliser cloudinary.uploader.upload() partout
  cloudinary.config({
    cloud_name: cloudName,
    api_key:    apiKey,
    api_secret: apiSecret,
    secure:     true, // force HTTPS pour toutes les URLs générées
  })

  // Log de confirmation au démarrage du serveur
  fastify.log.info('Cloudinary configuré')
})