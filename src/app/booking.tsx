import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { DimensionValue, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { laundryInventory, setSelectedResco, type RescoId } from '@/hooks/use-selected-resco';
import { useTheme } from '@/hooks/use-theme';

type LaundryRoom = {
  id: RescoId;
  name: string;
  entryway: string;
  washers: number;
  dryers: number;
  top: DimensionValue;
  left: DimensionValue;
};

const laundryRooms: LaundryRoom[] = [
  {
    id: 'trumbull',
    name: 'Trumbull',
    entryway: 'Under Entryway C',
    ...laundryInventory.trumbull,
    top: '18%',
    left: '38%',
  },
  {
    id: 'davenport',
    name: 'Davenport',
    entryway: 'Under Entryway G',
    ...laundryInventory.davenport,
    top: '30%',
    left: '12%',
  },
  {
    id: 'farnam',
    name: 'Farnam',
    entryway: 'Under Entryway A',
    ...laundryInventory.farnam,
    top: '22%',
    left: '78%',
  },
  {
    id: 'pierson',
    name: 'Pierson',
    entryway: 'Under Entryway B',
    ...laundryInventory.pierson,
    top: '55%',
    left: '10%',
  },
  {
    id: 'branford',
    name: 'Branford',
    entryway: 'Under Entryway K',
    ...laundryInventory.branford,
    top: '70%',
    left: '32%',
  },
  {
    id: 'bingham',
    name: 'Bingham',
    entryway: 'Under Entryway D',
    ...laundryInventory.bingham,
    top: '58%',
    left: '84%',
  },
  {
    id: 'saybrook',
    name: 'Saybrook',
    entryway: 'Under Entryway F',
    ...laundryInventory.saybrook,
    top: '46%',
    left: '48%',
  },
];

function machineCountLabel(count: number, singular: string, abbreviation: string) {
  return `${count} ${singular}${count === 1 ? '' : 's'} (${abbreviation})`;
}

const listings: {
  id: RescoId;
  name: string;
  image: number;
  rating: string;
  distance: string;
  price: string;
  priceUnit: string;
}[] = [
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
    id: 'benfrank',
    name: 'Benjamin Franklin',
    image: require('@/assets/images/illustrations/booking-listing-benfrank.jpg'),
    rating: '2990 pts',
    distance: '2.7 miles',
    price: '11th',
    priceUnit: '/ 16 Laundry Rooms',
  },
  {
    id: 'saybrook',
    name: 'Saybrook',
    image: require('@/assets/images/illustrations/booking-listing-saybrook.jpg'),
    rating: '3895 pts',
    distance: '1.7 miles',
    price: '2nd',
    priceUnit: '/ 16 Laundry Rooms',
  },
  {
    id: 'trumbull',
    name: 'Trumbull',
    image: require('@/assets/images/illustrations/booking-listing-trumbull.jpg'),
    rating: '2800 pts',
    distance: '0.7 miles',
    price: '9th',
    priceUnit: '/ 16 Laundry Rooms',
  },
  {
    id: 'davenport',
    name: 'Davenport',
    image: require('@/assets/images/illustrations/booking-listing-davenport.jpg'),
    rating: '1000 pts',
    distance: '1.3 miles',
    price: '12th',
    priceUnit: '/ 16 Laundry Rooms',
  },
  {
    id: 'pierson',
    name: 'Pierson',
    image: require('@/assets/images/illustrations/booking-listing-pierson.jpg'),
    rating: '700 pts',
    distance: '0.9 miles',
    price: '16th',
    priceUnit: '/ 16 Laundry Rooms',
  },
  {
    id: 'branford',
    name: 'Branford',
    image: require('@/assets/images/illustrations/booking-listing-branford.png'),
    rating: '1200 pts',
    distance: '0.5 miles',
    price: '6th',
    priceUnit: '/ 16 Laundry Rooms',
  },
  {
    id: 'bingham',
    name: 'Bingham',
    image: require('@/assets/images/illustrations/booking-listing-bingham.jpg'),
    rating: '800 pts',
    distance: '0.3 miles',
    price: '15th',
    priceUnit: '/ 16 Laundry Rooms',
  },
  {
    id: 'farnam',
    name: 'Farnam',
    image: require('@/assets/images/illustrations/booking-listing-farnam.png'),
    rating: '1100 pts',
    distance: '0.2 miles',
    price: '14th',
    priceUnit: '/ 16 Laundry Rooms',
  }
];

export default function BookingScreen() {
  const theme = useTheme();
  const listRef = useRef<ScrollView>(null);
  const [selectedRoomId, setSelectedRoomId] = useState('saybrook');
  const selectedRoom = laundryRooms.find((room) => room.id === selectedRoomId) ?? laundryRooms[0];
  const orderedListings = useMemo(() => {
    const selectedListing = listings.find((listing) => listing.id === selectedRoomId);
    if (!selectedListing) return listings;
    return [selectedListing, ...listings.filter((listing) => listing.id !== selectedRoomId)];
  }, [selectedRoomId]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement }]}>
          <Icon name="search" size={26} color={theme.textMuted} />
          <View style={styles.searchText}>
            <ThemedText style={styles.searchTitle}>{selectedRoom.name}</ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {selectedRoom.entryway}
            </ThemedText>
            <View style={styles.searchMeta}>
              <ThemedText type="small" themeColor="textMuted">
                {machineCountLabel(selectedRoom.washers, 'Washer', 'W')}
              </ThemedText>
              <View style={[styles.dot, { backgroundColor: theme.textMuted }]} />
              <ThemedText type="small" themeColor="textMuted">
                {machineCountLabel(selectedRoom.dryers, 'Dryer', 'D')}
              </ThemedText>
            </View>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Icon name="edit" size={24} color={theme.text} />
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
          {laundryRooms.map((room) => {
            const selected = room.id === selectedRoomId;
            return (
              <Pressable
                key={room.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${room.name}, ${machineCountLabel(room.washers, 'Washer', 'W')}, ${machineCountLabel(room.dryers, 'Dryer', 'D')}`}
                onPress={() => {
                  setSelectedRoomId(room.id);
                  listRef.current?.scrollTo({ y: 0, animated: true });
                }}
                style={[
                  styles.mapChip,
                  selected && styles.mapChipActive,
                  { top: room.top, left: room.left },
                ]}>
                <ThemedText style={[styles.mapChipText, selected && styles.mapChipTextActive]}>
                  {room.washers} W, {room.dryers} D
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          ref={listRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.listHandle, { backgroundColor: theme.cardBorder }]} />
          {orderedListings.map((listing) => (
            <View key={listing.id} style={styles.listing}>
              <Image source={listing.image} style={styles.listingImage} contentFit="cover" />
              <View style={styles.listingInfo}>
                <ThemedText style={styles.listingName}>{listing.name}</ThemedText>
                <View style={styles.listingMetaRow}>
                  <View style={styles.listingMeta}>
                    <Icon name="star" size={18} color={theme.textMuted} />
                    <ThemedText type="small" themeColor="textMuted">
                      {listing.rating}
                    </ThemedText>
                  </View>
                  <View style={styles.listingMeta}>
                    <Icon name="map-pin" size={18} color={theme.textMuted} />
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
                    onPress={() => {
                      setSelectedResco(listing.id);
                      if (router.canGoBack()) {
                        router.back();
                      } else {
                        router.replace('/home');
                      }
                    }}
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
