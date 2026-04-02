import { useState } from 'react'
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/authStore'
import { Button, Input, FormError, colors } from '../../components/ui'

type Step1 = { email: string; password: string; confirmPassword: string }
type Step2 = { displayName: string; birthYear: string; city: string }

export default function RegisterScreen() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuthStore()

  const [step, setStep] = useState<1 | 2>(1)
  const [step1, setStep1] = useState<Step1>({ email: '', password: '', confirmPassword: '' })
  const [step2, setStep2] = useState<Step2>({ displayName: '', birthYear: '', city: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validateStep1() {
    const errors: Record<string, string> = {}
    if (!step1.email.includes('@')) errors.email = 'Email invalide'
    if (step1.password.length < 8) errors.password = 'Au moins 8 caractères'
    else if (!/[A-Z]/.test(step1.password)) errors.password = 'Au moins une majuscule'
    else if (!/[0-9]/.test(step1.password)) errors.password = 'Au moins un chiffre'
    if (step1.password !== step1.confirmPassword) errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function validateStep2() {
    const errors: Record<string, string> = {}
    const year = parseInt(step2.birthYear)
    const maxYear = new Date().getFullYear() - 18
    if (step2.displayName.trim().length < 2) errors.displayName = 'Au moins 2 caractères'
    if (isNaN(year) || year < 1950 || year > maxYear) errors.birthYear = `Entre 1950 et ${maxYear}`
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleNext() {
    clearError()
    if (validateStep1()) setStep(2)
  }

  async function handleRegister() {
    clearError()
    if (!validateStep2()) return
    try {
      await register({
        email:       step1.email.trim().toLowerCase(),
        password:    step1.password,
        displayName: step2.displayName.trim(),
        birthYear:   parseInt(step2.birthYear),
        city:        step2.city.trim() || undefined,
        gender:      'female',
      })
    } catch {}
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          {step === 2 && (
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
              <Text style={styles.backText}>← Retour</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{step === 1 ? 'Créer mon compte' : 'Mon profil'}</Text>
          <Text style={styles.subtitle}>{step === 1 ? 'Rejoins la communauté HeySister' : 'Dis-nous qui tu es'}</Text>
          <View style={styles.steps}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
          </View>
        </View>

        {error && <FormError message={error} />}

        {step === 1 && (
          <>
            <Input label="Email" value={step1.email} onChangeText={(v) => setStep1(s => ({ ...s, email: v }))} error={fieldErrors.email} keyboardType="email-address" placeholder="toi@exemple.com" />
            <Input label="Mot de passe" value={step1.password} onChangeText={(v) => setStep1(s => ({ ...s, password: v }))} error={fieldErrors.password} secureTextEntry placeholder="Min. 8 car., 1 majuscule, 1 chiffre" />
            <Input label="Confirmer le mot de passe" value={step1.confirmPassword} onChangeText={(v) => setStep1(s => ({ ...s, confirmPassword: v }))} error={fieldErrors.confirmPassword} secureTextEntry placeholder="••••••••" />
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>HeySister est un espace réservé aux femmes. En t'inscrivant, tu confirmes t'identifier comme femme.</Text>
            </View>
            <Button label="Continuer →" onPress={handleNext} />
          </>
        )}

        {step === 2 && (
          <>
            <Input label="Prénom" value={step2.displayName} onChangeText={(v) => setStep2(s => ({ ...s, displayName: v }))} error={fieldErrors.displayName} autoCapitalize="words" placeholder="Alice" />
            <Input label="Année de naissance" value={step2.birthYear} onChangeText={(v) => setStep2(s => ({ ...s, birthYear: v }))} error={fieldErrors.birthYear} keyboardType="numeric" placeholder="1998" maxLength={4} />
            <Input label="Ville (optionnel)" value={step2.city} onChangeText={(v) => setStep2(s => ({ ...s, city: v }))} placeholder="Amiens" autoCapitalize="words" />
            <Button label="Créer mon compte" onPress={handleRegister} isLoading={isLoading} style={{ marginTop: 8 }} />
          </>
        )}

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Déjà un compte ? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.switchLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex:            { flex: 1, backgroundColor: colors.background },
  container:       { flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 },
  header:          { marginBottom: 36 },
  backBtn:         { marginBottom: 12 },
  backText:        { fontSize: 14, color: colors.primary },
  title:           { fontSize: 28, fontWeight: '600', color: colors.text, letterSpacing: -0.5 },
  subtitle:        { fontSize: 15, color: colors.textMuted, marginTop: 6 },
  steps:           { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 8 },
  stepDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  stepDotActive:   { backgroundColor: colors.primary },
  stepLine:        { flex: 1, height: 1, backgroundColor: colors.border, maxWidth: 40 },
  disclaimer:      { backgroundColor: colors.primaryLight, borderRadius: 12, padding: 12, marginBottom: 20 },
  disclaimerText:  { fontSize: 13, color: '#6b21a8', textAlign: 'center', lineHeight: 18 },
  switchRow:       { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  switchText:      { fontSize: 14, color: colors.textMuted },
  switchLink:      { fontSize: 14, color: colors.primary, fontWeight: '500' },
})