import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useRef, useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PickupModal } from '@/components/pickup-modal';
import { RatePreviousUserModal } from '@/components/rate-previous-user-modal';
import { ReminderModal, type ReminderKind } from '@/components/reminder-modal';
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

const WASHER_COLUMNS = 5;
const DRYER_COLUMNS = 4;
const MACHINE_GAP = Spacing.two;

export default function HomeScreen() {
  const theme = useTheme();
  const [washers, setWashers] = useState(initialWashers);
  const [dryers, setDryers] = useState(initialDryers);
  const [pickup, setPickup] = useState<{ kind: 'Washer' | 'Dryer'; id: number } | null>(null);
  const [showRatePrompt, setShowRatePrompt] = useState(false);

  useEffect(() => {
    if (hasShownRatePromptThisSession || myMachines.length === 0) return;
    hasShownRatePromptThisSession = true;

    const timer = setTimeout(() => setShowRatePrompt(true), 800);
    return () => clearTimeout(timer);
  }, []);
  const [reminder, setReminder] = useState<ReminderKind | null>(null);
  const lastReminderRef = useRef<ReminderKind | null>(null);

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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
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
            <MachineRow
              machines={washers}
              columns={WASHER_COLUMNS}
              onPressMachine={(machine) =>
                machine.status === 'pickup' && !machine.mine
                  ? () => setPickup({ kind: 'Washer', id: machine.id })
                  : undefined
              }
            />
          </View>

          <View style={styles.machineGroup}>
            <ThemedText type="small" themeColor="textMuted" style={styles.sectionLabel}>
              DRYERS
            </ThemedText>
            <MachineRow
              machines={dryers}
              columns={DRYER_COLUMNS}
              onPressMachine={(machine) =>
                machine.status === 'pickup' && !machine.mine
                  ? () => setPickup({ kind: 'Dryer', id: machine.id })
                  : undefined
              }
            />
          </View>
        </ThemedView>
        </ScrollView>
      </SafeAreaView>

      <PickupModal
        visible={pickup !== null}
        machineLabel={pickup ? `${pickup.kind} ${pickup.id}` : ''}
        onClose={() => setPickup(null)}
        onPickedUp={markPickupAvailable}
      />

      <RatePreviousUserModal
        visible={showRatePrompt}
        machineLabel={myMachines[0]?.label ?? 'this machine'}
        onClose={() => setShowRatePrompt(false)}
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

function chunkMachines(machines: Machine[], size: number) {
  const rows: Machine[][] = [];
  for (let i = 0; i < machines.length; i += size) {
    rows.push(machines.slice(i, i + size));
  }
  return rows;
}

function MachineRow({
  machines,
  columns,
  onPressMachine,
}: {
  machines: Machine[];
  columns: number;
  onPressMachine: (machine: Machine) => (() => void) | undefined;
}) {
  return (
    <View style={styles.machineRows}>
      {chunkMachines(machines, columns).map((row) => (
        <View key={row.map((machine) => machine.id).join('-')} style={styles.machineRow}>
          {row.map((machine) => (
            <View key={machine.id} style={styles.machineCell}>
              <MachineTile machine={machine} onPress={onPressMachine(machine)} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function MachineTile({
  machine,
  onPress,
  onLongPress,
}: {
  machine: Machine;
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
    {
      backgroundColor: colors.bg,
      borderColor: showOutline ? theme.inUseBorder : 'transparent',
      borderWidth: 2,
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: WebTopTabBarInset,
    paddingBottom: Spacing.five,
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
  machineRows: {
    gap: Spacing.two,
  },
  machineRow: {
    flexDirection: 'row',
    gap: MACHINE_GAP,
  },
  machineCell: {
    flex: 1,
    aspectRatio: 1,
  },
  machineTile: {
    flex: 1,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  machineNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  machineTime: {
    fontSize: 10,
    fontWeight: '500',
  },
});
