import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

interface SignUp07ViewProps {
  onOpenUploadModal: () => void;
  onContinue: () => void;
  onSkip: () => void;
}

/**
 * Sign up 07 — Upload your portfolio (Empty State)
 * Master PDF Page 5
 */
export const SignUp07View: React.FC<SignUp07ViewProps> = ({
  onOpenUploadModal,
  onContinue,
  onSkip,
}) => {
  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Upload your portfolio</Text>
        <Text style={styles.subtitle}>
          Provide your details to complete your profile
        </Text>
      </View>

      {/* Portfolio Box (Empty State) */}
      <View style={styles.portfolioBox}>
        <Text style={styles.emptyText} numberOfLines={1}>
          No portfolio uploaded yet
        </Text>

        <HapticPressable
          haptic="light"
          borderRadius={Radii.pill}
          onPress={onOpenUploadModal}
          style={styles.uploadPortfolioBtn}>
          <Text style={styles.uploadPortfolioBtnText}>Upload Portfolio</Text>
        </HapticPressable>
      </View>

      {/* Primary Continue CTA */}
      <HapticPressable
        haptic="medium"
        borderRadius={Radii.pill}
        onPress={onContinue}
        style={styles.continueButton}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </HapticPressable>

      {/* Skip Action */}
      <View style={styles.skipSection}>
        <HapticPressable
          haptic="selection"
          borderRadius={Radii.pill}
          onPress={onSkip}
          style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </HapticPressable>
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
  portfolioBox: {
    width: '100%',
    height: 56,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingStart: 18,
    paddingEnd: 6,
    marginBottom: 32,
    ...Shadows.card,
  },
  emptyText: {
    fontSize: 13,
    color: SurfaceColors.textMuted,
    flexShrink: 1,
    marginEnd: 10,
  },
  uploadPortfolioBtn: {
    height: 42,
    paddingHorizontal: 16,
    backgroundColor: BrandColors.primary,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPortfolioBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  continueButton: {
    height: 52,
    backgroundColor: BrandColors.primary,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Shadows.buttonGlow,
  },
  continueButtonText: {
    color: SurfaceColors.textInverted,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  skipSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 14,
    color: SurfaceColors.textSecondary,
    fontWeight: '500',
  },
});
