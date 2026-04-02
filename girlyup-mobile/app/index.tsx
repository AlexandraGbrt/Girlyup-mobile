import { Redirect } from 'expo-router'
import { useAuthStore } from '../store/authStore'

export default function Index() {
  const { token } = useAuthStore()
  return <Redirect href={token ? '/(tabs)/swipe' : '/(auth)/login'} />
}