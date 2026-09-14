import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PickupModal } from '@/components/pickup-modal';
import { ReminderModal, type ReminderKind } from '@/components/reminder-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, WebTopTabBarInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const WASHES_BETWEEN_REMINDERS = 3;

type MachineStatus = 'available' | 'in-use' | 'broken' | 'pickup';

type Machine = {
  id: number;
  status: MachineStatus;
  minutesLeft?: number;
  mine?: boolean;
};

const initialWashers: Machine[] = [
  { id: 1, status: 'available' },
  { id: 2, status: 'pickup', mine: true },
  { id: 3, status: 'in-use', minutesLeft: 15, mine: true },
  { id: 4, status: 'in-use', minutesLeft: 14, mine: true },
  { id: 5, status: 'broken' },
];

const initialDryers: Machine[] = [
  { id: 1, status: 'in-use', minutesLeft: 8, mine: true },
  { id: 2, status: 'in-use', minutesLeft: 22 },
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
  const [washers, setWashers] = useState(initialWashers);
  const [dryers, setDryers] = useState(initialDryers);
  const [pickup, setPickup] = useState<{ kind: 'Washer' | 'Dryer'; id: number } | null>(null);
  const [reminder, setReminder] = useState<ReminderKind | null>(null);
  const [completedWashes, setCompletedWashes] = useState(0);
  const lastReminderRef = useRef<ReminderKind | null>(null);

  const showReminderIfDue = useCallback((nextCount: number) => {
    if (nextCount % WASHES_BETWEEN_REMINDERS !== 0) return;
    const kind: ReminderKind = lastReminderRef.current === 'lint' ? 'door' : 'lint';
    lastReminderRef.current = kind;
    setReminder(kind);
  }, []);

  const onMyWasherPress = useCallback(
    (machine: Machine) => {
      if (machine.status === 'in-use') {
        setWashers((current) =>
          current.map((item) =>
            item.id === machine.id
              ? { ...item, status: 'pickup' as const, minutesLeft: undefined }
              : item
          )
        );
      }
      const nextCount = completedWashes + 1;
      setCompletedWashes(nextCount);
      showReminderIfDue(nextCount);
    },
    [completedWashes, showReminderIfDue]
  );

  const showNextReminderForDemo = useCallback(() => {
    const kind: ReminderKind = lastReminderRef.current === 'lint' ? 'door' : 'lint';
    lastReminderRef.current = kind;
    setReminder(kind);
  }, []);

  const markPickupAvailable = useCallback(() => {
    if (!pickup) return;
    const update = (machines: Machine[]) =>
      machines.map((machine) =>
        machine.id === pickup.id ? { ...machine, status: 'available' as const } : machine
      );
    if (pickup.kind === 'Washer') setWashers(update);
    else setDryers(update);
  }, [pickup]);

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
          <Pressable onPress={showNextReminderForDemo} accessibilityRole="button" accessibilityLabel="My machines">
            <ThemedText type="small" themeColor="textMuted" style={styles.sectionLabel}>
              MY MACHINES
            </ThemedText>
          </Pressable>
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
                    machine.mine && (machine.status === 'in-use' || machine.status === 'pickup')
                      ? () => onMyWasherPress(machine)
                      : machine.status === 'pickup'
                        ? () => setPickup({ kind: 'Washer', id: machine.id })
                        : undefined
                  }
                  onLongPress={machine.mine ? showNextReminderForDemo : undefined}
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
                      machine.status === 'pickup' && !machine.mine
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
        onPickedUp={markPickupAvailable}
      />
      <ReminderModal kind={reminder} onClose={() => setReminder(null)} />
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
  onLongPress,
}: {
  machine: Machine;
  flexGrow?: boolean;
  fill?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  const theme = useTheme();
  const palette: Record<MachineStatus, { bg: string; text: string }> = {
    available: { bg: theme.available, text: theme.availableText },
    'in-use': { bg: theme.inUse, text: theme.inUseText },
    broken: { bg: theme.broken, text: theme.brokenText },
    pickup: { bg: theme.pickup, text: theme.pickupText },
  };
  const colors = palette[machine.status];
  const showOutline = machine.status === 'in-use' && machine.mine;
  const tileStyle = [
    styles.machineTile,
    flexGrow && styles.machineTileGrow,
    fill && styles.machineTileFill,
    machine.mine && styles.machineTileMine,
    {
      backgroundColor: colors.bg,
      borderColor: showOutline ? theme.inUseBorder : undefined,
      borderWidth: showOutline ? 2 : 0,
    },
  ];
  const content = (
    <>
      {machine.mine && (
        <ThemedText style={[styles.myBadge, { color: colors.text }]}>MY</ThemedText>
      )}
      <ThemedText style={[styles.machineNumber, { color: colors.text }]}>{machine.id}</ThemedText>
      {machine.status === 'in-use' && (
        <ThemedText style={[styles.machineTime, { color: colors.text }]}>
          {machine.minutesLeft}m
        </ThemedText>
      )}
    </>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={400}
        style={tileStyle}>
        {content}
      </Pressable>
    );
  }

  return <View style={tileStyle}>{content}</View>;
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
    overflow: 'hidden',
  },
  machineTileMine: {
    paddingTop: 10,
  },
  myBadge: {
    position: 'absolute',
    top: 2,
    right: 3,
    zIndex: 1,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
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
