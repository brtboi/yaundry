import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { StarRating } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBottomSheetAnimation } from '@/hooks/use-bottom-sheet-animation';
import { addMachineReview, type MachineKind } from '@/hooks/use-machine-reviews';
import { useTheme } from '@/hooks/use-theme';

const INPUT_MIN_HEIGHT = 44;
const INPUT_MAX_HEIGHT = 140;
const REPORT_RED = '#A40000';

export type RateReportTarget = {
  kind: MachineKind;
  id: number;
};

type SheetStep = 'menu' | 'rating' | 'posted';

type RateReportModalProps = {
  visible: boolean;
  machine: RateReportTarget | null;
  backdropColor?: string;
  onClose: () => void;
  onViewReviews: () => void;
  onReportOutOfOrder: () => void;
};

export function RateReportModal({
  visible,
  machine,
  backdropColor,
  onClose,
  onViewReviews,
  onReportOutOfOrder,
}: RateReportModalProps) {
  const theme = useTheme();
  const [step, setStep] = useState<SheetStep>('menu');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [inputHeight, setInputHeight] = useState(INPUT_MIN_HEIGHT);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const { mounted, backdropOpacity, translateY, panHandlers, hide } = useBottomSheetAnimation(
    visible,
    () => {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      onClose();
      action?.();
    },
  );

  const label = machine ? `${machine.kind} ${machine.id}` : '';

  useEffect(() => {
    if (!visible) {
      setStep('menu');
      setRating(0);
      setComment('');
      setInputHeight(INPUT_MIN_HEIGHT);
    }
  }, [visible]);

  function handleClose() {
    pendingActionRef.current = null;
    Keyboard.dismiss();
    hide();
  }

  function handleViewReviews() {
    Keyboard.dismiss();
    pendingActionRef.current = onViewReviews;
    hide();
  }

  function handleReportOutOfOrder() {
    Keyboard.dismiss();
    pendingActionRef.current = onReportOutOfOrder;
    hide();
  }

  function handleSubmit() {
    if (!machine || rating <= 0) return;
    Keyboard.dismiss();
    addMachineReview({
      kind: machine.kind,
      machineId: machine.id,
      rating,
      comment: comment.trim(),
    });
    setStep('posted');
  }

  if (!mounted) return null;

  const overlayColor = backdropColor ?? 'rgba(0,0,0,0.4)';

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.root}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor, opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.View style={{ transform: [{ translateY }] }}>
            <ThemedView style={[styles.sheet, { backgroundColor: theme.card }]}>
              <View style={styles.handleRow} {...panHandlers}>
                <View style={[styles.handle, { backgroundColor: theme.cardBorder }]} />
              </View>

              <View style={styles.header}>
                <ThemedText style={styles.title}>
                  {step === 'rating' ? `Rate ${label}` : label}
                </ThemedText>
                <Pressable
                  onPress={handleClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  style={[styles.closeButton, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="small" themeColor="textSecondary">
                    X
                  </ThemedText>
                </Pressable>
              </View>

              {step === 'menu' && (
                <>
                  <Pressable
                    onPress={() => setStep('rating')}
                    accessibilityRole="button"
                    accessibilityLabel={`Rate ${label}`}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      { backgroundColor: theme.text, opacity: pressed ? 0.85 : 1 },
                    ]}>
                    <ThemedText style={[styles.primaryLabel, { color: theme.background }]}>
                      Rate {label}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleViewReviews}
                    accessibilityRole="button"
                    accessibilityLabel="View Machine Reviews"
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.85 : 1 },
                    ]}>
                    <ThemedText style={styles.primaryLabel}>View Machine Reviews</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleReportOutOfOrder}
                    accessibilityRole="button"
                    accessibilityLabel="Report Out of Order"
                    style={styles.reportRow}>
                    <ThemedText style={[styles.reportLabel, { color: REPORT_RED }]}>
                      Report Out of Order
                    </ThemedText>
                  </Pressable>
                </>
              )}

              {step === 'rating' && (
                <>
                  <StarRating value={rating} onChange={setRating} />
                  <View style={[styles.formCard, { borderColor: theme.cardBorder }]}>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
                      Describe your experience (optional)
                    </ThemedText>
                    <TextInput
                      value={comment}
                      onChangeText={setComment}
                      placeholder="Needed 2 sessions for 1 load...."
                      placeholderTextColor={theme.textMuted}
                      multiline
                      onContentSizeChange={(event) => {
                        const next = Math.ceil(event.nativeEvent.contentSize.height);
                        setInputHeight(Math.min(INPUT_MAX_HEIGHT, Math.max(INPUT_MIN_HEIGHT, next)));
                      }}
                      style={[
                        styles.input,
                        {
                          borderColor: theme.cardBorder,
                          color: theme.text,
                          height: comment.trim() ? inputHeight : INPUT_MIN_HEIGHT,
                        },
                      ]}
                    />
                    <Pressable
                      onPress={handleSubmit}
                      disabled={rating <= 0}
                      accessibilityRole="button"
                      accessibilityLabel="Submit"
                      style={({ pressed }) => [
                        styles.primaryButton,
                        {
                          backgroundColor: rating > 0 ? theme.text : theme.backgroundElement,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}>
                      <ThemedText
                        style={[
                          styles.primaryLabel,
                          { color: rating > 0 ? theme.background : theme.textMuted },
                        ]}>
                        Submit
                      </ThemedText>
                    </Pressable>
                  </View>
                </>
              )}

              {step === 'posted' && (
                <View style={styles.postedRow}>
                  <ThemedText style={styles.postedText} themeColor="textSecondary">
                    Your response was posted!
                  </ThemedText>
                </View>
              )}
            </ThemedView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
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
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  reportRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  fieldLabel: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  postedRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  postedText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});
