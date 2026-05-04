// ─── Zod — librairie de validation de données ─────────────────────────────────
// z.object() = définit la forme exacte attendue d'un objet JSON
import { z } from 'zod'

// ─── Schéma de mise à jour du profil ─────────────────────────────────────────
// .partial() = rend tous les champs optionnels
// Utile pour un PUT partiel : l'utilisatrice peut modifier
// uniquement son prénom sans toucher les autres champs
export const updateProfileSchema = z.object({

  // Prénom affiché — entre 2 et 30 caractères
  // .trim() supprime les espaces en début/fin
  displayName: z.string().min(2).max(30).trim().optional(),

  // Bio — texte libre limité à 300 caractères
  // .optional() = ce champ peut être absent de la requête
  bio: z.string().max(300).optional(),

  // Ville — limitée à 100 caractères
  city: z.string().max(100).optional(),

  // Centres d'intérêt — tableau de strings
  // ex: ['Cinéma', 'Yoga', 'Lecture']
  // .array() = attend un tableau
  // .max(10) = maximum 10 intérêts pour éviter le spam
  interests: z.array(z.string().max(50)).max(10).optional(),

}).partial() // .partial() rend tout optionnel — on ne met à jour que ce qui est envoyé

// ─── Type TypeScript inféré depuis le schéma Zod ─────────────────────────────
// z.infer<> = génère automatiquement le type TypeScript depuis le schéma Zod
// Évite de dupliquer la définition du type manuellement
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>