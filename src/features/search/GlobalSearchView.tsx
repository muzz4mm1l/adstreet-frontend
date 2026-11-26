import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { HomeTopBar } from '@/features/home/HomeTopBar';
import { DisplayFont } from '@/constants/fonts';
import { BrandColors, Shadows } from '@/constants/theme';
import { JobListing } from '@/features/adbazaar/PopularJobs';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';
import {
  CROSS_MODULE_RESULTS,
  EXPLORE_CATEGORY_BUBBLES,
  ExploreCategoryBubble,
  FEATURED_OPPORTUNITIES,
  FREELANCERS,
  LATEST_LISTINGS,
  ModuleSearchResult,
  SEARCH_LOCATIONS,
  SEARCH_MODULE_CHIPS,
  SearchFreelancer,
  SearchLocationFilter,
  SearchModuleChip,
  SearchOpportunity,
  toJobListing,
} from './searchData';

const FIGMA_RED = '#EC2029';
const FREELANCER_CARD_W = 168;
const FREELANCER_GAP = 12;

interface GlobalSearchViewProps {
  onOpenMenu?: () => void;
  onOpenNotifications?: () => void;
  onPressJob?: (job: JobListing) => void;
  onOpenAdBazaar?: () => void;
  onPostJob?: () => void;
}

/** Two-tone Editorial Serif section title matching the Figma Global Search spec. */
const SearchSectionTitle: React.FC<{
  prefix: string;
  accent: string;
  center?: boolean;
  action?: string;
  onAction?: () => void;
}> = ({ prefix, accent, center, action, onAction }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.sectionHeaderRow, center && styles.sectionHeaderCentered]}>
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, center && styles.centerText]}>
        <Text>{prefix}</Text>
        <Text style={styles.sectionTitleAccent}>{accent}</Text>
      </Text>
      {action ? (
        <HapticPressable
          haptic="selection"
          scaleTo={0.96}
          borderRadius={8}
          onPress={onAction}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={action}>
          <Text style={styles.viewAllLink}>{action}</Text>
        </HapticPressable>
      ) : null}
    </View>
  );
};

/** Opportunity / Listing Glass Card matching Figma node 192:3387. */
const SearchJobCard: React.FC<{
  item: SearchOpportunity;
  showPastelWash?: boolean;
  showDescription?: boolean;
  onPress: () => void;
  onApply: () => void;
}> = React.memo(({ item, showPastelWash, showDescription, onPress, onApply }) => {
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

      <View style={styles.jobCardRow}>
        <HapticPressable
          haptic="light"
          scaleTo={0.985}
          borderRadius={12}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${item.title} at ${item.company}`}
          style={styles.jobCardMain}>
          <Text
            style={[
              styles.jobTitle,
              showDescription ? styles.jobTitleFeatured : styles.jobTitleListing,
            ]}
            numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.jobCompany} numberOfLines={1}>
            {item.company}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={FIGMA_RED} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          {showDescription && item.description ? (
            <Text style={styles.jobDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.jobFooterMeta}>
            <View style={[styles.tagPill, { backgroundColor: item.tagBg }]}>
              <Text style={[styles.tagPillText, { color: item.tagColor }]}>
                {item.tag}
              </Text>
            </View>
            <Text style={styles.postedText}>{item.posted}</Text>
          </View>
        </HapticPressable>

        <HapticPressable
          haptic="medium"
          scaleTo={0.94}
          borderRadius={10}
          onPress={onApply}
          accessibilityRole="button"
          accessibilityLabel={`Apply for ${item.title}`}
          style={styles.applyBtn}>
          <Text style={styles.applyBtnText}>Apply</Text>
        </HapticPressable>
      </View>
    </View>
  );
});

const FreelancerCardItem: React.FC<{
  item: SearchFreelancer;
  showPastelWash?: boolean;
  onPress: () => void;
}> = React.memo(({ item, showPastelWash, onPress }) => {
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
        <Text style={styles.freelancerAvatarText}>{item.initials}</Text>
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
          <Text style={styles.ratePillText} numberOfLines={1}>
            {item.rateLabel}
          </Text>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={10} color={FIGMA_RED} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      <HapticPressable
        haptic="light"
        scaleTo={0.96}
        borderRadius={10}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`View profile for ${item.name}`}
        style={styles.viewProfileBtn}>
        <Text style={styles.viewProfileBtnText}>View Profile</Text>
      </HapticPressable>
    </View>
  );
});

export const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({
  onOpenMenu,
  onOpenNotifications,
  onPressJob,
  onOpenAdBazaar,
  onPostJob,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const searchInputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const [query, setQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState<SearchModuleChip>('AdBazaar');
  const [selectedLocation, setSelectedLocation] = useState<SearchLocationFilter>('All Locations');
  const [selectedCategoryTag, setSelectedCategoryTag] = useState<string | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [freelancerPage, setFreelancerPage] = useState(0);

  const searchFocus = useSharedValue(0);
  const searchBorderStyle = useAnimatedStyle(() => ({
    borderColor:
      searchFocus.value > 0.5
        ? 'rgba(236, 32, 41, 0.45)'
        : theme.scheme === 'dark'
          ? 'rgba(255, 255, 255, 0.14)'
          : 'rgba(255, 255, 255, 0.92)',
  }));

  const normalizedQuery = query.trim().toLowerCase();

  const matchesJob = (job: SearchOpportunity) => {
    if (featuredOnly && !job.featured) return false;
    if (
      selectedLocation !== 'All Locations' &&
      job.location.toLowerCase() !== selectedLocation.toLowerCase()
    ) {
      return false;
    }
    if (
      selectedCategoryTag &&
      !job.tag.toLowerCase().includes(selectedCategoryTag.toLowerCase()) &&
      !job.title.toLowerCase().includes(selectedCategoryTag.toLowerCase())
    ) {
      return false;
    }
    if (!normalizedQuery) return true;
    return (
      job.title.toLowerCase().includes(normalizedQuery) ||
      job.company.toLowerCase().includes(normalizedQuery) ||
      job.location.toLowerCase().includes(normalizedQuery) ||
      job.tag.toLowerCase().includes(normalizedQuery) ||
      (job.description ?? '').toLowerCase().includes(normalizedQuery)
    );
  };

  const filteredFeatured = useMemo(
    () => FEATURED_OPPORTUNITIES.filter(matchesJob),
    [normalizedQuery, selectedLocation, selectedCategoryTag, featuredOnly],
  );

  const filteredListings = useMemo(
    () => LATEST_LISTINGS.filter(matchesJob),
    [normalizedQuery, selectedLocation, selectedCategoryTag, featuredOnly],
  );

  const filteredFreelancers = useMemo(() => {
    return FREELANCERS.filter((f) => {
      if (
        selectedLocation !== 'All Locations' &&
        f.city.toLowerCase() !== selectedLocation.toLowerCase()
      ) {
        return false;
      }
      if (!normalizedQuery) return true;
      return (
        f.name.toLowerCase().includes(normalizedQuery) ||
        f.role.toLowerCase().includes(normalizedQuery) ||
        f.city.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, selectedLocation]);

  const filteredModuleResults = useMemo(() => {
    return CROSS_MODULE_RESULTS.filter((item) => {
      if (selectedChip !== 'All' && selectedChip !== 'AdBazaar' && item.module !== selectedChip) {
        return false;
      }
      if (!normalizedQuery) return true;
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.subtitle.toLowerCase().includes(normalizedQuery) ||
        item.module.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [selectedChip, normalizedQuery]);

  const showAdBazaarSections = selectedChip === 'All' || selectedChip === 'AdBazaar';
  const showCrossModuleSection = selectedChip !== 'AdBazaar';
  const activeFiltersCount =
    (selectedLocation !== 'All Locations' ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (selectedCategoryTag ? 1 : 0);

  const handleOpenJobDetails = (item: SearchOpportunity) => {
    const listing = toJobListing(item);
    if (onPressJob) {
      onPressJob(listing);
    } else {
      Alert.alert(item.title, `${item.company} • ${item.location}\n${item.budget}`);
    }
  };

  const handleCategoryBubblePress = (bubble: ExploreCategoryBubble) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedChip('AdBazaar');
    setSelectedCategoryTag((prev) =>
      prev === bubble.filterKey ? null : bubble.filterKey,
    );
    scrollRef.current?.scrollTo({ y: 240, animated: true });
  };

  const handleFreelancerScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const step = FREELANCER_CARD_W + FREELANCER_GAP;
    const page = Math.round(e.nativeEvent.contentOffset.x / step);
    const maxPage = Math.max(0, filteredFreelancers.length - 1);
    setFreelancerPage(Math.min(Math.max(page, 0), maxPage));
  };

  const handleModuleResultPress = (item: ModuleSearchResult) => {
    Alert.alert(item.title, `${item.subtitle}\n\n${item.meta}`);
  };

  const clearAllFilters = () => {
    Haptics.selectionAsync().catch(() => {});
    setQuery('');
    setSelectedLocation('All Locations');
    setSelectedCategoryTag(null);
    setFeaturedOnly(false);
  };

  const isDark = theme.scheme === 'dark';
  const headerWashColors: readonly [string, string] = isDark
    ? ['#2D1417', theme.canvas]
    : ['#F5DFDF', '#F9F2F2'];

  const noAdBazaarMatches =
    showAdBazaarSections &&
    filteredFeatured.length === 0 &&
    filteredListings.length === 0 &&
    filteredFreelancers.length === 0;

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(180)}
      style={[styles.root, { backgroundColor: isDark ? theme.canvas : '#F9F2F2' }]}>
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}>
          {/* Top Ambient Wash Header Container */}
          <LinearGradient
            colors={headerWashColors}
            locations={[0, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[
              styles.headerContainer,
              { paddingTop: Math.max(insets.top, 16) },
            ]}>
            {/* TopNav Row: same header as Home */}
            <View style={styles.topBar}>
              <HomeTopBar
                tone="onLight"
                ink={isDark ? theme.text : '#3A3A3A'}
                onOpenMenu={onOpenMenu}
                onOpenSearch={() => searchInputRef.current?.focus()}
                onOpenNotifications={onOpenNotifications}
              />
            </View>

            {/* Hero Headline */}
            <Text style={styles.heroTitle} accessibilityRole="header">
              Search Across All Categories In One Place.
            </Text>

            {/* Search Input + Filter Button */}
            <View style={styles.searchRow}>
              <Animated.View style={[styles.searchBox, searchBorderStyle]}>
                <Ionicons name="search-outline" size={17} color={FIGMA_RED} />
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
                  placeholder="Search anything..."
                  underlineColorAndroid="transparent"
                  selectionColor={FIGMA_RED}
                  cursorColor={FIGMA_RED}
                  placeholderTextColor={isDark ? theme.textMuted : '#777777'}
                  returnKeyType="search"
                  style={styles.searchInput}
                  accessibilityLabel="Search anything"
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
                      color={isDark ? theme.textMuted : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                ) : null}
              </Animated.View>

              <HapticPressable
                haptic="light"
                scaleTo={0.94}
                borderRadius={16}
                onPress={() => setFilterModalOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Filter search results"
                style={styles.filterBtn}>
                <Ionicons name="funnel-outline" size={17} color={FIGMA_RED} />
                {activeFiltersCount > 0 ? <View style={styles.filterBadgeDot} /> : null}
              </HapticPressable>
            </View>
          </LinearGradient>

          {/* Module Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}>
            {SEARCH_MODULE_CHIPS.map((chip) => {
              const active = selectedChip === chip;
              return (
                <HapticPressable
                  key={chip}
                  haptic="selection"
                  scaleTo={0.95}
                  borderRadius={50}
                  onPress={() => setSelectedChip(chip)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[styles.chipBtn, active ? styles.chipBtnActive : styles.chipBtnIdle]}>
                  <Text
                    style={[
                      styles.chipText,
                      active ? styles.chipTextActive : styles.chipTextIdle,
                    ]}>
                    {chip}
                  </Text>
                </HapticPressable>
              );
            })}
          </ScrollView>

          {/* Active Category / Location Filter Summary Pill */}
          {(selectedCategoryTag || selectedLocation !== 'All Locations' || featuredOnly) ? (
            <View style={styles.activeFilterRow}>
              <Text style={styles.activeFilterLabel}>
                Filtering by:{' '}
                {[
                  selectedCategoryTag,
                  selectedLocation !== 'All Locations' ? selectedLocation : null,
                  featuredOnly ? 'Featured only' : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </Text>
              <TouchableOpacity onPress={clearAllFilters}>
                <Text style={styles.clearFilterText}>Reset</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Cross-Module Results when All or a non-AdBazaar module chip is active */}
          {showCrossModuleSection && filteredModuleResults.length > 0 ? (
            <View style={styles.sectionBlock}>
              <SearchSectionTitle
                prefix={selectedChip === 'All' ? 'Across ' : `${selectedChip} `}
                accent={selectedChip === 'All' ? 'AdStreet' : 'Results'}
              />
              <View style={styles.cardStack}>
                {filteredModuleResults.map((item, idx) => (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.duration(300).delay(Math.min(idx, 5) * 45)}>
                    <HapticPressable
                      haptic="light"
                      scaleTo={0.985}
                      borderRadius={20}
                      onPress={() => handleModuleResultPress(item)}
                      style={styles.jobCard}>
                      {idx === 0 ? (
                        <LinearGradient
                          colors={[theme.washPink, theme.surface, theme.washBlue]}
                          locations={[0, 0.5, 1]}
                          start={{ x: 0, y: 0.1 }}
                          end={{ x: 1, y: 0.9 }}
                          style={StyleSheet.absoluteFill}
                        />
                      ) : null}
                      <View style={styles.jobCardRow}>
                        <View style={styles.jobCardMain}>
                          <Text style={styles.jobTitleListing} numberOfLines={2}>
                            {item.title}
                          </Text>
                          <Text style={styles.jobCompany} numberOfLines={2}>
                            {item.subtitle}
                          </Text>
                          <View style={styles.jobFooterMeta}>
                            <View style={[styles.tagPill, { backgroundColor: item.tagBg }]}>
                              <Text style={[styles.tagPillText, { color: item.tagColor }]}>
                                {item.tag}
                              </Text>
                            </View>
                            <Text style={styles.postedText}>{item.meta}</Text>
                          </View>
                        </View>
                        <View style={styles.applyBtn}>
                          <Text style={styles.applyBtnText}>{item.ctaLabel}</Text>
                        </View>
                      </View>
                    </HapticPressable>
                  </Animated.View>
                ))}
              </View>
            </View>
          ) : null}

          {/* AdBazaar Sections (Matching Figma 192:3387 Vertical Rhythm) */}
          {showAdBazaarSections ? (
            <>
              {/* Empty state when search/filter finds nothing */}
              {noAdBazaarMatches ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="search-outline" size={32} color={FIGMA_RED} />
                  <Text style={styles.emptyTitle}>No matching opportunities found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try another keyword or reset your location and category filters.
                  </Text>
                  <HapticPressable
                    haptic="light"
                    borderRadius={12}
                    onPress={clearAllFilters}
                    style={styles.emptyResetBtn}>
                    <Text style={styles.applyBtnText}>Clear Filters</Text>
                  </HapticPressable>
                </View>
              ) : null}

              {/* Featured Opportunities */}
              {filteredFeatured.length > 0 ? (
                <View style={styles.sectionBlock}>
                  <SearchSectionTitle prefix="Featured " accent="Opportunities" />
                  <View style={styles.cardStack}>
                    {filteredFeatured.map((job, idx) => (
                      <Animated.View
                        key={job.id}
                        entering={FadeInDown.duration(320).delay(idx * 50)}>
                        <SearchJobCard
                          item={job}
                          showPastelWash={idx === 0}
                          showDescription
                          onPress={() => handleOpenJobDetails(job)}
                          onApply={() => handleOpenJobDetails(job)}
                        />
                      </Animated.View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Latest Listings */}
              {filteredListings.length > 0 ? (
                <View style={styles.sectionBlock}>
                  <SearchSectionTitle
                    prefix="Latest "
                    accent="Listings"
                    action="View All"
                    onAction={onOpenAdBazaar}
                  />
                  <View style={styles.cardStack}>
                    {filteredListings.map((job, idx) => (
                      <Animated.View
                        key={job.id}
                        entering={FadeInDown.duration(320).delay(Math.min(idx, 5) * 45)}>
                        <SearchJobCard
                          item={job}
                          showPastelWash={idx === 0}
                          onPress={() => handleOpenJobDetails(job)}
                          onApply={() => handleOpenJobDetails(job)}
                        />
                      </Animated.View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Explore by Category (Tilted Floating Tag Showcase) */}
              <View style={styles.sectionBlock}>
                <SearchSectionTitle prefix="Explore by " accent="Category" center />
                <View style={styles.exploreBox}>
                  {EXPLORE_CATEGORY_BUBBLES.map((bubble, i) => {
                    const selected = selectedCategoryTag === bubble.filterKey;
                    return (
                      <HapticPressable
                        key={bubble.id}
                        haptic="selection"
                        scaleTo={0.94}
                        borderRadius={14}
                        onPress={() => handleCategoryBubblePress(bubble)}
                        accessibilityRole="button"
                        accessibilityLabel={`${bubble.label}, ${bubble.jobsCount}`}
                        style={[
                          styles.explorePill,
                          { transform: [{ rotate: `${i % 2 === 0 ? -2 : 2}deg` }] },
                          selected && styles.explorePillSelected,
                        ]}>
                        <Text
                          style={[styles.explorePillTitle, { color: bubble.color }]}
                          numberOfLines={1}>
                          {bubble.label}
                        </Text>
                        <Text style={styles.explorePillCount}>{bubble.jobsCount}</Text>
                      </HapticPressable>
                    );
                  })}
                </View>
              </View>

              {/* Hire a Freelancer */}
              {filteredFreelancers.length > 0 ? (
                <View style={styles.sectionBlock}>
                  <SearchSectionTitle
                    prefix="Hire a "
                    accent="Freelancer"
                    action="Browse All"
                    onAction={() =>
                      Alert.alert(
                        'Freelancer Directory',
                        'Showing top vetted AdStreet creative & marketing freelancers.',
                      )
                    }
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToInterval={FREELANCER_CARD_W + FREELANCER_GAP}
                    onMomentumScrollEnd={handleFreelancerScrollEnd}
                    contentContainerStyle={styles.freelancerStrip}>
                    {filteredFreelancers.map((freelancer, idx) => (
                      <FreelancerCardItem
                        key={freelancer.id}
                        item={freelancer}
                        showPastelWash={idx === 0}
                        onPress={() =>
                          Alert.alert(
                            freelancer.name,
                            `${freelancer.role} • ${freelancer.city}\n${freelancer.rateLabel} • ${freelancer.rating} ★`,
                          )
                        }
                      />
                    ))}
                  </ScrollView>

                  {/* Freelancer Carousel Dots Pill */}
                  <View style={styles.dotsWrap}>
                    <View style={styles.dotsPill}>
                      {filteredFreelancers.map((f, idx) => (
                        <View
                          key={f.id}
                          style={[
                            styles.dot,
                            idx === freelancerPage && styles.dotActive,
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              ) : null}

              {/* Bottom CTA Banner ("Looking for the Right Talent?") */}
              <View style={styles.ctaWrap}>
                <View style={styles.ctaBanner}>
                  <LinearGradient
                    colors={
                      isDark
                        ? ['#7A2D33', '#3A1D22', '#1A1A1F', '#1B2D3D', '#2C5878']
                        : ['#F4A5A8', '#FBE9EA', '#FFFFFF', '#E3F1FA', '#90C9EC']
                    }
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
                    haptic="medium"
                    scaleTo={0.96}
                    borderRadius={12}
                    onPress={() => {
                      if (onPostJob) {
                        onPostJob();
                      } else {
                        Alert.alert(
                          'Post a Job',
                          'Job posting composer will open for verified employers & agencies.',
                        );
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Post a Job"
                    style={styles.postJobBtn}>
                    <Text style={styles.postJobBtnText}>Post a Job</Text>
                  </HapticPressable>
                </View>
              </View>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Filter Bottom Sheet */}
      <BottomSheet visible={filterModalOpen} onClose={() => setFilterModalOpen(false)}>
        <View style={[styles.sheetBody, { backgroundColor: theme.surface }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filter Search</Text>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearFilterText}>Reset All</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sheetSectionLabel}>Location</Text>
          <View style={styles.sheetChipWrap}>
            {SEARCH_LOCATIONS.map((loc) => {
              const active = selectedLocation === loc;
              return (
                <HapticPressable
                  key={loc}
                  haptic="selection"
                  borderRadius={999}
                  onPress={() => setSelectedLocation(loc)}
                  style={[
                    styles.sheetChip,
                    active ? styles.chipBtnActive : styles.sheetChipIdle,
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      active ? styles.chipTextActive : styles.chipTextIdle,
                    ]}>
                    {loc}
                  </Text>
                </HapticPressable>
              );
            })}
          </View>

          <Text style={styles.sheetSectionLabel}>Opportunity Type</Text>
          <HapticPressable
            haptic="selection"
            borderRadius={14}
            onPress={() => setFeaturedOnly((prev) => !prev)}
            style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Featured Opportunities Only</Text>
            <Ionicons
              name={featuredOnly ? 'checkbox' : 'square-outline'}
              size={22}
              color={featuredOnly ? FIGMA_RED : theme.textMuted}
            />
          </HapticPressable>

          <HapticPressable
            haptic="medium"
            borderRadius={14}
            onPress={() => setFilterModalOpen(false)}
            style={styles.sheetApplyBtn}>
            <Text style={styles.sheetApplyBtnText}>Show Results</Text>
          </HapticPressable>
        </View>
      </BottomSheet>
    </Animated.View>
  );
};

const createStyles = (t: AppTheme) => {
  const isDark = t.scheme === 'dark';
  // Android draws an elevated view's shadow *through* a translucent fill (a visible rectangle
  // inside the box), so fills are opaque there; iOS/web keep the glass look.
  const android = Platform.OS === 'android';
  const glassFill = isDark ? t.surface : android ? '#FDFBFB' : 'rgba(255, 255, 255, 0.72)';
  const glassCardFill = isDark ? t.surface : android ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)';
  const glassBorder = isDark ? t.border : 'rgba(255, 255, 255, 0.92)';

  return StyleSheet.create({
    root: {
      flex: 1,
    },
    flexOne: {
      flex: 1,
    },
    headerContainer: {
      paddingHorizontal: 20, // same as Home so the top bar lines up exactly
      paddingBottom: 22,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    topBar: {
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
      borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.85)',
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
      backgroundColor: isDark ? t.text : '#3A3A3A',
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
      color: '#111827',
    },
    brandTextStreet: {
      fontWeight: '500',
      color: '#4B5563',
    },
    notificationDot: {
      position: 'absolute',
      top: 0,
      start: 1,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: FIGMA_RED,
    },
    coinPill: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 34,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.55)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.85)',
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
      color: isDark ? t.text : '#3A3A3A',
    },
    heroTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.6,
      color: isDark ? t.text : '#3A3A3A',
      maxWidth: 280,
      marginBottom: 16,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    searchBox: {
      flex: 1,
      height: 45,
      borderRadius: 16,
      backgroundColor: glassFill,
      borderWidth: 1,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      ...Shadows.card,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: isDark ? t.text : '#3A3A3A',
      paddingVertical: 0,
      backgroundColor: 'transparent',
      includeFontPadding: false,
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
      backgroundColor: FIGMA_RED,
    },
    chipsContent: {
      paddingHorizontal: 16,
      gap: 6,
      paddingTop: 4,
      paddingBottom: 18, // room for the chip shadows (a scroll view clips them)
    },
    chipBtn: {
      height: 34,
      paddingHorizontal: 14,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipBtnActive: {
      backgroundColor: FIGMA_RED,
      ...Shadows.buttonGlow,
    },
    chipBtnIdle: {
      backgroundColor: glassFill,
      borderWidth: 1,
      borderColor: glassBorder,
      ...Shadows.card,
    },
    chipText: {
      fontSize: 13.5,
      letterSpacing: -0.2,
    },
    chipTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    chipTextIdle: {
      color: isDark ? t.text : '#3A3A3A',
      fontWeight: '400',
    },
    activeFilterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      marginTop: 10,
    },
    activeFilterLabel: {
      fontSize: 12,
      color: isDark ? t.textSecondary : '#6B7280',
      flex: 1,
    },
    clearFilterText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: FIGMA_RED,
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
      color: isDark ? t.text : '#3A3A3A',
    },
    sectionTitleAccent: {
      color: FIGMA_RED,
    },
    centerText: {
      textAlign: 'center',
    },
    viewAllLink: {
      fontSize: 12.5,
      fontWeight: '600',
      color: FIGMA_RED,
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
      overflow: 'hidden',
      ...Shadows.card,
    },
    jobCardRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    jobCardMain: {
      flex: 1,
      gap: 10,
    },
    jobTitle: {
      fontFamily: DisplayFont.semibold,
      color: isDark ? t.text : '#3A3A3A',
      letterSpacing: -0.4,
    },
    jobTitleFeatured: {
      fontSize: 18,
      lineHeight: 24,
    },
    jobTitleListing: {
      fontSize: 19.5,
      lineHeight: 25,
    },
    jobCompany: {
      fontSize: 12.5,
      color: isDark ? t.textSecondary : '#4B5563',
      marginTop: -4,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    locationText: {
      fontSize: 12,
      color: isDark ? t.textMuted : '#777777',
    },
    jobDescription: {
      fontSize: 13.5,
      lineHeight: 19,
      color: isDark ? t.textSecondary : '#777777',
    },
    jobFooterMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 2,
    },
    tagPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 14,
    },
    tagPillText: {
      fontSize: 12,
      fontWeight: '500',
    },
    postedText: {
      fontSize: 10.5,
      color: isDark ? t.textMuted : '#777777',
    },
    applyBtn: {
      backgroundColor: FIGMA_RED,
      height: 28,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.buttonGlow,
    },
    applyBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    exploreBox: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
      padding: 14,
      borderRadius: 20,
      backgroundColor: glassFill,
      borderWidth: 1,
      borderColor: glassBorder,
      ...Shadows.card,
    },
    explorePill: {
      backgroundColor: isDark ? t.surfaceAlt : 'rgba(255, 255, 255, 0.88)',
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
      borderColor: FIGMA_RED,
      borderWidth: 1.5,
    },
    explorePillTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 13.5,
      lineHeight: 18,
      letterSpacing: -0.3,
    },
    explorePillCount: {
      fontSize: 11.5,
      color: isDark ? t.textMuted : '#777777',
    },
    freelancerStrip: {
      gap: FREELANCER_GAP,
      paddingTop: 4,
      paddingBottom: 20, // keeps the card shadows from being cut off
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
      shadowOffset: { width: 0, height: 4 },
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
      color: isDark ? t.text : '#3A3A3A',
    },
    freelancerRole: {
      fontSize: 12,
      color: isDark ? t.textMuted : '#777777',
    },
    freelancerRateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 4,
    },
    ratePill: {
      backgroundColor: 'rgba(201, 47, 53, 0.10)',
      borderRadius: 12,
      paddingHorizontal: 7,
      paddingVertical: 5,
      flexShrink: 1,
    },
    ratePillText: {
      fontSize: 10.5,
      color: '#C92F35',
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
      color: isDark ? t.text : '#3A3A3A',
    },
    viewProfileBtn: {
      height: 32,
      borderRadius: 10,
      backgroundColor: FIGMA_RED,
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
      marginTop: -4,
    },
    dotsPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255, 255, 255, 0.72)',
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
      backgroundColor: FIGMA_RED,
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
      color: isDark ? t.text : '#3A3A3A',
      textAlign: 'center',
    },
    ctaSubtitle: {
      fontSize: 12.5,
      lineHeight: 17,
      color: isDark ? t.textSecondary : '#777777',
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
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    postJobBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#3A3A3A',
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
      color: isDark ? t.text : '#3A3A3A',
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 13,
      color: isDark ? t.textSecondary : '#777777',
      textAlign: 'center',
    },
    emptyResetBtn: {
      backgroundColor: FIGMA_RED,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 12,
      marginTop: 6,
    },
    sheetBody: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
      gap: 14,
    },
    sheetHandle: {
      width: 38,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border,
      alignSelf: 'center',
      marginBottom: 4,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sheetTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 20,
      color: t.text,
    },
    sheetSectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: t.textSecondary,
    },
    sheetChipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    sheetChip: {
      height: 34,
      paddingHorizontal: 14,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetChipIdle: {
      backgroundColor: t.surfaceAlt,
      borderWidth: 1,
      borderColor: t.border,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: t.surfaceAlt,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 14,
    },
    toggleLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: t.text,
    },
    sheetApplyBtn: {
      backgroundColor: FIGMA_RED,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
      ...Shadows.buttonGlow,
    },
    sheetApplyBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
  });
};
