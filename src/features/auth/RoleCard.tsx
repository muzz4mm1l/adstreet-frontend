import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticPressable } from '@/components/ui/HapticPressable';
import {
  BrandColors,
  Radii,
  SignaturePastelGradient,
  SurfaceColors,
} from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface RoleCardProps {
  title: string;
  selected: boolean;
  onSelect: () => void;
}

/**
 * AdStreet Signature Pastel Gradient Role Card
 * - Diagonal soft blush (#FDE8EA) -> white (#FFFFFF) -> soft sky blue (#D8EEFA)
 * - Brand red active border when selected
 * - UI-thread spring scale & haptics
 */
export const RoleCard: React.FC<RoleCardProps> = ({
  title,
  selected,
  onSelect,
}) => {
  return (
    <HapticPressable
      haptic="selection"
      borderRadius={Radii.card}
      onPress={onSelect}
      style={[
        styles.cardContainer,
        selected ? styles.selectedCard : styles.unselectedCard,
      ]}>
      <LinearGradient
        colors={SignaturePastelGradient.colors}
        locations={SignaturePastelGradient.locations}
        start={SignaturePastelGradient.start}
        end={SignaturePastelGradient.end}
        style={styles.gradient}>
        <Text style={[styles.title, selected && styles.selectedTitle]}>
          {title}
        </Text>
      </LinearGradient>
    </HapticPressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 64,
    borderRadius: Radii.card,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  unselectedCard: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  selectedCard: {
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
    shadowColor: BrandColors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  gradient: {
    flex: 1,
    borderRadius: Radii.card - 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: SurfaceColors.textPrimary,
    letterSpacing: -0.1,
  },
  selectedTitle: {
    fontWeight: '600',
    color: SurfaceColors.textPrimary,
  },
});
