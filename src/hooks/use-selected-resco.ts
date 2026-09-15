import { useSyncExternalStore } from 'react';

export type RescoId = 'je' | 'benfrank';

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
} as const;

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
