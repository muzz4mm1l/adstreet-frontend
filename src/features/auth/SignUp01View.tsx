import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SocialButton, SocialProvider } from './SocialButton';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

interface SignUp01ViewProps {
  email: string;
  onChangeEmail: (text: string) => void;
  onContinue: () => void;
  onLogin: () => void;
  onSocialLogin?: (provider: SocialProvider) => void;
}

export const SignUp01View: React.FC<SignUp01ViewProps> = ({
  email,
  onChangeEmail,
  onContinue,
  onLogin,
  onSocialLogin = () => { },
}) => {
  return (
    <View style={styles.container}>
      {/* Editorial Titles */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Create an account</Text>
        <Text style={styles.subtitle}>
          To create an account provide details verify email{'\n'}and set a password
        </Text>
      </View>

      {/* Social Providers */}
      <View style={styles.socialGroup}>
        <SocialButton provider="google" onPress={() => onSocialLogin('google')} />
        <SocialButton provider="apple" onPress={() => onSocialLogin('apple')} />
        <SocialButton provider="facebook" onPress={() => onSocialLogin('facebook')} />
      </View>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Email Input */}
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
          returnKeyType="next"
          onSubmitEditing={onContinue}
        />
      </View>

      {/* Sign Up Primary CTA */}
      <HapticPressable
        haptic="medium"
        borderRadius={Radii.pill}
        onPress={onContinue}
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
    marginBottom: 24,
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
  socialGroup: {
    marginBottom: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    paddingHorizontal: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: SurfaceColors.textMuted,
    fontWeight: '500',
  },
  inputWrapper: {
    marginBottom: 16,
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
  submitButton: {
    height: 52,
    backgroundColor: BrandColors.primary,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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
