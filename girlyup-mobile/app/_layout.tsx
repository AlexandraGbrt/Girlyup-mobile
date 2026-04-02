import { useEffect } from 'react'
import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '../store/authStore'

export default function RootLayout() {
  const { token, loadToken } = useAuthStore()

  useEffect(() => {
    loadToken()
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="index" redirect={true} />
    </Stack>
  )
}