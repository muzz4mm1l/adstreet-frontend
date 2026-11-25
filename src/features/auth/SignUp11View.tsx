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

interface SignUp11ViewProps {
  email: string;
  onChangeEmail: (text: string) => void;
  onSignIn: (password: string) => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
  onSocialLogin: (provider: SocialProvider) => void;
}

/**
 * Sign up 11 — Log in
 * Master PDF Page 6
 */
export const SignUp11View: React.FC<SignUp11ViewProps> = ({
  email,
  onChangeEmail,
  onSignIn,
  onForgotPassword,
  onSignUp,
  onSocialLogin,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSignIn(password);
  };

  const handleForgotPassword = () => {
    Haptics.selectionAsync().catch(() => {});
    onForgotPassword();
  };

  const handleSignUp = () => {
    Haptics.selectionAsync().catch(() => {});
    onSignUp();
  };

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Log in</Text>
        <Text style={styles.subtitle}>
          To create an account provide details verify email and set a password
        </Text>
      </View>

      {/* Input Fields */}
      <View style={styles.formGroup}>
        {/* Email Input */}
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
          />
        </View>

        {/* Password Input with Eye Toggle */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color="#94A3B8"
            style={styles.leftInputIcon}
          />
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor={theme.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => setShowPassword((prev) => !prev)}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        <View style={styles.forgotPasswordRow}>
          <TouchableOpacity
            onPress={handleForgotPassword}
            activeOpacity={0.7}
            hitSlop={{ top: 14, bottom: 14, left: 20, right: 14 }}
            style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Primary Sign In CTA with Red Gradient & Arrow */}
      <GradientButton
        title="Sign in"
        showArrow={true}
        onPress={handleSignIn}
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

      {/* Don't have an account Link */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity
          onPress={handleSignUp}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
          <Text style={styles.footerLink}>Sign up</Text>
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
    position: 'relative',
    marginBottom: 12,
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
  passwordInput: {
    paddingStart: 46,
    paddingEnd: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 18,
    top: 16,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 4,
    paddingEnd: 2,
    zIndex: 20,
    elevation: 5,
  },
  forgotPasswordButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    zIndex: 20,
  },
  forgotPasswordText: {
    fontSize: 12.5,
    color: '#ED1C24',
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
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
    marginBottom: 16,
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
