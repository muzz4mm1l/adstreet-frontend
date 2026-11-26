import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeOutUp,
  useReducedMotion,
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
import { FLOATING_BAR_CLEARANCE } from '@/components/navigation/FloatingTabBarOverlay';
import { HomeTopBar } from '@/features/home/HomeTopBar';
import { JobListing } from './PopularJobs';
import {
  ADBAZAAR_LATEST_LISTINGS,
  ADBAZAAR_LOCATION_FILTERS,
  ADBAZAAR_QUICK_CATEGORIES,
  ADBAZAAR_SORT_OPTIONS,
  AdBazaarLocationFilter,
  AdBazaarOpportunity,
  AdBazaarQuickCategory,
  AdBazaarSortOption,
  toAdBazaarJobListing,
} from './adBazaarData';

/** Last vertical scroll offset so the frozen back-preview matches the live scroll position. */
let lastScrollY = 0;

const CATEGORY_PALETTE = {
  lightCanvas: '#F9F2F2',
  lightTopWash: '#F7CFD1',
  darkTopWash: '#3A1418',
  accent: '#EC2029',
  success: '#16A34A',
  ink: '#3A3A3A',
  muted: '#777777',
  brandAd: '#111827',
  brandStreet: '#4B5563',
} as const;

interface AdBazaarCategoryScreenViewProps {
  category: AdBazaarQuickCategory;
  onBack: () => void;
  /** Screen revealed underneath while this page slides away (swipe / hardware back). */
  renderPreviousScreen?: () => React.ReactNode;
  onPressJob?: (job: JobListing) => void;
}

const CategoryListingCard: React.FC<{
  item: AdBazaarOpportunity;
  index: number;
  applied: boolean;
  reduceMotion: boolean | null;
  onPressCard: () => void;
  onApply: () => void;
}> = React.memo(({ item, index, applied, reduceMotion, onPressCard, onApply }) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const card = (
    <View style={styles.jobCard}>
      {index === 0 ? (
        <LinearGradient
          colors={[theme.washPink, theme.surface, theme.washBlue]}
          locations={[0, 0.48, 1]}
          start={{ x: 0, y: 0.1 }}
          end={{ x: 1, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View style={styles.listingTopRow}>
        <HapticPressable
          haptic="light"
          scaleTo={0.985}
          borderRadius={12}
          onPress={onPressCard}
          accessibilityRole="button"
          accessibilityLabel={`${item.title} at ${item.company}, Budget ${item.budgetShort}`}
          style={styles.listingMainText}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.jobCompany} numberOfLines={1}>
            {item.company}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={CATEGORY_PALETTE.accent} />
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
          style={[styles.applyBtn, applied && styles.appliedBtn]}>
          <Text maxFontSizeMultiplier={1.3} style={styles.applyBtnText}>
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

  if (reduceMotion || index >= 3) {
    return card;
  }
  return (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 45)}>
      {card}
    </Animated.View>
  );
});

/** AdBazaar Category Page (e.g. Content Creators - Figma node 195:5584). */
export const AdBazaarCategoryScreenView: React.FC<AdBazaarCategoryScreenViewProps> = ({
  category = ADBAZAAR_QUICK_CATEGORIES[0],
  onBack,
  renderPreviousScreen,
  onPressJob,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const swipeBackRef = useRef<SwipeBackHandle>(null);
  const inPeek = useIsPeek();
  const trackScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    lastScrollY = e.nativeEvent.contentOffset.y;
  };
  React.useEffect(() => {
    if (!inPeek) lastScrollY = 0; // a freshly opened page starts at the top
  }, [inPeek]);

  const [sortBy, setSortBy] = useState<AdBazaarSortOption>('default');
  const [locationFilter, setLocationFilter] = useState<AdBazaarLocationFilter>('All Locations');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Record<string, boolean>>({});
  const [showAllListings, setShowAllListings] = useState(true);

  const handleHeaderBack = () => {
    if (swipeBackRef.current) {
      swipeBackRef.current.goBack();
    } else {
      onBack();
    }
  };

  const activeSortLabel =
    ADBAZAAR_SORT_OPTIONS.find((s) => s.id === sortBy)?.label ?? 'Sorting';

  const filteredAndSortedListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = ADBAZAAR_LATEST_LISTINGS.filter((item) => {
      if (
        locationFilter !== 'All Locations' &&
        item.location.toLowerCase() !== locationFilter.toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'newest') {
      list.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    } else if (sortBy === 'budget-high') {
      list.sort((a, b) => b.budgetMinK - a.budgetMinK);
    } else if (sortBy === 'budget-low') {
      list.sort((a, b) => a.budgetMinK - b.budgetMinK);
    }

    return showAllListings ? list : list.slice(0, 4);
  }, [locationFilter, searchQuery, sortBy, showAllListings]);

  const handleApplyInline = (item: AdBazaarOpportunity) => {
    if (appliedJobIds[item.id]) {
      onPressJob?.(toAdBazaarJobListing(item));
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setAppliedJobIds((prev) => ({ ...prev, [item.id]: true }));
  };

  const resetFilters = () => {
    Haptics.selectionAsync().catch(() => {});
    setSortBy('default');
    setLocationFilter('All Locations');
    setSearchQuery('');
    setShowAllListings(true);
  };

  const isDark = theme.scheme === 'dark';
  const topWashColors: readonly [string, string] = isDark
    ? [CATEGORY_PALETTE.darkTopWash, theme.canvas]
    : [CATEGORY_PALETTE.lightTopWash, CATEGORY_PALETTE.lightCanvas];
  const hasActiveFilter = locationFilter !== 'All Locations' || sortBy !== 'default';

  const listHeader = (
    <>
      {/* Ambient Blush Header Wash */}
      <LinearGradient
        colors={topWashColors}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, 16) },
        ]}>
        {/* Same header row as Home / AdBazaar (shared component) */}
        <HomeTopBar
          tone="onLight"
          ink={isDark ? theme.text : CATEGORY_PALETTE.ink}
          onBack={handleHeaderBack}
          onOpenSearch={() => setSearchOpen((prev) => !prev)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        {/* ADBAZAAR Logo Pill */}
        <View style={styles.adBazaarBadgeWrap}>
          <Image
            source={require('@/assets/images/adbazaar/adbazaar-logo.png')}
            style={styles.adBazaarBadgeImg}
            contentFit="contain"
            accessibilityLabel="AdBazaar"
          />
        </View>

        {/* Category Icon + Serif Title */}
        <View style={styles.categoryHeroRow}>
          <Image
            source={category.iconAsset}
            style={styles.categoryHeroIcon}
            contentFit="contain"
          />
          <Text style={styles.categoryHeroTitle} accessibilityRole="header">
            {category.label}
          </Text>
        </View>

        {/* Sorting Dropdown + Funnel Filter Button */}
        <View style={styles.controlsRow}>
          <HapticPressable
            haptic="selection"
            scaleTo={0.98}
            borderRadius={20}
            onPress={() => setSortSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Sort listings, current ${activeSortLabel}`}
            style={styles.sortingPill}>
            <View style={styles.sortingLeft}>
              <Ionicons name="options-outline" size={17} color={CATEGORY_PALETTE.accent} />
              <Text
                maxFontSizeMultiplier={1.3}
                style={[
                  styles.sortingText,
                  sortBy !== 'default' && styles.sortingTextActive,
                ]}
                numberOfLines={1}>
                {activeSortLabel}
              </Text>
            </View>
            <Ionicons
              name="chevron-down"
              size={15}
              color={isDark ? theme.textSecondary : CATEGORY_PALETTE.ink}
            />
          </HapticPressable>

          <HapticPressable
            haptic="light"
            scaleTo={0.94}
            borderRadius={16}
            onPress={() => setFilterSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Filter listings by location"
            style={styles.filterBtn}>
            <Ionicons name="funnel-outline" size={17} color={CATEGORY_PALETTE.accent} />
            {locationFilter !== 'All Locations' ? <View style={styles.filterBadgeDot} /> : null}
          </HapticPressable>
        </View>
      </LinearGradient>

      {/* Expandable Search Input */}
      {searchOpen ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(200)}
          exiting={reduceMotion ? undefined : FadeOutUp.duration(160)}
          style={styles.inlineSearchWrap}>
          <View style={styles.inlineSearchBox}>
            <Ionicons name="search-outline" size={16} color={CATEGORY_PALETTE.accent} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search in ${category.label}...`}
              placeholderTextColor={isDark ? theme.textMuted : CATEGORY_PALETTE.muted}
              autoFocus
              returnKeyType="search"
              autoComplete="off"
              autoCorrect={false}
              underlineColorAndroid="transparent"
              selectionColor={CATEGORY_PALETTE.accent}
              cursorColor={CATEGORY_PALETTE.accent}
              style={styles.inlineSearchInput}
              accessibilityLabel={`Search in ${category.label}`}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </Animated.View>
      ) : null}

      {/* Section Header: Job Listings + View All */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          <Text>Job </Text>
          <Text style={styles.sectionTitleAccent}>Listings</Text>
        </Text>
        <HapticPressable
          haptic="selection"
          scaleTo={0.96}
          borderRadius={Radii.sm}
          onPress={() => {
            if (hasActiveFilter || searchQuery.trim()) {
              resetFilters();
            } else {
              setShowAllListings((prev) => !prev);
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={hasActiveFilter ? 'Reset filters' : 'View all listings'}>
          <Text maxFontSizeMultiplier={1.35} style={styles.viewAllLink}>
            {hasActiveFilter || searchQuery.trim()
              ? 'Reset'
              : showAllListings
                ? 'View All'
                : 'Show All'}
          </Text>
        </HapticPressable>
      </View>
    </>
  );

  return (
    <SwipeBackContainer
      ref={swipeBackRef}
      onBack={onBack}
      backgroundColor={isDark ? theme.canvas : CATEGORY_PALETTE.lightCanvas}
      renderPrevious={renderPreviousScreen}
      previousMounted>
      <Animated.View
        entering={reduceMotion ? undefined : FadeInRight.duration(260)}
        style={[
          styles.root,
          { backgroundColor: isDark ? theme.canvas : CATEGORY_PALETTE.lightCanvas },
        ]}>
        <ScreenStatusBar style={theme.statusBar} />

        <KeyboardAvoidingView
          style={styles.flexOne}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList
            data={filteredAndSortedListings}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={64}
            initialNumToRender={5}
            maxToRenderPerBatch={4}
            windowSize={7}
            removeClippedSubviews={Platform.OS === 'android'}
            onScroll={inPeek ? undefined : trackScroll}
            onScrollEndDrag={inPeek ? undefined : trackScroll}
            onMomentumScrollEnd={inPeek ? undefined : trackScroll}
            contentOffset={inPeek ? { x: 0, y: lastScrollY } : undefined}
            ListHeaderComponent={listHeader}
            contentContainerStyle={{
              paddingBottom: insets.bottom + FLOATING_BAR_CLEARANCE,
              gap: 12,
            }}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Ionicons name="search-outline" size={30} color={CATEGORY_PALETTE.accent} />
                <Text style={styles.emptyTitle}>No listings match this filter</Text>
                <Text style={styles.emptySubtitle}>
                  Adjust your location filter or search query to view all listings.
                </Text>
                <HapticPressable
                  haptic="light"
                  borderRadius={12}
                  onPress={resetFilters}
                  style={styles.emptyResetBtn}>
                  <Text maxFontSizeMultiplier={1.3} style={styles.applyBtnText}>
                    Reset Filters
                  </Text>
                </HapticPressable>
              </View>
            }
            renderItem={({ item, index }) => (
              <View style={styles.cardPad}>
                <CategoryListingCard
                  item={item}
                  index={index}
                  applied={Boolean(appliedJobIds[item.id])}
                  reduceMotion={reduceMotion}
                  onPressCard={() => onPressJob?.(toAdBazaarJobListing(item))}
                  onApply={() => handleApplyInline(item)}
                />
              </View>
            )}
          />
        </KeyboardAvoidingView>


        {/* Sorting Sheet */}
        <BottomSheet visible={sortSheetOpen} onClose={() => setSortSheetOpen(false)}>
          <View style={[styles.sheetBody, { backgroundColor: theme.surface }]}>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>Sort Job Listings</Text>
              <TouchableOpacity
                onPress={() => setSortSheetOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Close sorting">
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetOptionsStack}>
              {ADBAZAAR_SORT_OPTIONS.map((opt) => {
                const selected = sortBy === opt.id;
                return (
                  <HapticPressable
                    key={opt.id}
                    haptic="selection"
                    borderRadius={14}
                    onPress={() => {
                      setSortBy(opt.id);
                      setSortSheetOpen(false);
                    }}
                    style={[styles.sheetOptionRow, selected && styles.sheetOptionRowSelected]}>
                    <Text
                      style={[
                        styles.sheetOptionText,
                        selected && styles.sheetOptionTextSelected,
                      ]}>
                      {opt.id === 'default' ? 'Recommended Order' : opt.label}
                    </Text>
                    {selected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={CATEGORY_PALETTE.accent}
                      />
                    ) : null}
                  </HapticPressable>
                );
              })}
            </View>
          </View>
        </BottomSheet>

        {/* Location Filter Sheet */}
        <BottomSheet visible={filterSheetOpen} onClose={() => setFilterSheetOpen(false)}>
          <View style={[styles.sheetBody, { backgroundColor: theme.surface }]}>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>Filter by Location</Text>
              <TouchableOpacity
                onPress={() => setFilterSheetOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Close filter">
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetChipsWrap}>
              {ADBAZAAR_LOCATION_FILTERS.map((loc) => {
                const selected = locationFilter === loc;
                return (
                  <HapticPressable
                    key={loc}
                    haptic="selection"
                    borderRadius={999}
                    onPress={() => setLocationFilter(loc)}
                    style={[
                      styles.sheetChip,
                      selected ? styles.sheetChipActive : styles.sheetChipIdle,
                    ]}>
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={[
                        styles.sheetChipText,
                        selected ? styles.sheetChipTextActive : styles.sheetChipTextIdle,
                      ]}>
                      {loc}
                    </Text>
                  </HapticPressable>
                );
              })}
            </View>
            <HapticPressable
              haptic="medium"
              borderRadius={14}
              onPress={() => setFilterSheetOpen(false)}
              style={styles.sheetPrimaryBtn}>
              <Text maxFontSizeMultiplier={1.3} style={styles.sheetPrimaryBtnText}>
                Apply Filter
              </Text>
            </HapticPressable>
          </View>
        </BottomSheet>

        {/* Notifications Quick Sheet */}
        <BottomSheet
          visible={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}>
          <View style={[styles.sheetBody, { backgroundColor: theme.surface }]}>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>{category.label} Alerts</Text>
              <TouchableOpacity
                onPress={() => setNotificationsOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Close notifications">
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetSub}>
              7 active briefs are accepting applications in {category.label}.
            </Text>
          </View>
        </BottomSheet>
      </Animated.View>
    </SwipeBackContainer>
  );
};

const createStyles = (t: AppTheme) => {
  const isDark = t.scheme === 'dark';
  const glassFill = isDark ? t.surface : '#FFFFFF';
  const glassCardFill = isDark ? t.surface : '#FFFFFF';
  const glassBorder = isDark ? t.border : '#F0E3E4';
  const ink = isDark ? t.text : CATEGORY_PALETTE.ink;
  const muted = isDark ? t.textMuted : CATEGORY_PALETTE.muted;

  return StyleSheet.create({
    root: {
      flex: 1,
    },
    flexOne: {
      flex: 1,
    },
    headerContainer: {
      paddingHorizontal: 20,
      paddingBottom: 8,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
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
      color: CATEGORY_PALETTE.brandAd,
    },
    brandTextStreet: {
      fontWeight: '500',
      color: CATEGORY_PALETTE.brandStreet,
    },
    notificationDot: {
      position: 'absolute',
      top: 0,
      start: 1,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: CATEGORY_PALETTE.accent,
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
    adBazaarBadgeWrap: {
      marginTop: 6,
      marginBottom: 14,
      alignSelf: 'flex-start',
    },
    adBazaarBadgeImg: {
      width: 101,
      height: 24,
      borderRadius: 4,
    },
    categoryHeroRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 18,
    },
    categoryHeroIcon: {
      width: 51,
      height: 43,
    },
    categoryHeroTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.6,
      includeFontPadding: false,
      color: ink,
      flex: 1,
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    sortingPill: {
      flex: 1,
      height: 45,
      borderRadius: 20,
      backgroundColor: glassFill,
      borderWidth: 1,
      borderColor: glassBorder,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...Shadows.card,
    },
    sortingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flex: 1,
    },
    sortingText: {
      fontSize: 14,
      color: muted,
    },
    sortingTextActive: {
      color: ink,
      fontWeight: '500',
    },
    filterBtn: {
      width: 45,
      height: 45,
      borderRadius: 16,
      backgroundColor: glassFill,
      borderWidth: 1,
      borderColor: glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.card,
    },
    filterBadgeDot: {
      position: 'absolute',
      top: 9,
      end: 9,
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: CATEGORY_PALETTE.accent,
    },
    inlineSearchWrap: {
      paddingHorizontal: 16,
      marginTop: 10,
    },
    inlineSearchBox: {
      height: 42,
      borderRadius: 14,
      backgroundColor: glassFill,
      borderWidth: 1,
      borderColor: glassBorder,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
          },
    inlineSearchInput: {
      flex: 1,
      fontSize: 14,
      color: ink,
      paddingVertical: 0,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginTop: 18,
      marginBottom: 4,
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
      color: CATEGORY_PALETTE.accent,
    },
    viewAllLink: {
      fontSize: 12.5,
      fontWeight: '600',
      color: CATEGORY_PALETTE.accent,
      textDecorationLine: 'underline',
      paddingBottom: 2,
    },
    cardPad: {
      paddingHorizontal: 16,
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
    jobTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 20,
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
      borderRadius: 10,
      backgroundColor: isDark ? t.surfaceAlt : '#FBF4F4',
      borderWidth: 1,
      borderColor: isDark ? t.border : '#F0E3E4',
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
    applyBtn: {
      backgroundColor: CATEGORY_PALETTE.accent,
      height: 28,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.buttonGlow,
    },
    appliedBtn: {
      backgroundColor: CATEGORY_PALETTE.success,
    },
    applyBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    emptyCard: {
      marginHorizontal: 16,
      marginTop: 8,
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
      backgroundColor: CATEGORY_PALETTE.accent,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 12,
      marginTop: 4,
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
    sheetTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 19,
      color: t.text,
    },
    sheetSub: {
      fontSize: 14,
      lineHeight: 20,
      color: t.textSecondary,
    },
    sheetOptionsStack: {
      gap: 8,
    },
    sheetOptionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderRadius: 14,
      backgroundColor: t.surfaceAlt,
    },
    sheetOptionRowSelected: {
      backgroundColor: isDark ? t.primaryTint : '#FFF1F2',
      borderWidth: 1,
      borderColor: CATEGORY_PALETTE.accent,
    },
    sheetOptionText: {
      fontSize: 14.5,
      color: t.text,
    },
    sheetOptionTextSelected: {
      fontWeight: '600',
      color: CATEGORY_PALETTE.accent,
    },
    sheetChipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    sheetChip: {
      height: 36,
      paddingHorizontal: 15,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetChipActive: {
      backgroundColor: CATEGORY_PALETTE.accent,
    },
    sheetChipIdle: {
      backgroundColor: t.surfaceAlt,
      borderWidth: 1,
      borderColor: t.border,
    },
    sheetChipText: {
      fontSize: 13.5,
    },
    sheetChipTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    sheetChipTextIdle: {
      color: t.text,
    },
    sheetPrimaryBtn: {
      height: 46,
      borderRadius: 14,
      backgroundColor: CATEGORY_PALETTE.accent,
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
