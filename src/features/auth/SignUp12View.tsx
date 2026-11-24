import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GradientButton } from '@/components/ui/GradientButton';
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
          <Ionicons
            name="mail-outline"
            size={18}
            color="#94A3B8"
            style={styles.leftInputIcon}
          />
          <TextInput
            style={[styles.input, styles.inputWithLeftIcon]}
            placeholder="abc@gmail.com"
            placeholderTextColor={SurfaceColors.textMuted}
            value={email}
            onChangeText={onChangeEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Send Code CTA with Gradient & Arrow */}
      <GradientButton
        title="Send Code"
        showArrow={true}
        onPress={handleSendCode}
        style={styles.ctaButtonWrapper}
      />
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
    position: 'relative',
  },
  leftInputIcon: {
    position: 'absolute',
    left: 18,
    top: 17,
    zIndex: 2,
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
  inputWithLeftIcon: {
    paddingStart: 46,
  },
  ctaButtonWrapper: {
    width: '100%',
  },
});
