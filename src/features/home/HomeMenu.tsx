import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SideDrawer } from '@/components/navigation/SideDrawer';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { AnimationPresets, BrandColors, Radii, Shadows } from '@/constants/theme';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';
import { ThemePreference, setThemePreference, useThemePreference } from '@/theme/themePreference';

export type HomeMenuItem = 'settings' | 'account' | 'help';

/** Ids match `CategoryCardData.type` on the Home screen. */
const CATEGORY_LINKS = [
  { id: 'adbazaar', label: 'AdBazaar', color: '#E31E24' },
  { id: 'adbooks', label: 'AdBooks', color: '#D9B93A' },
  { id: 'adleaks', label: 'AdLeaks', color: '#E8892B' },
  { id: 'admeet', label: 'AdMeet', color: '#22B58B' },
  { id: 'adguru', label: 'AdGuru', color: '#7B7F87' },
  { id: 'adread', label: 'AdRead', color: '#2FA7E0' },
] as const;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export interface HomeMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (id: string) => void;
  onSelectItem: (item: HomeMenuItem) => void;
  onLogout: () => void;
}

const SWITCH_PAD = 3;
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

/** Home side menu: categories (expandable), settings, account, help, log out. */
export const HomeMenu: React.FC<HomeMenuProps> = ({
  visible,
  onClose,
  onSelectCategory,
  onSelectItem,
  onLogout,
}) => {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(true);
  const chevron = useSharedValue(1);

  const toggleCategories = () => {
    const next = !expanded;
    setExpanded(next);
    chevron.value = reduceMotion ? (next ? 1 : 0) : withSpring(next ? 1 : 0, AnimationPresets.spring);
  };
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(1 - chevron.value) * 180}deg` }],
  }));

  const enter = (index: number) =>
    reduceMotion ? undefined : FadeInLeft.delay(80 + index * 35).duration(260);

  return (
    <SideDrawer visible={visible} onClose={onClose}>
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 },
        ]}>
        {/* Brand */}
        <Animated.View entering={enter(0)} style={styles.brandRow}>
          <Image
            source={require('@/assets/images/splash-logo-clean.png')}
            style={styles.brandEmblem}
            contentFit="contain"
          />
          <Text style={styles.brandText}>ADSTREET</Text>
        </Animated.View>

        {/* Categories (expandable) */}
        <Animated.View entering={enter(1)} layout={LinearTransition.duration(220)}>
          <HapticPressable
            haptic="selection"
            scaleTo={0.985}
            borderRadius={Radii.md}
            onPress={toggleCategories}
            accessibilityRole="button"
            accessibilityLabel="Categories"
            accessibilityState={{ expanded }}
            style={styles.categoriesHeader}>
            <LinearGradient
              colors={[BrandColors.primary, 'rgba(227, 30, 36, 0.3)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="apps-outline" size={19} color="#FFFFFF" />
            <Text style={styles.categoriesLabel}>Categories</Text>
            <Animated.View style={chevronStyle}>
              <Ionicons name="chevron-up" size={16} color="#FFFFFF" />
            </Animated.View>
          </HapticPressable>

          {expanded && (
            <Animated.View
              entering={FadeIn.duration(180)}
              exiting={FadeOut.duration(120)}
              style={styles.categoryList}>
              {CATEGORY_LINKS.map((category) => (
                <HapticPressable
                  key={category.id}
                  haptic="selection"
                  scaleTo={0.98}
                  borderRadius={Radii.sm}
                  onPress={() => onSelectCategory(category.id)}
                  accessibilityRole="button"
                  accessibilityLabel={category.label}
                  style={styles.categoryRow}>
                  <View style={[styles.dot, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryText}>{category.label}</Text>
                </HapticPressable>
              ))}
            </Animated.View>
          )}
        </Animated.View>

        {/* Main items */}
        <Animated.View entering={enter(2)} layout={LinearTransition.duration(220)}>
          <View style={styles.divider} />
          <MenuRow icon="settings-outline" label="Settings" onPress={() => onSelectItem('settings')} />
          <View style={styles.divider} />
          <MenuRow icon="person-outline" label="Account" onPress={() => onSelectItem('account')} />
          <View style={styles.divider} />
          <MenuRow icon="headset-outline" label="Help & Support" onPress={() => onSelectItem('help')} />
        </Animated.View>

        <View style={styles.spacer} />

        {/* Appearance */}
        <Animated.View entering={enter(3)}>
          <ThemeSwitcher />
        </Animated.View>

        {/* Log out */}
        <Animated.View entering={enter(3)}>
          <HapticPressable
            haptic="light"
            scaleTo={0.98}
            borderRadius={Radii.md}
            onPress={onLogout}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            style={styles.logoutRow}>
            <Ionicons name="log-out-outline" size={18} color={BrandColors.primary} />
            <Text style={styles.logoutText}>Log out</Text>
          </HapticPressable>
        </Animated.View>
      </View>
    </SideDrawer>
  );
};

const THEME_OPTIONS: { id: ThemePreference; label: string; icon: IconName }[] = [
  { id: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { id: 'light', label: 'Light', icon: 'sunny-outline' },
  { id: 'dark', label: 'Dark', icon: 'moon-outline' },
];

/** Segmented System / Light / Dark control with a sliding selection pill. */
const ThemeSwitcher: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const preference = useThemePreference();
  const index = Math.max(0, THEME_OPTIONS.findIndex((o) => o.id === preference));
  const [width, setWidth] = useState(0);
  const segW = width > 0 ? (width - SWITCH_PAD * 2) / THEME_OPTIONS.length : 0;
  const slide = useSharedValue(index);

  useEffect(() => {
    slide.value = reduceMotion ? index : withSpring(index, AnimationPresets.spring);
  }, [index, reduceMotion, slide]);

  const pillStyle = useAnimatedStyle(() => ({
    width: segW,
    transform: [{ translateX: slide.value * segW }],
  }));

  return (
    <View style={styles.switcherBlock}>
      <Text style={styles.switcherLabel}>Appearance</Text>
      <View
        accessibilityRole="radiogroup"
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={styles.switcher}>
        {segW > 0 && <Animated.View style={[styles.switcherPill, pillStyle]} />}
        {THEME_OPTIONS.map((o) => {
          const selected = o.id === preference;
          return (
            <HapticPressable
              key={o.id}
              haptic="selection"
              enableScaleAnimation={false}
              borderRadius={Radii.sm}
              onPress={() => setThemePreference(o.id)}
              accessibilityRole="radio"
              accessibilityLabel={`${o.label} appearance`}
              accessibilityState={{ selected }}
              style={styles.switcherItem}>
              <Ionicons name={o.icon} size={15} color={selected ? theme.text : theme.textMuted} />
              <Text style={[styles.switcherText, selected && styles.switcherTextOn]}>{o.label}</Text>
            </HapticPressable>
          );
        })}
      </View>
    </View>
  );
};

const MenuRow: React.FC<{ icon: IconName; label: string; onPress: () => void }> = ({
  icon,
  label,
  onPress,
}) => {
  const styles = useThemedStyles(createStyles);
  return (
  <HapticPressable
    haptic="selection"
    scaleTo={0.985}
    borderRadius={Radii.md}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={styles.menuRow}>
    <Ionicons name={icon} size={20} color={BrandColors.primary} />
    <Text style={styles.menuText}>{label}</Text>
  </HapticPressable>
  );
};

const createStyles = (t: AppTheme) =>
  StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    paddingStart: 4,
  },
  brandEmblem: {
    width: 30,
    height: 30,
    marginEnd: 8,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: '#0F172A',
  },
  categoriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    paddingHorizontal: 14,
  },
  categoriesLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: SERIF,
    letterSpacing: -0.1,
  },
  categoryList: {
    paddingTop: 8,
    paddingBottom: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginEnd: 12,
  },
  categoryText: {
    fontSize: 13.5,
    color: t.text,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: t.border,
    marginVertical: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  menuText: {
    fontSize: 16,
    color: t.text,
    fontFamily: SERIF,
    letterSpacing: -0.1,
  },
  switcherBlock: {
    marginBottom: 12,
    gap: 8,
  },
  switcherLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: t.textMuted,
    paddingStart: 4,
  },
  switcher: {
    flexDirection: 'row',
    padding: SWITCH_PAD,
    borderRadius: Radii.md,
    backgroundColor: t.surfaceAlt,
  },
  switcherPill: {
    position: 'absolute',
    top: SWITCH_PAD,
    bottom: SWITCH_PAD,
    left: SWITCH_PAD,
    borderRadius: Radii.sm,
    backgroundColor: t.surface,
    ...Shadows.card,
  },
  switcherItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 38,
  },
  switcherText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: t.textMuted,
  },
  switcherTextOn: {
    color: t.text,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  logoutText: {
    fontSize: 14,
    color: t.text,
    fontFamily: SERIF,
  },
});
