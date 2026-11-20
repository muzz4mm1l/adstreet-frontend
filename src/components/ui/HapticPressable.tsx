import React, { useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimationPresets, Radii } from '@/constants/theme';

export type HapticFeedbackType =
  | 'none'
  | 'selection'
  | 'light'
  | 'medium'
  | 'success'
  | 'error';

export interface HapticPressableProps extends Omit<PressableProps, 'style'> {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: HapticFeedbackType;
  scaleTo?: number;
  borderRadius?: number;
  rippleColor?: string;
  enableScaleAnimation?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * AdStreet 60fps UI-Thread Haptic Pressable
 * - UI-thread GPU-composited spring scaling (0.96) via Reanimated
 * - Respects accessibility reduced-motion settings
 * - Cross-platform haptic feedback via `expo-haptics`
 * - Android ripple clipped within exact border radius
 */
export const HapticPressable: React.FC<HapticPressableProps> = ({
  children,
  style,
  haptic = 'light',
  scaleTo = AnimationPresets.pressScale,
  borderRadius = Radii.md,
  rippleColor = 'rgba(227, 30, 36, 0.12)',
  enableScaleAnimation = true,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...restProps
}) => {
  const isReducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const triggerHaptic = useCallback(async () => {
    if (disabled || haptic === 'none') return;
    try {
      switch (haptic) {
        case 'selection':
          await Haptics.selectionAsync();
          break;
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch {
      // Graceful fallback on devices/emulators without haptics support
    }
  }, [disabled, haptic]);

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (!disabled && enableScaleAnimation && !isReducedMotion) {
        scale.value = withSpring(scaleTo, AnimationPresets.spring);
      }
      onPressIn?.(event);
    },
    [disabled, enableScaleAnimation, isReducedMotion, onPressIn, scale, scaleTo]
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      if (!disabled && enableScaleAnimation && !isReducedMotion) {
        scale.value = withSpring(1, AnimationPresets.spring);
      }
      onPressOut?.(event);
    },
    [disabled, enableScaleAnimation, isReducedMotion, onPressOut, scale]
  );

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      triggerHaptic();
      onPress?.(event);
    },
    [onPress, triggerHaptic]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      android_ripple={{
        color: rippleColor,
        borderless: false,
      }}
      style={[
        styles.base,
        { borderRadius },
        animatedStyle,
        style,
      ]}
      {...restProps}>
      {children}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
