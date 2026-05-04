// ─── Déclarations de types TypeScript pour Fastify ───────────────────────────
// Ce fichier étend les types existants de Fastify pour y ajouter
// nos fonctionnalités personnalisées (JWT authenticate, multipart file)
// "Declaration merging" = TypeScript fusionne ces déclarations avec
// les types originaux de la librairie

// On importe les types de base de @fastify/jwt
// Nécessaire pour que TypeScript connaisse request.jwtVerify()
import '@fastify/jwt'

// On importe les types de @fastify/multipart
// Nécessaire pour que TypeScript connaisse request.file()
import '@fastify/multipart'

// On étend le module 'fastify' pour y ajouter nos types
declare module 'fastify' {

  // FastifyInstance = l'objet fastify lui-même (le serveur)
  // On y ajoute notre décorateur authenticate
  interface FastifyInstance {
    // authenticate = fonction middleware qui vérifie le JWT
    // Utilisée dans onRequest: [fastify.authenticate]
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>
  }

  // FastifyRequest = l'objet request de chaque requête HTTP
  // On y ajoute le type de request.file() fourni par @fastify/multipart
  interface FastifyRequest {
    // file() = méthode pour lire le fichier uploadé en multipart
    // Retourne une Promise avec les données du fichier ou undefined
    file: () => Promise<import('@fastify/multipart').MultipartFile | undefined>
  }
}