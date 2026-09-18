import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBottomSheetAnimation } from '@/hooks/use-bottom-sheet-animation';
import { useTheme } from '@/hooks/use-theme';

type PingState = 'idle' | 'sent' | 'responded' | 'picked-up';

type PickupModalProps = {
  visible: boolean;
  machineLabel: string;
  ownerName?: string;
  ownerAvatar?: number;
  finishedAgo?: string;
  /** The owner was already pinged earlier, so reopen straight into the "Ping Sent!" state. */
  pinged?: boolean;
  onClose: () => void;
  onPinged?: () => void;
  onPickedUp?: () => void;
};

const blueberryAvatar = require('@/assets/images/illustrations/avatar-blueberry.png');

export function PickupModal({
  visible,
  machineLabel,
  ownerName = 'Blueberry',
  ownerAvatar = blueberryAvatar,
  finishedAgo = 'Finished 12 min ago',
  pinged = false,
  onClose,
  onPinged,
  onPickedUp,
}: PickupModalProps) {
  const theme = useTheme();
  const [pingState, setPingState] = useState<PingState>('idle');
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const onPickedUpRef = useRef(onPickedUp);
  onPickedUpRef.current = onPickedUp;
  const isAvailable = pingState === 'picked-up';
  const { mounted, backdropOpacity, translateY, panHandlers, hide } = useBottomSheetAnimation(
    visible,
    onClose,
  );

  useEffect(() => {
    if (visible) {
      setPingState(pinged ? 'sent' : 'idle');
    } else {
      setPingState('idle');
      setPointsAwarded(false);
    }
    // Only sync from `pinged` when the sheet opens; afterwards the sheet owns its ping state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (pingState !== 'sent') return;
    const timer = setTimeout(() => setPingState('responded'), 2500);
    return () => clearTimeout(timer);
  }, [pingState]);

  useEffect(() => {
    if (pingState !== 'responded') return;
    const timer = setTimeout(() => {
      setPingState('picked-up');
      onPickedUpRef.current?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [pingState]);

  if (!mounted) return null;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={hide}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={hide} />
        </Animated.View>
        <Animated.View style={[styles.sheetWrap, { transform: [{ translateY }] }]}>
          <ThemedView style={[styles.sheet, { backgroundColor: theme.card }]}>
            <View style={styles.handleRow} {...panHandlers}>
              <View style={[styles.handle, { backgroundColor: theme.cardBorder }]} />
            </View>

            <View style={styles.header}>
              <View style={styles.titleGroup}>
                <ThemedText style={styles.title}>{machineLabel}</ThemedText>
                <View
                style={[
                  styles.pill,
                  { backgroundColor: isAvailable ? theme.available : theme.pickup },
                ]}>
                  <ThemedText
                  style={[
                    styles.pillText,
                    { color: isAvailable ? theme.availableText : theme.pickupText },
                  ]}>
                    {isAvailable ? 'Available' : 'Awaiting Pickup'}
                  </ThemedText>
                </View>
              </View>
              <Pressable
                onPress={hide}
                style={[styles.closeButton, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="small" themeColor="textSecondary">
                  X
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.ownerRow}>
              <Image
                source={ownerAvatar}
                style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}
                contentFit="cover"
              />
              <View style={styles.ownerCopy}>
                <ThemedText style={styles.ownerName}>{ownerName}</ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  {isAvailable ? 'Picked up just now' : finishedAgo}
                </ThemedText>
              </View>
            </View>

            {pingState === 'idle' && (
              <Pressable
                onPress={() => {
                  setPingState('sent');
                  onPinged?.();
                }}
                style={({ pressed }) => [
                  styles.pingButton,
                  { backgroundColor: theme.text, opacity: pressed ? 0.85 : 1 },
                ]}>
                <ThemedText style={[styles.pingButtonLabel, { color: theme.background }]}>
                  Ping {ownerName}
                </ThemedText>
              </Pressable>
            )}

            {pingState === 'sent' && (
              <View style={[styles.pingButton, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={styles.pingButtonLabel}>Ping Sent!</ThemedText>
              </View>
            )}

            {pingState === 'responded' && (
              <View style={styles.respondedRow}>
                <ThemedText style={styles.respondedText} themeColor="textSecondary">
                  Responded: omw!
                </ThemedText>
              </View>
            )}

          {pingState === 'picked-up' && (
            <>
              <View style={styles.respondedRow}>
                <ThemedText style={[styles.respondedText, styles.pickedUpText]} themeColor="textSecondary">
                  {ownerName} picked their laundry up!
                </ThemedText>
              </View>
              <Pressable
                disabled={pointsAwarded}
                onPress={() => setPointsAwarded(true)}
                style={({ pressed }) => [
                  styles.pingButton,
                  {
                    backgroundColor: pointsAwarded ? theme.backgroundElement : theme.text,
                    opacity: pressed && !pointsAwarded ? 0.85 : 1,
                  },
                ]}>
                <ThemedText
                  style={[
                    styles.pingButtonLabel,
                    { color: pointsAwarded ? theme.text : theme.background },
                  ]}>
                  {pointsAwarded ? 'Sent 10 points!' : `Send ${ownerName} 10 points`}
                </ThemedText>
              </Pressable>
            </>
          )}

          {pingState !== 'responded' && (
              <View style={styles.dismissRow}>
                <Pressable onPress={hide}>
                  <ThemedText type="small" themeColor="textMuted">
                    {pingState === 'sent' && 'Wait 3 minutes for another ping....'}
                    {pingState === 'picked-up' && (pointsAwarded ? 'Done' : 'No thanks....')}
                    {pingState === 'idle' && 'Not now'}
                  </ThemedText>
                </Pressable>
              </View>
          )}
          </ThemedView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // Pinned to the bottom edge rather than relying on flex justification, so the sheet always
  // sits flush against the bottom of the screen no matter how tall its content gets.
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
    gap: Spacing.three,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  ownerCopy: {
    gap: 2,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '500',
  },
  pingButton: {
    borderRadius: Spacing.three,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  respondedRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  respondedText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  pickedUpText: {
    fontSize: 18,
  },
  dismissRow: {
    alignItems: 'center',
  },
});
