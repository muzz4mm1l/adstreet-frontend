import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Region {
  id: string;
  city: string;
  country: string; // short code shown after the city, e.g. "Pk"
  flag: string;
}

export const REGIONS: Region[] = [
  { id: 'karachi', city: 'Karachi', country: 'Pk', flag: '🇵🇰' },
  { id: 'lahore', city: 'Lahore', country: 'Pk', flag: '🇵🇰' },
  { id: 'islamabad', city: 'Islamabad', country: 'Pk', flag: '🇵🇰' },
  { id: 'dubai', city: 'Dubai', country: 'Ae', flag: '🇦🇪' },
  { id: 'riyadh', city: 'Riyadh', country: 'Sa', flag: '🇸🇦' },
  { id: 'london', city: 'London', country: 'Uk', flag: '🇬🇧' },
];

const KEY = 'adstreet.region';
let current: Region = REGIONS[0];
const listeners = new Set<() => void>();

export function setRegion(r: Region) {
  current = r;
  listeners.forEach((l) => l());
  AsyncStorage.setItem(KEY, r.id).catch(() => {});
}

AsyncStorage.getItem(KEY)
  .then((id) => {
    const found = REGIONS.find((r) => r.id === id);
    if (found && found !== current) {
      current = found;
      listeners.forEach((l) => l());
    }
  })
  .catch(() => {});

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const useRegion = (): Region =>
  useSyncExternalStore(subscribe, () => current, () => current);
