import React from 'react';
import { View, StyleSheet, ViewProps, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SurfaceColors } from '@/constants/theme';

interface AuthBackgroundProps extends ViewProps {
  children?: React.ReactNode;
}

/**
 * AdStreet Auth Premium Background
 * - Soft blush-pink (#FCE5E8) smoothly transitioning into warm off-white (#FAFAFA)
 * - Oversized elegant curved gradient wave shapes in the background for depth
 * - Subtle pink accent curves near the bottom-left and top-left corners
 * - 100% responsive, hardware-accelerated, zero touch interference (pointerEvents="none")
 */
export const AuthBackground: React.FC<AuthBackgroundProps> = ({
  children,
  style,
  ...props
}) => {
  const { width: windowWidth } = useWindowDimensions();

  const topCurveSize = Math.max(windowWidth * 0.92, 340);
  const midCurveSize = Math.max(windowWidth * 0.72, 260);
  const bottomCurveSize = Math.max(windowWidth * 0.64, 230);

  return (
    <View style={[styles.container, style]} {...props}>
      {/* 1. Base Ambient Top Wash */}
      <LinearGradient
        colors={['#FCE5E8', '#FCECEE', '#FDF5F6', SurfaceColors.canvas]}
        locations={[0, 0.28, 0.58, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* 2. Top-Right Oversized Curved Gradient Wave */}
      <View
        pointerEvents="none"
        style={[
          styles.curveBase,
          {
            width: topCurveSize,
            height: topCurveSize,
            borderRadius: topCurveSize / 2,
            top: -topCurveSize * 0.26,
            right: -topCurveSize * 0.28,
          },
        ]}>
        <LinearGradient
          colors={['#FCDDE1', '#FCECEE', 'rgba(255, 255, 255, 0)']}
          locations={[0, 0.5, 1]}
          start={{ x: 0.25, y: 0.2 }}
          end={{ x: 0.85, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* 3. Secondary Flowing Wave for Depth */}
      <View
        pointerEvents="none"
        style={[
          styles.curveBase,
          {
            width: midCurveSize,
            height: midCurveSize,
            borderRadius: midCurveSize / 2,
            top: topCurveSize * 0.12,
            right: -midCurveSize * 0.22,
            transform: [{ rotate: '25deg' }],
          },
        ]}>
        <LinearGradient
          colors={['rgba(252, 224, 229, 0.72)', 'rgba(255, 255, 255, 0)']}
          locations={[0, 1]}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.85, y: 0.85 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* 4. Top-Left Delicate Wave behind Back Button */}
      <View
        pointerEvents="none"
        style={[
          styles.curveBase,
          {
            width: 170,
            height: 170,
            borderRadius: 85,
            top: -45,
            left: -45,
          },
        ]}>
        <LinearGradient
          colors={['rgba(252, 226, 231, 0.6)', 'rgba(255, 255, 255, 0)']}
          locations={[0, 1]}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 0.9, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* 5. Bottom-Left Corner Accent Wave */}
      <View
        pointerEvents="none"
        style={[
          styles.curveBase,
          {
            width: bottomCurveSize,
            height: bottomCurveSize,
            borderRadius: bottomCurveSize / 2,
            bottom: -bottomCurveSize * 0.28,
            left: -bottomCurveSize * 0.24,
          },
        ]}>
        <LinearGradient
          colors={['#FCDFE3', '#FCEEEF', 'rgba(255, 255, 255, 0)']}
          locations={[0, 0.5, 1]}
          start={{ x: 0.4, y: 0.4 }}
          end={{ x: 0.9, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SurfaceColors.canvas,
    overflow: 'hidden',
  },
  curveBase: {
    position: 'absolute',
    overflow: 'hidden',
  },
});
