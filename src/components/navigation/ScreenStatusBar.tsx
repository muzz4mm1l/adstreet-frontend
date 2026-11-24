import React from 'react';
import { StatusBar, StatusBarProps } from 'expo-status-bar';
import { useIsPeek } from './SwipeBackContainer';

/**
 * Drop-in for expo-status-bar's StatusBar. Renders nothing inside the swipe-back preview
 * layer, so the screen being revealed underneath never flips the status bar style mid-drag.
 */
export const ScreenStatusBar: React.FC<StatusBarProps> = (props) => {
  const inPeek = useIsPeek();
  return inPeek ? null : <StatusBar {...props} />;
};
