import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import {
  MdArrowDownward,
  MdArrowUpward,
  MdChatBubbleOutline,
  MdNotificationsNone,
  MdOutlineEdit,
  MdSchedule,
} from 'react-icons/md';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedSwitch } from '@/components/animated-switch';
import { FruitPickerModal, fruitOptions, type FruitOption } from '@/components/fruit-picker-modal';
import { Icon, type IconType } from '@/components/icon';
import { NotificationToast, type NotificationPreview } from '@/components/notification-toast';
import { PingReceivedNotification, type PingReceivedData } from '@/components/ping-received-notification';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatTime, TimePickerModal, type TimeValue } from '@/components/time-picker-modal';
import { MaxContentWidth, Spacing, WebTopTabBarInset } from '@/constants/theme';
import { pointsExplainer, userStats } from '@/constants/user-stats';
import { type ColorSchemeOverride, useColorSchemeOverride } from '@/hooks/color-scheme-context';
import { useTheme } from '@/hooks/use-theme';

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const defaultActiveDays = [1, 3];
const appearanceOptions = ['Light', 'Dark', 'System'] as const;

function overrideToOption(override: ColorSchemeOverride): (typeof appearanceOptions)[number] {
  if (override === 'light') return 'Light';
  if (override === 'dark') return 'Dark';
  return 'System';
}

function optionToOverride(option: (typeof appearanceOptions)[number]): ColorSchemeOverride {
  if (option === 'Light') return 'light';
  if (option === 'Dark') return 'dark';
  return null;
}

type NotificationDemo = NotificationPreview & { id: string; blurb: string };

const notificationDemos: NotificationDemo[] = [
  {
    id: 'free-machine',
    icon: MdSchedule,
    title: 'A dryer just opened up',
    message: 'JE Laundry has a free dryer during your 6:00 PM preferred time.',
    blurb: 'Free machine at preferred time',
  },
  {
    id: 'pickup',
    icon: MdNotificationsNone,
    title: 'Your laundry is done',
    message: "Washer 3 finished 2 min ago — swing by before someone else needs it.",
    blurb: 'Pickup reminders',
  },
];

const pingDemo: PingReceivedData = {
  senderName: 'Blueberry',
  location: 'Jonathan Edwards, Washer 3',
};

export default function ProfileScreen() {
  const theme = useTheme();
  const [identity, setIdentity] = useState<'fruit' | 'real'>('fruit');
  const [pingNotifications, setPingNotifications] = useState(true);
  const [pickupReminders, setPickupReminders] = useState(true);
  const [freeMachineAlert, setFreeMachineAlert] = useState(true);
  const [activeDays, setActiveDays] = useState<number[]>(defaultActiveDays);
  const { override, setOverride } = useColorSchemeOverride();
  const appearance = overrideToOption(override);
  const [previewNotification, setPreviewNotification] = useState<NotificationPreview | null>(null);
  const [pingPreviewVisible, setPingPreviewVisible] = useState(false);
  const [fruit, setFruit] = useState<FruitOption>(fruitOptions[0]);
  const [fruitPickerVisible, setFruitPickerVisible] = useState(false);
  const [preferredTime, setPreferredTime] = useState<TimeValue>({ hour: 6, minute: 0, period: 'PM' });
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  function toggleDay(index: number) {
    setActiveDays((current) =>
      current.includes(index) ? current.filter((d) => d !== index) : [...current, index],
    );
  }

  function handleFruityNicknamePress() {
    if (identity === 'fruit') {
      setFruitPickerVisible(true);
    } else {
      setIdentity('fruit');
    }
  }

  function showPointsInfo() {
    Alert.alert('How points work', pointsExplainer);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]} />
              <View style={[styles.avatarEditBadge, { backgroundColor: theme.text }]}>
                <Icon icon={MdOutlineEdit} size={13} color={theme.background} />
              </View>
            </View>
            <ThemedText style={styles.name}>Elihu Yale</ThemedText>

            <View style={styles.statsRow}>
              <ThemedText type="smallBold">{userStats.points} pts</ThemedText>
              <View style={[styles.statsDot, { backgroundColor: theme.textMuted }]} />
              <View style={styles.rankGroup}>
                <ThemedText type="smallBold">#{userStats.rank}</ThemedText>
                {userStats.trend !== 'same' && (
                  <View style={styles.trendGroup}>
                    <Icon
                      icon={userStats.trend === 'up' ? MdArrowUpward : MdArrowDownward}
                      size={17}
                      color={userStats.trend === 'up' ? '#1E8E3E' : '#D93025'}
                    />
                    <ThemedText
                      type="smallBold"
                      style={{ color: userStats.trend === 'up' ? '#1E8E3E' : '#D93025' }}>
                      {userStats.trendDelta}
                    </ThemedText>
                  </View>
                )}
              </View>
              <Pressable
                onPress={showPointsInfo}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="How do points work?"
                style={[styles.infoBadge, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText type="smallBold" themeColor="textSecondary" style={styles.infoBadgeLabel}>
                  ?
                </ThemedText>
              </Pressable>
            </View>

            <ThemedText type="small" themeColor="textMuted">
              {fruit.emoji} {fruit.name}
            </ThemedText>
          </View>

          <Section label="Display Name">
            <IdentityOption
              selected={identity === 'fruit'}
              onPress={handleFruityNicknamePress}
              label="Fruity Nickname"
              trailing={fruit.emoji}
              showChevron={identity === 'fruit'}
            />
            <IdentityOption
              selected={identity === 'real'}
              onPress={() => setIdentity('real')}
              label="Real Name"
            />
            <ThemedText type="small" themeColor="textMuted">
              Shown when you ping others or post to Lost & Found.
            </ThemedText>
          </Section>

          <Section label="Notifications">
            <ToggleRow
              label="Ping notifications"
              value={pingNotifications}
              onChange={setPingNotifications}
            />
            <ToggleRow
              label="Pickup reminders"
              value={pickupReminders}
              onChange={setPickupReminders}
            />
            <ToggleRow
              label="Free machine at preferred time"
              value={freeMachineAlert}
              onChange={setFreeMachineAlert}
            />
          </Section>

          <Section label="Preferred Laundry Time">
            <View style={styles.dayRow}>
              {days.map((day, index) => {
                const active = activeDays.includes(index);
                return (
                  <Pressable
                    key={index}
                    onPress={() => toggleDay(index)}
                    style={[
                      styles.dayPill,
                      { backgroundColor: active ? theme.text : theme.backgroundElement },
                    ]}>
                    <ThemedText
                      style={[
                        styles.dayLabel,
                        { color: active ? theme.background : theme.textSecondary },
                      ]}>
                      {day}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <Pressable onPress={() => setTimePickerVisible(true)}>
              <SelectRow value={formatTime(preferredTime)} />
            </Pressable>
          </Section>

          <Section label="Connect GCal">
            <Pressable
              onPress={() =>
                Alert.alert('Connect Google Calendar', 'Google Calendar sync is coming soon!')
              }
              style={({ pressed }) => [
                styles.gcalButton,
                { borderColor: theme.cardBorder, opacity: pressed ? 0.8 : 1 },
              ]}>
              <Icon icon={FcGoogle} size={18} />
              <ThemedText style={styles.gcalLabel}>Connect Google Calendar</ThemedText>
              <ThemedText themeColor="textMuted">{'›'}</ThemedText>
            </Pressable>
          </Section>

          <Section label="Preview Notifications">
            <ThemedText type="small" themeColor="textMuted">
              See what these alerts will look like once they're live.
            </ThemedText>
            <View style={styles.demoList}>
              <DemoButton
                icon={MdChatBubbleOutline}
                label="Ping notifications"
                onPress={() => setPingPreviewVisible(true)}
              />
              {notificationDemos.map((demo) => (
                <DemoButton
                  key={demo.id}
                  icon={demo.icon}
                  label={demo.blurb}
                  onPress={() => setPreviewNotification(demo)}
                />
              ))}
            </View>
          </Section>

          <Section label="Appearance">
            <View style={[styles.segmented, { backgroundColor: theme.backgroundElement }]}>
              {appearanceOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setOverride(optionToOverride(option))}
                  style={[
                    styles.segment,
                    appearance === option && { backgroundColor: theme.text },
                  ]}>
                  <ThemedText
                    style={[
                      styles.segmentLabel,
                      { color: appearance === option ? theme.background : theme.textMuted },
                    ]}>
                    {option}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </Section>

          <Pressable style={styles.signOut} onPress={() => router.replace('/')}>
            <ThemedText style={styles.signOutLabel}>Sign Out</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <NotificationToast
        data={previewNotification}
        onDismiss={() => setPreviewNotification(null)}
      />

      <PingReceivedNotification
        data={pingPreviewVisible ? pingDemo : null}
        onDismiss={() => setPingPreviewVisible(false)}
        onReply={() => {}}
      />

      <FruitPickerModal
        visible={fruitPickerVisible}
        selected={fruit.name}
        onClose={() => setFruitPickerVisible(false)}
        onSelect={(next) => {
          setFruit(next);
          setFruitPickerVisible(false);
        }}
      />

      <TimePickerModal
        visible={timePickerVisible}
        value={preferredTime}
        onClose={() => setTimePickerVisible(false)}
        onChange={setPreferredTime}
      />
    </ThemedView>
  );
}

function DemoButton({
  icon,
  label,
  onPress,
}: {
  icon: IconType;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.demoButton,
        { borderColor: theme.cardBorder, opacity: pressed ? 0.7 : 1 },
      ]}>
      <View style={[styles.demoIconBadge, { backgroundColor: theme.backgroundElement }]}>
        <Icon icon={icon} size={18} color={theme.text} />
      </View>
      <ThemedText style={styles.demoLabel}>{label}</ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        Preview
      </ThemedText>
    </Pressable>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="small" themeColor="textMuted" style={styles.sectionLabel}>
        {label.toUpperCase()}
      </ThemedText>
      {children}
    </View>
  );
}

function IdentityOption({
  selected,
  onPress,
  label,
  trailing,
  showChevron,
}: {
  selected: boolean;
  onPress: () => void;
  label: string;
  trailing?: string;
  showChevron?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.identityOption,
        { borderColor: selected ? theme.text : theme.cardBorder, borderWidth: selected ? 1.5 : 1 },
      ]}>
      <View
        style={[
          styles.radioDot,
          {
            borderColor: selected ? theme.text : theme.cardBorder,
            backgroundColor: selected ? theme.text : 'transparent',
          },
        ]}
      />
      <ThemedText style={styles.identityLabel}>{label}</ThemedText>
      {trailing && <ThemedText style={styles.identityTrailing}>{trailing}</ThemedText>}
      {showChevron && (
        <ThemedText themeColor="textMuted" style={styles.identityChevron}>
          ›
        </ThemedText>
      )}
    </Pressable>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.toggleRow}>
      <ThemedText style={styles.toggleLabel}>{label}</ThemedText>
      <AnimatedSwitch
        value={value}
        onValueChange={onChange}
        activeColor={theme.text}
        inactiveColor={theme.backgroundSelected}
        thumbColor={theme.background}
      />
    </View>
  );
}

function SelectRow({ value }: { value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.selectRow, { borderColor: theme.cardBorder }]}>
      <ThemedText style={styles.selectValue}>{value}</ThemedText>
      <ThemedText themeColor="textMuted">{'›'}</ThemedText>
    </View>
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
  header: {
    paddingVertical: Spacing.two,
    paddingTop: Spacing.two + WebTopTabBarInset,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.34,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  statsDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  rankGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  infoBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBadgeLabel: {
    fontSize: 11,
    lineHeight: 13,
  },
  avatarWrap: {
    width: 84,
    height: 84,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarEditBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    letterSpacing: 0.48,
    fontSize: 12,
  },
  identityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  identityLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  identityTrailing: {
    fontSize: 14,
  },
  identityChevron: {
    fontSize: 16,
    marginLeft: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    paddingRight: Spacing.two,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  demoList: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  demoIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: Spacing.two,
  },
  selectValue: {
    fontSize: 14,
  },
  gcalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: Spacing.two,
  },
  gcalLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  segmented: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 20,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 16,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  signOut: {
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  signOutLabel: {
    color: '#D42E2E',
    fontSize: 15,
    fontWeight: '600',
  },
});
