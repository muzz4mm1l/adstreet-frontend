import React, { useState } from 'react';
import { FlatList, I18nManager, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { DisplayFont } from '@/constants/fonts';
import { AnimationPresets, Shadows } from '@/constants/theme';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';
import { JobListingStatus, MyGigItem, PostedJobItem } from './jobPostData';
import { JOBPOST_PALETTE, PostJobHeader } from './PostJobHeader';

type ListingsTab = 'jobs' | 'gigs';

interface MyListingsViewProps {
  jobs: PostedJobItem[];
  gigs: MyGigItem[];
  justPublishedId?: string | null;
  onEditJob: (job: PostedJobItem) => void;
  onCloseJob: (id: string) => void;
  onRenewJob: (id: string) => void;
  onCreateNewJob: () => void;
  onOpenTalentProfile: () => void;
  onOpenMenu: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}

const getStatusColor = (status: JobListingStatus) => {
  switch (status) {
    case 'Active':
      return JOBPOST_PALETTE.statusActive;
    case 'Filled':
      return JOBPOST_PALETTE.statusFilled;
    case 'Expired':
      return JOBPOST_PALETTE.statusExpired;
    case 'Closed':
      return JOBPOST_PALETTE.statusClosed;
  }
};

/** AdBazaar "My Listings" screen (Figma 05 - AdBazaar - 06 / node 205:838). */
export const MyListingsView: React.FC<MyListingsViewProps> = ({
  jobs,
  gigs,
  justPublishedId,
  onEditJob,
  onCloseJob,
  onRenewJob,
  onCreateNewJob,
  onOpenTalentProfile,
  onOpenMenu,
  onOpenSearch,
  onOpenNotifications,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const isDark = theme.scheme === 'dark';

  const [tab, setTab] = useState<ListingsTab>('jobs');
  const toggleX = useSharedValue(0);
  const [segmentW, setSegmentW] = useState(86);

  const switchTab = (next: ListingsTab) => {
    if (next === tab) return;
    Haptics.selectionAsync().catch(() => {});
    setTab(next);
    const dir = I18nManager.isRTL ? -1 : 1;
    const target = (next === 'jobs' ? 0 : segmentW) * dir;
    toggleX.value = reduceMotion ? target : withSpring(target, AnimationPresets.spring);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: toggleX.value }],
    width: segmentW,
  }));

  const headerNode = (
    <>
      <PostJobHeader
        onMenuOrBack={onOpenMenu}
        onOpenSearch={onOpenSearch}
        onOpenNotifications={onOpenNotifications}
        showAdBazaarBadge>
        <View style={styles.titleToggleRow}>
          <Text style={styles.screenTitle} accessibilityRole="header">
            My Listings
          </Text>

          {/* Segmented Pill Toggle: My Jobs | My Gigs */}
          <View style={styles.segmentedTrack}>
            <Animated.View style={[styles.segmentedActiveBg, indicatorStyle]} />
            <HapticPressable
              haptic="none"
              scaleTo={0.96}
              borderRadius={50}
              onPress={() => switchTab('jobs')}
              onLayout={(e) => setSegmentW(Math.max(e.nativeEvent.layout.width, 78))}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === 'jobs' }}
              style={styles.segmentBtn}>
              <Text
                maxFontSizeMultiplier={1.25}
                style={[
                  styles.segmentText,
                  tab === 'jobs' && styles.segmentTextActive,
                ]}>
                My Jobs
              </Text>
            </HapticPressable>

            <HapticPressable
              haptic="none"
              scaleTo={0.96}
              borderRadius={50}
              onPress={() => switchTab('gigs')}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === 'gigs' }}
              style={styles.segmentBtn}>
              <Text
                maxFontSizeMultiplier={1.25}
                style={[
                  styles.segmentText,
                  tab === 'gigs' && styles.segmentTextActive,
                ]}>
                My Gigs
              </Text>
            </HapticPressable>
          </View>
        </View>
      </PostJobHeader>

      {justPublishedId && tab === 'jobs' ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(220)}
          style={styles.publishedBanner}>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={JOBPOST_PALETTE.statusActive}
          />
          <Text style={styles.publishedBannerText}>
            Your job post is now live on AdBazaar.
          </Text>
          <HapticPressable
            haptic="light"
            borderRadius={999}
            onPress={onCreateNewJob}
            style={styles.newPostMiniBtn}>
            <Ionicons name="add" size={14} color="#FFFFFF" />
            <Text maxFontSizeMultiplier={1.2} style={styles.newPostMiniText}>
              Post New
            </Text>
          </HapticPressable>
        </Animated.View>
      ) : (
        <View style={styles.subActionBar}>
          <HapticPressable
            haptic="light"
            scaleTo={0.96}
            borderRadius={999}
            onPress={onCreateNewJob}
            style={styles.quickActionPill}>
            <Ionicons name="add-circle" size={16} color={JOBPOST_PALETTE.accent} />
            <Text maxFontSizeMultiplier={1.25} style={styles.quickActionText}>
              Post a New Job
            </Text>
          </HapticPressable>

          <HapticPressable
            haptic="light"
            scaleTo={0.96}
            borderRadius={999}
            onPress={onOpenTalentProfile}
            style={styles.quickActionPill}>
            <Ionicons name="person-circle-outline" size={16} color={JOBPOST_PALETTE.accent} />
            <Text maxFontSizeMultiplier={1.25} style={styles.quickActionText}>
              Talent Profile
            </Text>
          </HapticPressable>
        </View>
      )}
    </>
  );

  if (tab === 'gigs') {
    return (
      <View
        style={[
          styles.root,
          { backgroundColor: isDark ? theme.canvas : JOBPOST_PALETTE.lightCanvas },
        ]}>
        <FlatList
          data={gigs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={headerNode}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 96,
            gap: 12,
          }}
          renderItem={({ item, index }) => (
            <View style={styles.cardPad}>
              <Animated.View
                entering={
                  reduceMotion || index >= 4
                    ? undefined
                    : FadeInDown.duration(280).delay(index * 45)
                }>
                <HapticPressable
                  haptic="light"
                  scaleTo={0.985}
                  borderRadius={20}
                  onPress={onOpenTalentProfile}
                  style={styles.jobCard}>
                  <LinearGradient
                    colors={[theme.washPink, theme.surface, theme.washBlue]}
                    locations={[0, 0.48, 1]}
                    start={{ x: 0, y: 0.1 }}
                    end={{ x: 1, y: 0.9 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.cardTopSplit}>
                    <Text style={styles.jobTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.statusGlassBadge}>
                      <Text
                        maxFontSizeMultiplier={1.2}
                        style={[
                          styles.statusText,
                          { color: getStatusColor(item.status) },
                        ]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.gigSummary} numberOfLines={3}>
                    {item.summary}
                  </Text>
                  <View style={styles.gigMetaRow}>
                    <View style={styles.metaGlassPill}>
                      <Text maxFontSizeMultiplier={1.2} style={styles.metaLabel}>
                        Starts from:{' '}
                      </Text>
                      <Text maxFontSizeMultiplier={1.2} style={styles.metaValue}>
                        {item.startsFrom}
                      </Text>
                    </View>
                    <View style={styles.metaGlassPill}>
                      <Text maxFontSizeMultiplier={1.2} style={styles.metaLabel}>
                        Delivery time:{' '}
                      </Text>
                      <Text maxFontSizeMultiplier={1.2} style={styles.metaValue}>
                        {item.deliveryTime}
                      </Text>
                    </View>
                  </View>
                </HapticPressable>
              </Animated.View>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: isDark ? theme.canvas : JOBPOST_PALETTE.lightCanvas },
      ]}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={headerNode}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 96,
          gap: 12,
        }}
        renderItem={({ item, index }) => {
          const isTagGreen = item.category.toLowerCase().includes('pr');
          const statusColor = getStatusColor(item.status);
          const cardContent = (
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

              {/* Header: Avatar + Title/Company + Status Pill */}
              <View style={styles.cardTopSplit}>
                <HapticPressable
                  haptic="light"
                  borderRadius={12}
                  onPress={onOpenTalentProfile}
                  style={styles.cardIdentityRow}>
                  <LinearGradient
                    colors={item.avatarColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.squareAvatar}>
                    <Text maxFontSizeMultiplier={1.2} style={styles.avatarInitials}>
                      {item.initials}
                    </Text>
                  </LinearGradient>
                  <View style={styles.titleBlock}>
                    <Text style={styles.jobTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.companyName} numberOfLines={1}>
                      {item.company}
                    </Text>
                  </View>
                </HapticPressable>

                <View style={styles.statusGlassBadge}>
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={[styles.statusText, { color: statusColor }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Location */}
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color={JOBPOST_PALETTE.accent} />
                <Text style={styles.locationText}>{item.location}</Text>
              </View>

              {/* Footer Split: Category + Just now | Budget + Last day */}
              <View style={styles.footerSplitRow}>
                <View style={styles.footerLeft}>
                  <View
                    style={[
                      styles.categoryPill,
                      {
                        backgroundColor: isTagGreen
                          ? JOBPOST_PALETTE.tagGreenBg
                          : JOBPOST_PALETTE.tagCreativeBg,
                      },
                    ]}>
                    <Text
                      maxFontSizeMultiplier={1.25}
                      style={[
                        styles.categoryPillText,
                        {
                          color: isTagGreen
                            ? JOBPOST_PALETTE.tagGreenText
                            : JOBPOST_PALETTE.tagCreativeText,
                        },
                      ]}>
                      {item.category}
                    </Text>
                  </View>
                  <Text maxFontSizeMultiplier={1.2} style={styles.postedText}>
                    {item.postedLabel}
                  </Text>
                </View>

                <View style={styles.footerRightStack}>
                  <View style={styles.metaGlassPill}>
                    <Text maxFontSizeMultiplier={1.2} style={styles.metaLabel}>
                      Budget:{' '}
                    </Text>
                    <Text maxFontSizeMultiplier={1.2} style={styles.metaValue}>
                      {item.budget}
                    </Text>
                  </View>
                  <View style={styles.metaGlassPill}>
                    <Text maxFontSizeMultiplier={1.2} style={styles.metaLabel}>
                      Last day to apply:{' '}
                    </Text>
                    <Text maxFontSizeMultiplier={1.2} style={styles.metaValue}>
                      {item.validTillDate}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bottom 3-Button Action Row: Edit | Close | Renew */}
              <View style={styles.tripleActionRow}>
                <HapticPressable
                  haptic="light"
                  scaleTo={0.96}
                  borderRadius={10}
                  onPress={() => onEditJob(item)}
                  hitSlop={{ top: 6, bottom: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.title}`}
                  style={styles.outlineActionBtn}>
                  <Text maxFontSizeMultiplier={1.25} style={styles.outlineActionText}>
                    Edit
                  </Text>
                </HapticPressable>

                <HapticPressable
                  haptic="selection"
                  scaleTo={item.status === 'Closed' ? 1 : 0.96}
                  borderRadius={10}
                  disabled={item.status === 'Closed'}
                  onPress={() => onCloseJob(item.id)}
                  hitSlop={{ top: 6, bottom: 6 }}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: item.status === 'Closed' }}
                  accessibilityLabel={
                    item.status === 'Closed' ? `${item.title} Closed` : `Close ${item.title}`
                  }
                  style={[
                    styles.outlineActionBtn,
                    item.status === 'Closed' && styles.outlineActionBtnDisabled,
                  ]}>
                  <Text
                    maxFontSizeMultiplier={1.25}
                    style={[
                      styles.outlineActionText,
                      item.status === 'Closed' && styles.outlineActionTextMuted,
                    ]}>
                    {item.status === 'Closed' ? 'Closed' : 'Close'}
                  </Text>
                </HapticPressable>

                <HapticPressable
                  haptic="light"
                  scaleTo={0.96}
                  borderRadius={10}
                  onPress={() => onRenewJob(item.id)}
                  hitSlop={{ top: 6, bottom: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel={`Renew ${item.title}`}
                  style={styles.outlineActionBtn}>
                  <Text maxFontSizeMultiplier={1.25} style={styles.outlineActionText}>
                    Renew
                  </Text>
                </HapticPressable>
              </View>
            </View>
          );

          return (
            <View style={styles.cardPad}>
              {reduceMotion || index >= 4 ? (
                cardContent
              ) : (
                <Animated.View entering={FadeInDown.duration(280).delay(index * 45)}>
                  {cardContent}
                </Animated.View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

const createStyles = (t: AppTheme) => {
  const isDark = t.scheme === 'dark';
  const ink = isDark ? t.text : JOBPOST_PALETTE.ink;
  const muted = isDark ? t.textMuted : JOBPOST_PALETTE.muted;
  const glassCardFill = isDark ? t.surface : 'rgba(255, 255, 255, 0.85)';
  const glassBorder = isDark ? t.border : 'rgba(255, 255, 255, 0.92)';

  return StyleSheet.create({
    root: {
      flex: 1,
    },
    titleToggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    screenTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.6,
      includeFontPadding: false,
      color: ink,
    },
    segmentedTrack: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? t.surfaceAlt : 'rgba(255, 255, 255, 0.56)',
      borderWidth: 1,
      borderColor: glassBorder,
      borderRadius: 50,
      padding: 4,
      position: 'relative',
      ...Shadows.card,
    },
    segmentedActiveBg: {
      position: 'absolute',
      top: 4,
      bottom: 4,
      start: 4,
      borderRadius: 50,
      backgroundColor: JOBPOST_PALETTE.accent,
      ...Shadows.buttonGlow,
    },
    segmentBtn: {
      minWidth: 86,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentText: {
      fontSize: 13.5,
      color: ink,
      fontWeight: '400',
    },
    segmentTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    publishedBanner: {
      marginHorizontal: 16,
      marginTop: 4,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: isDark ? t.surface : 'rgba(255, 255, 255, 0.85)',
      borderWidth: 1,
      borderColor: 'rgba(14, 185, 46, 0.35)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      ...Shadows.card,
    },
    publishedBannerText: {
      flex: 1,
      fontSize: 12.5,
      fontWeight: '500',
      color: ink,
    },
    newPostMiniBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: JOBPOST_PALETTE.accent,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },
    newPostMiniText: {
      fontSize: 11.5,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    subActionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      gap: 10,
    },
    quickActionPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 36,
      borderRadius: 999,
      backgroundColor: isDark ? t.surface : 'rgba(255, 255, 255, 0.72)',
      borderWidth: 1,
      borderColor: glassBorder,
      ...Shadows.card,
    },
    quickActionText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: ink,
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
      gap: 14,
      overflow: 'hidden',
      ...Shadows.card,
    },
    cardTopSplit: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    cardIdentityRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    squareAvatar: {
      width: 46,
      height: 46,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 6,
      elevation: 3,
    },
    avatarInitials: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '800',
    },
    titleBlock: {
      flex: 1,
      gap: 3,
    },
    jobTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 20,
      lineHeight: 25,
      letterSpacing: -0.4,
      includeFontPadding: false,
      color: ink,
    },
    companyName: {
      fontSize: 12.5,
      color: isDark ? t.textSecondary : ink,
    },
    statusGlassBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor: isDark ? t.surfaceAlt : 'rgba(255, 255, 255, 0.75)',
      borderWidth: 1,
      borderColor: glassBorder,
      ...Shadows.card,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
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
    footerSplitRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 8,
    },
    footerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 1,
    },
    categoryPill: {
      borderRadius: 15,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    categoryPillText: {
      fontSize: 12,
      fontWeight: '500',
    },
    postedText: {
      fontSize: 10.5,
      color: muted,
    },
    footerRightStack: {
      alignItems: 'flex-end',
      gap: 5,
    },
    metaGlassPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor: isDark ? t.surfaceAlt : 'rgba(255, 255, 255, 0.60)',
      borderWidth: 1,
      borderColor: isDark ? t.border : 'rgba(255, 255, 255, 0.8)',
    },
    metaLabel: {
      fontSize: 10.5,
      color: muted,
    },
    metaValue: {
      fontSize: 10.5,
      fontWeight: '600',
      color: ink,
    },
    tripleActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
    outlineActionBtn: {
      flex: 1,
      height: 30,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: JOBPOST_PALETTE.accent,
      backgroundColor: isDark ? t.surfaceAlt : 'rgba(255, 255, 255, 0.72)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: JOBPOST_PALETTE.accent,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 6,
      elevation: 2,
    },
    outlineActionText: {
      fontSize: 12,
      fontWeight: '600',
      color: ink,
    },
    outlineActionBtnDisabled: {
      opacity: 0.45,
      borderColor: glassBorder,
    },
    outlineActionTextMuted: {
      color: muted,
    },
    gigSummary: {
      fontSize: 12.5,
      lineHeight: 18,
      color: isDark ? t.textSecondary : muted,
    },
    gigMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
  });
};
