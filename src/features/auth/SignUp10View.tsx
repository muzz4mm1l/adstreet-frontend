import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { LanguageCard } from './LanguageCard';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

export type AppLanguage = 'en' | 'ur' | 'ar';

interface SignUp10ViewProps {
  selectedLanguage: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  onConfirm: () => void;
  onSkip: () => void;
}

/**
 * Sign up 10 — Language Selection
 * Master PDF Page 6
 */
export const SignUp10View: React.FC<SignUp10ViewProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onConfirm,
  onSkip,
}) => {
  const isRtl = selectedLanguage === 'ur' || selectedLanguage === 'ar';

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Language selection</Text>
        <Text style={styles.subtitle}>
          Select your preferred language for the app
        </Text>
      </View>

      {/* Language Cards */}
      <View style={styles.cardList}>
        <LanguageCard
          label="English"
          selected={selectedLanguage === 'en'}
          onSelect={() => onSelectLanguage('en')}
        />
        <LanguageCard
          label="اردو"
          isRtl={true}
          selected={selectedLanguage === 'ur'}
          onSelect={() => onSelectLanguage('ur')}
        />
        <LanguageCard
          label="العربية"
          isRtl={true}
          selected={selectedLanguage === 'ar'}
          onSelect={() => onSelectLanguage('ar')}
        />
      </View>

      {/* Confirm CTA */}
      <HapticPressable
        haptic="medium"
        borderRadius={Radii.pill}
        onPress={onConfirm}
        style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </HapticPressable>

      {/* Dynamic RTL Informational Footnote */}
      <View style={styles.footnoteContainer}>
        {isRtl ? (
          <Animated.View
            entering={FadeInDown.duration(200)}
            exiting={FadeOutUp.duration(150)}
            style={styles.footnoteRow}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={SurfaceColors.textMuted}
            />
            <Text style={styles.footnoteText}>
              Shown when an RTL language is selected, explaining the mirrored layout
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.footnotePlaceholder} />
        )}
      </View>

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
    marginBottom: 32,
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
  cardList: {
    marginBottom: 20,
  },
  confirmButton: {
    height: 52,
    backgroundColor: BrandColors.primary,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Shadows.buttonGlow,
  },
  confirmButtonText: {
    color: SurfaceColors.textInverted,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  footnoteContainer: {
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  footnotePlaceholder: {
    height: 18,
  },
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  footnoteText: {
    fontSize: 11,
    color: SurfaceColors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
    flexShrink: 1,
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
