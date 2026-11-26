import React, { useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenStatusBar } from '@/components/navigation/ScreenStatusBar';
import {
  SwipeBackContainer,
  SwipeBackHandle,
  useIsPeek,
} from '@/components/navigation/SwipeBackContainer';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { DisplayFont } from '@/constants/fonts';
import { BrandColors, Radii, Shadows } from '@/constants/theme';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';
import { ExploreCloud } from './ExploreCloud';
import { FLOATING_BAR_CLEARANCE } from '@/components/navigation/FloatingTabBarOverlay';
import { HomeTopBar } from '@/features/home/HomeTopBar';
import { JobListing } from './PopularJobs';
import {
  ADBAZAAR_CATEGORY_CLOUD,
  ADBAZAAR_FEATURED_OPPORTUNITIES,
  ADBAZAAR_FREELANCERS,
  ADBAZAAR_LATEST_LISTINGS,
  ADBAZAAR_QUICK_CATEGORIES,
  AdBazaarCloudCategory,
  AdBazaarFreelancer,
  AdBazaarOpportunity,
  AdBazaarQuickCategory,
  toAdBazaarJobListing,
} from './adBazaarData';

/** Last vertical scroll offset so the frozen back-preview matches the live scroll position. */
let lastScrollY = 0;

const BAZAAR_PALETTE = {
  lightCanvas: '#F9F2F2',
  lightTopWash: '#F7CFD1',
  darkTopWash: '#3A1418',
  accent: '#EC2029',
  success: '#16A34A',
  ink: '#3A3A3A',
  muted: '#777777',
  brandAd: '#111827',
  brandStreet: '#4B5563',
  rateText: '#C92F35',
  rateTint: 'rgba(201, 47, 53, 0.10)',
  budgetTint: 'rgba(236, 32, 41, 0.10)',
  ctaLightStops: ['#F4A5A8', '#FBE9EA', '#FFFFFF', '#E3F1FA', '#90C9EC'] as const,
  ctaDarkStops: ['#7A2D33', '#3A1D22', '#1A1A1F', '#1B2D3D', '#2C5878'] as const,
} as const;

const FREELANCER_CARD_W = 168;
const FREELANCER_GAP = 12;

export interface ServiceCategory {
  id: string;
  label: string;
}

interface AdBazaarScreenViewProps {
  onBack: () => void;
  /** Screen revealed underneath while this page slides away (swipe / hardware back). */
  renderPreviousScreen?: () => React.ReactNode;
  onSelectCategory?: (category: AdBazaarQuickCategory) => void;
  onPressJob?: (job: JobListing) => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}

const SectionHeading: React.FC<{
  prefix: string;
  accent: string;
  center?: boolean;
  action?: string;
  onAction?: () => void;
}> = ({ prefix, accent, center, action, onAction }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.sectionHeaderRow, center && styles.sectionHeaderCentered]}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, center && styles.centerText]}>
        <Text>{prefix}</Text>
        <Text style={styles.sectionTitleAccent}>{accent}</Text>
      </Text>
      {action ? (
        <HapticPressable
          haptic="selection"
          scaleTo={0.96}
          borderRadius={Radii.sm}
          onPress={onAction}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={action}>
          <Text maxFontSizeMultiplier={1.35} style={styles.viewAllLink}>
            {action}
          </Text>
        </HapticPressable>
      ) : null}
    </View>
  );
};

const FeaturedOpportunityCard: React.FC<{
  item: AdBazaarOpportunity;
        showPastelWash?: boolean;
  onOpenDetails: () => void;
}> = React.memo(({item, showPastelWash, onOpenDetails}) => {
  const styles = useThemedStyles(createStyles);
        const theme = useAppTheme();

  return (

        <View style={styles.jobCard}>
          {showPastelWash ? (
            <LinearGradient
              colors={[theme.washPink, theme.surface, theme.washBlue]}
              locations={[0, 0.48, 1]}
              start={{ x: 0, y: 0.1 }}
              end={{ x: 1, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}

          {/* Top Row: Square Avatar + Title/Company + Details CTA */}
          <View style={styles.featuredTopRow}>
            <HapticPressable haptic="light" scaleTo={0.985} borderRadius={12} onPress={onOpenDetails} accessibilityRole="button" accessibilityLabel={`${item.title} at ${item.company}, Budget ${item.budgetShort}`} style={styles.featuredTitleGroup}>
              <LinearGradient
                colors={item.avatarColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.featuredSquareAvatar}>
                <Text maxFontSizeMultiplier={1.25} style={styles.featuredAvatarText}>
                  {item.initials}
                </Text>
              </LinearGradient>
              <View style={styles.featuredTitleTextCol}>
                <Text style={styles.jobTitleFeatured} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.jobCompany} numberOfLines={1}>
                  {item.company}
                </Text>
              </View>
            </HapticPressable>

            <HapticPressable
              haptic="light"
              scaleTo={0.94}
              borderRadius={10}
              onPress={onOpenDetails}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${item.title}`}
              style={styles.primarySmallBtn}>
              <Text maxFontSizeMultiplier={1.3} style={styles.primarySmallBtnText}>
                Details
              </Text>
            </HapticPressable>
          </View>

          {/* Location + Description */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={BAZAAR_PALETTE.accent} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          {item.description ? (
            <Text style={styles.jobDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {/* Footer Meta: Tag + Time on left, Translucent Budget pill on right */}
          <View style={styles.jobFooterSplitRow}>
            <View style={styles.jobFooterMeta}>
              <View style={[styles.tagPill, { backgroundColor: item.tagBg }]}>
                <Text maxFontSizeMultiplier={1.3} style={[styles.tagPillText, { color: item.tagColor }]}>
                  {item.tag}
                </Text>
              </View>
              <Text maxFontSizeMultiplier={1.3} style={styles.postedText}>
                {item.posted}
              </Text>
            </View>

            <View style={styles.budgetGlassPill}>
              <Text maxFontSizeMultiplier={1.25} style={styles.budgetLabelText}>
                Budget:{' '}
              </Text>
              <Text maxFontSizeMultiplier={1.25} style={styles.budgetValueText}>
                {item.budgetShort}
              </Text>
            </View>
          </View>
        </View>
  );
});

        const LatestListingCard: React.FC<{
  item: AdBazaarOpportunity;
        showPastelWash?: boolean;
        applied?: boolean;
  onPressCard: () => void;
  onApply: () => void;
}> = React.memo(({item, showPastelWash, applied, onPressCard, onApply}) => {
  const styles = useThemedStyles(createStyles);
        const theme = useAppTheme();

        return (
        <View style={styles.jobCard}>
          {showPastelWash ? (
            <LinearGradient
              colors={[theme.washPink, theme.surface, theme.washBlue]}
              locations={[0, 0.48, 1]}
              start={{ x: 0, y: 0.1 }}
              end={{ x: 1, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}

          <View style={styles.listingTopRow}>
            <HapticPressable haptic="light" scaleTo={0.985} borderRadius={12} onPress={onPressCard} accessibilityRole="button" accessibilityLabel={`${item.title} at ${item.company}, Budget ${item.budgetShort}`} style={styles.listingMainText}>
              <Text style={styles.jobTitleListing} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.jobCompany} numberOfLines={1}>
                {item.company}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color={BAZAAR_PALETTE.accent} />
                <Text style={styles.locationText}>{item.location}</Text>
              </View>
            </HapticPressable>

            <HapticPressable
              haptic={applied ? 'none' : 'medium'}
              scaleTo={0.94}
              borderRadius={10}
              onPress={onApply}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel={applied ? `Applied to ${item.title}` : `Apply for ${item.title}`}
              style={[styles.primarySmallBtn, applied && styles.appliedSmallBtn]}>
              <Text maxFontSizeMultiplier={1.3} style={styles.primarySmallBtnText}>
                {applied ? 'Applied' : 'Apply'}
              </Text>
            </HapticPressable>
          </View>

          <View style={styles.jobFooterSplitRow}>
            <View style={styles.jobFooterMeta}>
              <View style={[styles.tagPill, { backgroundColor: item.tagBg }]}>
                <Text maxFontSizeMultiplier={1.3} style={[styles.tagPillText, { color: item.tagColor }]}>
                  {item.tag}
                </Text>
              </View>
              <Text maxFontSizeMultiplier={1.3} style={styles.postedText}>
                {item.posted}
              </Text>
            </View>

            <View style={styles.budgetTintPill}>
              <Text maxFontSizeMultiplier={1.25} style={styles.budgetLabelText}>
                Budget:{' '}
              </Text>
              <Text maxFontSizeMultiplier={1.25} style={styles.budgetValueText}>
                {item.budgetShort}
              </Text>
            </View>
          </View>
        </View>
        );
});

        const FreelancerCard: React.FC<{
  item: AdBazaarFreelancer;
        showPastelWash?: boolean;
  onViewProfile: () => void;
}> = React.memo(({item, showPastelWash, onViewProfile}) => {
  const styles = useThemedStyles(createStyles);
        const theme = useAppTheme();

        return (
        <View style={[styles.freelancerCard, { width: FREELANCER_CARD_W }]}>
          {showPastelWash ? (
            <LinearGradient
              colors={[theme.washPink, theme.surface, theme.washBlue]}
              locations={[0, 0.5, 1]}
              start={{ x: 0.9, y: 0 }}
              end={{ x: 0.1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}

          <LinearGradient
            colors={item.avatarColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.freelancerAvatar, { shadowColor: item.shadowColor }]}>
            <Text maxFontSizeMultiplier={1.2} style={styles.freelancerAvatarText}>
              {item.initials}
            </Text>
          </LinearGradient>

          <View style={styles.freelancerNameBlock}>
            <Text style={styles.freelancerName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.freelancerRole} numberOfLines={1}>
              {item.role}
            </Text>
          </View>

          <View style={styles.freelancerRateRow}>
            <View style={styles.ratePill}>
              <Text maxFontSizeMultiplier={1.2} style={styles.ratePillText} numberOfLines={1}>
                {item.rateLabel}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={10} color={BAZAAR_PALETTE.accent} />
              <Text maxFontSizeMultiplier={1.2} style={styles.ratingText}>
                {item.rating}
              </Text>
            </View>
          </View>

          <HapticPressable
            haptic="light"
            scaleTo={0.96}
            borderRadius={10}
            onPress={onViewProfile}
            accessibilityRole="button"
            accessibilityLabel={`View profile for ${item.name}`}
            style={styles.viewProfileBtn}>
            <Text maxFontSizeMultiplier={1.3} style={styles.viewProfileBtnText}>
              View Profile
            </Text>
          </HapticPressable>
        </View>
        );
});

        export const AdBazaarScreenView: React.FC<AdBazaarScreenViewProps> = ({
          onBack,
          renderPreviousScreen,
          onSelectCategory,
          onPressJob,
          onOpenSearch,
          onOpenNotifications,
}) => {
  const styles = useThemedStyles(createStyles);
          const theme = useAppTheme();
          const insets = useSafeAreaInsets();
          const inPeek = useIsPeek();
          const reduceMotion = useReducedMotion();
          const {width: windowWidth } = useWindowDimensions();

          const swipeBackRef = useRef<SwipeBackHandle>(null);
            const searchInputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
              const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

                const [query, setQuery] = useState('');
                const [selectedQuickCatId, setSelectedQuickCatId] = useState<string | null>(null);
                const [selectedCloudFilter, setSelectedCloudFilter] = useState<string | null>(null);
                const [appliedJobIds, setAppliedJobIds] = useState<Record<string, boolean>>({ });
                  const [freelancerPage, setFreelancerPage] = useState(0);
                  const [activeFreelancer, setActiveFreelancer] = useState<AdBazaarFreelancer | null>(null);
                  const [postJobOpen, setPostJobOpen] = useState(false);
                  const [notificationsOpen, setNotificationsOpen] = useState(false);
                  const [postTitle, setPostTitle] = useState('');
                  const [postSubmitted, setPostSubmitted] = useState(false);
                  const [hiredFreelancerIds, setHiredFreelancerIds] = useState<Record<string, boolean>>({ });

                    const searchFocus = useSharedValue(0);
  const searchBorderStyle = useAnimatedStyle(() => ({
                      borderColor:
      searchFocus.value > 0.5
                    ? 'rgba(236, 32, 41, 0.45)'
                    : theme.scheme === 'dark'
                    ? 'rgba(255, 255, 255, 0.14)'
                    : 'rgba(255, 255, 255, 0.92)',
  }));

                    const [cloudActive, setCloudActive] = useState(false);
  const cloudBox = useRef({ y: 0, h: 0 });
  const scrollYRef = useRef(0);
  const { height: windowHeight } = useWindowDimensions();
  const updateCloud = () => {
    const { y, h } = cloudBox.current;
    if (!h) return;
    const top = scrollYRef.current;
    const onScreen = top + windowHeight * 0.85 > y + 140 && top < y + h - 60;
    setCloudActive((prev) => (prev === onScreen ? prev : onScreen));
  };
  const onCloudLayout = (e: LayoutChangeEvent) => {
    cloudBox.current = { y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height };
    updateCloud();
  };
  const trackScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    lastScrollY = e.nativeEvent.contentOffset.y;
    scrollYRef.current = lastScrollY;
    updateCloud();
  };
  React.useEffect(() => {
    if (!inPeek) lastScrollY = 0; // a freshly opened page starts at the top
                      if (!inPeek) lastScrollY = 0;
  }, [inPeek]);

  const handleHeaderBack = () => {
    if (swipeBackRef.current) {
                        swipeBackRef.current.goBack();
    } else {
                        onBack();
    }
  };

  const activeQuickCat = ADBAZAAR_QUICK_CATEGORIES.find((c) => c.id === selectedQuickCatId);
                      const effectiveCategoryFilter = selectedCloudFilter ?? activeQuickCat?.filterKey ?? null;
                      const normalizedQuery = query.trim().toLowerCase();

  const matchesItem = (item: AdBazaarOpportunity) => {
    if (
                      effectiveCategoryFilter &&
                      !item.tag.toLowerCase().includes(effectiveCategoryFilter.toLowerCase()) &&
                      !item.title.toLowerCase().includes(effectiveCategoryFilter.toLowerCase())
                      ) {
      return false;
    }
                      if (!normalizedQuery) return true;
                      return (
                      item.title.toLowerCase().includes(normalizedQuery) ||
                      item.company.toLowerCase().includes(normalizedQuery) ||
                      item.location.toLowerCase().includes(normalizedQuery) ||
                      item.tag.toLowerCase().includes(normalizedQuery) ||
                      (item.description ?? '').toLowerCase().includes(normalizedQuery)
                      );
  };

                      const filteredFeatured = useMemo(
    () => ADBAZAAR_FEATURED_OPPORTUNITIES.filter(matchesItem),
                      [normalizedQuery, effectiveCategoryFilter],
                      );

                      const filteredListings = useMemo(
    () => ADBAZAAR_LATEST_LISTINGS.filter(matchesItem),
                      [normalizedQuery, effectiveCategoryFilter],
                      );

  const filteredFreelancers = useMemo(() => {
    if (!normalizedQuery) return ADBAZAAR_FREELANCERS;
                      return ADBAZAAR_FREELANCERS.filter(
      (f) =>
                      f.name.toLowerCase().includes(normalizedQuery) ||
                      f.role.toLowerCase().includes(normalizedQuery) ||
                      f.city.toLowerCase().includes(normalizedQuery),
                      );
  }, [normalizedQuery]);

  const handleQuickCategoryPress = (cat: AdBazaarQuickCategory) => {
    Haptics.selectionAsync().catch(() => { });
    if (onSelectCategory) {
      onSelectCategory(cat);
      return;
    }
    setSelectedCloudFilter(null);
    setSelectedQuickCatId((prev) => (prev === cat.id ? null : cat.id));
  };

  const handleCloudCategoryPress = (bubble: AdBazaarCloudCategory) => {
                        Haptics.selectionAsync().catch(() => { });
                      setSelectedQuickCatId(null);
    setSelectedCloudFilter((prev) =>
                      prev === bubble.filterKey ? null : bubble.filterKey,
                      );
                      scrollRef.current?.scrollTo({y: 420, animated: true });
  };

  const handleOpenJob = (item: AdBazaarOpportunity) => {
                        onPressJob?.(toAdBazaarJobListing(item));
  };

  const handleApplyInline = (item: AdBazaarOpportunity) => {
    if (appliedJobIds[item.id]) {
                        handleOpenJob(item);
                      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    setAppliedJobIds((prev) => ({...prev, [item.id]: true }));
  };

                      const handleFreelancerScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const step = FREELANCER_CARD_W + FREELANCER_GAP;
                        const page = Math.round(e.nativeEvent.contentOffset.x / step);
                        const maxPage = Math.max(0, filteredFreelancers.length - 1);
                        setFreelancerPage(Math.min(Math.max(page, 0), maxPage));
  };

  const clearAllFilters = () => {
                          Haptics.selectionAsync().catch(() => { });
                        setQuery('');
                        setSelectedQuickCatId(null);
                        setSelectedCloudFilter(null);
  };


  const isDark = theme.scheme === 'dark';
  const canvas = isDark ? theme.canvas : BAZAAR_PALETTE.lightCanvas;
  const topWashColors: readonly [string, string] = isDark
    ? [BAZAAR_PALETTE.darkTopWash, theme.canvas]
    : [BAZAAR_PALETTE.lightTopWash, BAZAAR_PALETTE.lightCanvas];
  const noMatches =
    filteredFeatured.length === 0 && filteredListings.length === 0 && filteredFreelancers.length === 0;
  const onScrollTrack = inPeek ? undefined : trackScroll;
  const cloudStyles = useMemo(
    () => ({
      box: styles.exploreBox,
      pos: styles.explorePos,
      pill: styles.explorePill,
      pillSelected: styles.explorePillSelected,
      title: styles.explorePillTitle,
      count: styles.explorePillCount,
    }),
    [styles],
  );

  return (
    <SwipeBackContainer
      ref={swipeBackRef}
      onBack={onBack}
      backgroundColor={canvas}
      renderPrevious={renderPreviousScreen}
      previousMounted>
      <View style={[styles.root, { backgroundColor: canvas }]}>
        <ScreenStatusBar style="light" />
        <Animated.View
          entering={reduceMotion ? undefined : FadeInRight.duration(260)}
          style={[styles.root, { backgroundColor: canvas }]}>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={64}
            onScroll={onScrollTrack}
            onScrollEndDrag={onScrollTrack}
            onMomentumScrollEnd={onScrollTrack}
            contentOffset={inPeek ? { x: 0, y: lastScrollY } : undefined}
            contentContainerStyle={{ paddingBottom: insets.bottom + FLOATING_BAR_CLEARANCE }}>
            <View style={[styles.headerContainer, { height: insets.top + 196 }]}>
              {/* Header artwork (awning, AdBazaar logo, tagline), shifted so the awning sits under the status bar */}
              <Image
                source={require('@/assets/images/adbazaar/header-banner.png')}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: insets.top - 118,
                  width: windowWidth,
                  height: (windowWidth * 258) / 310,
                }}
                contentFit="fill"
                accessibilityLabel="AdBazaar. Seek or offer services"
              />

              {/* Soft blur over the awning where the status bar sits */}
              {Platform.OS === 'ios' || Platform.OS === 'web' ? (
                <>
                  <BlurView intensity={10} tint="light" style={[styles.topBlur, { height: insets.top + 46 }]} />
                  <BlurView intensity={22} tint="light" style={[styles.topBlur, { height: insets.top + 30 }]} />
                  <BlurView intensity={40} tint="light" style={[styles.topBlur, { height: insets.top + 14 }]} />
                </>
              ) : (
                <LinearGradient
                  pointerEvents="none"
                  colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
                  style={[styles.topBlur, { height: insets.top + 46 }]}
                />
              )}

              {/* Same header row as Home (shared component), back arrow in place of the menu */}
              <View style={{ paddingTop: Math.max(insets.top, 16) + 14 }}>
                <HomeTopBar
                  tone="onBrand"
                  onBack={handleHeaderBack}
                  onOpenSearch={() => {
                    if (onOpenSearch) {
                      onOpenSearch();
                    } else {
                      scrollRef.current?.scrollTo({ y: 0, animated: true });
                      searchInputRef.current?.focus();
                    }
                  }}
                  onOpenNotifications={() => {
                    if (onOpenNotifications) {
                      onOpenNotifications();
                    } else {
                      setNotificationsOpen(true);
                    }
                  }}
                />
              </View>
            </View>

            <View style={styles.searchSection}>
              <Animated.View style={[styles.searchBox, searchBorderStyle]}>
                <Ionicons name="search-outline" size={17} color={BAZAAR_PALETTE.accent} />
                <TextInput
                  ref={searchInputRef}
                  value={query}
                  onChangeText={setQuery}
                  onFocus={() => {
                    searchFocus.value = withTiming(1, { duration: 180 });
                  }}
                  onBlur={() => {
                    searchFocus.value = withTiming(0, { duration: 180 });
                  }}
                  placeholder="Search for services"
                  placeholderTextColor={isDark ? theme.textMuted : BAZAAR_PALETTE.muted}
                  returnKeyType="search"
                  autoComplete="off"
                  autoCorrect={false}
                  underlineColorAndroid="transparent"
                  selectionColor={BAZAAR_PALETTE.accent}
                  cursorColor={BAZAAR_PALETTE.accent}
                  style={styles.searchInput}
                  accessibilityLabel="Search for services"
                />
                {query.length > 0 ? (
                  <TouchableOpacity
                    onPress={() => setQuery('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Clear search">
                    <Ionicons
                      name="close-circle"
                      size={17}
                      color={isDark ? theme.textMuted : BAZAAR_PALETTE.muted}
                    />
                  </TouchableOpacity>
                ) : null}
              </Animated.View>
            </View>

            <View style={styles.quickCategoriesWrap}>
              {ADBAZAAR_QUICK_CATEGORIES.map((cat) => {
                const selected = selectedQuickCatId === cat.id;
                return (
                  <HapticPressable
                    key={cat.id}
                    haptic="selection"
                    scaleTo={0.95}
                    borderRadius={14}
                    onPress={() => handleQuickCategoryPress(cat)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={cat.label}
                    style={[styles.quickCategoryChip, selected && styles.quickCategoryChipSelected]}>
                    <Image
                      source={cat.iconAsset}
                      style={{ width: cat.iconWidth, height: cat.iconHeight }}
                      contentFit="contain"
                    />
                    <Text maxFontSizeMultiplier={1.3} style={styles.quickCategoryLabel}>
                      {cat.label}
                    </Text>
                  </HapticPressable>
                );
              })}
            </View>

            {effectiveCategoryFilter ? (
              <View style={styles.activeFilterRow}>
                <Text style={styles.activeFilterLabel}>
                  Filtered by: {activeQuickCat?.label ?? effectiveCategoryFilter}
                </Text>
                <TouchableOpacity
                  onPress={clearAllFilters}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.clearFilterText}>Reset</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {noMatches ? (
              <View style={styles.emptyCard}>
                <Ionicons name="search-outline" size={32} color={BAZAAR_PALETTE.accent} />
                <Text style={styles.emptyTitle}>No matching services or roles</Text>
                <Text style={styles.emptySubtitle}>
                  Try another search keyword or reset the selected discipline filter.
                </Text>
                <HapticPressable
                  haptic="light"
                  scaleTo={0.94}
                  borderRadius={12}
                  onPress={clearAllFilters}
                  style={styles.emptyResetBtn}>
                  <Text maxFontSizeMultiplier={1.3} style={styles.primarySmallBtnText}>
                    Clear Filters
                  </Text>
                </HapticPressable>
              </View>
            ) : null}

            {filteredFeatured.length > 0 ? (
              <View style={styles.sectionBlock}>
                <SectionHeading prefix="Featured " accent="Opportunities" />
                <View style={styles.cardStack}>
                  {filteredFeatured.map((item, idx) => (
                    <Animated.View
                      key={item.id}
                      entering={
                        reduceMotion || idx >= 3 ? undefined : FadeInDown.duration(300).delay(idx * 50)
                      }>
                      <FeaturedOpportunityCard
                        item={item}
                        showPastelWash={idx === 0}
                        onOpenDetails={() => handleOpenJob(item)}
                      />
                    </Animated.View>
                  ))}
                </View>
              </View>
            ) : null}

            {filteredListings.length > 0 ? (
              <View style={styles.sectionBlock}>
                <SectionHeading
                  prefix="Latest "
                  accent="Listings"
                  action={effectiveCategoryFilter || query ? 'Reset' : undefined}
                  onAction={clearAllFilters}
                />
                <View style={styles.cardStack}>
                  {filteredListings.map((item, idx) => (
                    <Animated.View
                      key={item.id}
                      entering={
                        reduceMotion || idx >= 3 ? undefined : FadeInDown.duration(300).delay(idx * 45)
                      }>
                      <LatestListingCard
                        item={item}
                        showPastelWash={idx === 0}
                        applied={Boolean(appliedJobIds[item.id])}
                        onPressCard={() => handleOpenJob(item)}
                        onApply={() => handleApplyInline(item)}
                      />
                    </Animated.View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.sectionBlock} onLayout={onCloudLayout}>
              <SectionHeading prefix="Explore by " accent="Category" center />
              <ExploreCloud
                items={ADBAZAAR_CATEGORY_CLOUD}
                width={Math.max(windowWidth - 32, 280)}
                height={350}
                active={cloudActive}
                selectedKey={selectedCloudFilter}
                onPressItem={handleCloudCategoryPress}
                styles={cloudStyles}
              />
</View>

            {filteredFreelancers.length > 0 ? (
              <View style={styles.sectionBlock}>
                <SectionHeading
                  prefix="Hire a "
                  accent="Freelancer"
                  action="Browse All"
                  onAction={() => setActiveFreelancer(filteredFreelancers[0])}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={FREELANCER_CARD_W + FREELANCER_GAP}
                  onMomentumScrollEnd={handleFreelancerScrollEnd}
                  contentContainerStyle={styles.freelancerStrip}>
                  {filteredFreelancers.map((freelancer, idx) => (
                    <FreelancerCard
                      key={freelancer.id}
                      item={freelancer}
                      showPastelWash={idx === 0}
                      onViewProfile={() => setActiveFreelancer(freelancer)}
                    />
                  ))}
                </ScrollView>
                <View style={styles.dotsWrap}>
                  <View style={styles.dotsPill}>
                    {filteredFreelancers.map((f, idx) => (
                      <View key={f.id} style={[styles.dot, idx === freelancerPage && styles.dotActive]} />
                    ))}
                  </View>
                </View>
              </View>
            ) : null}

            <View style={styles.ctaWrap}>
              <View style={styles.ctaBanner}>
                <LinearGradient
                  colors={isDark ? BAZAAR_PALETTE.ctaDarkStops : BAZAAR_PALETTE.ctaLightStops}
                  locations={[0, 0.28, 0.5, 0.72, 1]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.ctaTitle}>
                  <Text>{'Looking for the\n'}</Text>
                  <Text style={styles.sectionTitleAccent}>Right Talent?</Text>
                </Text>
                <Text style={styles.ctaSubtitle}>
                  Post a job for free and reach thousands of professionals across Pakistan.
                </Text>
                <HapticPressable
                  haptic="light"
                  scaleTo={0.96}
                  borderRadius={12}
                  onPress={() => {
                    setPostSubmitted(false);
                    setPostJobOpen(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Post a Job"
                  style={styles.postJobBtn}>
                  <Text maxFontSizeMultiplier={1.3} style={styles.postJobBtnText}>
                    Post a Job
                  </Text>
                </HapticPressable>
              </View>
            </View>
          </ScrollView>



                          {/* Freelancer Profile Sheet */}
                          <BottomSheet
                            visible={Boolean(activeFreelancer)}
                            onClose={() => setActiveFreelancer(null)}>
                            {activeFreelancer ? (
                              <View style={[styles.sheetBody, { backgroundColor: theme.surface }]}>
                                <View style={styles.sheetHeaderRow}>
                                  <View style={styles.sheetProfileTop}>
                                    <LinearGradient
                                      colors={activeFreelancer.avatarColors}
                                      start={{ x: 0, y: 0 }}
                                      end={{ x: 1, y: 1 }}
                                      style={styles.sheetAvatar}>
                                      <Text style={styles.freelancerAvatarText}>
                                        {activeFreelancer.initials}
                                      </Text>
                                    </LinearGradient>
                                    <View style={styles.flexOne}>
                                      <Text style={styles.sheetTitle}>{activeFreelancer.name}</Text>
                                      <Text style={styles.sheetSub}>
                                        {activeFreelancer.role} • {activeFreelancer.city}
                                      </Text>
                                    </View>
                                  </View>
                                  <TouchableOpacity
                                    onPress={() => setActiveFreelancer(null)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Close profile">
                                    <Ionicons name="close" size={22} color={theme.textSecondary} />
                                  </TouchableOpacity>
                                </View>

                                <Text style={styles.sheetBio}>{activeFreelancer.bio}</Text>

                                <View style={styles.sheetStatsRow}>
                                  <View style={styles.ratePill}>
                                    <Text style={styles.ratePillText}>{activeFreelancer.rateLabel}</Text>
                                  </View>
                                  <Text style={styles.sheetSub}>
                                    {activeFreelancer.completedProjects} completed briefs •{' '}
                                    {activeFreelancer.rating} ★
                                  </Text>
                                </View>

                                <HapticPressable
                                  haptic="medium"
                                  borderRadius={14}
                                  onPress={() => {
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
                                      () => { },
                                    );
                                    setHiredFreelancerIds((prev) => ({
                                      ...prev,
                                      [activeFreelancer.id]: true,
                                    }));
                                  }}
                                  style={[
                                    styles.sheetPrimaryBtn,
                                    hiredFreelancerIds[activeFreelancer.id] && styles.appliedSmallBtn,
                                  ]}>
                                  <Text maxFontSizeMultiplier={1.3} style={styles.sheetPrimaryBtnText}>
                                    {hiredFreelancerIds[activeFreelancer.id]
                                      ? 'Inquiry Sent'
                                      : 'Request Quote'}
                                  </Text>
                                </HapticPressable>
                              </View>
                            ) : null}
                          </BottomSheet>

                          {/* Quick Post a Job Sheet */}
                          <BottomSheet visible={postJobOpen} onClose={() => setPostJobOpen(false)}>
                            <View style={[styles.sheetBody, { backgroundColor: theme.surface }]}>
                              <View style={styles.sheetHeaderRow}>
                                <Text style={styles.sheetTitle}>Post a Job on AdBazaar</Text>
                                <TouchableOpacity
                                  onPress={() => setPostJobOpen(false)}
                                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                  accessibilityRole="button"
                                  accessibilityLabel="Close">
                                  <Ionicons name="close" size={22} color={theme.textSecondary} />
                                </TouchableOpacity>
                              </View>

                              <Text style={styles.inputLabel}>Role or Brief Title</Text>
                              <TextInput
                                value={postTitle}
                                onChangeText={setPostTitle}
                                placeholder="e.g. Senior Brand Strategist"
                                placeholderTextColor={theme.textMuted}
                                autoComplete="off"
                                style={styles.sheetInput}
                              />

                              <HapticPressable
                                haptic="medium"
                                borderRadius={14}
                                onPress={() => {
                                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
                                    () => { },
                                  );
                                  setPostSubmitted(true);
                                  setPostTitle('');
                                }}
                                style={[styles.sheetPrimaryBtn, postSubmitted && styles.appliedSmallBtn]}>
                                <Text maxFontSizeMultiplier={1.3} style={styles.sheetPrimaryBtnText}>
                                  {postSubmitted ? 'Draft Saved for Review' : 'Publish Listing'}
                                </Text>
                              </HapticPressable>
                            </View>
                          </BottomSheet>

                          {/* AdBazaar Activity Sheet */}
                          <BottomSheet
                            visible={notificationsOpen}
                            onClose={() => setNotificationsOpen(false)}>
                            <View style={[styles.sheetBody, { backgroundColor: theme.surface }]}>
                              <View style={styles.sheetHeaderRow}>
                                <Text style={styles.sheetTitle}>AdBazaar Activity</Text>
                                <TouchableOpacity
                                  onPress={() => setNotificationsOpen(false)}
                                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                  accessibilityRole="button"
                                  accessibilityLabel="Close notifications">
                                  <Ionicons name="close" size={22} color={theme.textSecondary} />
                                </TouchableOpacity>
                              </View>
                              <Text style={styles.sheetBio}>
                                2 new featured opportunities match your Strategy & Digital Marketing profile.
                              </Text>
                            </View>
                          </BottomSheet>
        </Animated.View>
      </View>
    </SwipeBackContainer>
  );
};


const createStyles = (t: AppTheme) => {
  const isDark = t.scheme === 'dark';
                      const glassFill = isDark ? t.surface : '#FFFFFF';
                      const glassCardFill = isDark ? t.surface : '#FFFFFF';
                      const glassBorder = isDark ? t.border : '#F0E3E4';
                      const ink = isDark ? t.text : BAZAAR_PALETTE.ink;
                      const muted = isDark ? t.textMuted : BAZAAR_PALETTE.muted;

                      return StyleSheet.create({
                        root: {
                        flex: 1,
    },
                      flexOne: {
                        flex: 1,
    },
                      headerContainer: {
                        paddingHorizontal: 20,
                      backgroundColor: '#D9202A',
                      borderBottomLeftRadius: 28,
                      borderBottomRightRadius: 28,
                      overflow: 'hidden',
    },
                      topBar: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 16,
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
                      color: BAZAAR_PALETTE.brandAd,
    },
                      brandTextStreet: {
                        fontWeight: '500',
                      color: BAZAAR_PALETTE.brandStreet,
    },
                      notificationDot: {
                        position: 'absolute',
                      top: 0,
                      start: 1,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: BAZAAR_PALETTE.accent,
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
                      topBlur: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
    },
                      awning: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        flexDirection: 'row',
    },
                      awningStripe: {
                        flex: 1,
                        height: '100%',
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
    },
                      heroTagline: {
                        color: '#FFFFFF',
                        fontSize: 22,
                        fontWeight: '700',
                        letterSpacing: 0.2,
                        textAlign: 'center',
    },
                      titleBlock: {
                        alignItems: 'center',
                        gap: 12,
                        marginTop: 18,
    },
                      adBazaarBadgeWrap: {
                        marginBottom: 14,
                      alignSelf: 'flex-start',
    },
                      adBazaarBadgeImg: {
                        width: 214,
                      height: 51,
                      borderRadius: 6,
    },
                      heroTitle: {
                        fontFamily: DisplayFont.semibold,
                      fontSize: 24,
                      lineHeight: 30,
                      letterSpacing: -0.6,
                      includeFontPadding: false,
                      color: ink,
                      maxWidth: 320,
    },
                      searchSection: {
                        paddingHorizontal: 16,
                      marginTop: 2,
    },
                      searchBox: {
                        height: 45,
                      borderRadius: 20,
                      backgroundColor: glassFill,
                      borderWidth: 1,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
    },
                      searchInput: {
                        flex: 1,
                      fontSize: 14,
                      color: ink,
                      paddingVertical: 0,
    },
                      quickCategoriesWrap: {
                        paddingHorizontal: 16,
                      marginTop: 18,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
    },
                      quickCategoryChip: {
                        height: 40,
                      borderRadius: 14,
                      backgroundColor: glassFill,
                      borderWidth: 1,
                      borderColor: glassBorder,
                      paddingHorizontal: 11,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 7,
                      ...Shadows.card,
    },
                      quickCategoryChipSelected: {
                        borderColor: BAZAAR_PALETTE.accent,
                      backgroundColor: isDark ? t.primaryTint : '#FFF2F2',
    },
                      quickCategoryLabel: {
                        fontFamily: DisplayFont.semibold,
                      fontSize: 15.5,
                      lineHeight: 20,
                      letterSpacing: -0.4,
                      includeFontPadding: false,
                      color: ink,
    },
                      activeFilterRow: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 18,
                      marginTop: 14,
    },
                      activeFilterLabel: {
                        fontSize: 12.5,
                      color: t.textSecondary,
                      flex: 1,
    },
                      clearFilterText: {
                        fontSize: 12.5,
                      fontWeight: '600',
                      color: BAZAAR_PALETTE.accent,
                      textDecorationLine: 'underline',
    },
                      sectionBlock: {
                        marginTop: 24,
                      paddingHorizontal: 16,
    },
                      sectionHeaderRow: {
                        flexDirection: 'row',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      marginBottom: 14,
    },
                      sectionHeaderCentered: {
                        justifyContent: 'center',
    },
                      sectionTitle: {
                        fontFamily: DisplayFont.semibold,
                      fontSize: 22,
                      lineHeight: 28,
                      letterSpacing: -0.5,
                      includeFontPadding: false,
                      color: ink,
    },
                      sectionTitleAccent: {
                        color: BAZAAR_PALETTE.accent,
    },
                      centerText: {
                        textAlign: 'center',
    },
                      viewAllLink: {
                        fontSize: 12.5,
                      fontWeight: '600',
                      color: BAZAAR_PALETTE.accent,
                      textDecorationLine: 'underline',
                      paddingBottom: 2,
    },
                      cardStack: {
                        gap: 12,
    },
                      jobCard: {
                        borderRadius: 20,
                      backgroundColor: glassCardFill,
                      borderWidth: 1,
                      borderColor: glassBorder,
                      padding: 16,
                      gap: 12,
                      overflow: 'hidden',
                      ...Shadows.card,
    },
                      featuredTopRow: {
                        flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 10,
    },
                      featuredTitleGroup: {
                        flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
    },
                      featuredSquareAvatar: {
                        width: 46,
                      height: 46,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: BAZAAR_PALETTE.rateText,
                      shadowOffset: {width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                      elevation: 4,
    },
                      featuredAvatarText: {
                        color: '#FFFFFF',
                      fontSize: 16,
                      fontWeight: '800',
                      letterSpacing: 0.4,
    },
                      featuredTitleTextCol: {
                        flex: 1,
                      gap: 3,
    },
                      listingTopRow: {
                        flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
    },
                      listingMainText: {
                        flex: 1,
                      gap: 8,
    },
                      jobTitleFeatured: {
                        fontFamily: DisplayFont.semibold,
                      fontSize: 17.5,
                      lineHeight: 23,
                      letterSpacing: -0.4,
                      includeFontPadding: false,
                      color: ink,
    },
                      jobTitleListing: {
                        fontFamily: DisplayFont.semibold,
                      fontSize: 19.5,
                      lineHeight: 25,
                      letterSpacing: -0.4,
                      includeFontPadding: false,
                      color: ink,
    },
                      jobCompany: {
                        fontSize: 12.5,
                      color: t.textSecondary,
    },
                      locationRow: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
    },
                      locationText: {
                        fontSize: 12,
                      color: muted,
    },
                      jobDescription: {
                        fontSize: 13.5,
                      lineHeight: 19,
                      color: isDark ? t.textSecondary : BAZAAR_PALETTE.muted,
    },
                      jobFooterSplitRow: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
    },
                      jobFooterMeta: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      flexShrink: 1,
    },
                      tagPill: {
                        paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 15,
    },
                      tagPillText: {
                        fontSize: 12,
                      fontWeight: '500',
    },
                      postedText: {
                        fontSize: 10.5,
                      color: muted,
    },
                      budgetGlassPill: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 9,
                      paddingVertical: 5,
                      borderRadius: 12,
                      backgroundColor: isDark ? t.surfaceAlt : '#FBF4F4',
                      borderWidth: 1,
                      borderColor: isDark ? t.border : 'rgba(255, 255, 255, 0.78)',
    },
                      budgetTintPill: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 9,
                      paddingVertical: 5,
                      borderRadius: 15,
                      backgroundColor: isDark ? t.primaryTint : BAZAAR_PALETTE.budgetTint,
    },
                      budgetLabelText: {
                        fontSize: 10.5,
                      color: muted,
    },
                      budgetValueText: {
                        fontSize: 10.5,
                      fontWeight: '600',
                      color: ink,
    },
                      primarySmallBtn: {
                        backgroundColor: BAZAAR_PALETTE.accent,
                      height: 28,
                      paddingHorizontal: 14,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...Shadows.buttonGlow,
    },
                      appliedSmallBtn: {
                        backgroundColor: BAZAAR_PALETTE.success,
    },
                      primarySmallBtnText: {
                        color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: '600',
    },
                      exploreBox: {
                        height: 350,
                      borderRadius: 20,
                      backgroundColor: glassFill,
                      borderWidth: 1,
                      borderColor: glassBorder,
                      overflow: 'hidden',
                      alignSelf: 'center',
                      ...Shadows.card,
    },
                      explorePos: {
                        position: 'absolute',
    },
                      explorePill: {
                      backgroundColor: isDark ? t.surfaceAlt : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: glassBorder,
                      borderRadius: 14,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      ...Shadows.card,
    },
                      explorePillSelected: {
                        borderColor: BAZAAR_PALETTE.accent,
                      borderWidth: 1.5,
    },
                      explorePillTitle: {
                        fontFamily: DisplayFont.semibold,
                      fontSize: 13.5,
                      lineHeight: 18,
                      letterSpacing: -0.3,
                      includeFontPadding: false,
    },
                      explorePillCount: {
                        fontSize: 11.5,
                      color: muted,
    },
                      freelancerStrip: {
                        gap: FREELANCER_GAP,
                      paddingVertical: 4,
    },
                      freelancerCard: {
                        borderRadius: 20,
                      backgroundColor: glassCardFill,
                      borderWidth: 1,
                      borderColor: glassBorder,
                      padding: 15,
                      gap: 13,
                      overflow: 'hidden',
                      ...Shadows.card,
    },
                      freelancerAvatar: {
                        width: 46,
                      height: 46,
                      borderRadius: 23,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowOffset: {width: 0, height: 4 },
                      shadowOpacity: 0.35,
                      shadowRadius: 8,
                      elevation: 4,
    },
                      freelancerAvatarText: {
                        color: '#FFFFFF',
                      fontSize: 16,
                      fontWeight: '800',
                      letterSpacing: 0.4,
    },
                      freelancerNameBlock: {
                        gap: 4,
    },
                      freelancerName: {
                        fontFamily: DisplayFont.semibold,
                      fontSize: 14.5,
                      lineHeight: 20,
                      includeFontPadding: false,
                      color: ink,
    },
                      freelancerRole: {
                        fontSize: 12,
                      color: muted,
    },
                      freelancerRateRow: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 4,
    },
                      ratePill: {
                        backgroundColor: BAZAAR_PALETTE.rateTint,
                      borderRadius: 12,
                      paddingHorizontal: 7,
                      paddingVertical: 5,
                      flexShrink: 1,
    },
                      ratePillText: {
                        fontSize: 10.5,
                      color: BAZAAR_PALETTE.rateText,
                      fontWeight: '500',
    },
                      ratingRow: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      gap: 2,
    },
                      ratingText: {
                        fontSize: 11,
                      fontWeight: '500',
                      color: ink,
    },
                      viewProfileBtn: {
                        height: 32,
                      borderRadius: 10,
                      backgroundColor: BAZAAR_PALETTE.accent,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...Shadows.buttonGlow,
    },
                      viewProfileBtnText: {
                        color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: '600',
    },
                      dotsWrap: {
                        alignItems: 'center',
                      marginTop: 12,
    },
                      dotsPill: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isDark ? t.surfaceAlt : '#FFFFFF',
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      gap: 6,
                      borderWidth: 1,
                      borderColor: glassBorder,
    },
                      dot: {
                        width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0, 0, 0, 0.15)',
    },
                      dotActive: {
                        width: 18,
                      backgroundColor: BAZAAR_PALETTE.accent,
    },
                      ctaWrap: {
                        marginTop: 26,
                      paddingHorizontal: 16,
    },
                      ctaBanner: {
                        borderRadius: 20,
                      borderWidth: 1,
                      borderColor: glassBorder,
                      paddingHorizontal: 20,
                      paddingVertical: 28,
                      alignItems: 'center',
                      overflow: 'hidden',
                      gap: 12,
                      ...Shadows.card,
    },
                      ctaTitle: {
                        fontFamily: DisplayFont.semibold,
                      fontSize: 22,
                      lineHeight: 28,
                      letterSpacing: -0.5,
                      includeFontPadding: false,
                      color: ink,
                      textAlign: 'center',
    },
                      ctaSubtitle: {
                        fontSize: 12.5,
                      lineHeight: 17,
                      color: isDark ? t.textSecondary : BAZAAR_PALETTE.muted,
                      textAlign: 'center',
                      maxWidth: 250,
    },
                      postJobBtn: {
                        backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      paddingHorizontal: 24,
                      paddingVertical: 13,
                      marginTop: 4,
                      shadowColor: '#000000',
                      shadowOffset: {width: 0, height: 4 },
                      shadowOpacity: 0.12,
                      shadowRadius: 8,
                      elevation: 4,
    },
                      postJobBtnText: {
                        fontSize: 14,
                      fontWeight: '600',
                      color: BAZAAR_PALETTE.ink,
    },
                      emptyCard: {
                        marginTop: 24,
                      marginHorizontal: 16,
                      borderRadius: 20,
                      backgroundColor: glassCardFill,
                      borderWidth: 1,
                      borderColor: glassBorder,
                      padding: 28,
                      alignItems: 'center',
                      gap: 10,
                      ...Shadows.card,
    },
                      emptyTitle: {
                        fontFamily: DisplayFont.semibold,
                      fontSize: 18,
                      color: ink,
                      textAlign: 'center',
    },
                      emptySubtitle: {
                        fontSize: 13,
                      color: muted,
                      textAlign: 'center',
    },
                      emptyResetBtn: {
                        backgroundColor: BAZAAR_PALETTE.accent,
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      borderRadius: 12,
                      marginTop: 6,
    },
                      sheetBody: {
                        borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                      paddingHorizontal: 20,
                      paddingTop: 16,
                      paddingBottom: 24,
                      gap: 14,
    },
                      sheetHeaderRow: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
    },
                      sheetProfileTop: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      flex: 1,
    },
                      sheetAvatar: {
                        width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
    },
                      sheetTitle: {
                        fontFamily: DisplayFont.semibold,
                      fontSize: 19,
                      color: t.text,
    },
                      sheetSub: {
                        fontSize: 13,
                      color: t.textSecondary,
    },
                      sheetBio: {
                        fontSize: 14,
                      lineHeight: 20,
                      color: t.textSecondary,
    },
                      sheetStatsRow: {
                        flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
    },
                      inputLabel: {
                        fontSize: 13,
                      fontWeight: '600',
                      color: t.textSecondary,
    },
                      sheetInput: {
                        height: 46,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: t.border,
                      backgroundColor: t.surfaceAlt,
                      paddingHorizontal: 14,
                      fontSize: 14,
                      color: t.text,
    },
                      sheetPrimaryBtn: {
                        height: 46,
                      borderRadius: 14,
                      backgroundColor: BAZAAR_PALETTE.accent,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...Shadows.buttonGlow,
    },
                      sheetPrimaryBtnText: {
                        color: '#FFFFFF',
                      fontSize: 15,
                      fontWeight: '600',
    },
  });
};