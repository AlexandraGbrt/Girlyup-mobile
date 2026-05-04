// ─── Imports ──────────────────────────────────────────────────────────────────

// FastifyInstance = type TypeScript représentant l'instance Fastify
// C'est le paramètre qu'on reçoit dans chaque module de routes
import type { FastifyInstance } from 'fastify'

// On importe le schéma Zod pour valider les données de mise à jour
import { updateProfileSchema } from './profiles.schema.js'

// On importe les fonctions de logique métier depuis le service
import {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  addPhotoToProfile,
} from './profiles.service.js'

// ─── Routes profil ────────────────────────────────────────────────────────────

// async (fastify) => {} = fonction qui enregistre toutes les routes du module
export async function profileRoutes(fastify: FastifyInstance) {

  // ── GET /profiles/me ────────────────────────────────────────────────────────
  // Récupère le profil de l'utilisatrice connectée
  // onRequest: [fastify.authenticate] = middleware JWT
  // Vérifie le token AVANT d'exécuter le handler
  // Si le token est absent ou invalide → 401 automatique
  fastify.get('/profiles/me', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {

    // request.user est injecté par le plugin JWT après vérification
    // On caste en { userId: string } car c'est ce qu'on a mis dans le token
    const { userId } = request.user as { userId: string }

    try {
      // On appelle le service qui fait la vraie requête Supabase
      const profile = await getMyProfile(userId)
      // 200 = OK, on retourne le profil en JSON
      return reply.send(profile)
    } catch (err) {
      // On log l'erreur côté serveur pour le debug
      fastify.log.error(err)
      // 500 = erreur serveur interne
      return reply.status(500).send({ error: 'Erreur serveur' })
    }
  })

  // ── PUT /profiles/me ─────────────────────────────────────────────────────────
  // Met à jour le profil de l'utilisatrice connectée
  // PUT = mise à jour partielle ou totale d'une ressource existante
  fastify.put('/profiles/me', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {

    const { userId } = request.user as { userId: string }

    // .safeParse() = validation Zod sans lever d'exception
    // Retourne { success: true, data: ... } ou { success: false, error: ... }
    const parsed = updateProfileSchema.safeParse(request.body)

    // Si les données envoyées ne correspondent pas au schéma
    if (!parsed.success) {
      // 400 = Bad Request — les données sont invalides
      // .flatten().fieldErrors = format lisible des erreurs par champ
      return reply.status(400).send({
        error: 'Données invalides',
        details: parsed.error.flatten().fieldErrors,
      })
    }

    try {
      const profile = await updateMyProfile(userId, parsed.data)
      return reply.send(profile)
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Erreur serveur' })
    }
  })

  // ── POST /profiles/photo ──────────────────────────────────────────────────────
  // Upload une photo de profil vers Cloudinary
  // POST = création d'une nouvelle ressource
  // multipart/form-data = format d'envoi de fichiers depuis un formulaire HTML
  fastify.post('/profiles/photo', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {

    const { userId } = request.user as { userId: string }

    try {
      // request.file() = méthode de @fastify/multipart
      // Attend un fichier dans la requête multipart
      // await = on attend que le fichier soit complètement reçu
      const data = await request.file()

      // Si aucun fichier n'a été envoyé
      if (!data) {
        // 400 = Bad Request
        return reply.status(400).send({ error: 'Aucun fichier reçu' })
      }

      // data.mimetype = type MIME du fichier ex: 'image/jpeg'
      // On vérifie que c'est bien une image (pas un PDF, exe...)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({
          error: 'Format non supporté. Utilise JPEG, PNG ou WebP',
        })
      }

      // data.toBuffer() = convertit le stream en Buffer (données en mémoire)
      // Un Buffer = tableau d'octets représentant le fichier
      const buffer = await data.toBuffer()

      // Limite de taille : 5 MB maximum
      // buffer.length = taille en octets (5 * 1024 * 1024 = 5 MB)
      if (buffer.length > 5 * 1024 * 1024) {
        return reply.status(400).send({
          error: 'Image trop lourde. Maximum 5 MB',
        })
      }

      // On upload vers Cloudinary et on récupère l'URL publique
      const photoUrl = await uploadProfilePhoto(buffer, data.mimetype, userId)

      // On ajoute l'URL dans le tableau photos[] du profil en base
      const profile = await addPhotoToProfile(userId, photoUrl)

      // 201 = Created — une nouvelle ressource a été créée
      return reply.status(201).send({
        message: 'Photo uploadée avec succès',
        photoUrl,  // URL Cloudinary de la nouvelle photo
        profile,   // Profil mis à jour avec le nouveau tableau de photos
      })

    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Erreur upload' })
    }
  })
}