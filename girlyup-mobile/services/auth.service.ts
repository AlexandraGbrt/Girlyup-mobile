import { api } from './api'

export type RegisterPayload = {
  email:       string
  password:    string
  displayName: string
  birthYear:   number
  gender:      'female'
  city?:       string
}

export type LoginPayload = {
  email:    string
  password: string
}

export type AuthResponse = {
  token: string
  user: {
    id:          string
    email:       string
    displayName: string
    city?:       string
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function getMe(): Promise<{ userId: string }> {
  const { data } = await api.get('/auth/me')
  return data
}