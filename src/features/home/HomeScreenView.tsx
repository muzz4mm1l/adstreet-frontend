import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { SwipeBackContainer } from '@/components/navigation/SwipeBackContainer';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 20 * 2 - CARD_GAP) / 2;

export interface CategoryCardData {
  id: string;
  name: string;
  subtitle: string;
  bgColor: string;
  badgeTextColor: string;
  type: 'adbazaar' | 'adleaks' | 'adbooks' | 'admeet' | 'adguru' | 'adread';
}

const CATEGORIES: CategoryCardData[] = [
  {
    id: 'adbazaar',
    name: 'ADBAZAAR',
    subtitle: 'Seek/offer services',
    bgColor: '#C8232B',
    badgeTextColor: '#C8232B',
    type: 'adbazaar',
  },
  {
    id: 'adleaks',
    name: 'ADLEAKS',
    subtitle: 'Industry News',
    bgColor: '#DE7B2C',
    badgeTextColor: '#C7661E',
    type: 'adleaks',
  },
  {
    id: 'adbooks',
    name: 'ADBOOKS',
    subtitle: 'Connecting Professionals',
    bgColor: '#E5A634',
    badgeTextColor: '#B87F18',
    type: 'adbooks',
  },
  {
    id: 'admeet',
    name: 'ADMEET',
    subtitle: 'Events & Conferences',
    bgColor: '#E59B32',
    badgeTextColor: '#BC6A16',
    type: 'admeet',
  },
  {
    id: 'adguru',
    name: 'ADGURU',
    subtitle: 'Mentorship & Guidance',
    bgColor: '#6A161E',
    badgeTextColor: '#6A161E',
    type: 'adguru',
  },
  {
    id: 'adread',
    name: 'ADREAD',
    subtitle: 'Articles & Insights',
    bgColor: '#4B5565',
    badgeTextColor: '#374151',
    type: 'adread',
  },
];

interface HomeScreenViewProps {
  onSelectCategory?: (category: CategoryCardData) => void;
  onOpenMenu?: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onSelectRegion?: () => void;
  onBack?: () => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  onSelectCategory,
  onOpenMenu,
  onOpenSearch,
  onOpenNotifications,
  onSelectRegion,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'add' | 'notifications' | 'search'>('home');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const handleTabPress = (tab: 'home' | 'chat' | 'add' | 'notifications' | 'search') => {
    Haptics.selectionAsync().catch(() => {});
    setActiveTab(tab);
  };

  const handleBack = () => {
    if (activeTab !== 'home') {
      Haptics.selectionAsync().catch(() => {});
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
    <SwipeBackContainer onBack={handleBack}>
      <View style={styles.rootContainer}>
        <StatusBar style="light" />

      {/* Main Scrollable View */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 96 },
        ]}>
        {/* 1. Deep Crimson Luxury Header */}
        <LinearGradient
          colors={['#800E13', '#A81218', '#C9181F', '#E31E24']}
          locations={[0, 0.35, 0.7, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
          {/* Top Bar: Menu, Brand Badge, Actions */}
          <View style={styles.topBar}>
            {/* Hamburger Button */}
            <TouchableOpacity
              onPress={onOpenMenu}
              activeOpacity={0.75}
              style={styles.iconButton}>
              <Ionicons name="menu" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* ADSTREET Logo Badge */}
            <View style={styles.brandBadge}>
              <Image
                source={require('@/assets/images/splash-logo-clean.png')}
                style={styles.brandEmblem}
                contentFit="contain"
              />
              <Text style={styles.brandText}>ADSTREET</Text>
            </View>

            {/* Right Action Icons Group */}
            <View style={styles.rightActionsGroup}>
              {/* Search */}
              <TouchableOpacity
                onPress={onOpenSearch}
                activeOpacity={0.75}
                style={styles.iconButton}>
                <Ionicons name="search" size={17} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Notification with Badge Dot */}
              <TouchableOpacity
                onPress={onOpenNotifications}
                activeOpacity={0.75}
                style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>

              {/* Coins Pill */}
              <View style={styles.coinPill}>
                <View style={styles.coinIconWrapper}>
                  <Text style={styles.coinLetter}>A</Text>
                </View>
                <Text style={styles.coinCount}>15</Text>
              </View>
            </View>
          </View>

          {/* Region Selector */}
          <View style={styles.regionSection}>
            <Text style={styles.regionLabel}>Region Selector</Text>
            <TouchableOpacity
              onPress={onSelectRegion}
              activeOpacity={0.8}
              style={styles.regionPill}>
              <Text style={styles.regionFlag}>🇵🇰</Text>
              <Text style={styles.regionText}>Karachi, PK</Text>
              <Ionicons name="chevron-down" size={12} color="#FFFFFF" style={{ marginStart: 4 }} />
            </TouchableOpacity>
          </View>

          {/* Hero Carousel Headline */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Pakistan's First Industry Platform for Marketing & Advertising Professionals
            </Text>
            <Text style={styles.heroSubtitle}>
              One destination for jobs, Gurus, news, events, courses, and podcasts.
            </Text>

            {/* Pagination Pill & Dots */}
            <View style={styles.carouselPagination}>
              <View style={[styles.pageIndicator, activeHeroIndex === 0 && styles.activePagePill]} />
              <View style={[styles.pageDot, activeHeroIndex === 1 && styles.activePagePill]} />
              <View style={[styles.pageDot, activeHeroIndex === 2 && styles.activePagePill]} />
            </View>
          </View>
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
                style={styles.cardWrapper}>
                <HapticPressable
                  haptic="light"
                  borderRadius={18}
                  onPress={() => onSelectCategory?.(cat)}
                  style={[styles.categoryCard, { backgroundColor: cat.bgColor }]}>
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
                </HapticPressable>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 3. Floating Bottom Tab Bar with Liquid Glass */}
      <View
        pointerEvents="box-none"
        style={[styles.floatingBarWrapper, { bottom: Math.max(insets.bottom, 12) }]}>
        <GlassSurface
          borderRadius={999}
          intensity={65}
          tint={Platform.OS === 'ios' ? 'systemChromeMaterialDark' : 'dark'}
          fallbackColor="rgba(30, 30, 32, 0.88)"
          elevation={12}
          style={styles.glassBar}>
          <View style={styles.tabBarInner}>
            {/* 1. Home Tab (Active Pill) */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleTabPress('home')}
              style={[
                styles.tabItem,
                activeTab === 'home' ? styles.activeHomePill : styles.inactiveTab,
              ]}>
              <Ionicons
                name="home"
                size={18}
                color={activeTab === 'home' ? BrandColors.primary : 'rgba(255, 255, 255, 0.75)'}
              />
              {activeTab === 'home' && (
                <Text style={styles.activeHomeText}>Home</Text>
              )}
            </TouchableOpacity>

            {/* 2. Chat Tab */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleTabPress('chat')}
              style={styles.tabItem}>
              <Ionicons
                name={activeTab === 'chat' ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
                size={20}
                color={activeTab === 'chat' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)'}
              />
            </TouchableOpacity>

            {/* 3. Elevated Add (+) Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleTabPress('add')}
              style={styles.centerAddButton}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* 4. Notifications Tab */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleTabPress('notifications')}
              style={styles.tabItem}>
              <Ionicons
                name={activeTab === 'notifications' ? 'notifications' : 'notifications-outline'}
                size={20}
                color={activeTab === 'notifications' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)'}
              />
            </TouchableOpacity>

            {/* 5. Search Tab */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleTabPress('search')}
              style={styles.tabItem}>
              <Ionicons
                name={activeTab === 'search' ? 'search' : 'search-outline'}
                size={20}
                color={activeTab === 'search' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)'}
              />
            </TouchableOpacity>
          </View>
        </GlassSurface>
      </View>
    </View>
  </SwipeBackContainer>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: SurfaceColors.canvas,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 22,
    ...Shadows.floatingBar,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    ...Shadows.card,
  },
  brandEmblem: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  brandText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.2,
  },
  rightActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: Radii.pill,
    paddingStart: 4,
    paddingEnd: 10,
    paddingVertical: 4,
  },
  coinIconWrapper: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E31E24',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  coinLetter: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  coinCount: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: 'bold',
  },
  regionSection: {
    marginTop: 14,
    alignItems: 'flex-start',
  },
  regionLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10.5,
    fontWeight: '500',
    marginBottom: 4,
  },
  regionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  regionFlag: {
    fontSize: 13,
    marginRight: 5,
  },
  regionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  heroSection: {
    marginTop: 18,
  },
  heroTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
  },
  carouselPagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  activePagePill: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  pageIndicator: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  bodySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    letterSpacing: -0.2,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48.2%',
    marginBottom: CARD_GAP,
  },
  categoryCard: {
    width: '100%',
    height: 154,
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
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
  floatingBarWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
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
