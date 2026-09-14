import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AnimatedSwitch } from '@/components/animated-switch';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSwipeToDismiss } from '@/hooks/use-swipe-to-dismiss';
import { useTheme } from '@/hooks/use-theme';

export const rescoOptions = [
  'Jonathan Edwards',
  'Saybrook',
  'Benjamin Franklin',
  'Berkeley',
  'Branford',
  'Davenport',
  'Pauli Murray',
  'Silliman',
] as const;

export type NewPostData = {
  resco: string;
  description: string;
  spotDescription: string;
  isSensitive: boolean;
  hasPhoto: boolean;
};

type CreatePostModalProps = {
  visible: boolean;
  defaultResco: string;
  onClose: () => void;
  onSubmit: (post: NewPostData) => void;
};

export function CreatePostModal({
  visible,
  defaultResco,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const theme = useTheme();
  const [resco, setResco] = useState(defaultResco);
  const [description, setDescription] = useState('');
  const [spotDescription, setSpotDescription] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const { translateY, panHandlers } = useSwipeToDismiss(handleClose);

  useEffect(() => {
    if (visible) setResco(defaultResco);
  }, [visible, defaultResco]);

  function reset() {
    setDescription('');
    setSpotDescription('');
    setIsSensitive(false);
    setHasPhoto(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!description.trim()) {
      Alert.alert('Add a description', "Say what the item is so people know what they're looking for.");
      return;
    }
    if (!spotDescription.trim()) {
      Alert.alert('Add a location', 'Describe where in the laundry room it was found.');
      return;
    }

    onSubmit({ resco, description: description.trim(), spotDescription: spotDescription.trim(), isSensitive, hasPhoto });
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View style={{ transform: [{ translateY }] }}>
        <ThemedView style={[styles.sheet, { backgroundColor: theme.card }]}>
          <View style={styles.handleRow} {...panHandlers}>
            <View style={[styles.handle, { backgroundColor: theme.cardBorder }]} />
          </View>

          <View style={styles.header}>
            <ThemedText style={styles.title}>New Lost & Found Post</ThemedText>
            <Pressable
              onPress={handleClose}
              style={[styles.closeButton, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">
                X
              </ThemedText>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <Field label="RESIDENTIAL COLLEGE">
              <View style={styles.chipRow}>
                {rescoOptions.map((option) => {
                  const selected = option === resco;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setResco(option)}
                      style={[
                        styles.chip,
                        {
                          borderColor: selected ? theme.text : theme.cardBorder,
                          backgroundColor: selected ? theme.text : 'transparent',
                        },
                      ]}>
                      <ThemedText
                        type="small"
                        style={{ color: selected ? theme.background : theme.text }}>
                        {option}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            <Field label="WHAT DID YOU FIND?">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Grey Yale hoodie, size M"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { borderColor: theme.cardBorder, color: theme.text }]}
              />
            </Field>

            <Field label="WHERE IN THE LAUNDRY ROOM?">
              <TextInput
                value={spotDescription}
                onChangeText={setSpotDescription}
                placeholder="e.g. On top of dryer 3"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { borderColor: theme.cardBorder, color: theme.text }]}
              />
            </Field>

            <Field label="PHOTO (OPTIONAL)">
              <Pressable
                onPress={() => setHasPhoto((v) => !v)}
                style={[styles.uploadBox, { borderColor: theme.cardBorder }]}>
                <View style={[styles.uploadPlus, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText themeColor="textMuted" style={styles.uploadPlusLabel}>
                    {hasPhoto ? '✓' : '+'}
                  </ThemedText>
                </View>
                <ThemedText type="small" themeColor="textMuted">
                  {hasPhoto ? 'Photo attached' : 'Add Photo'}
                </ThemedText>
              </Pressable>
            </Field>

            <View style={[styles.sensitiveRow, { borderColor: theme.cardBorder }]}>
              <View style={styles.sensitiveCopy}>
                <ThemedText style={styles.sensitiveLabel}>Delicates / intimates</ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  Flag if the photo shows underwear or other intimate items — we'll blur the
                  thumbnail and add a heads-up before anyone opens it.
                </ThemedText>
              </View>
              <AnimatedSwitch
                value={isSensitive}
                onValueChange={setIsSensitive}
                activeColor={theme.text}
                inactiveColor={theme.backgroundSelected}
                thumbColor={theme.background}
              />
            </View>

            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: theme.text, opacity: pressed ? 0.85 : 1 },
              ]}>
              <ThemedText style={[styles.submitLabel, { color: theme.background }]}>
                Post
              </ThemedText>
            </Pressable>
          </ScrollView>
        </ThemedView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textMuted" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    maxHeight: '88%',
  },
  handleRow: {
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: Spacing.four,
    paddingBottom: Spacing.five,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    letterSpacing: 0.48,
    fontSize: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  uploadBox: {
    height: 100,
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
  sensitiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
  },
  sensitiveCopy: {
    flex: 1,
    gap: 2,
  },
  sensitiveLabel: {
    fontSize: 14,
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
