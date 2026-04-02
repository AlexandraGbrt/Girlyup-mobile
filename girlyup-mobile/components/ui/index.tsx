import {
  TouchableOpacity, Text, TextInput, View,
  ActivityIndicator, StyleSheet,
  type TextInputProps, type ViewStyle,
} from 'react-native'

export const colors = {
  primary:      '#a855f7',
  primaryDark:  '#9333ea',
  primaryLight: '#f3e8ff',
  text:         '#1c1c1e',
  textMuted:    '#6b7280',
  border:       '#e5e7eb',
  borderFocus:  '#a855f7',
  background:   '#ffffff',
  error:        '#ef4444',
  errorBg:      '#fef2f2',
}

type ButtonProps = {
  label:      string
  onPress:    () => void
  isLoading?: boolean
  disabled?:  boolean
  variant?:   'primary' | 'ghost'
  style?:     ViewStyle
}

export function Button({ label, onPress, isLoading, disabled, variant = 'primary', style }: ButtonProps) {
  const isPrimary = variant === 'primary'
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.85}
      style={[
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonGhost,
        (disabled || isLoading) && styles.buttonDisabled,
        style,
      ]}
    >
      {isLoading
        ? <ActivityIndicator color={isPrimary ? '#fff' : colors.primary} />
        : <Text style={[styles.buttonLabel, isPrimary ? styles.labelPrimary : styles.labelGhost]}>{label}</Text>
      }
    </TouchableOpacity>
  )
}

type InputProps = TextInputProps & { label: string; error?: string }

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : undefined, style as any]}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        {...props}
      />
      {error ? <Text style={styles.inputErrorText}>{error}</Text> : null}
    </View>
  )
}

export function FormError({ message }: { message: string }) {
  return (
    <View style={styles.formError}>
      <Text style={styles.formErrorText}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  button:        { height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', width: '100%' },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonGhost:   { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  buttonDisabled:{ opacity: 0.6 },
  buttonLabel:   { fontSize: 16, fontWeight: '500' },
  labelPrimary:  { color: '#fff' },
  labelGhost:    { color: colors.textMuted },

  inputWrapper:    { marginBottom: 16 },
  inputLabel:      { fontSize: 13, fontWeight: '500', color: colors.text, marginBottom: 6 },
  input:           { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, fontSize: 16, color: colors.text, backgroundColor: '#fafafa' },
  inputError:      { borderColor: colors.error },
  inputErrorText:  { fontSize: 12, color: colors.error, marginTop: 4 },

  formError:     { backgroundColor: colors.errorBg, borderRadius: 12, padding: 12, marginBottom: 16 },
  formErrorText: { color: colors.error, fontSize: 14, textAlign: 'center' },
})