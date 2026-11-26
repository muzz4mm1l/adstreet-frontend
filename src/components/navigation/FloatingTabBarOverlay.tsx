import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeTab, LiquidTabBar } from '@/features/home/LiquidTabBar';

/** Bottom space pages reserve so their last content clears the floating tab bar. */
export const FLOATING_BAR_CLEARANCE = 100;

interface Props {
  active: HomeTab;
  onChange: (tab: HomeTab) => void;
  androidBlurTarget?: React.ComponentProps<typeof LiquidTabBar>['androidBlurTarget'];
}

/**
 * The single app-wide floating liquid-glass tab bar (the Home one). Mounted once in the app shell,
 * above every page, so it never slides or re-mounts while pages navigate underneath it.
 */
export const GlobalTabBar: React.FC<Props> = ({ active, onChange, androidBlurTarget }) => {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <LiquidTabBar active={active} onChange={onChange} androidBlurTarget={androidBlurTarget} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 20, right: 20, alignItems: 'center', zIndex: 30 },
});
