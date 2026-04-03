import { z } from "zod";

// Ajouter un champ verified: false par defaut
// Creer une file de moderation pour valider les nouveaux comptes
// Ou : verification par selfie via service tiers (Jumio, Onfido)
// Pour MVP : accepter declaratif + systeme de signalement robuste

export const registerSchema = z.object({
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
  email: z.string().email("Email invalide").max(255).toLowerCase(),
  displayName: z.string().min(2).max(30).trim(),
  birthYear: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() - 18),
  city: z.string().optional(),
  gender: z.literal("female"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
