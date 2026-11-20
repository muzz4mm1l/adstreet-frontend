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
}

/**
 * AdStreet Concentric Radar Graphic (Ultra 60fps Native Performance)
 * - Single UI-thread animation clock driving all waves (zero multi-timer overhead)
 * - Zero offscreen render passes / zero dynamic rasterized shadows on animated layers
 * - 4 structural concentric rings matching master PDF
 * - Centered 3D ruby diamond emblem
 */
export const RadarGraphic: React.FC<RadarGraphicProps> = ({
  size = Math.min(SCREEN_WIDTH * 0.74, 300),
}) => {
  const isReducedMotion = useReducedMotion();

  // Single master clock for all ripple waves (0 to 1)
  const clock = useSharedValue(0);
  // Single subtle breathing clock for center emblem
  const breathe = useSharedValue(1);

  useEffect(() => {
    if (isReducedMotion) return;

    // Single linear loop for continuous radar wave emission
    clock.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Subtle jewel breathing
    breathe.value = withRepeat(
      withTiming(1.04, {
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [breathe, clock, isReducedMotion]);

  // Wave 0
  const wave0Style = useAnimatedStyle(() => {
    const p = clock.value;
    const scale = interpolate(p, [0, 1], [0.38, 1.04]);
    const opacity = interpolate(p, [0, 0.2, 0.65, 1], [0, 0.42, 0.18, 0]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Wave 1 (offset by 0.333)
  const wave1Style = useAnimatedStyle(() => {
    const p = (clock.value + 0.333) % 1;
    const scale = interpolate(p, [0, 1], [0.38, 1.04]);
    const opacity = interpolate(p, [0, 0.2, 0.65, 1], [0, 0.42, 0.18, 0]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Wave 2 (offset by 0.666)
  const wave2Style = useAnimatedStyle(() => {
    const p = (clock.value + 0.666) % 1;
    const scale = interpolate(p, [0, 1], [0.38, 1.04]);
    const opacity = interpolate(p, [0, 0.2, 0.65, 1], [0, 0.42, 0.18, 0]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Emblem breathing
  const emblemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  // Concentric circle diameters
  const ring1 = size * 0.42;
  const ring2 = size * 0.60;
  const ring3 = size * 0.78;
  const ring4 = size * 0.98;

  // Emblem size
  const emblemWidth = size * 0.26;
  const emblemHeight = emblemWidth * (102 / 97);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 1. Structural Baseline Concentric Rings */}
      <View style={[styles.absoluteCenter, { width: size, height: size }]}>
        <View
          style={[
            styles.baseRing,
            { width: ring4, height: ring4, borderRadius: ring4 / 2 },
          ]}
        />
        <View
          style={[
            styles.baseRing,
            { width: ring3, height: ring3, borderRadius: ring3 / 2 },
          ]}
        />
        <View
          style={[
            styles.baseRing,
            { width: ring2, height: ring2, borderRadius: ring2 / 2 },
          ]}
        />
        <View
          style={[
            styles.baseRing,
            { width: ring1, height: ring1, borderRadius: ring1 / 2 },
          ]}
        />
      </View>

      {/* 2. Active Outward Radar Wave Ripples (Hardware-accelerated) */}
      {!isReducedMotion && (
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

      {/* 3. Soft Ambient Glow (Zero Dynamic Shadow) */}
      <View
        style={[
          styles.ambientGlow,
          {
            width: emblemWidth * 1.5,
            height: emblemWidth * 1.5,
            borderRadius: (emblemWidth * 1.5) / 2,
          },
        ]}
      />

      {/* 4. Center 3D Ruby Diamond Emblem Image */}
      <Animated.View style={[styles.emblemContainer, emblemStyle]}>
        <Image
          source={require('@/assets/images/onboarding-emblem-clean.png')}
          style={{ width: emblemWidth, height: emblemHeight }}
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
  baseRing: {
    position: 'absolute',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'transparent',
  },
  rippleCircle: {
    position: 'absolute',
    borderWidth: 1.4,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  ambientGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  emblemContainer: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
