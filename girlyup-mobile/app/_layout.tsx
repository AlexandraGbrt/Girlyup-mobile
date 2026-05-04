// On importe useEffect pour exécuter du code après le rendu
// useEffect = "fais ça APRÈS que React a affiché le composant"
import { useEffect, useState } from 'react'

// Stack = composant de navigation "en pile" (comme des cartes empilées)
// useRouter = hook pour naviguer programmatiquement
// useSegments = hook qui donne le chemin URL actuel sous forme de tableau
// ex: sur /(auth)/login → segments = ['(auth)', 'login']
import { Stack, useRouter, useSegments } from 'expo-router'

// Notre store Zustand qui contient le token JWT
import { useAuthStore } from '../store/authStore'

export default function RootLayout() {
  // On récupère token et loadToken avec la syntaxe sélecteur
  // Cette syntaxe force React à re-rendre quand token change
  const token = useAuthStore((state) => state.token)
  const loadToken = useAuthStore((state) => state.loadToken)

  // segments = tableau représentant l'URL actuelle
  const segments = useSegments()
  const router = useRouter()

  // mounted = true une fois que le composant est affiché
  // Empêche de naviguer avant qu'Expo Router soit prêt
  const [mounted, setMounted] = useState(false)

  // Premier useEffect : charge le token stocké au démarrage
  // Le tableau vide [] signifie "exécute une seule fois au montage"
  useEffect(() => {
    loadToken()
    // Indique qu'Expo Router est prêt à naviguer
    setMounted(true)
  }, [])

  // Deuxième useEffect : redirige selon l'état de connexion
  // Se déclenche quand token, segments ou mounted changent
  useEffect(() => {
    // On attend que le composant soit monté ET qu'on ait des segments
     if (!segments || (segments as string[]).length === 0) return

    // Vérifie si on est dans le groupe (auth) = login ou register
    const inAuthGroup = segments[0] === '(auth)'

    if (!token && !inAuthGroup) {
      // Pas de token + pas sur écran auth → aller au login
      router.replace('/(auth)/login')
    } else if (token && inAuthGroup) {
      // Token présent + sur écran auth → aller à l'app principale
      router.replace('/(tabs)/swipe')
    }
  }, [token, segments, mounted])

  // Stack = conteneur de navigation
  // screenOptions={{ headerShown: false }} = pas de barre de titre
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="index" redirect={true} />
    </Stack>
  )
}