import { useState } from 'react'
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/authStore'
import { Button, Input, FormError, colors } from '../../components/ui'

export default function LoginScreen() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  function validate() {
    const errors: typeof fieldErrors = {}
    if (!email.includes('@')) errors.email    = 'Email invalide'
    if (password.length < 1)  errors.password = 'Champ requis'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleLogin() {
    clearError()
    if (!validate()) return
    try {
      await login({ email: email.trim().toLowerCase(), password })
    } catch {}
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.logoArea}>
          <Text style={styles.logo}>Hey<Text style={styles.logoPurple}>Sister</Text></Text>
          <Text style={styles.tagline}>Des amitiés qui commencent par un swipe</Text>
        </View>

        {error && <FormError message={error} />}

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          placeholder="toi@exemple.com"
        />
        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          secureTextEntry
          textContentType="password"
          autoComplete="current-password"
          placeholder="••••••••"
        />

        <TouchableOpacity style={styles.forgotRow}>
          <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        <Button label="Se connecter" onPress={handleLogin} isLoading={isLoading} style={styles.cta} />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.switchLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex:        { flex: 1, backgroundColor: colors.background },
  container:   { flexGrow: 1, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40 },
  logoArea:    { alignItems: 'center', marginBottom: 48 },
  logo:        { fontSize: 40, fontWeight: '600', color: colors.text, letterSpacing: -1 },
  logoPurple:  { color: colors.primary },
  tagline:     { fontSize: 14, color: colors.textMuted, marginTop: 8, textAlign: 'center' },
  forgotRow:   { alignItems: 'flex-end', marginTop: -8, marginBottom: 24 },
  forgotText:  { fontSize: 13, color: colors.primary },
  cta:         { marginTop: 8 },
  switchRow:   { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText:  { fontSize: 14, color: colors.textMuted },
  switchLink:  { fontSize: 14, color: colors.primary, fontWeight: '500' },
})