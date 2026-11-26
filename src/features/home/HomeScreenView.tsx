import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
  Alert,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from 'react-native';
import { ScreenStatusBar } from '@/components/navigation/ScreenStatusBar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  Extrapolation,
  ZoomIn,
  ZoomOut,
  interpolate,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { SwipeBackContainer } from '@/components/navigation/SwipeBackContainer';
import { HomeMenu, HomeMenuItem } from './HomeMenu';
import { BannerCarousel } from './BannerCarousel';
import { HomeShelf, ShelfItem } from './HomeShelf';
import type { HomeTab } from './LiquidTabBar';
import { HomeTopBar } from './HomeTopBar';
import { FeedError, HomeSkeleton, OfflineBanner, useHomeFeed } from './HomeStates';
import { GlobalSearchView } from '@/features/search/GlobalSearchView';
import { JobPostScreenKey, PostJobFlow } from '@/features/jobpost/PostJobFlow';
import { JobListing } from '@/features/adbazaar/PopularJobs';
// import { LockedOverlay } from './LockedOverlay'; // lock overlay disabled for now
import {
  BuiltForEveryone,
  ComingUpSection,
  EventBanner,
  GurusSection,
  HappeningSection,
  JoinCta,
  SectionDivider,
  OpportunitiesSection,
  SessionsSection,
} from './HomeSections';
import { DisplayFont } from '@/constants/fonts';
import { BrandColors, Radii, Shadows } from '@/constants/theme';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
/** Categories that are not available yet get the animated lock overlay. */
// Locks are switched off for now, so every category counts as unlocked. To bring the locks back,
// restore the list below and un-comment the <LockedOverlay /> block and its import.
// const UNLOCKED_CATEGORIES: readonly string[] = ['adbazaar', 'adleaks'];
const UNLOCKED_CATEGORIES: readonly string[] = ['adbazaar', 'adleaks', 'adbooks', 'admeet', 'adguru', 'adread', 'adpro'];
const COMPACT_AT = 230; // scroll offset where the slim sticky bar takes over from the header
const TOP_BUTTON_AT = 700;
const CARD_GAP = 8;
const CARD_RADIUS = 12;
/** Width : height of each card's artwork — rows pair cards of equal ratio so they line up. */
const CARD_ASPECT: Record<string, number> = {
  adbazaar: 1.025,
  adleaks: 1.025,
  adbooks: 1.73,
  admeet: 1.73,
  adguru: 1.72,
  adread: 1.72,
  adpro: 3.657,
};
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - 20 * 2 - CARD_GAP) / 2);

export interface HeaderBanner {
  id: string;
  source: any;
  title: string;
}

export const HEADER_BANNERS: HeaderBanner[] = [
  {
    id: 'banner-1',
    source: require('@/assets/images/banners/banner-1.webp'),
    title: 'AdPro Services',
  },
  {
    id: 'banner-2',
    source: require('@/assets/images/banners/banner-2.webp'),
    title: 'Axsonstech',
  },
  {
    id: 'banner-3',
    source: require('@/assets/images/banners/banner-3.webp'),
    title: 'ProPakistani',
  },
  {
    id: 'banner-4',
    source: require('@/assets/images/banners/banner-4.webp'),
    title: 'TownEvent',
  },
  {
    id: 'banner-5',
    source: require('@/assets/images/banners/banner-5.webp'),
    title: 'Startup Pakistan',
  },
];

export interface CategoryCardData {
  id: string;
  name: string;
  subtitle: string;
  bgColor: string;
  badgeTextColor: string;
  type: 'adbazaar' | 'adleaks' | 'adbooks' | 'admeet' | 'adguru' | 'adread' | 'adpro';
}

const CATEGORIES: CategoryCardData[] = [
  {
    id: 'adbazaar',
    name: 'ADBAZAAR',
    subtitle: 'Seek Exciting Offers',
    bgColor: '#E31E24',
    badgeTextColor: '#E31E24',
    type: 'adbazaar',
  },
  {
    id: 'adleaks',
    name: 'ADLEAKS',
    subtitle: 'Industry News',
    bgColor: '#F27920',
    badgeTextColor: '#F27920',
    type: 'adleaks',
  },
  {
    id: 'adbooks',
    name: 'ADBOOKS',
    subtitle: 'Industry Database',
    bgColor: '#FBB714',
    badgeTextColor: '#FBB714',
    type: 'adbooks',
  },
  {
    id: 'admeet',
    name: 'ADMEET',
    subtitle: 'Events - Networking',
    bgColor: '#C5E8FB',
    badgeTextColor: '#2D3748',
    type: 'admeet',
  },
  {
    id: 'adguru',
    name: 'ADGURU',
    subtitle: 'Mentorship & Guidance',
    bgColor: '#59595B',
    badgeTextColor: '#59595B',
    type: 'adguru',
  },
  {
    id: 'adread',
    name: 'ADREAD',
    subtitle: 'Articles & Insights',
    bgColor: '#82151A',
    badgeTextColor: '#82151A',
    type: 'adread',
  },
  {
    id: 'adpro',
    name: 'ADPRO SERVICES',
    subtitle: 'Adpro Services - OneStop Advertising Services',
    bgColor: '#231F1E',
    badgeTextColor: '#231F1E',
    type: 'adpro',
  },
];

// Placeholder content: add `image: require(...)` to each item once the artwork is provided.
const FRESH_LEAKS: ShelfItem[] = [
  {
    id: 'leak-1',
    title: 'Fresh Leak',
    image: require('@/assets/images/leaks/fresh-leak.webp'),
  },
  {
    id: 'leak-2',
    title: 'A Tale of Misguided Ambitions: Chasing Foreign Dreams',
    image: require('@/assets/images/leaks/misguided-ambitions.webp'),
  },
];
const FEATURED_LISTINGS: ShelfItem[] = [
  {
    id: 'listing-1',
    title: 'Copywriting',
    image: require('@/assets/images/listings/copywriting.webp'),
  },
  {
    id: 'listing-2',
    title: 'App & Website Development',
    image: require('@/assets/images/listings/app-development.webp'),
  },
  {
    id: 'listing-3',
    title: 'Social Media Management',
    image: require('@/assets/images/listings/social-media.webp'),
  },
  {
    id: 'listing-4',
    title: 'Brand Developer',
    image: require('@/assets/images/listings/brand-developer.webp'),
  },
];

interface HomeScreenViewProps {
  onSelectCategory?: (category: CategoryCardData) => void;
  onOpenMenu?: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onSelectRegion?: () => void;
  onBack?: () => void;
  /** Screen revealed underneath while Home slides away on back (hardware back / swipe). */
  renderPreviousScreen?: () => React.ReactNode;
  /** Settings / Account / Help & Support taps in the side menu. */
  onMenuSelect?: (item: HomeMenuItem) => void;
  /** Called after the user confirms "Log out" in the side menu. */
  onLogout?: () => void;
  /** Initial active tab (e.g. 'search' for dev deep links). */
  initialTab?: HomeTab;
  /** Initial screen inside the '+' Post a Job flow (used for dev deep links). */
  initialJobStep?: JobPostScreenKey;
  /** Switch tab from outside (floating bar tapped on an inner page). `n` changes on every request. */
  /** Controlled active tab + change handler (the app shell owns the floating tab bar). */
  tab?: HomeTab;
  onTabChange?: (tab: HomeTab) => void;
  /** Opens job details when user selects a job from Global Search. */
  onPressJob?: (job: JobListing) => void;
  /** Opens full AdBazaar page from Search's View All action. */
  onOpenAdBazaar?: () => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  onSelectCategory,
  onOpenMenu,
  onOpenSearch,
  onOpenNotifications,
  onSelectRegion,
  onBack,
  renderPreviousScreen,
  onMenuSelect,
  onLogout,
  initialTab = 'home',
  initialJobStep,
  tab: tabProp,
  onTabChange,
  onPressJob,
  onOpenAdBazaar,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const feed = useHomeFeed();

  // Scroll-linked chrome: a slim sticky bar fades in once the big header has scrolled away, and a
  // back-to-top button appears further down. Scroll position lives in a shared value (UI thread);
  // React state only flips at the two thresholds.
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const [compactOn, setCompactOn] = useState(false);
  const [topButtonOn, setTopButtonOn] = useState(false);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  useAnimatedReaction(
    () => scrollY.value,
    (y, prev) => {
      const wasCompact = prev !== null && prev > COMPACT_AT;
      if (y > COMPACT_AT !== wasCompact) scheduleOnRN(setCompactOn, y > COMPACT_AT);
      const wasTop = prev !== null && prev > TOP_BUTTON_AT;
      if (y > TOP_BUTTON_AT !== wasTop) scheduleOnRN(setTopButtonOn, y > TOP_BUTTON_AT);
    },
  );
  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COMPACT_AT - 40, COMPACT_AT + 20], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [COMPACT_AT - 40, COMPACT_AT + 20], [-14, 0], Extrapolation.CLAMP),
      },
    ],
  }));
  const scrollToTop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  // taps on locked cards, per category: drives the lock's rattle
  const [lockPings, setLockPings] = useState<Record<string, number>>({});
  const handleCategoryPress = (cat: CategoryCardData) => {
    if (UNLOCKED_CATEGORIES.includes(cat.type)) {
      onSelectCategory?.(cat);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
    setLockPings((prev) => ({ ...prev, [cat.id]: (prev[cat.id] ?? 0) + 1 }));
  };

  const openMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    setMenuOpen(true);
    onOpenMenu?.();
  };
  const handleMenuCategory = (id: string) => {
    setMenuOpen(false);
    const category = CATEGORIES.find((c) => c.id === id);
    if (category) onSelectCategory?.(category);
  };
  const handleMenuItem = (item: HomeMenuItem) => {
    setMenuOpen(false);
    onMenuSelect?.(item);
  };
  const handleLogout = () => {
    setMenuOpen(false);
    // the system alert can't present while the drawer is still animating away
    setTimeout(() => {
      Alert.alert('Log out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: () => onLogout?.() },
      ]);
    }, 320);
  };
  const [internalTab, setInternalTab] = useState<HomeTab>(initialTab);
  const activeTab = tabProp ?? internalTab;
  const setActiveTab = (next: HomeTab) => {
    setInternalTab(next);
    onTabChange?.(next);
  };
  const handleTabPress = (tab: 'home' | 'chat' | 'add' | 'notifications' | 'search') => {
    Haptics.selectionAsync().catch(() => { });
    setActiveTab(tab);
  };
  const openGlobalSearch = () => {
    Haptics.selectionAsync().catch(() => { });
    setActiveTab('search');
    onOpenSearch?.();
  };

  // The container plays the back haptic. From another tab, back just returns to the Home tab
  // (no screen change, so no slide); from the Home tab it leaves the screen.
  const handleBack = () => {
    if (activeTab !== 'home') {
      setActiveTab('home');
    } else {
      onBack?.();
    }
  };

  const renderCategoryGraphic = (type: CategoryCardData['type']) => {
    switch (type) {
      case 'adbazaar':
        return (
          <View style={styles.awningContainer}>
            {/* Scalloped striped shop awning */}
            <View style={styles.awningRoof}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.awningStripe,
                    { backgroundColor: i % 2 === 0 ? '#4DD0E1' : '#FFFFFF' },
                  ]}
                />
              ))}
            </View>
            <View style={styles.awningScallops}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.scallopCircle,
                    { backgroundColor: i % 2 === 0 ? '#4DD0E1' : '#FFFFFF' },
                  ]}
                />
              ))}
            </View>
          </View>
        );

      case 'adleaks':
        return (
          <View style={styles.leakGraphicContainer}>
            <Ionicons name="newspaper-outline" size={32} color="#FFFFFF" style={{ opacity: 0.95 }} />
            <View style={styles.leakMiniIcon}>
              <Ionicons name="globe-outline" size={14} color="#DE7B2C" />
            </View>
          </View>
        );

      case 'adbooks':
        return (
          <View style={styles.booksGraphicGrid}>
            <View style={styles.iconChip}>
              <Ionicons name="call" size={11} color="#E5A634" />
            </View>
            <View style={styles.iconChip}>
              <Ionicons name="chatbubbles" size={11} color="#E5A634" />
            </View>
            <View style={styles.iconChip}>
              <Ionicons name="location" size={11} color="#E5A634" />
            </View>
            <View style={styles.iconChip}>
              <Ionicons name="videocam" size={11} color="#E5A634" />
            </View>
            <View style={styles.iconChip}>
              <Ionicons name="book" size={11} color="#E5A634" />
            </View>
            <View style={styles.iconChip}>
              <Ionicons name="at" size={11} color="#E5A634" />
            </View>
          </View>
        );

      case 'admeet':
        return (
          <View style={styles.meetGraphicContainer}>
            {/* Stylized colorful team avatar crowd */}
            <View style={[styles.avatarCircle, { backgroundColor: '#F87171', left: 4 }]}>
              <Ionicons name="person" size={14} color="#FFFFFF" />
            </View>
            <View style={[styles.avatarCircle, { backgroundColor: '#FBBF24', left: 24, zIndex: 2 }]}>
              <Ionicons name="person" size={15} color="#FFFFFF" />
            </View>
            <View style={[styles.avatarCircle, { backgroundColor: '#34D399', left: 44, zIndex: 3 }]}>
              <Ionicons name="person" size={16} color="#FFFFFF" />
            </View>
            <View style={[styles.avatarCircle, { backgroundColor: '#60A5FA', left: 66, zIndex: 2 }]}>
              <Ionicons name="person" size={15} color="#FFFFFF" />
            </View>
            <View style={[styles.avatarCircle, { backgroundColor: '#A78BFA', left: 86 }]}>
              <Ionicons name="person" size={14} color="#FFFFFF" />
            </View>
          </View>
        );

      case 'adguru':
        return (
          <View style={styles.guruGraphicContainer}>
            <MaterialCommunityIcons name="brain" size={36} color="#FFFFFF" style={{ opacity: 0.95 }} />
          </View>
        );

      case 'adread':
        return (
          <View style={styles.readGraphicContainer}>
            <Ionicons name="book-outline" size={34} color="#FFFFFF" style={{ opacity: 0.95 }} />
          </View>
        );
    }
  };

  return (
    <SwipeBackContainer
      onBack={handleBack}
      backgroundColor={theme.canvas}
      renderPrevious={activeTab === 'home' && onBack ? renderPreviousScreen : undefined}>
      <View style={styles.rootContainer}>
        <ScreenStatusBar
          style={activeTab === 'search' || activeTab === 'add' ? theme.statusBar : 'light'}
        />
        <View style={styles.blurTarget}>
          <OfflineBanner top={insets.top + 8} />

          {/* Main Scrollable View */}
          <Animated.ScrollView
            ref={scrollRef}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            // Pull-to-refresh is switched off for now. To bring it back, restore this prop:
            // refreshControl={
            // <RefreshControl
            // refreshing={feed.refreshing}
            // onRefresh={feed.refresh}
            // tintColor="#FFFFFF"
            // colors={[theme.primary]}
            // progressBackgroundColor={theme.surface}
            // />
            // }
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 96 },
            ]}>
            {/* 1. Deep Crimson Luxury Header (linear-gradient(52.54deg, #EC2029 0%, #6C2326 100%)) */}
            <LinearGradient
              colors={['#EC2029', '#6C2326']}
              locations={[0, 1]}
              start={{ x: 0, y: 0.88 }}
              end={{ x: 1, y: 0.12 }}
              style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>

              {/* Top Bar: Menu, Brand Badge, Actions (shared with Global Search) */}
              <HomeTopBar
                onOpenMenu={openMenu}
                onOpenSearch={openGlobalSearch}
                onOpenNotifications={onOpenNotifications}
              />

              {/* Hero banner carousel: coverflow with parallax and timed progress pill */}
              <BannerCarousel banners={HEADER_BANNERS} />
            </LinearGradient>

            {/* 2. Categories Section */}
            <View style={styles.bodySection}>
              <Text style={styles.sectionHeading}>Categories</Text>

              {/* 2-Column Grid */}
              <View style={styles.gridContainer}>
                {CATEGORIES.map((cat, idx) => (
                  <Animated.View
                    key={cat.id}
                    entering={FadeInDown.duration(400).delay(idx * 60)}
                    style={cat.type === 'adpro' ? styles.cardWrapperWide : styles.cardWrapper}>
                    <HapticPressable
                      haptic={UNLOCKED_CATEGORIES.includes(cat.type) ? 'light' : 'none'}
                      borderRadius={CARD_RADIUS}
                      onPress={() => handleCategoryPress(cat)}
                      accessibilityRole="button"
                      accessibilityLabel={`${cat.name} - ${cat.subtitle}${UNLOCKED_CATEGORIES.includes(cat.type) ? '' : ', locked'
                        }`}
                      style={[
                        cat.type === 'adpro' ? styles.categoryCardWide : styles.categoryCard,
                        { aspectRatio: CARD_ASPECT[cat.type], backgroundColor: cat.bgColor },
                      ]}>
                      {cat.type === 'adbazaar' ? (
                        // The ADBAZAAR card artwork (striped awning, dual-tone badge, and subtitle)
                        <Image
                          source={require('@/assets/images/categories/adbazaar-card.webp')}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                        />
                      ) : cat.type === 'adleaks' ? (
                        // The ADLEAKS card artwork (world map silhouette, newspaper, dual-tone badge, and subtitle)
                        <Image
                          source={require('@/assets/images/categories/adleaks-card.webp')}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                        />
                      ) : cat.type === 'adbooks' ? (
                        // The ADBOOKS card artwork (contact icons, dual-tone badge, and subtitle)
                        <Image
                          source={require('@/assets/images/categories/adbooks-card.webp')}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                        />
                      ) : cat.type === 'admeet' ? (
                        // The ADMEET card artwork (people networking illustration, badge, and subtitle)
                        <Image
                          source={require('@/assets/images/categories/admeet-card.webp')}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                        />
                      ) : cat.type === 'adpro' ? (
                        // Full-width ADPRO SERVICES banner card (logo + tagline artwork)
                        <Image
                          source={require('@/assets/images/categories/adpro-card.webp')}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                        />
                      ) : cat.type === 'adguru' || cat.type === 'adread' ? (
                        // The ADGURU / ADREAD cards are ready-made artwork (logo + tagline): show it whole.
                        <Image
                          source={
                            cat.type === 'adguru'
                              ? require('@/assets/images/adguru-card.png')
                              : require('@/assets/images/adread-card.png')
                          }
                          style={StyleSheet.absoluteFill}
                          contentFit="contain"
                        />
                      ) : (
                        <>
                          {/* Top Graphic Illustration Area */}
                          <View style={styles.cardGraphicArea}>
                            {renderCategoryGraphic(cat.type)}
                          </View>

                          {/* Category Name Badge */}
                          <View style={styles.categoryBadge}>
                            <Text style={[styles.categoryBadgeText, { color: cat.badgeTextColor }]}>
                              {cat.name}
                            </Text>
                          </View>

                          {/* Subtitle */}
                          <Text style={styles.cardSubtitle} numberOfLines={1}>
                            {cat.subtitle}
                          </Text>
                        </>
                      )}
                      {/* Lock overlay disabled for now:
                    {!UNLOCKED_CATEGORIES.includes(cat.type) && (
                      <LockedOverlay ping={lockPings[cat.id] ?? 0} />
                    )}
                    */}
                    </HapticPressable>
                  </Animated.View>
                ))}
              </View>

              {feed.status === 'loading' && (
                <>
                  <SectionDivider />
                  <HomeSkeleton />
                </>
              )}
              {feed.status === 'error' && (
                <>
                  <SectionDivider />
                  <FeedError onRetry={feed.retry} />
                </>
              )}
              {feed.status === 'ready' && (
                <>
                  <SectionDivider />
                  <HomeShelf title="Explore market's fresh leaks" items={FRESH_LEAKS} />
                  <SectionDivider />
                  <HomeShelf title="Featured Listings" items={FEATURED_LISTINGS} />

                  <SectionDivider />
                  <BuiltForEveryone />
                  <SectionDivider />
                  <EventBanner />
                  <OpportunitiesSection />
                  <SectionDivider />
                  <GurusSection />
                  <SectionDivider />
                  <HappeningSection />
                  <SectionDivider />
                  <ComingUpSection />
                  <SectionDivider />
                  <SessionsSection />
                  <SectionDivider />
                  <JoinCta />
                </>
              )}
            </View>
          </Animated.ScrollView>

          {/* Slim sticky bar (collapsed header) */}
          <Animated.View
            pointerEvents={compactOn ? 'auto' : 'none'}
            style={[styles.compactBar, { paddingTop: Math.max(insets.top, 12) }, compactStyle]}>
            <LinearGradient
              colors={['#EC2029', '#6C2326']}
              locations={[0, 1]}
              start={{ x: 0, y: 0.88 }}
              end={{ x: 1, y: 0.12 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.compactRow}>
              <TouchableOpacity
                onPress={openMenu}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Open menu"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.compactIcon}>
                <Ionicons name="menu" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.compactBrand}>
                <Image
                  source={require('@/assets/images/splash-logo-clean.png')}
                  style={styles.compactEmblem}
                  contentFit="contain"
                />
                <Text style={styles.compactBrandText}>ADSTREET</Text>
              </View>
              <TouchableOpacity
                onPress={openGlobalSearch}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Search"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.compactIcon}>
                <Ionicons name="search" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Back to top */}
          {topButtonOn && (
            <Animated.View
              entering={ZoomIn.duration(200)}
              exiting={ZoomOut.duration(160)}
              style={[styles.topButtonWrap, { bottom: Math.max(insets.bottom, 12) + 76 }]}>
              <HapticPressable
                haptic="none"
                borderRadius={22}
                onPress={scrollToTop}
                accessibilityRole="button"
                accessibilityLabel="Back to top"
                style={styles.topButton}>
                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
              </HapticPressable>
            </Animated.View>
          )}

          {/* Global Search Tab Screen (renders above Home feed, beneath floating tab bar) */}
          {activeTab === 'search' && (
            <View style={[StyleSheet.absoluteFill, styles.searchOverlay]}>
              <GlobalSearchView
                onOpenMenu={openMenu}
                onOpenNotifications={() => {
                  setActiveTab('notifications');
                  onOpenNotifications?.();
                }}
                onPressJob={onPressJob}
                onOpenAdBazaar={onOpenAdBazaar}
                onPostJob={() => setActiveTab('add')}
              />
            </View>
          )}

          {/* Add a Job Post Flow (renders above Home feed when '+' tab is selected) */}
          {activeTab === 'add' && (
            <View style={[StyleSheet.absoluteFill, styles.searchOverlay]}>
              <PostJobFlow
                initialScreen={initialJobStep}
                onClose={() => setActiveTab('home')}
                onOpenMenu={openMenu}
                onOpenSearch={() => setActiveTab('search')}
                onOpenNotifications={() => {
                  setActiveTab('notifications');
                  onOpenNotifications?.();
                }}
              />
            </View>
          )}
        </View>

      </View>
      <HomeMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSelectCategory={handleMenuCategory}
        onSelectItem={handleMenuItem}
        onLogout={handleLogout}
      />
    </SwipeBackContainer>
  );
};

const createStyles = (t: AppTheme) =>
  StyleSheet.create({
    rootContainer: {
      flex: 1,
      backgroundColor: t.canvas,
    },
    blurTarget: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    compactBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#6C2326',
      overflow: 'hidden',
      paddingBottom: 10,
      paddingHorizontal: 20,
      zIndex: 20,
      ...Shadows.floatingBar,
    },
    compactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 40,
    },
    compactIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(255, 255, 255, 0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    compactBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    compactEmblem: {
      width: 22,
      height: 22,
    },
    compactBrandText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 1.4,
    },
    topButtonWrap: {
      position: 'absolute',
      right: 20,
      zIndex: 15,
    },
    topButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.buttonGlow,
    },
    headerContainer: {
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      paddingHorizontal: 20,
      paddingBottom: 20,
      ...Shadows.floatingBar,
    },
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
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
      backgroundColor: '#FFFFFF',
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
      backgroundColor: '#FFFFFF',
    },
    coinPill: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 36,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
    bannerCarouselContainer: {
      marginTop: 18,
      width: '100%',
    },
    bannerCardWrapper: {
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#0F172A',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    bannerImage: {
      width: '100%',
      height: '100%',
    },
    carouselPagination: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      gap: 6,
    },
    paginationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.45)',
    },
    activePaginationPill: {
      width: 22,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#FFFFFF',
    },
    bodySection: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    sectionHeading: {
      fontSize: 26,
      lineHeight: 32,
      color: t.text,
      fontFamily: DisplayFont.bold,
      letterSpacing: -0.2,
      marginBottom: 12,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    cardWrapper: {
      width: CARD_WIDTH,
      marginBottom: CARD_GAP,
    },
    sectionDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.divider,
      marginTop: 10,
      marginBottom: 18,
    },
    cardWrapperWide: {
      width: '100%',
      marginBottom: CARD_GAP,
    },
    categoryCardWide: {
      width: '100%',
      borderRadius: CARD_RADIUS,
      overflow: 'hidden',
      ...Shadows.card,
    },
    categoryCard: {
      width: '100%',
      borderRadius: CARD_RADIUS,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'space-between',
      overflow: 'hidden',
      ...Shadows.card,
    },
    cardGraphicArea: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    categoryBadge: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.08)',
      ...Shadows.card,
    },
    categoryBadgeText: {
      fontSize: 11.5,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    cardSubtitle: {
      fontSize: 11,
      color: 'rgba(255, 255, 255, 0.95)',
      fontWeight: '500',
      marginTop: 6,
      textAlign: 'center',
    },

    // Category Graphics
    awningContainer: {
      width: 90,
      alignItems: 'center',
    },
    awningRoof: {
      width: '100%',
      height: 30,
      flexDirection: 'row',
      overflow: 'hidden',
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,
    },
    awningStripe: {
      flex: 1,
      height: '100%',
    },
    awningScallops: {
      width: '100%',
      height: 8,
      flexDirection: 'row',
    },
    scallopCircle: {
      flex: 1,
      height: 8,
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
    },
    leakGraphicContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    leakMiniIcon: {
      position: 'absolute',
      bottom: -2,
      right: -6,
      backgroundColor: '#FFFFFF',
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.card,
    },
    booksGraphicGrid: {
      width: 90,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 6,
    },
    iconChip: {
      width: 22,
      height: 22,
      borderRadius: 6,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    meetGraphicContainer: {
      width: 110,
      height: 38,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarCircle: {
      position: 'absolute',
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    guruGraphicContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    readGraphicContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Floating Bottom Tab Bar
    searchOverlay: {
      zIndex: 25,
    },
    floatingBarWrapper: {
      position: 'absolute',
      left: 20,
      right: 20,
      alignItems: 'center',
      zIndex: 30,
    },
    glassBar: {
      width: '100%',
      maxWidth: 380,
      borderWidth: 0.8,
      borderColor: 'rgba(255, 255, 255, 0.22)',
    },
    tabBarInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      height: 60,
      paddingHorizontal: 8,
    },
    tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    inactiveTab: {
      paddingHorizontal: 12,
    },
    activeHomePill: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      borderRadius: Radii.pill,
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 6,
      ...Shadows.card,
    },
    activeHomeText: {
      color: '#0F172A',
      fontSize: 13,
      fontWeight: '700',
    },
    centerAddButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#E31E24',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.45)',
      ...Shadows.buttonGlow,
    },
  });
