import { type ReactNode, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, WebTopTabBarInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function TechSupportScreen() {
  const theme = useTheme();
  const [errorCode, setErrorCode] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit() {
    Alert.alert('Report submitted', 'Facilities has been notified. Thanks for the heads up!');
    setErrorCode('');
    setDescription('');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Tech Support</ThemedText>
        </View>
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <SelectField label="RESIDENTIAL COLLEGE" value="Jonathan Edwards" />
          <SelectField label="MACHINE" value="Select washer or dryer" placeholder />

          <Field label="ERROR CODE">
            <TextInput
              value={errorCode}
              onChangeText={setErrorCode}
              placeholder="e.g. E4"
              placeholderTextColor={theme.textMuted}
              style={[styles.input, { borderColor: theme.cardBorder, color: theme.text }]}
            />
          </Field>

          <Field label="DESCRIPTION (OPTIONAL)">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what's wrong…"
              placeholderTextColor={theme.textMuted}
              multiline
              style={[
                styles.input,
                styles.textarea,
                { borderColor: theme.cardBorder, color: theme.text },
              ]}
            />
          </Field>

          <Field label="PHOTO (OPTIONAL)">
            <Pressable style={[styles.uploadBox, { borderColor: theme.cardBorder }]}>
              <View style={[styles.uploadPlus, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText themeColor="textMuted" style={styles.uploadPlusLabel}>
                  +
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textMuted">
                Add Photo
              </ThemedText>
            </Pressable>
          </Field>

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: theme.text, opacity: pressed ? 0.85 : 1 },
            ]}>
            <ThemedText style={[styles.submitLabel, { color: theme.background }]}>
              Submit Report
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textMuted" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

function SelectField({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: boolean;
}) {
  const theme = useTheme();
  return (
    <Field label={label}>
      <View style={[styles.selectBox, { borderColor: theme.cardBorder }]}>
        <ThemedText themeColor={placeholder ? 'textMuted' : 'text'} style={styles.selectValue}>
          {value}
        </ThemedText>
        <ThemedText themeColor="textMuted">{'›'}</ThemedText>
      </View>
    </Field>
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
  },
  header: {
    paddingVertical: Spacing.two,
    paddingTop: Spacing.two + WebTopTabBarInset,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.34,
  },
  form: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    letterSpacing: 0.48,
    fontSize: 12,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  selectValue: {
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  uploadBox: {
    height: 110,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  uploadPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPlusLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
