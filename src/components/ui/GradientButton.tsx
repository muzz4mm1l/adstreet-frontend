import React, { useCallback } from 'react';
import {
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
  GestureResponderEvent,
  Pressable,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimationPresets, Radii } from '@/constants/theme';

export interface GradientButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  showArrow?: boolean;
  haptic?: 'light' | 'medium' | 'success' | 'none';
  borderRadius?: number;
  height?: number;
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * AdStreet Premium Red Gradient Button
 * - 3-stop rich gradient: #FF454D (bright coral) -> #ED1C24 (crimson) -> #C90018 (deep ruby)
 * - Calibrated red-tinted glow shadow
 * - Full pill radius
 * - UI-thread Reanimated 60fps micro-spring press physics
 * - Synchronized expo-haptics
 */
export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  showArrow = false,
  haptic = 'medium',
  borderRadius = Radii.pill,
  height = 52,
  hitSlop = { top: 10, bottom: 10, left: 12, right: 12 },
}) => {
  const isReducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const triggerHaptic = useCallback(async () => {
    if (disabled || haptic === 'none') return;
    try {
      if (haptic === 'medium') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (haptic === 'light') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (haptic === 'success') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {}
  }, [disabled, haptic]);

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (!disabled && !isReducedMotion) {
        scale.value = withSpring(0.97, AnimationPresets.spring);
      }
    },
    [disabled, isReducedMotion, scale]
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      if (!disabled && !isReducedMotion) {
        scale.value = withSpring(1, AnimationPresets.spring);
      }
    },
    [disabled, isReducedMotion, scale]
  );

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (disabled || loading) return;
      triggerHaptic();
      onPress?.(event);
    },
    [disabled, loading, onPress, triggerHaptic]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      hitSlop={hitSlop}
      style={[
        styles.shadowWrapper,
        { borderRadius, height },
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}>
      <LinearGradient
        colors={['#FF454D', '#ED1C24', '#C90018']}
        locations={[0, 0.48, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.gradient, { borderRadius, height }]}>
        <View style={styles.contentRow}>
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          {showArrow && (
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
              style={styles.arrowIcon}
            />
          )}
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    width: '100%',
    shadowColor: '#DC1428',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 6,
  },
  gradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  arrowIcon: {
    marginStart: 8,
  },
  disabled: {
    opacity: 0.65,
  },
});
