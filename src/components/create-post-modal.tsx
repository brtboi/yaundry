import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedSwitch } from '@/components/animated-switch';
import { Dropdown } from '@/components/dropdown';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { rescoOptions } from '@/constants/rescos';
import { Spacing } from '@/constants/theme';
import { useBottomSheetAnimation } from '@/hooks/use-bottom-sheet-animation';
import { useTheme } from '@/hooks/use-theme';

const SHEET_MAX_HEIGHT = Dimensions.get('window').height * 0.85;

export type PostKind = 'found' | 'message';

const postKinds: { id: PostKind; label: string }[] = [
  { id: 'found', label: 'Found an item' },
  { id: 'message', label: 'Just a message' },
];

export type NewPostData = {
  kind: PostKind;
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
  const insets = useSafeAreaInsets();
  const [kind, setKind] = useState<PostKind>('found');
  const [resco, setResco] = useState(defaultResco);
  const [description, setDescription] = useState('');
  const [spotDescription, setSpotDescription] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const { mounted, backdropOpacity, translateY, panHandlers, hide } = useBottomSheetAnimation(
    visible,
    onClose,
  );

  useEffect(() => {
    if (visible) setResco(defaultResco);
  }, [visible, defaultResco]);

  function reset() {
    setKind('found');
    setDescription('');
    setSpotDescription('');
    setIsSensitive(false);
    setHasPhoto(false);
  }

  function handleClose() {
    reset();
    hide();
  }

  function handleSubmit() {
    if (!description.trim()) {
      Alert.alert(
        kind === 'found' ? 'Add a description' : 'Add a message',
        kind === 'found'
          ? "Say what the item is so people know what they're looking for."
          : 'Write what you want to say to the laundry room.',
      );
      return;
    }
    if (kind === 'found' && !spotDescription.trim()) {
      Alert.alert('Add a location', 'Describe where in the laundry room it was found.');
      return;
    }

    onSubmit({
      kind,
      resco,
      description: description.trim(),
      spotDescription: kind === 'found' ? spotDescription.trim() : '',
      isSensitive: kind === 'found' ? isSensitive : false,
      hasPhoto: kind === 'found' ? hasPhoto : false,
    });
    reset();
    hide();
  }

  if (!mounted) return null;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.root}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View style={[styles.sheetWrap, { transform: [{ translateY }] }]}>
          <ThemedView
            style={[
              styles.sheet,
              { backgroundColor: theme.card, paddingBottom: insets.bottom + Spacing.two },
            ]}>
            <View style={styles.handleRow} {...panHandlers}>
              <View style={[styles.handle, { backgroundColor: theme.cardBorder }]} />
            </View>

            <View style={styles.header}>
              <ThemedText style={styles.title}>
                {kind === 'found' ? 'Report a Found Item' : 'Post a Message'}
              </ThemedText>
              <Pressable
                onPress={handleClose}
                style={[styles.closeButton, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="small" themeColor="textSecondary">
                  X
                </ThemedText>
              </Pressable>
            </View>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.form}
              showsVerticalScrollIndicator={false}>
              <View style={[styles.segmented, { backgroundColor: theme.backgroundElement }]}>
                {postKinds.map((option) => {
                  const selected = option.id === kind;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setKind(option.id)}
                      style={[styles.segment, selected && { backgroundColor: theme.text }]}>
                      <ThemedText
                        style={[
                          styles.segmentLabel,
                          { color: selected ? theme.background : theme.textMuted },
                        ]}>
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              <Field label="RESIDENTIAL COLLEGE">
                <Dropdown value={resco} options={rescoOptions} onChange={setResco} />
              </Field>

              {kind === 'found' ? (
                <>
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
                      <View
                        style={[styles.uploadPlus, { backgroundColor: theme.backgroundSelected }]}>
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
                </>
              ) : (
                <Field label="YOUR MESSAGE">
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="e.g. Missing a navy jacket — please lmk if you find it!"
                    placeholderTextColor={theme.textMuted}
                    multiline
                    style={[
                      styles.input,
                      styles.textarea,
                      { borderColor: theme.cardBorder, color: theme.text },
                    ]}
                  />
                </Field>
              )}

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
  root: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  // Pinned to the bottom edge rather than relying on flex justification, so the sheet always
  // sits flush against the bottom of the screen no matter how tall its content gets.
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    maxHeight: SHEET_MAX_HEIGHT,
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
  formScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  form: {
    gap: Spacing.four,
    paddingBottom: Spacing.three,
  },
  segmented: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 20,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 16,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    letterSpacing: 0.48,
    fontSize: 12,
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
