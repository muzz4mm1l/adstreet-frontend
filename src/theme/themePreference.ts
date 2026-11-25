import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** User choice for the app appearance. `system` follows the phone setting. */
export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'adstreet.themePreference';
let current: ThemePreference = 'system';
const listeners = new Set<() => void>();

const isPref = (v: unknown): v is ThemePreference => v === 'system' || v === 'light' || v === 'dark';

const apply = (pref: ThemePreference) => {
  current = pref;
  try {
    // also flips native chrome (alerts, keyboards, pickers) to match
    Appearance.setColorScheme?.(pref === 'system' ? 'unspecified' : pref);
  } catch {
    // not available on every platform; the in-app tokens still follow `current`
  }
  listeners.forEach((l) => l());
};

export function setThemePreference(pref: ThemePreference) {
  apply(pref);
  AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {});
}

/** Reads the saved choice once at startup (resolves even when storage fails). */
export async function loadThemePreference(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (isPref(saved)) apply(saved);
  } catch {
    // keep `system`
  }
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const getThemePreference = () => current;

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribe, getThemePreference, getThemePreference);
}
