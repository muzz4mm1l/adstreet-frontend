import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useReducedMotion,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RadarGraphicProps {
  size?: number;
  active?: boolean;
  isSpinning?: boolean;
}

/**
 * AdStreet Pristine Concentric Radar Graphic (Clean & Non-Overlapping)
 * - Anti-slop / high-taste visual craft per /design-taste-frontend
 * - Strictly eliminated conflicting static & moving duplicate lines
 * - 3 harmonic waves equidistant in phase (offset 0.333), maintaining constant ~72px separation
 * - Single UI-thread clock driving hardware-composited scale and opacity
 * - Delicate hairline strokes (1.0px) with smooth entrance and boundary dissipation
 */
export const RadarGraphic: React.FC<RadarGraphicProps> = ({
  size = Math.min(SCREEN_WIDTH * 0.74, 300),
  active = true,
  isSpinning = false,
}) => {
  const isReducedMotion = useReducedMotion();

  // Single master clock for all ripple waves (0 to 1 over 3400ms)
  const clock = useSharedValue(0);
  // Single subtle breathing clock for center emblem
  const breathe = useSharedValue(1);

  // Synchronized 3D spin & spatial alignment with Splash Screen
  const spinY = useSharedValue(0);
  const emblemScale = useSharedValue(1);
  const emblemTranslateY = useSharedValue(0);

  // Sync 3D Y-axis spin and coordinate landing with Splash Screen
  useEffect(() => {
    if (isSpinning && !isReducedMotion) {
      // 1. Match Splash Screen's 500ms lift height and scale
      emblemScale.value = 1.22 * 1.35; // 1.647x matches Splash displayEmblemSize * 1.22
      emblemTranslateY.value = -14;
      spinY.value = 0;

      // 2. 360° Y-axis spin in lockstep with Splash Screen (1500ms)
      spinY.value = withTiming(360, {
        duration: 1500,
        easing: Easing.inOut(Easing.cubic),
      });

      // 3. Smoothly settle scale and Y translation to exact 1:1 resting hub
      emblemScale.value = withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.cubic),
      });
      emblemTranslateY.value = withTiming(0, {
        duration: 1500,
        easing: Easing.inOut(Easing.cubic),
      });
    } else if (!isSpinning) {
      spinY.value = 0;
      emblemScale.value = 1;
      emblemTranslateY.value = 0;
    }
  }, [isSpinning, isReducedMotion, emblemScale, emblemTranslateY, spinY]);

  useEffect(() => {
    if (isReducedMotion || !active) {
      clock.value = 0;
      breathe.value = 1;
      return;
    }

    // Calm, luxury radar pulse cycle
    clock.value = withRepeat(
      withTiming(1, {
        duration: 3400,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Subtle jewel breathing
    breathe.value = withRepeat(
      withTiming(1.03, {
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [active, breathe, clock, isReducedMotion]);

  // Wave 0 (Phase: 0.0)
  const wave0Style = useAnimatedStyle(() => {
    const p = clock.value;
    const scale = interpolate(p, [0, 1], [0.30, 1.0]);
    const opacity = interpolate(p, [0, 0.15, 0.65, 0.90, 1], [0, 0.40, 0.20, 0.04, 0]);
    return {
      transform: [{ scale }],
      opacity: active ? opacity : 0,
    };
  });

  // Wave 1 (Phase: 0.333) - Strictly equidistant phase separation
  const wave1Style = useAnimatedStyle(() => {
    const p = (clock.value + 0.333) % 1;
    const scale = interpolate(p, [0, 1], [0.30, 1.0]);
    const opacity = interpolate(p, [0, 0.15, 0.65, 0.90, 1], [0, 0.40, 0.20, 0.04, 0]);
    return {
      transform: [{ scale }],
      opacity: active ? opacity : 0,
    };
  });

  // Wave 2 (Phase: 0.666) - Strictly equidistant phase separation
  const wave2Style = useAnimatedStyle(() => {
    const p = (clock.value + 0.666) % 1;
    const scale = interpolate(p, [0, 1], [0.30, 1.0]);
    const opacity = interpolate(p, [0, 0.15, 0.65, 0.90, 1], [0, 0.40, 0.20, 0.04, 0]);
    return {
      transform: [{ scale }],
      opacity: active ? opacity : 0,
    };
  });

  // Emblem breathing & 3D Y-axis spinning transform
  const emblemStyle = useAnimatedStyle(() => {
    const currentScale = isSpinning
      ? emblemScale.value
      : active
      ? breathe.value
      : 1;
    const currentTranslateY = isSpinning ? emblemTranslateY.value : 0;

    return {
      transform: [
        { perspective: 800 },
        { translateY: currentTranslateY },
        { scale: currentScale },
        { rotateY: `${spinY.value}deg` },
      ],
    };
  });

  // Emblem size (exact match with Splash Screen logo)
  const emblemSize = size * 0.26;
  const outerBoundarySize = size * 0.98;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 1. Subtle Outer Scope Boundary (ONLY shown when reduced motion or inactive to eliminate overlapping) */}
      {(isReducedMotion || !active) && (
        <View
          pointerEvents="none"
          style={[
            styles.outerBoundary,
            {
              width: outerBoundarySize,
              height: outerBoundarySize,
              borderRadius: outerBoundarySize / 2,
            },
          ]}
        />
      )}

      {/* 2. Static Concentric Rings (ONLY shown when reduced motion or inactive) */}
      {(isReducedMotion || !active) && (
        <View
          pointerEvents="none"
          style={[styles.absoluteCenter, { width: size, height: size }]}>
          <View
            style={[
              styles.fallbackRing,
              { width: size * 0.44, height: size * 0.44, borderRadius: (size * 0.44) / 2 },
            ]}
          />
          <View
            style={[
              styles.fallbackRing,
              { width: size * 0.68, height: size * 0.68, borderRadius: (size * 0.68) / 2 },
            ]}
          />
          <View
            style={[
              styles.fallbackRing,
              { width: size * 0.92, height: size * 0.92, borderRadius: (size * 0.92) / 2 },
            ]}
          />
        </View>
      )}

      {/* 3. Pure Active Harmonic Radar Waves (Equidistant, strictly non-overlapping) */}
      {!isReducedMotion && active && (
        <View
          pointerEvents="none"
          style={[styles.absoluteCenter, { width: size, height: size }]}>
          <Animated.View
            style={[
              styles.rippleCircle,
              { width: size, height: size, borderRadius: size / 2 },
              wave0Style,
            ]}
          />
          <Animated.View
            style={[
              styles.rippleCircle,
              { width: size, height: size, borderRadius: size / 2 },
              wave1Style,
            ]}
          />
          <Animated.View
            style={[
              styles.rippleCircle,
              { width: size, height: size, borderRadius: size / 2 },
              wave2Style,
            ]}
          />
        </View>
      )}

      {/* 4. Delicate Ambient Backlight behind Center Emblem */}
      <View
        style={[
          styles.ambientGlow,
          {
            width: emblemSize * 1.35,
            height: emblemSize * 1.35,
            borderRadius: (emblemSize * 1.35) / 2,
          },
        ]}
      />

      {/* 5. Center 3D Ruby Diamond Emblem Image (Exact asset matched to Splash Screen) */}
      <Animated.View style={[styles.emblemContainer, emblemStyle]}>
        <Image
          source={require('@/assets/images/splash-logo-clean.png')}
          style={{ width: emblemSize, height: emblemSize }}
          contentFit="contain"
          transition={0}
          cachePolicy="memory-disk"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
  },
  absoluteCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerBoundary: {
    position: 'absolute',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'transparent',
  },
  fallbackRing: {
    position: 'absolute',
    borderWidth: 1.0,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'transparent',
  },
  rippleCircle: {
    position: 'absolute',
    borderWidth: 1.0,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'transparent',
  },
  ambientGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  emblemContainer: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
});
