import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useAuthStore } from '../store/authStore'

export default function RootLayout() {
  const token = useAuthStore((state) => state.token)
  const loadToken = useAuthStore((state) => state.loadToken)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    loadToken()
  }, [])

  useEffect(() => {
    if (!segments || (segments as string[]).length === 0) return
    const inAuthGroup = segments[0] === '(auth)'
    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)/swipe')
    }
  }, [token, segments])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="index" redirect={true} />
    </Stack>
  )
}