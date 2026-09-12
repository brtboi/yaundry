import { Image } from 'expo-image';
import { router } from 'expo-router';
import { DimensionValue, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const mapChips: { label: string; top: DimensionValue; left: DimensionValue }[] = [
  { label: '3 W, 2 D', top: '18%', left: '38%' },
  { label: '3 W, 2 D', top: '30%', left: '12%' },
  { label: '4 W, 5 D', top: '22%', left: '78%' },
  { label: '2 W, 1 D', top: '55%', left: '10%' },
  { label: '1 W, 1 D', top: '70%', left: '32%' },
  { label: '0 W, 1 D', top: '58%', left: '84%' },
];

const listings = [
  {
    id: 'je',
    name: 'Jonathan Edwards',
    image: require('@/assets/images/illustrations/booking-listing-1.png'),
    rating: '5690 pts',
    distance: '1.2 miles',
    price: '1st',
    priceUnit: '/ 16 Laundry Rooms',
  },
  {
    id: 'placeholder',
    name: 'Location name',
    image: require('@/assets/images/illustrations/booking-listing-2.png'),
    rating: '4.7 (800 reviews)',
    distance: '1.5 miles',
    price: '$178',
    priceUnit: '/ night',
  },
];

export default function BookingScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement }]}>
          <Icon name="search" size={24} color={theme.textMuted} />
          <View style={styles.searchText}>
            <ThemedText style={styles.searchTitle}>Saybrook</ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              Under Entryway F
            </ThemedText>
            <View style={styles.searchMeta}>
              <ThemedText type="small" themeColor="textMuted">
                1 Washer (W)
              </ThemedText>
              <View style={[styles.dot, { backgroundColor: theme.textMuted }]} />
              <ThemedText type="small" themeColor="textMuted">
                2 Dryers (D)
              </ThemedText>
            </View>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Icon name="edit" size={22} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          <View style={[styles.filterChip, { borderColor: theme.cardBorder }]}>
            <ThemedText type="small">Filter</ThemedText>
          </View>
          <View style={[styles.filterChip, { borderColor: theme.cardBorder }]}>
            <ThemedText type="small">Sort</ThemedText>
          </View>
          <View style={styles.resultsCount}>
            <ThemedText type="small" themeColor="textMuted">
              16 results
            </ThemedText>
          </View>
        </View>

        <View style={[styles.map, { backgroundColor: theme.backgroundElement }]}>
          <Image
            source={require('@/assets/images/illustrations/booking-map.png')}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          {mapChips.map((chip, index) => (
            <View
              key={`${chip.label}-${index}`}
              style={[styles.mapChip, { top: chip.top, left: chip.left }]}>
              <ThemedText style={styles.mapChipText}>{chip.label}</ThemedText>
            </View>
          ))}
          <View style={[styles.mapChip, styles.mapChipActive, { top: '46%', left: '48%' }]}>
            <ThemedText style={[styles.mapChipText, styles.mapChipTextActive]}>
              1 W, 2 D
            </ThemedText>
          </View>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.listHandle, { backgroundColor: theme.cardBorder }]} />
          {listings.map((listing) => (
            <View key={listing.id} style={styles.listing}>
              <Image source={listing.image} style={styles.listingImage} contentFit="cover" />
              <View style={styles.listingInfo}>
                <ThemedText style={styles.listingName}>{listing.name}</ThemedText>
                <View style={styles.listingMetaRow}>
                  <View style={styles.listingMeta}>
                    <Icon name="star" size={16} color={theme.textMuted} />
                    <ThemedText type="small" themeColor="textMuted">
                      {listing.rating}
                    </ThemedText>
                  </View>
                  <View style={styles.listingMeta}>
                    <Icon name="map-pin" size={16} color={theme.textMuted} />
                    <ThemedText type="small" themeColor="textMuted">
                      {listing.distance}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.priceRow}>
                  <View style={styles.priceGroup}>
                    <ThemedText style={styles.price}>{listing.price}</ThemedText>
                    <ThemedText type="small" themeColor="textMuted">
                      {listing.priceUnit}
                    </ThemedText>
                  </View>
                  <Pressable
                    onPress={() => router.back()}
                    style={[styles.selectButton, { backgroundColor: theme.text }]}>
                    <ThemedText style={[styles.selectButtonLabel, { color: theme.background }]}>
                      Select
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    padding: Spacing.two,
    paddingLeft: Spacing.three,
    borderRadius: Spacing.three,
  },
  searchText: {
    flex: 1,
    gap: 2,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  resultsCount: {
    marginLeft: 'auto',
  },
  map: {
    height: 220,
    marginTop: Spacing.three,
    overflow: 'hidden',
  },
  mapChip: {
    position: 'absolute',
    backgroundColor: '#fcfeff',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  mapChipActive: {
    backgroundColor: '#000',
  },
  mapChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1b2228',
  },
  mapChipTextActive: {
    color: '#fff',
  },
  list: {
    flex: 1,
    marginTop: -Spacing.three,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.five,
  },
  listHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.two,
  },
  listing: {
    gap: Spacing.two,
  },
  listingImage: {
    width: '100%',
    height: 150,
    borderRadius: Spacing.two,
  },
  listingInfo: {
    gap: Spacing.one,
  },
  listingName: {
    fontSize: 14,
    fontWeight: '500',
  },
  listingMetaRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  listingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '500',
  },
  selectButton: {
    height: 32,
    width: 72,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
