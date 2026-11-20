import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

interface SignUp12ViewProps {
  email: string;
  onChangeEmail: (email: string) => void;
  onSendCode: () => void;
}

/**
 * Sign up 12 — Forgot Password
 * Master PDF Page 6
 */
export const SignUp12View: React.FC<SignUp12ViewProps> = ({
  email,
  onChangeEmail,
  onSendCode,
}) => {
  const handleSendCode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSendCode();
  };

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          A code will be sent to your email to help reset password
        </Text>
      </View>

      {/* Email Input */}
      <View style={styles.formGroup}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={SurfaceColors.textMuted}
            value={email}
            onChangeText={onChangeEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Send Code CTA */}
      <HapticPressable
        haptic="medium"
        borderRadius={Radii.pill}
        onPress={handleSendCode}
        style={styles.sendCodeButton}>
        <Text style={styles.sendCodeButtonText}>Send Code</Text>
      </HapticPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  heading: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
    color: SurfaceColors.textPrimary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: SurfaceColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  inputWrapper: {
    width: '100%',
  },
  input: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.pill,
    paddingHorizontal: 20,
    fontSize: 14.5,
    color: SurfaceColors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Shadows.card,
  },
  sendCodeButton: {
    height: 52,
    backgroundColor: BrandColors.primary,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.buttonGlow,
  },
  sendCodeButtonText: {
    color: SurfaceColors.textInverted,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
});
