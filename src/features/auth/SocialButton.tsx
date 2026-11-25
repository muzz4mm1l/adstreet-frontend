import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { Radii } from '@/constants/theme';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';

export type SocialProvider = 'google' | 'apple' | 'facebook';

interface SocialButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  label?: string;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  label: customLabel,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          label: customLabel || 'Continue with Google',
          icon: <FontAwesome5 name="google" size={17} color="#EA4335" />,
        };
      case 'apple':
        return {
          label: customLabel || 'Continue with Apple',
          icon: <FontAwesome5 name="apple" size={20} color={theme.text} />,
        };
      case 'facebook':
        return {
          label: customLabel || 'Continue with Facebook',
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

const createStyles = (t: AppTheme) =>
  StyleSheet.create({
  button: {
    height: 50,
    backgroundColor: t.surface,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: t.border,
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
    color: t.text,
    letterSpacing: -0.1,
  },
  spacer: {
    width: 28,
  },
});
