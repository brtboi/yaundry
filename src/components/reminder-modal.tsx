import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ReminderKind = 'lint' | 'door';

type ReminderModalProps = {
  kind: ReminderKind | null;
  onClose: () => void;
};

const copy = {
  lint: {
    headline: 'Clean Your Lint Filter!',
    body: 'Remember to clean your lint filter before you start your dryer to avoid a fire hazard.',
  },
  door: {
    headline: 'Leave the Washing Machine Door Open after Washing',
    body: 'Bruno Mars was talking about his Washing Machine door in order to prevent mold!!',
  },
} as const;

export function ReminderModal({ kind, onClose }: ReminderModalProps) {
  const theme = useTheme();
  const visible = kind !== null;
  const content = kind ? copy[kind] : copy.lint;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <ThemedView style={[styles.sheet, { backgroundColor: theme.card }]}>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: theme.cardBorder }]} />
          </View>

          <View style={styles.header}>
            <ThemedText style={styles.title}>Friendly Reminder :)</ThemedText>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close reminder"
              style={[styles.closeButton, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">
                X
              </ThemedText>
            </Pressable>
          </View>

          {kind === 'door' ? (
            <View style={styles.doorRow}>
              <View style={styles.doorHeadline}>
                <ThemedText style={styles.headline}>{content.headline}</ThemedText>
              </View>
              <Image
                source={require('@/assets/images/illustrations/washer-door-reminder.png')}
                style={styles.illustration}
                contentFit="contain"
              />
            </View>
          ) : (
            <ThemedText style={styles.headline}>{content.headline}</ThemedText>
          )}

          {kind === 'door' ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Fun Fact:{'\n'}
              </ThemedText>
              {content.body}
            </ThemedText>
          ) : (
            <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
              {content.body}
            </ThemedText>
          )}
        </ThemedView>
      </View>
    </Modal>
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
  doorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.three,
  },
  headline: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  doorHeadline: {
    width: 173,
  },
  illustration: {
    width: 115,
    height: 97,
    flexShrink: 0,
  },
  body: {
    lineHeight: 20,
  },
});
