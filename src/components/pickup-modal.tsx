import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PingState = 'idle' | 'sent' | 'responded' | 'picked-up';

type PickupModalProps = {
  visible: boolean;
  machineLabel: string;
  ownerName?: string;
  finishedAgo?: string;
  onClose: () => void;
  onPickedUp?: () => void;
};

export function PickupModal({
  visible,
  machineLabel,
  ownerName = 'Blueberry',
  finishedAgo = 'Finished 12 min ago',
  onClose,
  onPickedUp,
}: PickupModalProps) {
  const theme = useTheme();
  const [pingState, setPingState] = useState<PingState>('idle');
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const onPickedUpRef = useRef(onPickedUp);
  onPickedUpRef.current = onPickedUp;
  const isAvailable = pingState === 'picked-up';

  useEffect(() => {
    if (!visible) {
      setPingState('idle');
      setPointsAwarded(false);
    }
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <ThemedView style={[styles.sheet, { backgroundColor: theme.card }]}>
          <View style={styles.handleRow}>
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
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">
                X
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.ownerRow}>
            <Image
              source={require('@/assets/images/illustrations/avatar-blueberry.png')}
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
              onPress={() => setPingState('sent')}
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
              <Pressable onPress={onClose}>
                <ThemedText type="small" themeColor="textMuted">
                  {pingState === 'sent' && 'Wait 3 minutes for another ping....'}
                  {pingState === 'picked-up' && (pointsAwarded ? 'Done' : 'No thanks....')}
                  {pingState === 'idle' && 'Not now'}
                </ThemedText>
              </Pressable>
            </View>
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
