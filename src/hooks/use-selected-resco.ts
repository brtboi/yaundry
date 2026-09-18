import { useSyncExternalStore } from 'react';

export type RescoId =
  | 'je'
  | 'benfrank'
  | 'saybrook'
  | 'trumbull'
  | 'davenport'
  | 'pierson'
  | 'branford'
  | 'bingham'
  | 'farnam';

export const rescoProfiles = {
  je: {
    name: 'Jonathan Edwards',
    shield: require('@/assets/images/illustrations/je-shield.png'),
    bannerLight: '#DFFFD8',
    bannerDark: '#173A22',
  },
  benfrank: {
    name: 'Benjamin Franklin',
    shield: require('@/assets/images/illustrations/bf-shield.png'),
    bannerLight: '#F5C5C9',
    bannerDark: '#3A1418',
  },
  saybrook: {
    name: 'Saybrook',
    shield: require('@/assets/images/illustrations/saybrook-shield.png'),
    bannerLight: '#D4E6F7',
    bannerDark: '#12344F',
  },
  trumbull: {
    name: 'Trumbull',
    shield: require('@/assets/images/illustrations/trumbull-shield.png'),
    bannerLight: '#EDE6DC',
    bannerDark: '#2A241C',
  },
  davenport: {
    name: 'Davenport',
    shield: require('@/assets/images/illustrations/davenport-shield.png'),
    bannerLight: '#E4E8EE',
    bannerDark: '#1B1E24',
  },
  pierson: {
    name: 'Pierson',
    shield: require('@/assets/images/illustrations/pierson-shield.png'),
    bannerLight: '#FFF3A8',
    bannerDark: '#2C2408',
  },
  branford: {
    name: 'Branford',
    shield: require('@/assets/images/illustrations/branford-shield.png'),
    bannerLight: '#D3F0E4',
    bannerDark: '#12382C',
  },
  bingham: {
    name: 'Bingham',
    shield: require('@/assets/images/illustrations/yale-shield.png'),
    bannerLight: '#D3DFEE',
    bannerDark: '#0C1F38',
  },
  farnam: {
    name: 'Farnam',
    shield: require('@/assets/images/illustrations/yale-shield.png'),
    bannerLight: '#D3DFEE',
    bannerDark: '#0C1F38',
  },
} as const;

export const laundryInventory: Record<RescoId, { washers: number; dryers: number }> = {
  je: { washers: 5, dryers: 8 },
  benfrank: { washers: 5, dryers: 8 },
  saybrook: { washers: 1, dryers: 2 },
  trumbull: { washers: 3, dryers: 2 },
  davenport: { washers: 3, dryers: 2 },
  pierson: { washers: 2, dryers: 1 },
  branford: { washers: 1, dryers: 2 },
  bingham: { washers: 0, dryers: 1 },
  farnam: { washers: 4, dryers: 5 },
};

let selectedRescoId: RescoId = 'je';
const listeners = new Set<() => void>();

export function setSelectedResco(id: RescoId) {
  if (selectedRescoId === id) return;
  selectedRescoId = id;
  listeners.forEach((listener) => listener());
}

export function useSelectedResco() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => selectedRescoId,
    () => selectedRescoId
  );
}
