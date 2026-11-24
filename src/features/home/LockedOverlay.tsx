import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeIn,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const GOLD = '#FFC72C';

interface LockedOverlayProps {
  /** Increment to play the "tap on a locked card" rattle. */
  ping?: number;
}

/**
 * "Coming soon" lock for a card: blur + dim fade in, a golden lock pops in, breathes with a soft
 * glow ring and periodically wiggles. A tap (ping) rattles it harder.
 * Everything is transform / opacity on the UI thread.
 */
export const LockedOverlay: React.FC<LockedOverlayProps> = ({ ping = 0 }) => {
  const reduceMotion = useReducedMotion();
  const pop = useSharedValue(reduceMotion ? 1 : 0);
  const wiggle = useSharedValue(0);
  const glow = useSharedValue(0);
  const rattle = useSharedValue(0);
  const bump = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pop.value = withDelay(220, withSpring(1, { damping: 9, stiffness: 180, mass: 0.7 }));
    // soft expanding ring, forever
    glow.value = withDelay(
      500,
      withRepeat(withTiming(1, { duration: 1900, easing: Easing.out(Easing.quad) }), -1, false),
    );
    // little shackle wiggle every few seconds
    wiggle.value = withDelay(
      1400,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 80 }),
          withTiming(12, { duration: 110 }),
          withTiming(-8, { duration: 90 }),
          withTiming(8, { duration: 90 }),
          withTiming(0, { duration: 80 }),
          withDelay(2600, withTiming(0, { duration: 1 })),
        ),
        -1,
        false,
      ),
    );
    return () => {
      cancelAnimation(glow);
      cancelAnimation(wiggle);
    };
  }, [reduceMotion, pop, glow, wiggle]);

  // tap on the locked card
  useEffect(() => {
    if (ping === 0) return;
    rattle.value = withSequence(
      withTiming(-16, { duration: 55 }),
      withTiming(16, { duration: 80 }),
      withTiming(-12, { duration: 70 }),
      withTiming(12, { duration: 70 }),
      withTiming(0, { duration: 60 }),
    );
    bump.value = withSequence(withTiming(1, { duration: 90 }), withSpring(0, { damping: 8, stiffness: 240 }));
  }, [ping, rattle, bump]);

  const lockStyle = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [
      { scale: (0.3 + pop.value * 0.7) * (1 + bump.value * 0.18) },
      { translateX: rattle.value * 0.5 },
      { rotate: `${wiggle.value + rattle.value * 0.6}deg` },
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: (1 - glow.value) * 0.55,
    transform: [{ scale: 1 + glow.value * 0.9 }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden>
      <BlurView
        intensity={Platform.OS === 'ios' ? 28 : 40}
        tint="dark"
        blurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.dim} />
      <View style={styles.center}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <Animated.View style={[styles.badge, lockStyle]}>
          <Ionicons name="lock-closed" size={24} color={GOLD} />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.flatten({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }),
    backgroundColor: 'rgba(10, 10, 14, 0.34)',
  },
  center: {
    ...StyleSheet.flatten({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: GOLD,
  },
  badge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 18, 22, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 44, 0.55)',
  },
});
