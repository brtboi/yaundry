import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PickupModal } from '@/components/pickup-modal';
import { RatePreviousUserModal } from '@/components/rate-previous-user-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, WebTopTabBarInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Module-scoped so the "you just opened the app" prompt only fires once per cold start,
// not every time the Home tab remounts as you navigate around the app.
let hasShownRatePromptThisSession = false;

type MachineStatus = 'available' | 'in-use' | 'broken' | 'pickup';

type Machine = {
  id: number;
  status: MachineStatus;
  minutesLeft?: number;
};

const washers: Machine[] = [
  { id: 1, status: 'available' },
  { id: 2, status: 'pickup' },
  { id: 3, status: 'in-use', minutesLeft: 15 },
  { id: 4, status: 'in-use', minutesLeft: 14 },
  { id: 5, status: 'broken' },
];

const dryers: Machine[] = [
  { id: 1, status: 'in-use', minutesLeft: 8 },
  { id: 2, status: 'available' },
  { id: 3, status: 'available' },
  { id: 4, status: 'broken' },
  { id: 5, status: 'pickup' },
  { id: 6, status: 'available' },
  { id: 7, status: 'available' },
  { id: 8, status: 'available' },
];

const myMachines = [
  { label: 'Washer 3', minutesLeft: 15, percent: 0.5 },
  { label: 'Washer 4', minutesLeft: 14, percent: 0.46 },
  { label: 'Dryer 1', minutesLeft: 8, percent: 0.2 },
];

export default function HomeScreen() {
  const theme = useTheme();
  const [pickup, setPickup] = useState<{ kind: 'Washer' | 'Dryer'; id: number } | null>(null);
  const [showRatePrompt, setShowRatePrompt] = useState(false);

  useEffect(() => {
    if (hasShownRatePromptThisSession || myMachines.length === 0) return;
    hasShownRatePromptThisSession = true;

    const timer = setTimeout(() => setShowRatePrompt(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Pressable onPress={() => router.push('/booking')}>
          <ThemedView
            style={[styles.banner, { backgroundColor: theme.bannerGreen, borderColor: theme.cardBorder }]}>
            <ThemedText type="subtitle" style={styles.bannerText}>
              Jonathan Edwards
            </ThemedText>
            <Image
              source={require('@/assets/images/illustrations/je-shield.png')}
              style={styles.shield}
              contentFit="contain"
            />
          </ThemedView>
        </Pressable>

        <ThemedView style={[styles.card, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
          <ThemedText type="small" themeColor="textMuted" style={styles.sectionLabel}>
            MY MACHINES
          </ThemedText>
          <View style={styles.machinesList}>
            {myMachines.map((machine) => (
              <View key={machine.label} style={styles.progressItem}>
                <View style={styles.progressLabelRow}>
                  <ThemedText style={styles.progressLabel}>{machine.label}</ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {machine.minutesLeft} min left
                  </ThemedText>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.accentTrack }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: theme.accent, width: `${machine.percent * 100}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView
          style={[styles.card, styles.availabilityCard, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
          <View style={styles.legend}>
            <LegendItem color={theme.availableText} label="Available" />
            <LegendItem color={theme.inUseBorder} label="In use" />
            <LegendItem color={theme.brokenText} label="Broken" />
            <LegendItem color={theme.pickupText} label="Awaiting Pickup" />
          </View>

          <View style={styles.machineGroup}>
            <ThemedText type="small" themeColor="textMuted" style={styles.sectionLabel}>
              WASHERS
            </ThemedText>
            <View style={styles.washerRow}>
              {washers.map((machine) => (
                <MachineTile
                  key={machine.id}
                  machine={machine}
                  flexGrow={machine.status !== 'in-use'}
                  onPress={
                    machine.status === 'pickup'
                      ? () => setPickup({ kind: 'Washer', id: machine.id })
                      : undefined
                  }
                />
              ))}
            </View>
          </View>

          <View style={styles.machineGroup}>
            <ThemedText type="small" themeColor="textMuted" style={styles.sectionLabel}>
              DRYERS
            </ThemedText>
            <View style={styles.dryerGrid}>
              {dryers.map((machine) => (
                <View key={machine.id} style={styles.dryerCell}>
                  <MachineTile
                    machine={machine}
                    fill
                    onPress={
                      machine.status === 'pickup'
                        ? () => setPickup({ kind: 'Dryer', id: machine.id })
                        : undefined
                    }
                  />
                </View>
              ))}
            </View>
          </View>
        </ThemedView>
      </SafeAreaView>

      <PickupModal
        visible={pickup !== null}
        machineLabel={pickup ? `${pickup.kind} ${pickup.id}` : ''}
        onClose={() => setPickup(null)}
      />

      <RatePreviousUserModal
        visible={showRatePrompt}
        machineLabel={myMachines[0]?.label ?? 'this machine'}
        onClose={() => setShowRatePrompt(false)}
      />
    </ThemedView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textMuted">
        {label}
      </ThemedText>
    </View>
  );
}

function MachineTile({
  machine,
  flexGrow,
  fill,
  onPress,
}: {
  machine: Machine;
  flexGrow?: boolean;
  fill?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const palette: Record<MachineStatus, { bg: string; text: string; border?: string }> = {
    available: { bg: theme.available, text: theme.availableText },
    'in-use': { bg: theme.inUse, text: theme.inUseText, border: theme.inUseBorder },
    broken: { bg: theme.broken, text: theme.brokenText },
    pickup: { bg: theme.pickup, text: theme.pickupText },
  };
  const colors = palette[machine.status];
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.machineTile,
        flexGrow && styles.machineTileGrow,
        fill && styles.machineTileFill,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: colors.border ? 2 : 0,
        },
      ]}>
      <ThemedText style={[styles.machineNumber, { color: colors.text }]}>{machine.id}</ThemedText>
      {machine.status === 'in-use' && (
        <ThemedText style={[styles.machineTime, { color: colors.text }]}>
          {machine.minutesLeft}m
        </ThemedText>
      )}
    </Wrapper>
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
    paddingHorizontal: Spacing.three,
    paddingTop: WebTopTabBarInset,
    gap: Spacing.three,
  },
  banner: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  bannerText: {
    fontSize: 20,
    lineHeight: 28,
    flexShrink: 1,
  },
  shield: {
    width: 56,
    height: 68,
  },
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionLabel: {
    letterSpacing: 0.48,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  machinesList: {
    gap: Spacing.three,
  },
  progressItem: {
    gap: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 14,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  availabilityCard: {
    gap: Spacing.four,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    rowGap: Spacing.one,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  machineGroup: {
    gap: Spacing.two,
  },
  washerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  dryerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  dryerCell: {
    width: '22.5%',
  },
  machineTile: {
    width: 54,
    height: 54,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  machineTileGrow: {
    flex: 1,
    width: undefined,
  },
  machineTileFill: {
    width: '100%',
    aspectRatio: 1,
  },
  machineNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  machineTime: {
    fontSize: 10,
    fontWeight: '500',
  },
});
