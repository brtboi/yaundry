import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, WebTopTabBarInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const defaultActiveDays = [1, 3];
const appearanceOptions = ['Light', 'Dark', 'System'] as const;

export default function ProfileScreen() {
  const theme = useTheme();
  const [identity, setIdentity] = useState<'fruit' | 'real'>('fruit');
  const [pingNotifications, setPingNotifications] = useState(true);
  const [pickupReminders, setPickupReminders] = useState(true);
  const [freeMachineAlert, setFreeMachineAlert] = useState(true);
  const [activeDays, setActiveDays] = useState<number[]>(defaultActiveDays);
  const [appearance, setAppearance] = useState<(typeof appearanceOptions)[number]>('Light');

  function toggleDay(index: number) {
    setActiveDays((current) =>
      current.includes(index) ? current.filter((d) => d !== index) : [...current, index],
    );
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
                <ThemedText style={[styles.avatarEditIcon, { color: theme.background }]}>
                  ✎
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.name}>Daniel Jay Park</ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              🍍 Pineapple
            </ThemedText>
          </View>

          <Section label="Display Name">
            <IdentityOption
              selected={identity === 'fruit'}
              onPress={() => setIdentity('fruit')}
              label="Fruity Nickname"
              trailing="🍍"
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
            <SelectRow value="6:00 PM" />
          </Section>

          <Section label="Connect GCal">
            <SelectRow value="Connect" />
          </Section>

          <Section label="Appearance">
            <View style={[styles.segmented, { backgroundColor: theme.backgroundElement }]}>
              {appearanceOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setAppearance(option)}
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
    </ThemedView>
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
}: {
  selected: boolean;
  onPress: () => void;
  label: string;
  trailing?: string;
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
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.backgroundSelected, true: theme.text }}
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
  avatarEditIcon: {
    fontSize: 12,
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
