import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const store = useAuthStore()
  return store
}

export function useRequireAuth() {
  const { token } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login')
    }
  }, [token])
}

export function useAuthLoader() {
  const loadToken = useAuthStore((s) => s.loadToken)

  useEffect(() => {
    loadToken()
  }, [])
}