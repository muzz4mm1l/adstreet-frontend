import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenStatusBar } from '@/components/navigation/ScreenStatusBar';
import { SwipeBackContainer } from '@/components/navigation/SwipeBackContainer';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors } from '@/constants/theme';
import { PopularJobs } from './PopularJobs';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const DEEP_RED = BrandColors.primary;
const TEAL = '#3FBFC2';

interface ServiceCategory {
  id: string;
  label: string;
  icon: IconName;
}

// Placeholder taxonomy until the real service categories are provided.
const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'creators', label: 'Content Creators', icon: 'laptop-outline' },
  { id: 'ai', label: 'AI (Artificial Intelligence)', icon: 'hardware-chip-outline' },
  { id: 'pr', label: 'PR Agencies', icon: 'megaphone-outline' },
  { id: 'architecture', label: 'Architecture & Design', icon: 'business-outline' },
  { id: 'digital-marketing', label: 'Digital Marketing', icon: 'trending-up-outline' },
  { id: 'design-house', label: 'Design House', icon: 'cube-outline' },
  { id: 'music-sound', label: 'Music & Sound Production', icon: 'musical-notes-outline' },
  { id: 'freelancers', label: 'Freelancers', icon: 'person-outline' },
  { id: 'media-houses', label: 'Media Houses', icon: 'newspaper-outline' },
  { id: 'digital-agencies', label: 'Digital Agencies', icon: 'globe-outline' },
  { id: 'event-management', label: 'Event Management', icon: 'calendar-outline' },
  { id: 'talent', label: 'Talent', icon: 'star-outline' },
  { id: 'web-app-designers', label: 'Web & App Designers', icon: 'phone-portrait-outline' },
  { id: 'visual-arts', label: 'Visual Arts', icon: 'color-palette-outline' },
  { id: 'photographers', label: 'Photographers', icon: 'camera-outline' },
  { id: 'influencers', label: 'Influencers', icon: 'people-outline' },
  { id: 'production-houses', label: 'Production Houses', icon: 'film-outline' },
  { id: 'ad-agencies', label: 'Ad Agencies', icon: 'radio-outline' },
  { id: 'outdoor-advertising', label: 'Outdoor Advertising', icon: 'easel-outline' },
  { id: 'tech-interactive', label: 'Technology & Interactive Media', icon: 'game-controller-outline' },
  { id: 'writing-storytelling', label: 'Writing & Story Telling', icon: 'create-outline' },
  { id: 'craftsmanships', label: 'Craftsmanships', icon: 'hammer-outline' },
  { id: 'culinary-arts', label: 'Culinary Arts', icon: 'restaurant-outline' },
  { id: 'education-arts', label: 'Education in Arts', icon: 'school-outline' },
  { id: 'dance-movement', label: 'Dance & Movement Arts', icon: 'body-outline' },
  { id: 'others', label: 'Others', icon: 'ellipsis-horizontal-circle-outline' },
];

interface AdBazaarScreenViewProps {
  onBack: () => void;
  /** Screen revealed underneath while this page slides away (swipe / hardware back). */
  renderPreviousScreen?: () => React.ReactNode;
  onSelectCategory?: (category: ServiceCategory) => void;
}

/** Brand badge: gray "AD" + red "BAZAAR" in a white, double-outlined pill. */
const LogoBadge: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => {
  const styles = useThemedStyles(createStyles);
  const big = size === 'lg';
  return (
    <View style={[styles.badgeOuter, big && styles.badgeOuterLg]}>
      <View style={[styles.badgeInner, big && styles.badgeInnerLg]}>
        <Text style={[styles.badgeText, big && styles.badgeTextLg]}>
          <Text style={styles.badgeAd}>AD </Text>
          <Text style={styles.badgeBazaar}>BAZAAR</Text>
        </Text>
      </View>
    </View>
  );
};

/** Striped shop awning with scalloped edge, drawn with Views. */
const Awning: React.FC<{ height: number }> = ({ height }) => {
  const styles = useThemedStyles(createStyles);
  return (
  <View style={[styles.awning, { height }]} pointerEvents="none">
    {Array.from({ length: 9 }).map((_, i) => (
      <View key={i} style={[styles.awningStripe, { backgroundColor: i % 2 === 0 ? TEAL : '#FFFFFF' }]} />
    ))}
  </View>
  );
};

export const AdBazaarScreenView: React.FC<AdBazaarScreenViewProps> = ({
  onBack,
  renderPreviousScreen,
  onSelectCategory,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <SwipeBackContainer
      onBack={onBack}
      backgroundColor={theme.canvas}
      renderPrevious={renderPreviousScreen}>
      <View style={styles.root}>
        <ScreenStatusBar style="light" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
          {/* Header: awning, back + logo, tagline, search: one red block (logo appears once) */}
          <View style={styles.header}>
            <Awning height={Math.max(insets.top, 16) + 30} />

            <View style={styles.headerRow}>
              <HapticPressable
                haptic="light"
                borderRadius={20}
                onPress={onBack}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </HapticPressable>
              <Animated.View
                entering={FadeInUp.duration(420).delay(80)}
                style={styles.headerLogo}
                pointerEvents="none">
                <LogoBadge size="lg" />
              </Animated.View>
              <View style={styles.backButton} />
            </View>

            <Animated.Text entering={FadeInUp.duration(420).delay(140)} style={styles.heroTagline}>
              Seek/offer services
            </Animated.Text>

            <Animated.View entering={FadeInDown.duration(380).delay(200)} style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={theme.textMuted} />
              <TextInput
                placeholder="Search For Services"
                placeholderTextColor={theme.textMuted}
                returnKeyType="search"
                style={styles.searchInput}
                accessibilityLabel="Search for services"
              />
            </Animated.View>
          </View>

          {/* Service categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            contentContainerStyle={styles.categoryRow}>
            {SERVICE_CATEGORIES.map((cat, i) => (
              <Animated.View key={cat.id} entering={FadeInDown.duration(340).delay(160 + Math.min(i, 8) * 45)}>
                <HapticPressable
                  haptic="light"
                  scaleTo={0.94}
                  borderRadius={14}
                  onPress={() => onSelectCategory?.(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={cat.label}
                  style={styles.categoryItem}>
                  <View style={styles.categoryCircle}>
                    <Ionicons name={cat.icon} size={26} color="#FFFFFF" />
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={2}>
                    {cat.label}
                  </Text>
                </HapticPressable>
              </Animated.View>
            ))}
          </ScrollView>

          <View style={styles.jobsGap} />
          <PopularJobs />
        </ScrollView>
      </View>
    </SwipeBackContainer>
  );
};

const createStyles = (t: AppTheme) =>
  StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.canvas,
  },
  header: {
    backgroundColor: DEEP_RED,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  searchBar: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: t.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: t.text,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  awning: {
    flexDirection: 'row',
  },
  awningStripe: {
    flex: 1,
    height: '100%',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  heroTagline: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badgeOuter: {
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    padding: 2,
  },
  badgeOuterLg: {
    borderRadius: 9,
    padding: 3,
  },
  badgeInner: {
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: '#B8BDC4',
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  badgeInnerLg: {
    borderRadius: 6,
    paddingHorizontal: 22,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 2,
  },
  badgeTextLg: {
    fontSize: 22,
    letterSpacing: 3,
  },
  badgeAd: {
    color: '#4A4A4F',
  },
  badgeBazaar: {
    color: '#E8222A',
  },
  categoryRow: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 6,
    gap: 6,
  },
  categoryItem: {
    width: 92,
    alignItems: 'center',
    paddingVertical: 6,
  },
  categoryCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E8222A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 11.5,
    lineHeight: 15,
    textAlign: 'center',
    color: t.text,
    fontWeight: '500',
  },
  jobsGap: {
    height: 8,
  },
});
