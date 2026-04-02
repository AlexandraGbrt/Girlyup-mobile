import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase(),
  password: z
    .string()
    .min(8, 'Au moins 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  displayName: z.string().min(2).max(30).trim(),
  birthYear: z.number().int().min(1950).max(new Date().getFullYear() - 18),
  city: z.string().optional(),
  gender: z.literal('female'),
})

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput    = z.infer<typeof loginSchema>