/**
 * Global App State / Store
 * Ready for React Context, Zustand, or Redux Toolkit
 */

export interface AppStoreState {
  isInitialized: boolean;
  themeMode: 'light' | 'dark' | 'system';
}

export const initialStoreState: AppStoreState = {
  isInitialized: false,
  themeMode: 'system',
};
