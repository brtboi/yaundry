import { useSyncExternalStore } from 'react';

export type MachineKind = 'Washer' | 'Dryer';

export type MachineReview = {
  id: string;
  kind: MachineKind;
  machineId: number;
  rating: number;
  comment: string;
};

export type MachineReviewSummary = {
  key: string;
  kind: MachineKind;
  machineId: number;
  rating: number;
  comment: string;
};

const seedReviews: MachineReview[] = [
  {
    id: 'washer-1',
    kind: 'Washer',
    machineId: 1,
    rating: 3.6,
    comment: 'Required 2 cycles on a relatively light load on various days that I did laundry.',
  },
  {
    id: 'washer-2',
    kind: 'Washer',
    machineId: 2,
    rating: 4.5,
    comment: 'This machine actually dissolves my tide pods!!!',
  },
  {
    id: 'dryer-1',
    kind: 'Dryer',
    machineId: 1,
    rating: 3.2,
    comment: 'Use this dryer if you love damp clothes T_T',
  },
];

let reviews: MachineReview[] = seedReviews;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function addMachineReview(review: Omit<MachineReview, 'id'>) {
  reviews = [
    {
      ...review,
      id: `${review.kind}-${review.machineId}-${Date.now()}`,
    },
    ...reviews,
  ];
  emit();
}

export function useMachineReviews() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => reviews,
    () => reviews,
  );
}

export function summarizeMachineReviews(items: MachineReview[]): MachineReviewSummary[] {
  const grouped = new Map<string, MachineReview[]>();
  for (const review of items) {
    const key = `${review.kind}-${review.machineId}`;
    const existing = grouped.get(key);
    if (existing) existing.push(review);
    else grouped.set(key, [review]);
  }

  return [...grouped.entries()].map(([key, group]) => {
    const latest = group[0];
    const rating = group.reduce((sum, item) => sum + item.rating, 0) / group.length;
    return {
      key,
      kind: latest.kind,
      machineId: latest.machineId,
      rating: Math.round(rating * 10) / 10,
      comment: latest.comment,
    };
  });
}
