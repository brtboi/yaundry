import { type ReactNode, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Dropdown } from '@/components/dropdown';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { rescoOptions } from '@/constants/rescos';
import { MaxContentWidth, Spacing, WebTopTabBarInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IssueDestination = 'facilities' | 'resco';

type IssueOption = {
  id: string;
  label: string;
  destination: IssueDestination;
};

const issueOptions: IssueOption[] = [
  { id: 'wont-start', label: "Machine won't start", destination: 'facilities' },
  { id: 'error-code', label: 'Error code / stuck cycle', destination: 'facilities' },
  { id: 'payment', label: 'Card reader / payment issue', destination: 'facilities' },
  { id: 'broken-other', label: 'Other broken machine', destination: 'facilities' },
  { id: 'cleanliness', label: 'Laundry room needs cleaning', destination: 'resco' },
  { id: 'period-products', label: 'Out of period products', destination: 'resco' },
  { id: 'contraception', label: 'Out of contraception', destination: 'resco' },
  { id: 'other-resco', label: 'Other room issue', destination: 'resco' },
];

const destinationCopy: Record<IssueDestination, { label: string; notified: string }> = {
  facilities: {
    label: 'Facilities / Tech Staff',
    notified: 'Facilities has been notified. Thanks for the heads up!',
  },
  resco: {
    label: "Your ResCo's Student Laundry Manager",
    notified: 'Your laundry manager has been notified. Thanks for flagging this!',
  },
};

const routingExplainer =
  "Broken machines, error codes, payment problems, and other technical issues are routed to Facilities/tech staff. " +
  "Cleanliness issues, and rooms out of period products or contraception, are routed straight to your residential " +
  "college's dedicated student laundry manager instead.";

export default function TechSupportScreen() {
  const theme = useTheme();
  const [resco, setResco] = useState<string>(rescoOptions[0]);
  const [issueId, setIssueId] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState('');
  const [description, setDescription] = useState('');

  const selectedIssue = issueOptions.find((option) => option.id === issueId) ?? null;
  const destination = selectedIssue?.destination ?? null;

  function showRoutingInfo() {
    Alert.alert('How reports are routed', routingExplainer);
  }

  function handleSubmit() {
    if (!selectedIssue) {
      Alert.alert('Pick an issue', 'Select what kind of issue you’re reporting first.');
      return;
    }

    Alert.alert('Report submitted', destinationCopy[selectedIssue.destination].notified);
    setIssueId(null);
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
          <Field label="RESIDENTIAL COLLEGE">
            <Dropdown value={resco} options={rescoOptions} onChange={setResco} />
          </Field>

          <View style={styles.field}>
            <View style={styles.issueLabelRow}>
              <ThemedText type="small" themeColor="textMuted" style={styles.fieldLabel}>
                WHAT'S THE ISSUE?
              </ThemedText>
              <Pressable
                onPress={showRoutingInfo}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="How are reports routed?"
                style={[styles.infoBadge, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText type="smallBold" themeColor="textSecondary" style={styles.infoBadgeLabel}>
                  ?
                </ThemedText>
              </Pressable>
            </View>

            <IssueGroup
              caption="Broken machine or other technical issue"
              options={issueOptions.filter((o) => o.destination === 'facilities')}
              selectedId={issueId}
              onSelect={setIssueId}
            />
            <IssueGroup
              caption="Cleanliness or missing supplies"
              options={issueOptions.filter((o) => o.destination === 'resco')}
              selectedId={issueId}
              onSelect={setIssueId}
            />

            {destination && (
              <View style={[styles.routingBanner, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="small" themeColor="textSecondary">
                  Goes to: <ThemedText type="smallBold">{destinationCopy[destination].label}</ThemedText>
                </ThemedText>
              </View>
            )}
          </View>

          {destination === 'facilities' && (
            <>
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
            </>
          )}

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

function IssueGroup({
  caption,
  options,
  selectedId,
  onSelect,
}: {
  caption: string;
  options: IssueOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.issueGroup}>
      <ThemedText type="small" themeColor="textMuted" style={styles.issueGroupCaption}>
        {caption}
      </ThemedText>
      <View style={styles.issueChipRow}>
        {options.map((option) => {
          const selected = option.id === selectedId;
          return (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option.id)}
              style={[
                styles.issueChip,
                {
                  borderColor: selected ? theme.text : theme.cardBorder,
                  backgroundColor: selected ? theme.text : 'transparent',
                },
              ]}>
              <ThemedText
                type="small"
                style={[styles.issueChipLabel, { color: selected ? theme.background : theme.text }]}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
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
  issueLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBadgeLabel: {
    fontSize: 12,
    lineHeight: 14,
  },
  issueGroup: {
    gap: 8,
    marginTop: Spacing.two,
  },
  issueGroupCaption: {
    fontSize: 12,
  },
  issueChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  issueChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  issueChipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  routingBanner: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
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
