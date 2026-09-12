import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, WebTopTabBarInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Entry = { rank: number; name: string; points: number };

const individuals: Entry[] = [
  { rank: 1, name: 'Azul Rangel', points: 980 },
  { rank: 2, name: 'Jonathan Edwards', points: 860 },
  { rank: 3, name: 'Theodore Dwight Woolsey', points: 795 },
  { rank: 4, name: 'Elihu Yale', points: 640 },
  { rank: 5, name: 'Grace Hopper', points: 512 },
  { rank: 6, name: 'Maurie McInnis', points: 312 },
  { rank: 999, name: 'John Harvard', points: -1012 },
];

const colleges: Entry[] = [
  { rank: 1, name: 'Jonathan Edwards', points: 4210 },
  { rank: 2, name: 'Saybrook', points: 3895 },
  { rank: 3, name: 'Silliman', points: 3640 },
  { rank: 4, name: 'Berkeley', points: 3102 },
  { rank: 5, name: 'Pierson', points: 2874 },
  { rank: 6, name: 'Timothy Dwight', points: 2510 },
];

const rankPalette: Record<number, { bg: string; text: string }> = {
  1: { bg: '#FFDB66', text: '#735200' },
  2: { bg: '#D9DEE3', text: '#4D5259' },
  3: { bg: '#EDB88C', text: '#73380D' },
};

export default function LeaderboardScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<'individual' | 'college'>('individual');
  const entries = tab === 'individual' ? individuals : colleges;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Leaderboard</ThemedText>
        </View>

        <ThemedText type="small" themeColor="textMuted" style={styles.blurb}>
          Earn points for on-time pickups, clean lint traps, quick pings, off-peak loads, lost &
          found posts, ratings & referrals
        </ThemedText>

        <View style={[styles.tabs, { backgroundColor: theme.backgroundElement }]}>
          <Pressable
            onPress={() => setTab('individual')}
            style={[styles.tab, tab === 'individual' && { backgroundColor: theme.text }]}>
            <ThemedText
              style={[styles.tabLabel, { color: tab === 'individual' ? theme.background : theme.textMuted }]}>
              Individual
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setTab('college')}
            style={[styles.tab, tab === 'college' && { backgroundColor: theme.text }]}>
            <ThemedText
              style={[styles.tabLabel, { color: tab === 'college' ? theme.background : theme.textMuted }]}>
              Residential College
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.list}>
          {entries.map((entry) => {
            const palette = rankPalette[entry.rank] ?? {
              bg: theme.backgroundElement,
              text: theme.textSecondary,
            };
            return (
              <View key={entry.rank} style={styles.row}>
                <View style={[styles.rankBadge, { backgroundColor: palette.bg }]}>
                  <ThemedText style={[styles.rankText, { color: palette.text }]}>
                    {entry.rank}
                  </ThemedText>
                </View>
                <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]} />
                <ThemedText style={styles.name} numberOfLines={1}>
                  {entry.name}
                </ThemedText>
                <ThemedText style={styles.points}>{entry.points} pts</ThemedText>
              </View>
            );
          })}
        </View>
      </SafeAreaView>
    </ThemedView>
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
  blurb: {
    marginTop: Spacing.two,
    lineHeight: 18,
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: 4,
    borderRadius: 24,
    marginTop: Spacing.three,
    alignSelf: 'flex-start',
  },
  tab: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    marginTop: Spacing.three,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
  },
});
