import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { register, login } from '../services/auth.service'
import type { RegisterPayload, LoginPayload } from '../services/auth.service'

type User = {
  id:          string
  email:       string
  displayName: string
  city?:       string
}

type AuthState = {
  user:       User | null
  token:      string | null
  isLoading:  boolean
  error:      string | null
  register:   (payload: RegisterPayload) => Promise<void>
  login:      (payload: LoginPayload) => Promise<void>
  logout:     () => Promise<void>
  loadToken:  () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user:      null,
  token:     null,
  isLoading: false,
  error:     null,

  register: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const { token, user } = await register(payload)
      await SecureStore.setItemAsync('auth_token', token)
      set({ token, user, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.error ?? "Erreur lors de l'inscription"
      set({ error: message, isLoading: false })
      throw err
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const { token, user } = await login(payload)
      await SecureStore.setItemAsync('auth_token', token)
      set({ token, user, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.error ?? 'Email ou mot de passe incorrect'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token')
    set({ token: null, user: null, error: null })
  },

  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token')
      if (token) set({ token })
    } catch {
      // token corrompu — on ignore
    }
  },

  clearError: () => set({ error: null }),
}))