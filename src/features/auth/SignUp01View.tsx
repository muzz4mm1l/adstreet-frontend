import { AUTH_TITLE_GAP, AUTH_TITLE_HEIGHT } from './authLayout';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SocialButton, SocialProvider } from './SocialButton';
import { GradientButton } from '@/components/ui/GradientButton';
import { BrandColors, Radii, Shadows } from '@/constants/theme';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';

interface SignUp01ViewProps {
  email: string;
  onChangeEmail: (text: string) => void;
  onContinue: () => void;
  onLogin: () => void;
  onSocialLogin?: (provider: SocialProvider) => void;
}

/**
 * Sign up 01 — Create an account
 * Clean, high-taste layout per /mobile-taste and /build-adstreet-screen:
 * 1. Title & Subtitle
 * 2. Form Input field (Email address only)
 * 3. Primary Sign Up CTA (placed directly below Email address)
 * 4. Divider ("or")
 * 5. Social Providers (Google, Apple, Facebook)
 * 6. Footer Navigation ("Already have an account? Log in")
 */
export const SignUp01View: React.FC<SignUp01ViewProps> = ({
  email,
  onChangeEmail,
  onContinue,
  onLogin,
  onSocialLogin = () => {},
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onContinue();
  };

  const handleLogin = () => {
    Haptics.selectionAsync().catch(() => {});
    onLogin();
  };

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Create an account</Text>
        <Text style={styles.subtitle}>
          To create an account provide details verify email and set a password
        </Text>
      </View>

      {/* Input Field: Email address */}
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
            placeholderTextColor={theme.textMuted}
            value={email}
            onChangeText={onChangeEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSignUp}
          />
        </View>
      </View>

      {/* Primary Sign Up CTA with Gradient & Arrow */}
      <GradientButton
        title="Sign Up"
        showArrow={true}
        onPress={handleSignUp}
        style={styles.ctaButtonWrapper}
      />

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login Options (Apple removed) */}
      <View style={styles.socialGroup}>
        <SocialButton provider="google" onPress={() => onSocialLogin('google')} />
        <SocialButton
          provider="facebook"
          onPress={() => onSocialLogin('facebook')}
        />
      </View>

      {/* Already have an account Link */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
          <Text style={styles.footerLink}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (t: AppTheme) =>
  StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 24,
  },
  titleSection: {
    alignItems: 'center',
    // Same height on every auth screen so the first text box always sits at the same y.
    minHeight: AUTH_TITLE_HEIGHT,
    marginBottom: AUTH_TITLE_GAP,
  },
  heading: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
    color: t.text,
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
    color: t.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 16,
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
    backgroundColor: t.surface,
    borderRadius: Radii.pill,
    paddingHorizontal: 20,
    fontSize: 14.5,
    color: t.text,
    borderWidth: 1,
    borderColor: t.border,
    ...Shadows.card,
  },
  inputWithLeftIcon: {
    paddingStart: 46,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: t.border,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 12,
    color: t.textMuted,
  },
  socialGroup: {
    marginBottom: 24,
  },
  ctaButtonWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: t.textSecondary,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: BrandColors.primary,
  },
});
