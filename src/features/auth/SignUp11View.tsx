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
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

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

        {/* Password Input with Eye Toggle */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor={SurfaceColors.textMuted}
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
              color={SurfaceColors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        <View style={styles.forgotPasswordRow}>
          <TouchableOpacity
            onPress={handleForgotPassword}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login Options */}
      <View style={styles.socialGroup}>
        <SocialButton provider="google" onPress={() => onSocialLogin('google')} />
        <SocialButton provider="apple" onPress={() => onSocialLogin('apple')} />
        <SocialButton
          provider="facebook"
          onPress={() => onSocialLogin('facebook')}
        />
      </View>

      {/* Primary Sign In CTA */}
      <HapticPressable
        haptic="medium"
        borderRadius={Radii.pill}
        onPress={handleSignIn}
        style={styles.signInButton}>
        <Text style={styles.signInButtonText}>Sign in</Text>
      </HapticPressable>

      {/* Don't have an account Link */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity
          onPress={handleSignUp}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.footerLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 28,
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
    marginBottom: 16,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 12,
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
  passwordInput: {
    paddingEnd: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 18,
    top: 16,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginTop: 2,
    paddingEnd: 4,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: SurfaceColors.textSecondary,
    fontWeight: '500',
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
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 12,
    color: SurfaceColors.textMuted,
  },
  socialGroup: {
    marginBottom: 24,
  },
  signInButton: {
    height: 52,
    backgroundColor: BrandColors.primary,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Shadows.buttonGlow,
  },
  signInButtonText: {
    color: SurfaceColors.textInverted,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: SurfaceColors.textSecondary,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: BrandColors.primary,
  },
});
