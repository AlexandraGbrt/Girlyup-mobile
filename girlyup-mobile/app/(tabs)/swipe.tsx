import { View, Text, StyleSheet } from 'react-native'
import { useAuthStore } from '../../store/authStore'
import { Button, colors } from '../../components/ui'

export default function SwipeScreen() {
  const { user, logout } = useAuthStore()

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        girl<Text style={{ color: colors.primary }}>up</Text>
      </Text>
      <Text style={styles.welcome}>Bienvenue {user?.displayName} 👋</Text>
      <Text style={styles.sub}>L'écran de swipe arrive dans le prochain module.</Text>
      <Button
        label="Se déconnecter"
        onPress={logout}
        variant="ghost"
        style={{ marginTop: 32, width: 200 }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  logo:      { fontSize: 36, fontWeight: '600', letterSpacing: -1, marginBottom: 24 },
  welcome:   { fontSize: 22, fontWeight: '500', color: colors.text },
  sub:       { fontSize: 14, color: colors.textMuted, marginTop: 8, textAlign: 'center' },
})