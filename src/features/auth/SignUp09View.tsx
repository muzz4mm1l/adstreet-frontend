import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';
import { PortfolioAttachment } from './UploadPortfolioModal';

interface SignUp09ViewProps {
  portfolioItems?: PortfolioAttachment[];
  onOpenUploadModal: () => void;
  onDeleteItem: (id: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

/**
 * Sign up 09 — Upload your portfolio (Populated State)
 * Master PDF Page 5
 */
export const SignUp09View: React.FC<SignUp09ViewProps> = ({
  portfolioItems = [
    {
      id: 'default-portfolio',
      source: require('@/assets/images/portfolio-sample-1.png'),
      title: 'Mobile App Project',
    },
  ],
  onOpenUploadModal,
  onDeleteItem,
  onContinue,
  onSkip,
}) => {
  const handleDelete = (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    onDeleteItem(id);
  };

  const currentItem = portfolioItems[0] || {
    id: 'sample-1',
    source: require('@/assets/images/portfolio-sample-1.png'),
  };

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Upload your portfolio</Text>
        <Text style={styles.subtitle}>
          Provide your details to complete your profile
        </Text>
      </View>

      {/* Portfolio Box (Populated with Thumbnail) */}
      <View style={styles.portfolioBox}>
        <View style={styles.thumbnailContainer}>
          <Image
            source={currentItem.source}
            style={styles.thumbnail}
            contentFit="cover"
            transition={150}
          />
          <TouchableOpacity
            onPress={() => handleDelete(currentItem.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.removeBadge}>
            <Ionicons name="close" size={10} color="#666666" />
          </TouchableOpacity>
        </View>

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
    height: 58,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingStart: 12,
    paddingEnd: 6,
    marginBottom: 32,
    ...Shadows.card,
  },
  thumbnailContainer: {
    position: 'relative',
    width: 44,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
  },
  removeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    elevation: 2,
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
