import bcrypt from 'bcryptjs'
import { supabase } from '../../db/client.js'
import type { RegisterInput, LoginInput } from './auth.schema.js'

const SALT_ROUNDS = 12

export async function registerUser(input: RegisterInput) {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', input.email)
    .limit(1)

  if (existing && existing.length > 0) throw new Error('EMAIL_ALREADY_EXISTS')

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert({ email: input.email, password_hash: passwordHash, gender: input.gender })
    .select('id, email, created_at')
    .single()

  if (userError || !newUser) throw new Error(userError?.message ?? 'Erreur création user')

  const { data: newProfile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id:      newUser.id,
      display_name: input.displayName,
      birth_year:   input.birthYear,
      city:         input.city ?? null,
    })
    .select()
    .single()

  if (profileError || !newProfile) throw new Error(profileError?.message ?? 'Erreur création profil')

  return { user: newUser, profile: newProfile }
}

export async function loginUser(input: LoginInput) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', input.email)
    .limit(1)
    .single()

  if (!user) throw new Error('INVALID_CREDENTIALS')

  const passwordMatch = await bcrypt.compare(input.password, user.password_hash)
  if (!passwordMatch) throw new Error('INVALID_CREDENTIALS')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return {
    user: { id: user.id, email: user.email, createdAt: user.created_at },
    profile,
  }
}

export async function getUserById(id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id, email, created_at')
    .eq('id', id)
    .single()

  return user ?? null
}