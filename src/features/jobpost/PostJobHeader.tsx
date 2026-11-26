import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Shadows } from '@/constants/theme';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';

export const JOBPOST_PALETTE = {
  lightCanvas: '#F9F2F2',
  lightTopWash: '#F7CFD1',
  darkTopWash: '#3A1418',
  accent: '#EC2029',
  ink: '#3A3A3A',
  muted: '#777777',
  placeholder: '#999999',
  inputBorder: '#EDEDED',
  brandAd: '#111827',
  brandStreet: '#4B5563',
  statusActive: '#0EB92E',
  statusFilled: '#D97706',
  statusExpired: '#EC2029',
  statusClosed: '#6B7280',
  tagCreativeBg: 'rgba(201, 47, 53, 0.10)',
  tagCreativeText: '#C92F35',
  tagGreenBg: 'rgba(23, 178, 51, 0.12)',
  tagGreenText: '#17B233',
} as const;

interface PostJobHeaderProps {
  onMenuOrBack: () => void;
  showBackInTopNav?: boolean;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  showAdBazaarBadge?: boolean;
  showBackChevronOnBadge?: boolean;
  onBackChevron?: () => void;
  children?: React.ReactNode;
}

/** Shared blush ambient header for the + Job Post, Preview, My Listings, and Talent Profile screens. */
export const PostJobHeader: React.FC<PostJobHeaderProps> = ({
  onMenuOrBack,
  showBackInTopNav = false,
  onOpenSearch,
  onOpenNotifications,
  showAdBazaarBadge = true,
  showBackChevronOnBadge = false,
  onBackChevron,
  children,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme.scheme === 'dark';

  const washColors: readonly [string, string] = isDark
    ? [JOBPOST_PALETTE.darkTopWash, theme.canvas]
    : [JOBPOST_PALETTE.lightTopWash, JOBPOST_PALETTE.lightCanvas];

  return (
    <LinearGradient
      colors={washColors}
      locations={[0, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[
        styles.headerContainer,
        { paddingTop: Math.max(insets.top, 12) + 4 },
      ]}>
      {/* TopNav */}
      <View style={styles.topBar}>
        <View style={styles.topLeftGroup}>
          <HapticPressable
            haptic="none"
            borderRadius={18}
            onPress={onMenuOrBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={showBackInTopNav ? 'Go back' : 'Open menu'}
            style={styles.topCircleBtn}>
            {showBackInTopNav ? (
              <Ionicons
                name="arrow-back"
                size={18}
                color={isDark ? theme.text : JOBPOST_PALETTE.ink}
              />
            ) : (
              <View style={styles.hamburgerIcon}>
                <View style={[styles.hamburgerBar, { width: 14 }]} />
                <View style={[styles.hamburgerBar, { width: 11.5 }]} />
                <View style={[styles.hamburgerBar, { width: 8 }]} />
              </View>
            )}
          </HapticPressable>

          <View style={styles.brandBadge}>
            <View style={styles.brandPill}>
              <Text maxFontSizeMultiplier={1.2} style={styles.brandText}>
                <Text style={styles.brandTextAd}>AD</Text>
                <Text style={styles.brandTextStreet}>STREET</Text>
              </Text>
            </View>
            <Image
              source={require('@/assets/images/splash-logo-clean.png')}
              style={styles.brandEmblem}
              contentFit="contain"
            />
          </View>
        </View>

        <View style={styles.topRightGroup}>
          <HapticPressable
            haptic="none"
            borderRadius={18}
            onPress={onOpenSearch}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Search"
            style={styles.topCircleBtn}>
            <Ionicons
              name="search-outline"
              size={16}
              color={isDark ? theme.text : JOBPOST_PALETTE.ink}
            />
          </HapticPressable>

          <HapticPressable
            haptic="none"
            borderRadius={18}
            onPress={onOpenNotifications}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={styles.topCircleBtn}>
            <Ionicons
              name="notifications-outline"
              size={17}
              color={isDark ? theme.text : JOBPOST_PALETTE.ink}
            />
            <View style={styles.notificationDot} />
          </HapticPressable>

          <View style={styles.coinPill}>
            <Image
              source={require('@/assets/images/adstreet-coin.png')}
              style={styles.coinImage}
              contentFit="contain"
            />
            <Text maxFontSizeMultiplier={1.2} style={styles.coinCount}>
              15
            </Text>
          </View>
        </View>
      </View>

      {/* Optional ADBAZAAR Pill Badge Row */}
      {showAdBazaarBadge ? (
        <View style={styles.badgeRow}>
          {showBackChevronOnBadge ? (
            <HapticPressable
              haptic="none"
              borderRadius={12}
              onPress={onBackChevron}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={styles.backChevronBtn}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={isDark ? theme.text : JOBPOST_PALETTE.ink}
              />
            </HapticPressable>
          ) : null}
          <Image
            source={require('@/assets/images/adbazaar/adbazaar-logo.png')}
            style={styles.adBazaarBadgeImg}
            contentFit="contain"
            accessibilityLabel="AdBazaar"
          />
        </View>
      ) : null}

      {children}
    </LinearGradient>
  );
};

const createStyles = (t: AppTheme) => {
  const isDark = t.scheme === 'dark';
  const ink = isDark ? t.text : JOBPOST_PALETTE.ink;

  return StyleSheet.create({
    headerContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    topLeftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    topRightGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    topCircleBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.52)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.86)',
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.card,
    },
    hamburgerIcon: {
      gap: 3.5,
      alignItems: 'flex-start',
    },
    hamburgerBar: {
      height: 1.6,
      borderRadius: 1,
      backgroundColor: ink,
    },
    brandBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 30,
      justifyContent: 'center',
    },
    brandPill: {
      backgroundColor: '#FFFFFF',
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: BrandColors.primary,
      paddingStart: 22,
      paddingEnd: 9,
      height: 22,
      marginStart: 13,
      justifyContent: 'center',
      ...Shadows.card,
    },
    brandEmblem: {
      position: 'absolute',
      start: 0,
      width: 30,
      height: 30,
    },
    brandText: {
      fontSize: 11.5,
      letterSpacing: 2.0,
    },
    brandTextAd: {
      fontWeight: '700',
      color: JOBPOST_PALETTE.brandAd,
    },
    brandTextStreet: {
      fontWeight: '500',
      color: JOBPOST_PALETTE.brandStreet,
    },
    notificationDot: {
      position: 'absolute',
      top: 0,
      start: 1,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: JOBPOST_PALETTE.accent,
    },
    coinPill: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 34,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.55)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.86)',
      borderRadius: 14,
      paddingStart: 8,
      paddingEnd: 11,
      gap: 5,
      ...Shadows.card,
    },
    coinImage: {
      width: 20,
      height: 20,
    },
    coinCount: {
      fontSize: 14,
      fontWeight: '600',
      color: ink,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 14,
    },
    backChevronBtn: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginStart: -4,
    },
    adBazaarBadgeImg: {
      width: 101,
      height: 24,
      borderRadius: 4,
    },
  });
};
