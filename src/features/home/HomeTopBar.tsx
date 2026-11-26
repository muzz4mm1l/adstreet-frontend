import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface HomeTopBarProps {
  onOpenMenu?: () => void;
  /** When set, the leading chip is a back arrow (same size/position as the hamburger) instead of the menu. */
  onBack?: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  /** 'onBrand' = white icons on the crimson header (Home); 'onLight' = dark icons on a light/dark canvas. */
  tone?: 'onBrand' | 'onLight';
  /** Icon / chip colour for tone="onLight" (pass a theme token). */
  ink?: string;
}

/**
 * The Home header row: hamburger, ADSTREET badge, search, notifications (with dot) and coin pill.
 * Shared by Home and Global Search so both headers use identical icons, sizes and spacing.
 * Deliberately flat (no shadows/elevation): an elevated translucent chip draws a faceted shadow
 * polygon behind itself on Android.
 */
export const HomeTopBar: React.FC<HomeTopBarProps> = ({
  onOpenMenu,
  onBack,
  onOpenSearch,
  onOpenNotifications,
  tone = 'onBrand',
  ink = '#3A3A3A',
}) => {
  const onBrand = tone === 'onBrand';
  const iconColor = onBrand ? '#FFFFFF' : ink;
  const chipBg = onBrand ? 'rgba(255, 255, 255, 0.1)' : 'rgba(128, 128, 128, 0.14)';

  return (
    <View style={styles.topBar}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={[styles.iconButton, { backgroundColor: chipBg }]}>
          <Ionicons name="arrow-back" size={19} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onOpenMenu}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={[styles.iconButton, { backgroundColor: chipBg }]}>
          <View style={styles.hamburgerIcon}>
            <View style={[styles.hamburgerBar, { width: 15, backgroundColor: iconColor }]} />
            <View style={[styles.hamburgerBar, { width: 12.5, backgroundColor: iconColor }]} />
            <View style={[styles.hamburgerBar, { width: 8.5, backgroundColor: iconColor }]} />
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.brandBadge}>
        <View style={styles.brandPill}>
          <Text style={styles.brandText}>
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

      <View style={styles.rightActionsGroup}>
        <TouchableOpacity
          onPress={onOpenSearch}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Search"
          style={[styles.iconButton, { backgroundColor: chipBg }]}>
          <Ionicons name="search-outline" size={18} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenNotifications}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={[styles.iconButton, { backgroundColor: chipBg }]}>
          <Ionicons name="notifications-outline" size={19} color={iconColor} />
          <View style={[styles.notificationDot, { backgroundColor: onBrand ? '#FFFFFF' : '#EC2029' }]} />
        </TouchableOpacity>

        <View style={[styles.coinPill, { backgroundColor: chipBg }]}>
          <Image
            source={require('@/assets/images/adstreet-coin.png')}
            style={styles.coinImage}
            contentFit="contain"
          />
          <Text style={[styles.coinCount, { color: iconColor }]}>15</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerIcon: {
    gap: 3.8,
    alignItems: 'flex-start',
  },
  hamburgerBar: {
    height: 1.75,
    borderRadius: 1,
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
    borderColor: '#E31E24',
    paddingStart: 22,
    paddingEnd: 9,
    height: 22,
    marginStart: 13,
    justifyContent: 'center',
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
    color: '#111827',
  },
  brandTextStreet: {
    fontWeight: '500',
    color: '#4B5563',
  },
  rightActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    start: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 14,
    paddingStart: 9,
    paddingEnd: 13,
    gap: 7,
  },
  coinImage: {
    width: 21,
    height: 21,
  },
  coinCount: {
    fontSize: 15,
    fontWeight: '600',
  },
});
