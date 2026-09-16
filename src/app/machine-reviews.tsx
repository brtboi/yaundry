import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { RATING_STAR_FILL } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  summarizeMachineReviews,
  useMachineReviews,
  type MachineKind,
  type MachineReviewSummary,
} from '@/hooks/use-machine-reviews';
import { rescoProfiles, useSelectedResco } from '@/hooks/use-selected-resco';
import { useTheme } from '@/hooks/use-theme';

export default function MachineReviewsScreen() {
  const theme = useTheme();
  const selectedResco = rescoProfiles[useSelectedResco()];
  const reviews = useMachineReviews();
  const summaries = summarizeMachineReviews(reviews);
  const washers = summaries
    .filter((item) => item.kind === 'Washer')
    .sort((a, b) => a.machineId - b.machineId);
  const dryers = summaries
    .filter((item) => item.kind === 'Dryer')
    .sort((a, b) => a.machineId - b.machineId);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable onPress={goBack} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
            <ThemedText type="small">Back</ThemedText>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heading}>
            <ThemedText style={styles.collegeName}>{selectedResco.name}</ThemedText>
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              Machine Reviews
            </ThemedText>
          </View>

          <ReviewSection title="Washers" items={washers} />
          <ReviewSection title="Dryers" items={dryers} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function ReviewSection({ title, items }: { title: string; items: MachineReviewSummary[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {items.map((item) => (
        <ReviewCard key={item.key} item={item} />
      ))}
    </View>
  );
}

function ReviewCard({ item }: { item: MachineReviewSummary }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
      <ThemedText style={styles.cardTitle}>
        {machineTitle(item.kind, item.machineId)}
      </ThemedText>
      <View style={styles.ratingRow}>
        <ThemedText type="small" themeColor="textMuted" style={styles.ratingValue}>
          {formatRating(item.rating)}
        </ThemedText>
        <Icon name="rating-star" size={15} color={RATING_STAR_FILL} />
      </View>
      {item.comment ? (
        <ThemedText themeColor="textSecondary" style={styles.cardBody}>
          {item.comment}
        </ThemedText>
      ) : null}
    </View>
  );
}

function machineTitle(kind: MachineKind, id: number) {
  return `${kind} ${id}`;
}

function formatRating(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
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
  topBar: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  heading: {
    gap: 8,
  },
  collegeName: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.48,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '400',
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.48,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.48,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: {
    fontSize: 12,
  },
  cardBody: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
});
