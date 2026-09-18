import { Image } from 'expo-image';
import { useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatMachineRating } from '@/hooks/use-machine-reviews';
import { useBottomSheetAnimation } from '@/hooks/use-bottom-sheet-animation';
import { useTheme } from '@/hooks/use-theme';

export type MachineStatusModalProps = {
  visible: boolean;
  machineLabel: string;
  statusLabel: string;
  statusBg: string;
  statusColor: string;
  occupantName: string;
  occupantAvatar?: number;
  subtitle: string;
  rating: number;
  onClose: () => void;
  onRate: () => void;
};

export function MachineStatusModal({
  visible,
  machineLabel,
  statusLabel,
  statusBg,
  statusColor,
  occupantName,
  occupantAvatar,
  subtitle,
  rating,
  onClose,
  onRate,
}: MachineStatusModalProps) {
  const theme = useTheme();
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

  function handleRate() {
    pendingActionRef.current = onRate;
    hide();
  }

  if (!mounted) return null;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={hide}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={hide} />
        </Animated.View>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <ThemedView style={[styles.sheet, { backgroundColor: theme.card }]}>
            <View style={styles.handleRow} {...panHandlers}>
              <View style={[styles.handle, { backgroundColor: theme.cardBorder }]} />
            </View>

            <View style={styles.header}>
              <View style={styles.titleGroup}>
                <ThemedText style={styles.title}>{machineLabel}</ThemedText>
                <View style={[styles.pill, { backgroundColor: statusBg }]}>
                  <ThemedText style={[styles.pillText, { color: statusColor }]}>{statusLabel}</ThemedText>
                </View>
              </View>
              <Pressable
                onPress={hide}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={[styles.closeButton, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="small" themeColor="textSecondary">
                  X
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.ownerRow}>
              {occupantAvatar ? (
                <Image
                  source={occupantAvatar}
                  style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]} />
              )}
              <View style={styles.ownerCopy}>
                <ThemedText style={styles.ownerName}>{occupantName}</ThemedText>
                <ThemedText type="small" themeColor="textMuted" style={styles.subtitle}>
                  {subtitle}
                </ThemedText>
              </View>
              <Icon name="star" size={15} color={theme.textMuted} />
              <ThemedText type="small" themeColor="textMuted" style={styles.rating}>
                {formatMachineRating(rating)}
              </ThemedText>
            </View>

            <Pressable
              onPress={handleRate}
              accessibilityRole="button"
              accessibilityLabel="Tap here to rate"
              style={styles.rateRow}>
              <ThemedText type="small" themeColor="textMuted">
                Tap Here to Rate
              </ThemedText>
            </Pressable>
          </ThemedView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
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
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  pill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  ownerCopy: {
    gap: 2,
    flexShrink: 1,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  rating: {
    fontSize: 13,
    fontWeight: '400',
  },
  rateRow: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'flex-start',
  },
});
