import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SignInScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');

  function handleContinue() {
    router.replace('/home');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.brand}>
          Yaundry
        </ThemedText>

        <ThemedView style={styles.content}>
          <ThemedView style={styles.copy}>
            <ThemedText type="smallBold" style={styles.heading}>
              Create an account
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Enter your email to sign up for this app
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.form}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="first.last@yale.edu"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={[styles.input, { borderColor: theme.cardBorder, color: theme.text }]}
            />
            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.continueButton,
                { backgroundColor: theme.text, opacity: pressed ? 0.8 : 1 },
              ]}>
              <ThemedText style={[styles.buttonLabel, { color: theme.background }]}>
                Continue
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.dividerRow}>
            <ThemedView style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            <ThemedText type="small" themeColor="textSecondary">
              or
            </ThemedText>
            <ThemedView style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
          </ThemedView>

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.googleButton,
              { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.8 : 1 },
            ]}>
            <Icon name="google" size={20} />
            <ThemedText style={styles.buttonLabel}>Continue with Google</ThemedText>
          </Pressable>

          <ThemedText type="small" themeColor="textMuted" style={styles.terms}>
            By clicking continue, you agree to our{' '}
            <ThemedText type="small" themeColor="text">
              Terms of Service
            </ThemedText>{' '}
            and{' '}
            <ThemedText type="small" themeColor="text">
              Privacy Policy
            </ThemedText>
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
  },
  brand: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.four,
  },
  copy: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  heading: {
    fontSize: 16,
  },
  form: {
    gap: Spacing.three,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  continueButton: {
    height: 40,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  googleButton: {
    height: 40,
    borderRadius: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  terms: {
    textAlign: 'center',
    lineHeight: Platform.select({ web: 18, default: 18 }),
  },
});
