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
import { GradientButton } from '@/components/ui/GradientButton';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

interface SignUp02ViewProps {
  password: string;
  onChangePassword: (text: string) => void;
  confirmPassword: string;
  onChangeConfirmPassword: (text: string) => void;
  onSubmit: () => void;
  onLogin?: () => void;
}

/**
 * Sign up 02 — Password & Confirm Password Screen
 * Focused, high-taste layout modeled after SignUp12 (Forgot Password):
 * 1. Title Section ("Create a password")
 * 2. Form Inputs (Password, Confirm Password with eye toggles)
 * 3. Primary CTA Button ("Continue")
 * 4. Footer Navigation ("Already have an account? Log in")
 */
export const SignUp02View: React.FC<SignUp02ViewProps> = ({
  password,
  onChangePassword,
  confirmPassword,
  onChangeConfirmPassword,
  onSubmit,
  onLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isPasswordMismatch =
    confirmPassword.length > 0 && password.length > 0 && password !== confirmPassword;

  return (
    <View style={styles.container}>
      {/* Editorial Titles */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Create a password</Text>
        <Text style={styles.subtitle}>
          Set a password to secure your new account
        </Text>
      </View>

      {/* Inputs Group */}
      <View style={styles.formGroup}>
        {/* Password Field */}
        <View style={styles.passwordWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color="#94A3B8"
            style={styles.leftInputIcon}
          />
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor={SurfaceColors.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={onChangePassword}
            returnKeyType="next"
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

        {/* Confirm Password Field */}
        <View style={styles.passwordWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color="#94A3B8"
            style={styles.leftInputIcon}
          />
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              isPasswordMismatch && styles.inputErrorBorder,
            ]}
            placeholder="Confirm password"
            placeholderTextColor={SurfaceColors.textMuted}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => setShowConfirmPassword((prev) => !prev)}>
            <Ionicons
              name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={SurfaceColors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Error Helper Text */}
        {isPasswordMismatch && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={14} color={BrandColors.primary} />
            <Text style={styles.errorText}>Passwords do not match</Text>
          </View>
        )}
      </View>

      {/* Primary CTA with Gradient & Arrow */}
      <GradientButton
        title="Continue"
        showArrow={true}
        onPress={onSubmit}
        style={styles.ctaButtonWrapper}
      />

      {/* Footer Navigation */}
      {onLogin && (
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={onLogin}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      )}
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
  passwordWrapper: {
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
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 20,
    fontSize: 14.5,
    color: SurfaceColors.textPrimary,
    ...Shadows.card,
  },
  passwordInput: {
    paddingStart: 46,
    paddingEnd: 50,
  },
  inputErrorBorder: {
    borderColor: BrandColors.primary,
  },
  eyeButton: {
    position: 'absolute',
    right: 18,
    top: 17,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: -2,
    marginBottom: 8,
    gap: 4,
  },
  errorText: {
    fontSize: 11.5,
    color: BrandColors.primary,
    fontWeight: '500',
  },
  ctaButtonWrapper: {
    width: '100%',
    marginTop: 8,
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 13,
    color: SurfaceColors.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: BrandColors.primary,
  },
});
