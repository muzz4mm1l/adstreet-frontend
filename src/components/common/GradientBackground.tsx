import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps extends ViewProps {
  children?: React.ReactNode;
}

/**
 * AdStreet Luxury Crimson Red Gradient Background
 * Matches the official design specification:
 * - Top-Right: #5B161B / #742226 (deep dark burgundy/crimson)
 * - Center: #AC2128 (rich crimson)
 * - Bottom-Left: #E22029 (vibrant luminous red)
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <LinearGradient
      colors={['#5B161B', '#7A1E24', '#AC2128', '#C92029', '#E22029']}
      locations={[0, 0.25, 0.55, 0.8, 1]}
      start={{ x: 0.9, y: 0.05 }}
      end={{ x: 0.1, y: 0.95 }}
      style={[styles.gradient, style]}
      {...props}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
