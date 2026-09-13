import { useState } from 'react';
import { Alert, Animated, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSwipeToDismiss } from '@/hooks/use-swipe-to-dismiss';
import { useTheme } from '@/hooks/use-theme';

const quickTags = [
  'Cleared the lint tray',
  'Retrieved laundry promptly',
  'Left the machine clean',
  'Left detergent residue',
];

type RatePreviousUserModalProps = {
  visible: boolean;
  machineLabel: string;
  onClose: () => void;
};

export function RatePreviousUserModal({
  visible,
  machineLabel,
  onClose,
}: RatePreviousUserModalProps) {
  const theme = useTheme();
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { translateY, panHandlers } = useSwipeToDismiss(handleSkip);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );
  }

  function reset() {
    setRating(null);
    setSelectedTags([]);
  }

  function handleSkip() {
    reset();
    onClose();
  }

  function handleSubmit() {
    Alert.alert('Thanks!', 'Your feedback helps keep the laundry room running smoothly.');
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleSkip}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleSkip} />
        <Animated.View style={{ transform: [{ translateY }] }}>
        <ThemedView style={[styles.sheet, { backgroundColor: theme.card }]}>
          <View style={styles.handleRow} {...panHandlers}>
            <View style={[styles.handle, { backgroundColor: theme.cardBorder }]} />
          </View>

          <ThemedText style={styles.title}>Rate the last user</ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            Someone used {machineLabel} right before you. Your rating is anonymous — they'll never
            see who left it.
          </ThemedText>

          <View style={styles.thumbsRow}>
            <ThumbButton
              emoji="👍"
              label="Good"
              selected={rating === 'up'}
              onPress={() => setRating('up')}
            />
            <ThumbButton
              emoji="👎"
              label="Not great"
              selected={rating === 'down'}
              onPress={() => setRating('down')}
            />
          </View>

          <View style={styles.tagList}>
            {quickTags.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.tagChip,
                    {
                      borderColor: selected ? theme.text : theme.cardBorder,
                      backgroundColor: selected ? theme.text : 'transparent',
                    },
                  ]}>
                  <ThemedText type="small" style={{ color: selected ? theme.background : theme.text }}>
                    {tag}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={!rating}
            style={({ pressed }) => [
              styles.submitButton,
              {
                backgroundColor: rating ? theme.text : theme.backgroundElement,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <ThemedText
              style={[styles.submitLabel, { color: rating ? theme.background : theme.textMuted }]}>
              Submit Rating
            </ThemedText>
          </Pressable>

          <Pressable style={styles.dismissRow} onPress={handleSkip}>
            <ThemedText type="small" themeColor="textMuted">
              Not now
            </ThemedText>
          </Pressable>
        </ThemedView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function ThumbButton({
  emoji,
  label,
  selected,
  onPress,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.thumbButton,
        {
          borderColor: selected ? theme.text : theme.cardBorder,
          backgroundColor: selected ? theme.backgroundSelected : 'transparent',
        },
      ]}>
      <ThemedText style={styles.thumbEmoji}>{emoji}</ThemedText>
      <ThemedText type="small" themeColor={selected ? 'text' : 'textMuted'}>
        {label}
      </ThemedText>
    </Pressable>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  thumbsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  thumbButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: 4,
  },
  thumbEmoji: {
    fontSize: 28,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  submitButton: {
    borderRadius: Spacing.three,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  submitLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  dismissRow: {
    alignItems: 'center',
  },
});
