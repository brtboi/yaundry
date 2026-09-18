import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useRef, useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { MachineStatusModal } from '@/components/machine-status-modal';
import { PickupModal } from '@/components/pickup-modal';
import { RatePreviousUserModal } from '@/components/rate-previous-user-modal';
import { RateReportModal, type RateReportTarget } from '@/components/rate-report-modal';
import { ReminderModal, type ReminderKind } from '@/components/reminder-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, WebTopTabBarInset } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getMachineRating,
  useMachineReviews,
  type MachineKind,
} from '@/hooks/use-machine-reviews';
import { laundryInventory, rescoProfiles, useSelectedResco, type RescoId } from '@/hooks/use-selected-resco';
import { useTheme } from '@/hooks/use-theme';

// Module-scoped so the "you just opened the app" prompt only fires once per cold start,
// not every time the Home tab remounts as you navigate around the app.
let hasShownRatePromptThisSession = false;

const DEFAULT_MACHINE_RATING = 3.8;
const blueberryAvatar = require('@/assets/images/illustrations/avatar-blueberry.png');
const mangoAvatar = require('@/assets/images/illustrations/avatar-mango.png');

const blueberry = { name: 'Blueberry', avatar: blueberryAvatar };
const mango = { name: 'Mango', avatar: mangoAvatar };

type MachineStatus = 'available' | 'in-use' | 'broken' | 'pickup';

type Occupant = {
  name: string;
  avatar: number;
};

type Machine = {
  id: number;
  status: MachineStatus;
  minutesLeft?: number;
  mine?: boolean;
  percent?: number;
  occupant?: Occupant;
  finishedAgo?: string;
};

const jonathanEdwardsMachines = {
  washers: [
    { id: 1, status: 'available', occupant: blueberry, finishedAgo: 'Finished 12 min ago' },
    { id: 2, status: 'in-use', minutesLeft: 28, occupant: mango },
    { id: 3, status: 'in-use', minutesLeft: 15, mine: true, percent: 0.5 },
    { id: 4, status: 'in-use', minutesLeft: 3, occupant: mango },
    { id: 5, status: 'broken', occupant: mango },
  ],
  dryers: [
    { id: 1, status: 'in-use', minutesLeft: 8, mine: true, percent: 0.2 },
    { id: 2, status: 'available', occupant: blueberry, finishedAgo: 'Finished 12 min ago' },
    { id: 3, status: 'available', occupant: blueberry, finishedAgo: 'Finished 12 min ago' },
    { id: 4, status: 'broken', occupant: mango },
    { id: 5, status: 'pickup', occupant: mango, finishedAgo: 'Finished 12 min ago' },
    { id: 6, status: 'available', occupant: blueberry, finishedAgo: 'Finished 12 min ago' },
    { id: 7, status: 'available', occupant: blueberry, finishedAgo: 'Finished 12 min ago' },
    { id: 8, status: 'available', occupant: blueberry, finishedAgo: 'Finished 12 min ago' },
  ],
} satisfies { washers: Machine[]; dryers: Machine[] };

function cloneMachines(machines: Machine[]) {
  return machines.map((machine) => ({ ...machine }));
}

type MachineRole = 'pickup' | 'broken' | 'mine' | 'available' | 'in-use';
type MachineSlot = { kind: 'washer' | 'dryer'; index: number };

const DEMO_WASHER_COUNT = 5;
const DEMO_DRYER_COUNT = 8;
const MAP_RESCOS: RescoId[] = [
  'saybrook',
  'trumbull',
  'davenport',
  'pierson',
  'branford',
  'bingham',
  'farnam',
];

function takeRandomSlot(slots: MachineSlot[]) {
  return slots.splice(Math.floor(Math.random() * slots.length), 1)[0];
}

function takePreferredSlot(slots: MachineSlot[], kind: MachineSlot['kind'] | null) {
  if (kind) {
    const preferred = slots
      .map((slot, index) => ({ slot, index }))
      .filter((item) => item.slot.kind === kind);
    if (preferred.length > 0) {
      const chosen = preferred[Math.floor(Math.random() * preferred.length)];
      return slots.splice(chosen.index, 1)[0];
    }
  }
  return takeRandomSlot(slots);
}

function makeMachine(id: number, role: MachineRole, kind: 'washer' | 'dryer'): Machine {
  if (role === 'mine') {
    return {
      id,
      status: 'in-use',
      minutesLeft: 6 + Math.floor(Math.random() * 20),
      mine: true,
      percent: 0.15 + Math.random() * 0.6,
    };
  }
  if (role === 'pickup') {
    return { id, status: 'pickup', occupant: mango, finishedAgo: 'Finished 12 min ago' };
  }
  if (role === 'broken') {
    return { id, status: 'broken', occupant: mango };
  }
  if (role === 'in-use') {
    return {
      id,
      status: 'in-use',
      minutesLeft: 3 + Math.floor(Math.random() * 30),
      occupant: mango,
    };
  }
  return { id, status: 'available', occupant: blueberry, finishedAgo: 'Finished 12 min ago' };
}

function createDemoMachines(availableCounts?: { washers: number; dryers: number }) {
  const washerRoles: MachineRole[] = Array.from({ length: DEMO_WASHER_COUNT }, () => 'in-use');
  const dryerRoles: MachineRole[] = Array.from({ length: DEMO_DRYER_COUNT }, () => 'in-use');
  const washerSlots: MachineSlot[] = Array.from({ length: DEMO_WASHER_COUNT }, (_, index) => ({
    kind: 'washer',
    index,
  }));
  const dryerSlots: MachineSlot[] = Array.from({ length: DEMO_DRYER_COUNT }, (_, index) => ({
    kind: 'dryer',
    index,
  }));

  const mineWasher = takeRandomSlot(washerSlots);
  const mineDryer = takeRandomSlot(dryerSlots);
  washerRoles[mineWasher.index] = 'mine';
  dryerRoles[mineDryer.index] = 'mine';

  const leftover = [...washerSlots, ...dryerSlots];
  let washerUnavailBudget = availableCounts
    ? Math.max(0, DEMO_WASHER_COUNT - availableCounts.washers - 1)
    : leftover.filter((slot) => slot.kind === 'washer').length;
  let dryerUnavailBudget = availableCounts
    ? Math.max(0, DEMO_DRYER_COUNT - availableCounts.dryers - 1)
    : leftover.filter((slot) => slot.kind === 'dryer').length;

  function takeSpecialSlot() {
    const prefer: MachineSlot['kind'] | null =
      washerUnavailBudget > dryerUnavailBudget
        ? 'washer'
        : dryerUnavailBudget > washerUnavailBudget
          ? 'dryer'
          : null;
    const slot = takePreferredSlot(leftover, prefer);
    if (slot.kind === 'washer') washerUnavailBudget = Math.max(0, washerUnavailBudget - 1);
    else dryerUnavailBudget = Math.max(0, dryerUnavailBudget - 1);
    return slot;
  }

  const brokenOne = takeSpecialSlot();
  const brokenTwo = takeSpecialSlot();
  const pickup = takeSpecialSlot();
  (brokenOne.kind === 'washer' ? washerRoles : dryerRoles)[brokenOne.index] = 'broken';
  (brokenTwo.kind === 'washer' ? washerRoles : dryerRoles)[brokenTwo.index] = 'broken';
  (pickup.kind === 'washer' ? washerRoles : dryerRoles)[pickup.index] = 'pickup';

  if (availableCounts) {
    const remainingWashers = leftover.filter((slot) => slot.kind === 'washer');
    const remainingDryers = leftover.filter((slot) => slot.kind === 'dryer');
    const availableWashers = Math.min(availableCounts.washers, remainingWashers.length);
    const availableDryers = Math.min(availableCounts.dryers, remainingDryers.length);
    for (let i = 0; i < availableWashers; i += 1) {
      washerRoles[takeRandomSlot(remainingWashers).index] = 'available';
    }
    for (let i = 0; i < availableDryers; i += 1) {
      dryerRoles[takeRandomSlot(remainingDryers).index] = 'available';
    }
  } else {
    leftover.forEach((slot) => {
      const role: MachineRole = Math.random() < 0.55 ? 'available' : 'in-use';
      (slot.kind === 'washer' ? washerRoles : dryerRoles)[slot.index] = role;
    });
  }

  return {
    washers: washerRoles.map((role, index) => makeMachine(index + 1, role, 'washer')),
    dryers: dryerRoles.map((role, index) => makeMachine(index + 1, role, 'dryer')),
  };
}

function machinesForResco(id: RescoId) {
  if (id === 'je') {
    return {
      washers: cloneMachines(jonathanEdwardsMachines.washers),
      dryers: cloneMachines(jonathanEdwardsMachines.dryers),
    };
  }
  if (MAP_RESCOS.includes(id)) {
    return createDemoMachines(laundryInventory[id]);
  }
  return createDemoMachines();
}

const WASHER_COLUMNS = 5;
const DRYER_COLUMNS = 4;
const MACHINE_GAP = Spacing.two;

type StatusTarget = { kind: MachineKind; machine: Machine };
type PickupTarget = { kind: MachineKind; id: number; occupant?: Occupant; finishedAgo?: string };
type RateTarget = RateReportTarget & { status: MachineStatus; mine?: boolean };

export default function HomeScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const reviews = useMachineReviews();
  const selectedRescoId = useSelectedResco();
  const selectedResco = rescoProfiles[selectedRescoId];
  const bannerColor = colorScheme === 'dark' ? selectedResco.bannerDark : selectedResco.bannerLight;
  const [washers, setWashers] = useState(() => machinesForResco(selectedRescoId).washers);
  const [dryers, setDryers] = useState(() => machinesForResco(selectedRescoId).dryers);
  const [pickup, setPickup] = useState<PickupTarget | null>(null);
  const [statusTarget, setStatusTarget] = useState<StatusTarget | null>(null);
  const lastStatusTargetRef = useRef<StatusTarget | null>(null);
  const previousRescoId = useRef(selectedRescoId);
  const [rateTarget, setRateTarget] = useState<RateTarget | null>(null);
  const [showRatePrompt, setShowRatePrompt] = useState(false);

  useEffect(() => {
    if (previousRescoId.current === selectedRescoId) return;
    previousRescoId.current = selectedRescoId;
    const next = machinesForResco(selectedRescoId);
    setWashers(next.washers);
    setDryers(next.dryers);
    setPickup(null);
    setStatusTarget(null);
    setRateTarget(null);
  }, [selectedRescoId]);

  const myMachines = [
    ...washers
      .filter((machine) => machine.mine && machine.status === 'in-use')
      .map((machine) => ({
        label: `Washer ${machine.id}`,
        minutesLeft: machine.minutesLeft ?? 0,
        percent: machine.percent ?? 0,
      })),
    ...dryers
      .filter((machine) => machine.mine && machine.status === 'in-use')
      .map((machine) => ({
        label: `Dryer ${machine.id}`,
        minutesLeft: machine.minutesLeft ?? 0,
        percent: machine.percent ?? 0,
      })),
  ];

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
        machine.id === pickup.id
          ? { ...machine, status: 'available' as const, finishedAgo: 'Picked up just now' }
          : machine
      );
    if (pickup.kind === 'Washer') setWashers(update);
    else setDryers(update);
  }, [pickup]);

  const openRateReport = useCallback((kind: MachineKind, machine: Machine) => {
    setPickup(null);
    setStatusTarget(null);
    setRateTarget({ kind, id: machine.id, status: machine.status, mine: machine.mine });
  }, []);

  const closeRateReport = useCallback(() => setRateTarget(null), []);

  const handleMachinePress = useCallback((kind: MachineKind, machine: Machine) => {
    if (machine.status === 'pickup' && !machine.mine) {
      setStatusTarget(null);
      setPickup({
        kind,
        id: machine.id,
        occupant: machine.occupant,
        finishedAgo: machine.finishedAgo,
      });
      return;
    }
    setPickup(null);
    setStatusTarget({ kind, machine });
  }, []);

  if (statusTarget) lastStatusTargetRef.current = statusTarget;
  const displayedStatus = statusTarget ?? lastStatusTargetRef.current;

  const statusMachine = displayedStatus?.machine;
  const statusKind = displayedStatus?.kind;
  const statusRating =
    statusKind && statusMachine
      ? (getMachineRating(reviews, statusKind, statusMachine.id) ?? DEFAULT_MACHINE_RATING)
      : DEFAULT_MACHINE_RATING;
  const statusCopy = statusMachine ? statusPopupCopy(theme, statusMachine) : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.push('/booking')}>
          <ThemedView
            style={[styles.banner, { backgroundColor: bannerColor, borderColor: theme.cardBorder }]}>
            <ThemedText type="subtitle" style={styles.bannerText}>
              {selectedResco.name}
            </ThemedText>
            <Image source={selectedResco.shield} style={styles.shield} contentFit="contain" />
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
            <LegendItem color={theme.brokenText} label="Unavailable" />
            <LegendItem color={theme.inUseBorder} label="Mine In Use" />
          </View>

          <View style={styles.machineGroup}>
            <ThemedText type="small" themeColor="textMuted" style={styles.sectionLabel}>
              WASHERS
            </ThemedText>
            <MachineRow
              machines={washers}
              columns={WASHER_COLUMNS}
              selectedId={rateTarget?.kind === 'Washer' ? rateTarget.id : null}
              onLongPressMachine={(machine) => openRateReport('Washer', machine)}
              onPressMachine={(machine) => handleMachinePress('Washer', machine)}
            />
          </View>

          <View style={styles.machineGroup}>
            <ThemedText type="small" themeColor="textMuted" style={styles.sectionLabel}>
              DRYERS
            </ThemedText>
            <MachineRow
              machines={dryers}
              columns={DRYER_COLUMNS}
              selectedId={rateTarget?.kind === 'Dryer' ? rateTarget.id : null}
              onLongPressMachine={(machine) => openRateReport('Dryer', machine)}
              onPressMachine={(machine) => handleMachinePress('Dryer', machine)}
            />
          </View>
        </ThemedView>
        </ScrollView>
      </SafeAreaView>

      <PickupModal
        visible={pickup !== null}
        machineLabel={pickup ? `${pickup.kind} ${pickup.id}` : ''}
        ownerName={pickup?.occupant?.name}
        ownerAvatar={pickup?.occupant?.avatar}
        finishedAgo={pickup?.finishedAgo}
        onClose={() => setPickup(null)}
        onPickedUp={markPickupAvailable}
      />

      <MachineStatusModal
        visible={statusTarget !== null}
        machineLabel={displayedStatus ? `${displayedStatus.kind} ${displayedStatus.machine.id}` : ''}
        statusLabel={statusCopy?.label ?? ''}
        statusBg={statusCopy?.bg ?? theme.available}
        statusColor={statusCopy?.color ?? theme.availableText}
        occupantName={
          statusMachine?.mine ? 'You' : (statusMachine?.occupant?.name ?? 'Someone')
        }
        occupantAvatar={statusMachine?.mine ? undefined : statusMachine?.occupant?.avatar}
        subtitle={statusCopy?.subtitle ?? ''}
        rating={statusRating}
        onClose={() => setStatusTarget(null)}
        onRate={() => {
          const target = lastStatusTargetRef.current;
          if (!target) return;
          openRateReport(target.kind, target.machine);
        }}
      />

      <RatePreviousUserModal
        visible={showRatePrompt}
        machineLabel={myMachines[0]?.label ?? 'this machine'}
        onClose={() => setShowRatePrompt(false)}
      />
      <ReminderModal kind={reminder} onClose={() => setReminder(null)} />
      <RateReportModal
        visible={rateTarget !== null}
        machine={rateTarget}
        backdropColor={
          rateTarget ? colorWithAlpha(machinePalette(theme, rateTarget).text, 0.4) : undefined
        }
        onClose={closeRateReport}
        onViewReviews={() => router.push('/machine-reviews')}
        onReportOutOfOrder={() => router.push('/home/tech-support')}
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

function chunkMachines(machines: Machine[], size: number) {
  const rows: Machine[][] = [];
  for (let i = 0; i < machines.length; i += size) {
    rows.push(machines.slice(i, i + size));
  }
  return rows;
}

function machinePalette(
  theme: ReturnType<typeof useTheme>,
  machine: Pick<Machine, 'status' | 'mine'>,
) {
  if (machine.mine) return { bg: theme.inUse, text: theme.inUseText };
  if (machine.status === 'available') return { bg: theme.available, text: theme.availableText };
  return { bg: theme.broken, text: theme.brokenText };
}

function statusPopupCopy(theme: ReturnType<typeof useTheme>, machine: Machine) {
  if (machine.status === 'available') {
    return {
      label: 'Available',
      bg: theme.available,
      color: theme.availableText,
      subtitle: machine.finishedAgo ?? 'Ready to use',
    };
  }
  if (machine.status === 'broken') {
    return {
      label: 'Broken',
      bg: theme.broken,
      color: theme.brokenText,
      subtitle: 'Out of Order',
    };
  }
  return {
    label: 'In Use',
    bg: machine.mine ? theme.inUse : theme.broken,
    color: machine.mine ? theme.inUseText : theme.brokenText,
    subtitle:
      machine.minutesLeft != null ? `Finishes in ${machine.minutesLeft} min` : 'Currently running',
  };
}

function machineCaption(machine: Machine) {
  if (machine.status === 'broken') return 'Broken';
  if (machine.status === 'pickup') return 'Finished';
  if (machine.status === 'in-use' && machine.minutesLeft != null) {
    return machine.mine ? `${machine.minutesLeft}m` : `${machine.minutesLeft}m left`;
  }
  return null;
}

function colorWithAlpha(hex: string, alpha: number) {
  const raw = hex.replace('#', '');
  const normalized =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => char + char)
          .join('')
      : raw;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function MachineRow({
  machines,
  columns,
  selectedId,
  onLongPressMachine,
  onPressMachine,
}: {
  machines: Machine[];
  columns: number;
  selectedId: number | null;
  onLongPressMachine: (machine: Machine) => void;
  onPressMachine: (machine: Machine) => void;
}) {
  return (
    <View style={styles.machineRows}>
      {chunkMachines(machines, columns).map((row) => (
        <View key={row.map((machine) => machine.id).join('-')} style={styles.machineRow}>
          {row.map((machine) => {
            const selected = selectedId === machine.id;
            return (
              <View
                key={machine.id}
                style={[styles.machineCell, selected && styles.selectedCell]}>
                {selected ? <SelectedMachineHalo machine={machine} /> : null}
                <MachineTile
                  machine={machine}
                  selected={selected}
                  compact={columns === WASHER_COLUMNS}
                  onPress={() => onPressMachine(machine)}
                  onLongPress={() => onLongPressMachine(machine)}
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function SelectedMachineHalo({ machine }: { machine: Machine }) {
  const theme = useTheme();
  const colors = machinePalette(theme, machine);
  return (
    <View
      pointerEvents="none"
      style={[
        styles.selectedHalo,
        {
          backgroundColor: colorWithAlpha(colors.bg, 0.95),
          borderColor: colorWithAlpha(colors.text, 0.55),
          boxShadow: `0 0 16px ${colorWithAlpha(colors.text, 0.55)}`,
        },
      ]}
    />
  );
}

function MachineTile({
  machine,
  selected,
  compact,
  onPress,
  onLongPress,
}: {
  machine: Machine;
  selected?: boolean;
  compact?: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const theme = useTheme();
  const colors = machinePalette(theme, machine);
  const showOutline = Boolean(machine.mine);
  const caption = machineCaption(machine);
  const showBell = machine.status === 'pickup' && !machine.mine;
  const showWarning = machine.status === 'broken';
  const warningSize = compact ? 12 : 18;
  const tileStyle = [
    styles.machineTile,
    {
      backgroundColor: colors.bg,
      borderColor: selected ? colors.text : showOutline ? theme.inUseBorder : 'transparent',
      borderWidth: selected ? 2.5 : 2,
    },
    selected && styles.selectedTile,
  ];

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      accessibilityRole="button"
      accessibilityLabel={`${machine.status === 'in-use' ? 'In use' : machine.status} ${machine.mine ? 'my ' : ''}machine ${machine.id}`}
      accessibilityHint={
        showBell ? 'Opens ping popup' : 'Shows machine status. Press and hold to rate or report this machine'
      }
      style={tileStyle}>
      {showBell ? (
        <View pointerEvents="none" style={styles.cornerIcon}>
          <Icon name="notifications" size={13} color={colors.text} />
        </View>
      ) : null}
      {showWarning ? (
        <View
          pointerEvents="none"
          style={[
            styles.warningIcon,
            compact && styles.warningIconCompact,
            { width: warningSize, height: warningSize },
          ]}>
          <Icon name="warning" size={warningSize} color={theme.text} />
        </View>
      ) : null}
      <ThemedText style={[styles.machineNumber, { color: colors.text }]}>{machine.id}</ThemedText>
      {caption ? (
        <ThemedText style={[styles.machineTime, { color: colors.text }]} numberOfLines={1}>
        {caption}
      </ThemedText>
      ) : null}
    </Pressable>
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
    overflow: 'visible',
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
    overflow: 'visible',
  },
  machineRow: {
    flexDirection: 'row',
    gap: MACHINE_GAP,
    overflow: 'visible',
  },
  machineCell: {
    flex: 1,
    aspectRatio: 1,
  },
  selectedCell: {
    zIndex: 2,
    overflow: 'visible',
  },
  selectedHalo: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: Spacing.two + 6,
    borderWidth: 1,
    transform: [{ scale: 1.2 }],
  },
  machineTile: {
    flex: 1,
    position: 'relative',
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  selectedTile: {
    overflow: 'visible',
    transform: [{ scale: 1.06 }],
  },
  cornerIcon: {
    position: 'absolute',
    top: 3,
    left: 3,
    zIndex: 1,
    width: 13,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIcon: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIconCompact: {
    top: 3,
    left: 3,
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
