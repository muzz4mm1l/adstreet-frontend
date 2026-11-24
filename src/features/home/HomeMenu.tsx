import React, { useState } from 'react';
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
import { AnimationPresets, BrandColors, Radii, SurfaceColors } from '@/constants/theme';

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

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

/** Home side menu: categories (expandable), settings, account, help, log out. */
export const HomeMenu: React.FC<HomeMenuProps> = ({
  visible,
  onClose,
  onSelectCategory,
  onSelectItem,
  onLogout,
}) => {
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
              colors={[BrandColors.primary, 'rgba(227, 30, 36, 0.08)']}
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

const MenuRow: React.FC<{ icon: IconName; label: string; onPress: () => void }> = ({
  icon,
  label,
  onPress,
}) => (
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

const styles = StyleSheet.create({
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
    color: SurfaceColors.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
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
    color: SurfaceColors.textPrimary,
    fontFamily: SERIF,
    letterSpacing: -0.1,
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
    color: SurfaceColors.textPrimary,
    fontFamily: SERIF,
  },
});
