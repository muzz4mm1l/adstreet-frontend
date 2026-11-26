import React, { useEffect, useState } from 'react';
import {
  Platform,
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  AccessibilityInfo,
} from 'react-native';
import { BlurView, BlurTint } from 'expo-blur';
import {
  GlassView,
  isLiquidGlassAvailable,
  isGlassEffectAPIAvailable,
  GlassStyle,
} from 'expo-glass-effect';
import { Radii, Shadows, SurfaceColors } from '@/constants/theme';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  glassStyle?: GlassStyle;
  intensity?: number;
  tint?: BlurTint;
  fallbackColor?: string;
  elevation?: number;
  /** Pin the native glass to a scheme instead of following the system (e.g. always-dark chrome). */
  colorScheme?: 'auto' | 'light' | 'dark';
}

/**
 * AdStreet Adaptive Glass Surface
 * - iOS 26+: Native Liquid Glass via `expo-glass-effect`
 * - iOS < 26: Hardware-accelerated `expo-blur` (BlurView)
 * - Accessibility: Falls back to solid white when Reduce Transparency is enabled
 * - Android: 60fps GPU-light frosted surface with hairline border and crisp elevation
 */
export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  borderRadius = Radii.lg,
  glassStyle = 'regular',
  intensity = 50,
  tint = Platform.OS === 'ios' ? ('systemChromeMaterialLight' as BlurTint) : 'light',
  fallbackColor = 'rgba(255, 255, 255, 0.92)',
  elevation = 6,
  colorScheme = 'auto',
}) => {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // react-native-web does not implement this API; guard so web never throws
    if (typeof AccessibilityInfo.isReduceTransparencyEnabled !== 'function') {
      return;
    }

    // Check accessibility setting for reduced transparency
    AccessibilityInfo.isReduceTransparencyEnabled()
      .then((enabled) => {
        if (isMounted) {
          setReduceTransparency(enabled);
        }
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      (enabled) => {
        if (isMounted) {
          setReduceTransparency(enabled);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  const containerStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
  };

  // 1. Accessibility Override (Solid Surface when transparency is reduced)
  if (reduceTransparency) {
    return (
      <View
        style={[
          styles.solidFallback,
          containerStyle,
          colorScheme === 'dark'
            ? { backgroundColor: fallbackColor, borderColor: 'rgba(255, 255, 255, 0.22)' }
            : { backgroundColor: SurfaceColors.card, borderColor: SurfaceColors.borderHairline },
          style,
        ]}>
        {children}
      </View>
    );
  }

  // 2. iOS Liquid Glass or BlurView
  if (Platform.OS === 'ios') {
    const hasLiquidGlass =
      typeof isLiquidGlassAvailable === 'function' && isLiquidGlassAvailable();
    const hasGlassApi =
      typeof isGlassEffectAPIAvailable === 'function' && isGlassEffectAPIAvailable();

    if (hasLiquidGlass || hasGlassApi) {
      return (
        <GlassView
          glassEffectStyle={glassStyle}
          colorScheme={colorScheme}
          style={[styles.glassView, containerStyle, style]}>
          {children}
        </GlassView>
      );
    }

    // Fallback for older iOS versions
    return (
      <BlurView
        tint={tint}
        intensity={intensity}
        style={[styles.blurView, containerStyle, style]}>
        {children}
      </BlurView>
    );
  }

  // 3. Android / Web: GPU-light frosted surface (locks scrolling at 60fps)
  return (
    <View
      style={[
        styles.androidSurface,
        containerStyle,
        {
          backgroundColor: fallbackColor,
          borderColor: SurfaceColors.borderHairline,
          elevation,
        },
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  glassView: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  blurView: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    ...Shadows.floatingBar,
  },
  androidSurface: {
    borderWidth: 1,
  },
  solidFallback: {
    borderWidth: 1,
  },
});
