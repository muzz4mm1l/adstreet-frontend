import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoleCard } from './RoleCard';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

export type UserRole = 'individual' | 'company' | 'guru';

interface SignUp04ViewProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onContinue: () => void;
}

export const SignUp04View: React.FC<SignUp04ViewProps> = ({
  selectedRole,
  onSelectRole,
  onContinue,
}) => {
  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Role selection</Text>
        <Text style={styles.subtitle}>
          We need to know this regulatory reasons
        </Text>
      </View>

      {/* Role Selection Cards */}
      <View style={styles.cardList}>
        <RoleCard
          title="Individual Card"
          selected={selectedRole === 'individual'}
          onSelect={() => onSelectRole('individual')}
        />
        <RoleCard
          title="Company Card"
          selected={selectedRole === 'company'}
          onSelect={() => onSelectRole('company')}
        />
        <RoleCard
          title="Guru Card"
          selected={selectedRole === 'guru'}
          onSelect={() => onSelectRole('guru')}
        />
      </View>

      {/* Primary Continue CTA */}
      <HapticPressable
        haptic="medium"
        borderRadius={Radii.pill}
        onPress={onContinue}
        style={styles.continueButton}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </HapticPressable>

      {/* Footnote */}
      <View style={styles.footnoteRow}>
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={SurfaceColors.textMuted}
        />
        <Text style={styles.footnoteText}>
          Note that role can be adjusted later in settings
        </Text>
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
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 24,
  },
  footnoteText: {
    fontSize: 11.5,
    color: SurfaceColors.textMuted,
  },
});
