import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { HapticPressable } from '@/components/ui/HapticPressable';
import {
  AnimationPresets,
  BrandColors,
  Radii,
  Shadows,
  SurfaceColors,
} from '@/constants/theme';

export type ProfileType = 'seeker' | 'provider' | 'freelancer';

export interface ProfileTypeCardProps {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  selected: boolean;
  onSelect: () => void;
  /** Position in the list; drives the staggered entrance. */
  index?: number;
}

const BORDER_IDLE = 'rgba(0, 0, 0, 0.08)';
const ICON_IDLE = '#64748B';

const clamp01 = (v: number) => {
  'worklet';
  return Math.min(Math.max(v, 0), 1);
};

/**
 * Selectable profile-type card (single choice, radio semantics).
 * Everything animates on the UI thread via one `progress` shared value:
 * border colour, blush tint, icon-tile swap, check badge pop. Only
 * transform/opacity/colour change, so there are no layout passes.
 */
export const ProfileTypeCard = React.memo(function ProfileTypeCard({
  title,
  subtitle,
  icon,
  selected,
  onSelect,
  index = 0,
}: ProfileTypeCardProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(selected ? 1 : 0);
  const pop = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = selected ? 1 : 0;
      return;
    }
    progress.value = withSpring(selected ? 1 : 0, AnimationPresets.spring);
    if (selected) {
      pop.value = withSequence(
        withTiming(1.14, { duration: 110 }),
        withSpring(1, AnimationPresets.bouncySpring)
      );
    }
  }, [selected, reduceMotion, progress, pop]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      clamp01(progress.value),
      [0, 1],
      [BORDER_IDLE, BrandColors.primary]
    ),
  }));
  const activeOpacity = useAnimatedStyle(() => ({
    opacity: clamp01(progress.value),
  }));
  const idleOpacity = useAnimatedStyle(() => ({
    opacity: 1 - clamp01(progress.value),
  }));
  const tilePop = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: clamp01(progress.value),
    transform: [{ scale: progress.value }],
  }));

  return (
    <Animated.View
      entering={
        reduceMotion ? undefined : FadeInDown.delay(index * 50).springify()
      }
      style={styles.shadowWrap}>
      <HapticPressable
        haptic="light"
        scaleTo={0.97}
        borderRadius={Radii.card}
        onPress={onSelect}
        accessibilityRole="radio"
        accessibilityLabel={`${title}. ${subtitle}`}
        accessibilityState={{ selected }}
        style={styles.card}>
        {/* Blush wash fades in when selected */}
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.tint, activeOpacity]}
        />

        <View style={styles.row}>
          <Animated.View style={[styles.tile, tilePop]}>
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, styles.tileActive, activeOpacity]}
            />
            <Animated.View style={[styles.iconLayer, idleOpacity]}>
              <Ionicons name={icon} size={22} color={ICON_IDLE} />
            </Animated.View>
            <Animated.View style={[styles.iconLayer, activeOpacity]}>
              <Ionicons name={icon} size={22} color="#FFFFFF" />
            </Animated.View>
          </Animated.View>

          <View style={styles.textCol}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>

          <View style={styles.radio}>
            <Animated.View style={[styles.check, badgeStyle]}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </Animated.View>
          </View>
        </View>

        {/* Animated brand-red border sits above the content */}
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.border, borderStyle]}
        />
      </HapticPressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  // Shadow lives on a non-clipping wrapper: HapticPressable clips (overflow hidden),
  // which would swallow the iOS shadow if it were set on the pressable itself.
  shadowWrap: {
    width: '100%',
    borderRadius: Radii.card,
    backgroundColor: '#FFFFFF',
    ...Shadows.card,
  },
  card: {
    width: '100%',
    minHeight: 68,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  tint: {
    backgroundColor: BrandColors.primaryLight,
  },
  border: {
    borderWidth: 1.5,
    borderRadius: Radii.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tile: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileActive: {
    backgroundColor: BrandColors.primary,
  },
  iconLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    marginStart: 12,
    marginEnd: 10,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: SurfaceColors.textPrimary,
    letterSpacing: -0.1,
  },
  subtitle: {
    fontSize: 11.5,
    lineHeight: 16,
    color: SurfaceColors.textSecondary,
    marginTop: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
