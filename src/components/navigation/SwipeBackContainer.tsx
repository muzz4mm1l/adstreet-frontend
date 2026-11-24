import React, { useEffect } from 'react';
import { BackHandler, View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface SwipeBackContainerProps {
  children: React.ReactNode;
  onBack?: () => void;
  enabled?: boolean;
}

/**
 * SwipeBackContainer
 * - Android Hardware & System Navigation Back: Listens to BackHandler with haptic feedback
 * - iOS & Android Left-Edge Swipe Gesture: Detects rightward swipe starting within 60px of the edge
 * - Fails on vertical scroll to preserve full ScrollView/FlatList gesture fidelity
 */
export const SwipeBackContainer: React.FC<SwipeBackContainerProps> = ({
  children,
  onBack,
  enabled = true,
}) => {
  // 1. Android Hardware & System Back Navigation
  useEffect(() => {
    if (!enabled || !onBack) return;

    const handleHardwareBack = () => {
      Haptics.selectionAsync().catch(() => {});
      onBack();
      return true; // Consume event to prevent accidental app exit
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleHardwareBack
    );

    return () => subscription.remove();
  }, [enabled, onBack]);

  // 2. iOS & Android System Swipe-From-Left-Edge Back Gesture
  const triggerBack = () => {
    Haptics.selectionAsync().catch(() => {});
    onBack?.();
  };

  const panGesture = Gesture.Pan()
    .enabled(enabled && !!onBack)
    .hitSlop({ left: 0, width: 45 })
    .activeOffsetX([15, 1000])
    .failOffsetY([-20, 20])
    .cancelsTouchesInView(false)
    .onEnd((e) => {
      'worklet';
      if (e.translationX > 60 || e.velocityX > 350) {
        runOnJS(triggerBack)();
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>{children}</View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
