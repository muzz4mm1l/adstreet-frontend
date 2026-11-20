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
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

interface SignUp02ViewProps {
  email: string;
  onChangeEmail: (text: string) => void;
  password: string;
  onChangePassword: (text: string) => void;
  confirmPassword: string;
  onChangeConfirmPassword: (text: string) => void;
  onSubmit: () => void;
  onLogin: () => void;
}

export const SignUp02View: React.FC<SignUp02ViewProps> = ({
  email,
  onChangeEmail,
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
        <Text style={styles.heading}>Create an account</Text>
        <Text style={styles.subtitle}>
          To create an account provide details verify email{'\n'}and set a password
        </Text>
      </View>

      {/* Inputs Group */}
      <View style={styles.formGroup}>
        {/* Email Field */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={SurfaceColors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={onChangeEmail}
          />
        </View>

        {/* Password Field */}
        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor={SurfaceColors.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            value={password}
            onChangeText={onChangePassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => setShowPassword((prev) => !prev)}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={SurfaceColors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Field */}
        <View style={styles.passwordWrapper}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              isPasswordMismatch && styles.inputErrorBorder,
            ]}
            placeholder="Confirm Password"
            placeholderTextColor={SurfaceColors.textMuted}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => setShowConfirmPassword((prev) => !prev)}>
            <Ionicons
              name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
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

      {/* Sign Up Primary CTA */}
      <HapticPressable
        haptic={isPasswordMismatch ? 'error' : 'medium'}
        borderRadius={Radii.pill}
        onPress={onSubmit}
        style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Sign Up</Text>
      </HapticPressable>

      {/* Footer Navigation */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity
          onPress={onLogin}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.loginLink}>Log in</Text>
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
    marginBottom: 14,
  },
  passwordWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  input: {
    height: 50,
    backgroundColor: SurfaceColors.card,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: SurfaceColors.borderLight,
    paddingHorizontal: 20,
    fontSize: 14.5,
    color: SurfaceColors.textPrimary,
  },
  passwordInput: {
    paddingRight: 48,
  },
  inputErrorBorder: {
    borderColor: BrandColors.primary,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 15,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: -4,
    marginBottom: 8,
    gap: 4,
  },
  errorText: {
    fontSize: 11.5,
    color: BrandColors.primary,
    fontWeight: '500',
  },
  submitButton: {
    height: 52,
    backgroundColor: BrandColors.primary,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    ...Shadows.buttonGlow,
  },
  submitButtonText: {
    color: SurfaceColors.textInverted,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
    textDecorationLine: 'underline',
  },
});
