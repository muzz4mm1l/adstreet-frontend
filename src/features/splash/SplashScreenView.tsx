import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { GradientBackground } from '@/components/common/GradientBackground';
import { AnimationPresets } from '@/constants/theme';

interface SplashScreenViewProps {
  onFinish?: () => void;
  autoAdvance?: boolean;
}

export const SplashScreenView: React.FC<SplashScreenViewProps> = ({
  onFinish,
  autoAdvance = true,
}) => {
  const [stage, setStage] = useState<'splash01' | 'splash02'>('splash01');

  // Reanimated 60fps shared values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);

  useEffect(() => {
    let timer2: ReturnType<typeof setTimeout> | undefined;

    // Stage 1: Splash 01 (Pure Luxury Gradient) for 650ms
    const timer1 = setTimeout(() => {
      setStage('splash02');

      // Stage 2: Splash 02 - Animate Logo Entrance on UI thread
      logoOpacity.value = withTiming(1, { duration: 600 });
      logoScale.value = withSpring(1, AnimationPresets.spring);

      // Auto-advance safely on the JS thread after Splash 02 display (~1.4s)
      if (autoAdvance && onFinish) {
        timer2 = setTimeout(() => {
          onFinish();
        }, 1400);
      }
    }, 650);

    return () => {
      clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
    };
  }, [autoAdvance, logoOpacity, logoScale, onFinish]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <GradientBackground style={styles.container}>
      <StatusBar style="light" />

      {/* Tap anywhere to skip splash if reviewing */}
      <TouchableOpacity
        style={styles.touchable}
        activeOpacity={1}
        onPress={() => onFinish?.()}>
        {stage === 'splash02' && (
          <Animated.View style={[styles.logoWrapper, animatedLogoStyle]}>
            <Image
              source={require('@/assets/images/splash-logo-clean.png')}
              style={styles.logoImage}
              contentFit="contain"
              transition={200}
              cachePolicy="memory-disk"
            />
          </Animated.View>
        )}
      </TouchableOpacity>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  logoImage: {
    width: 160,
    height: 160,
  },
});
