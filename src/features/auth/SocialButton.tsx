import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { Radii, SurfaceColors } from '@/constants/theme';

export type SocialProvider = 'google' | 'apple' | 'facebook';

interface SocialButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ provider, onPress }) => {
  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          label: 'Google',
          icon: <FontAwesome5 name="google" size={17} color="#EA4335" />,
        };
      case 'apple':
        return {
          label: 'Apple',
          icon: <FontAwesome5 name="apple" size={20} color="#000000" />,
        };
      case 'facebook':
        return {
          label: 'Facebook',
          icon: <FontAwesome name="facebook-square" size={20} color="#1877F2" />,
        };
    }
  };

  const { label, icon } = getProviderConfig();

  return (
    <HapticPressable
      haptic="light"
      borderRadius={Radii.pill}
      onPress={onPress}
      style={styles.button}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.spacer} />
    </HapticPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    backgroundColor: SurfaceColors.card,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: SurfaceColors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  iconContainer: {
    width: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14.5,
    fontWeight: '500',
    color: SurfaceColors.textPrimary,
    letterSpacing: -0.1,
  },
  spacer: {
    width: 28,
  },
});
