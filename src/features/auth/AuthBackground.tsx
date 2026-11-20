import React from 'react';
import { View, StyleSheet, ViewProps, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ModuleTopWash, SurfaceColors } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AuthBackgroundProps extends ViewProps {
  children?: React.ReactNode;
}

/**
 * AdStreet Auth Ambient Top Wash Background
 * - Vertical wash fading from #FADADD down to #FAFAFA canvas
 */
export const AuthBackground: React.FC<AuthBackgroundProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={[ModuleTopWash.auth.start, '#FCE8EA', '#FDF5F6', SurfaceColors.canvas]}
        locations={[0, 0.45, 0.75, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientWash}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SurfaceColors.canvas,
  },
  gradientWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.38,
  },
});
