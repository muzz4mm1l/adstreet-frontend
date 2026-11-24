import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, SurfaceColors } from '@/constants/theme';

export interface AvatarPickerSheetProps {
  visible: boolean;
  hasPhoto: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseLibrary: () => void;
  onAdjustCurrent: () => void;
  onRemove: () => void;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Row {
  key: string;
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
}

/** Profile-photo actions: take, choose, re-crop the current photo, remove. */
export const AvatarPickerSheet: React.FC<AvatarPickerSheetProps> = ({
  visible,
  hasPhoto,
  onClose,
  onTakePhoto,
  onChooseLibrary,
  onAdjustCurrent,
  onRemove,
}) => {
  const reduceMotion = useReducedMotion();

  const rows: Row[] = [
    {
      key: 'camera',
      icon: 'camera-outline',
      title: 'Take a photo',
      subtitle: 'Use your camera',
      onPress: onTakePhoto,
    },
    {
      key: 'library',
      icon: 'images-outline',
      title: 'Choose from library',
      subtitle: 'Pick an existing photo',
      onPress: onChooseLibrary,
    },
    ...(hasPhoto
      ? [
          {
            key: 'adjust',
            icon: 'crop-outline' as IconName,
            title: 'Adjust current photo',
            subtitle: 'Crop, zoom or rotate',
            onPress: onAdjustCurrent,
          },
          {
            key: 'remove',
            icon: 'trash-outline' as IconName,
            title: 'Remove photo',
            onPress: onRemove,
            destructive: true,
          },
        ]
      : []),
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.heading}>Profile photo</Text>
      <Text style={styles.subheading}>Choose how you'd like to add your photo</Text>

      <View style={styles.rows}>
        {rows.map((row, index) => (
          <Animated.View
            key={row.key}
            entering={
              reduceMotion ? undefined : FadeInDown.delay(70 + index * 40).duration(260)
            }>
            <HapticPressable
              haptic="light"
              borderRadius={Radii.card}
              onPress={row.onPress}
              accessibilityRole="button"
              accessibilityLabel={row.subtitle ? `${row.title}. ${row.subtitle}` : row.title}
              style={styles.row}>
              <View style={[styles.tile, row.destructive && styles.tileDestructive]}>
                <Ionicons
                  name={row.icon}
                  size={22}
                  color={row.destructive ? BrandColors.primary : '#475569'}
                />
              </View>
              <View style={styles.rowText}>
                <Text
                  style={[styles.rowTitle, row.destructive && styles.rowTitleDestructive]}
                  numberOfLines={1}>
                  {row.title}
                </Text>
                {row.subtitle ? (
                  <Text style={styles.rowSubtitle} numberOfLines={1}>
                    {row.subtitle}
                  </Text>
                ) : null}
              </View>
              {!row.destructive && (
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              )}
            </HapticPressable>
          </Animated.View>
        ))}
      </View>

      <HapticPressable
        haptic="selection"
        borderRadius={Radii.pill}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cancel"
        style={styles.cancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </HapticPressable>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 'bold',
    color: SurfaceColors.textPrimary,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    letterSpacing: -0.2,
  },
  subheading: {
    fontSize: 12.5,
    lineHeight: 18,
    color: SurfaceColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  rows: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SurfaceColors.borderLight,
  },
  tile: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileDestructive: {
    backgroundColor: BrandColors.primaryLight,
  },
  rowText: {
    flex: 1,
    marginStart: 12,
    marginEnd: 8,
  },
  rowTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: SurfaceColors.textPrimary,
  },
  rowTitleDestructive: {
    color: BrandColors.primary,
  },
  rowSubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
    color: SurfaceColors.textSecondary,
    marginTop: 1,
  },
  cancel: {
    height: 50,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: SurfaceColors.textSecondary,
  },
});
