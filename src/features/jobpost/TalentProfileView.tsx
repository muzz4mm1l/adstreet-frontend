import React, { useState } from 'react';
import {
  I18nManager,
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
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { DisplayFont } from '@/constants/fonts';
import { AnimationPresets, Shadows } from '@/constants/theme';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';
import { TALENT_PROFILE, TalentPortfolioItem } from './jobPostData';
import { JOBPOST_PALETTE, PostJobHeader } from './PostJobHeader';

type ProfileTab = 'about' | 'services' | 'portfolio' | 'reviews';
const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'reviews', label: 'Reviews' },
];

interface TalentProfileViewProps {
  onBack: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}

/** Talent / Creator Profile with About | Services | Portfolio | Reviews tabs (Figma 208:1117..1542). */
export const TalentProfileView: React.FC<TalentProfileViewProps> = ({
  onBack,
  onOpenSearch,
  onOpenNotifications,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const isDark = theme.scheme === 'dark';

  const [activeTab, setActiveTab] = useState<ProfileTab>('about');
  const [tabWidth, setTabWidth] = useState(86);
  const pillX = useSharedValue(0);

  const [hireSent, setHireSent] = useState(false);
  const [hireSheetOpen, setHireSheetOpen] = useState(false);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [previewPortfolio, setPreviewPortfolio] = useState<TalentPortfolioItem | null>(
    null,
  );

  const handleSelectTab = (tab: ProfileTab, idx: number) => {
    if (tab === activeTab) return;
    Haptics.selectionAsync().catch(() => {});
    setActiveTab(tab);
    const dir = I18nManager.isRTL ? -1 : 1;
    const target = idx * tabWidth * dir;
    pillX.value = reduceMotion ? target : withSpring(target, AnimationPresets.spring);
  };

  const slidingPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: tabWidth,
  }));

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: isDark ? theme.canvas : JOBPOST_PALETTE.lightCanvas },
      ]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}>
        {/* Header with Profile Identity + Hire Me & Chat */}
        <PostJobHeader
          onMenuOrBack={onBack}
          showBackInTopNav
          onOpenSearch={onOpenSearch}
          onOpenNotifications={onOpenNotifications}
          showAdBazaarBadge={false}>
          <View style={styles.profileRow}>
            <View style={styles.avatarFrame}>
              <Image
                source={TALENT_PROFILE.avatar}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {TALENT_PROFILE.name}
                </Text>
                <View style={styles.rankBadgeBox}>
                  <Image
                    source={TALENT_PROFILE.rankBadge}
                    style={styles.rankBadgeImg}
                    contentFit="contain"
                  />
                </View>
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color={JOBPOST_PALETTE.accent} />
                <Text style={styles.locationText}>{TALENT_PROFILE.location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileActionsRow}>
            <HapticPressable
              haptic="medium"
              scaleTo={0.97}
              borderRadius={10}
              onPress={() => setHireSheetOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={hireSent ? 'Hire inquiry sent' : 'Hire Me'}
              style={[styles.hireBtn, hireSent && styles.hireBtnSent]}>
              <Text maxFontSizeMultiplier={1.3} style={styles.hireBtnText}>
                {hireSent ? 'Hire Request Sent' : 'Hire Me'}
              </Text>
            </HapticPressable>

            <HapticPressable
              haptic="light"
              scaleTo={0.94}
              borderRadius={10}
              onPress={() => {
                setMessageSent(false);
                setChatSheetOpen(true);
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel="Message Abdullah Amir"
              style={styles.chatIconBtn}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={17}
                color={JOBPOST_PALETTE.accent}
              />
            </HapticPressable>
          </View>
        </PostJobHeader>

        {/* 4-Tab Segmented Bar: About | Services | Portfolio | Reviews */}
        <View style={styles.tabsContainer}>
          <View
            style={styles.tabsTrack}
            onLayout={(e) => {
              const inner = Math.max(e.nativeEvent.layout.width - 8, 240);
              setTabWidth(inner / PROFILE_TABS.length);
            }}>
            <Animated.View style={[styles.tabsActiveBg, slidingPillStyle]} />
            {PROFILE_TABS.map((t, idx) => {
              const active = activeTab === t.id;
              return (
                <HapticPressable
                  key={t.id}
                  haptic="none"
                  scaleTo={0.97}
                  borderRadius={10}
                  onPress={() => handleSelectTab(t.id, idx)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={styles.tabBtn}>
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={[styles.tabText, active && styles.tabTextActive]}>
                    {t.label}
                  </Text>
                </HapticPressable>
              );
            })}
          </View>
        </View>

        {/* Tab Panels */}
        {activeTab === 'about' ? (
          <Animated.View
            key="panel-about"
            entering={reduceMotion ? undefined : FadeIn.duration(200)}
            style={styles.panelWrap}>
            {TALENT_PROFILE.aboutParagraphs.map((para, idx) => (
              <Text key={idx} style={styles.aboutText}>
                {para}
              </Text>
            ))}
          </Animated.View>
        ) : null}

        {activeTab === 'services' ? (
          <View key="panel-services" style={styles.panelStack}>
            {TALENT_PROFILE.services.map((srv, idx) => (
              <Animated.View
                key={srv.id}
                entering={
                  reduceMotion || idx >= 4
                    ? undefined
                    : FadeInDown.duration(260).delay(idx * 45)
                }
                style={styles.pastelCard}>
                <LinearGradient
                  colors={[theme.washPink, theme.surface, theme.washBlue]}
                  locations={[0, 0.48, 1]}
                  start={{ x: 0, y: 0.1 }}
                  end={{ x: 1, y: 0.9 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.cardSerifTitle}>{srv.title}</Text>
                <Text style={styles.cardBodyText}>{srv.description}</Text>
                <View style={styles.chipsRow}>
                  <View style={styles.metaGlassPill}>
                    <Text maxFontSizeMultiplier={1.2} style={styles.metaLabel}>
                      Starts from:{' '}
                    </Text>
                    <Text maxFontSizeMultiplier={1.2} style={styles.metaValue}>
                      {srv.startsFrom}
                    </Text>
                  </View>
                  <View style={styles.metaGlassPill}>
                    <Text maxFontSizeMultiplier={1.2} style={styles.metaLabel}>
                      Delivery time:{' '}
                    </Text>
                    <Text maxFontSizeMultiplier={1.2} style={styles.metaValue}>
                      {srv.deliveryTime}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        ) : null}

        {activeTab === 'portfolio' ? (
          <View key="panel-portfolio" style={styles.portfolioGrid}>
            {TALENT_PROFILE.portfolio.map((item, idx) => (
              <Animated.View
                key={item.id}
                entering={
                  reduceMotion || idx >= 4
                    ? undefined
                    : FadeInDown.duration(260).delay(idx * 45)
                }
                style={styles.portfolioItemCol}>
                <HapticPressable
                  haptic="light"
                  scaleTo={0.97}
                  borderRadius={16}
                  onPress={() => setPreviewPortfolio(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`View portfolio project ${item.title}`}
                  style={styles.portfolioPressable}>
                  <View style={styles.portfolioThumbWrap}>
                    <Image
                      source={item.image}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                      transition={180}
                    />
                  </View>
                  <Text style={styles.portfolioTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </HapticPressable>
              </Animated.View>
            ))}
          </View>
        ) : null}

        {activeTab === 'reviews' ? (
          <View key="panel-reviews" style={styles.panelStack}>
            {TALENT_PROFILE.reviews.map((rev, idx) => (
              <Animated.View
                key={rev.id}
                entering={
                  reduceMotion || idx >= 4
                    ? undefined
                    : FadeInDown.duration(260).delay(idx * 45)
                }
                style={styles.pastelCard}>
                <LinearGradient
                  colors={[theme.washPink, theme.surface, theme.washBlue]}
                  locations={[0, 0.48, 1]}
                  start={{ x: 0, y: 0.1 }}
                  end={{ x: 1, y: 0.9 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.reviewTopRow}>
                  <Text style={styles.reviewAuthor}>{rev.author}</Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: rev.rating }).map((_, sIdx) => (
                      <Ionicons
                        key={sIdx}
                        name="star"
                        size={14}
                        color={JOBPOST_PALETTE.accent}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.cardBodyText}>{rev.quote}</Text>
              </Animated.View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* Hire Confirmation Sheet */}
      <BottomSheet visible={hireSheetOpen} onClose={() => setHireSheetOpen(false)}>
        <View style={[styles.sheetBody, { backgroundColor: theme.surface }]}>
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>Hire {TALENT_PROFILE.name}</Text>
            <TouchableOpacity
              onPress={() => setHireSheetOpen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sheetSub}>
            Send an invitation to collaborate on your active AdBazaar brief. They typically respond within a few hours.
          </Text>
          <HapticPressable
            haptic="none"
            borderRadius={14}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
                () => {},
              );
              setHireSent(true);
              setHireSheetOpen(false);
            }}
            style={styles.sheetPrimaryBtn}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sheetPrimaryText}>
              Send Hire Invitation
            </Text>
          </HapticPressable>
        </View>
      </BottomSheet>

      {/* Quick Message Sheet */}
      <BottomSheet visible={chatSheetOpen} onClose={() => setChatSheetOpen(false)}>
        <View style={[styles.sheetBody, { backgroundColor: theme.surface }]}>
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>Message {TALENT_PROFILE.name}</Text>
            <TouchableOpacity
              onPress={() => setChatSheetOpen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Share your timeline or project brief..."
            placeholderTextColor={theme.textMuted}
            multiline
            autoComplete="off"
            style={styles.sheetInput}
          />
          <HapticPressable
            haptic="none"
            borderRadius={14}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
                () => {},
              );
              setMessageSent(true);
              setMessageText('');
            }}
            style={[styles.sheetPrimaryBtn, messageSent && styles.hireBtnSent]}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sheetPrimaryText}>
              {messageSent ? 'Message Sent' : 'Send Message'}
            </Text>
          </HapticPressable>
        </View>
      </BottomSheet>

      {/* Portfolio Preview Sheet */}
      <BottomSheet
        visible={Boolean(previewPortfolio)}
        onClose={() => setPreviewPortfolio(null)}>
        {previewPortfolio ? (
          <View style={[styles.sheetBody, { backgroundColor: theme.surface }]}>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>{previewPortfolio.title}</Text>
              <TouchableOpacity
                onPress={() => setPreviewPortfolio(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Close preview">
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetPortfolioPreview}>
              <Image
                source={previewPortfolio.image}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            </View>
            <Text style={styles.sheetSub}>Category: {previewPortfolio.category}</Text>
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
};

const createStyles = (t: AppTheme) => {
  const isDark = t.scheme === 'dark';
  const ink = isDark ? t.text : JOBPOST_PALETTE.ink;
  const muted = isDark ? t.textMuted : JOBPOST_PALETTE.muted;
  const glassBorder = isDark ? t.border : 'rgba(255, 255, 255, 0.92)';

  return StyleSheet.create({
    root: {
      flex: 1,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 6,
      marginBottom: 16,
    },
    avatarFrame: {
      width: 65,
      height: 65,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: t.surfaceAlt,
      ...Shadows.card,
    },
    profileInfo: {
      flex: 1,
      gap: 8,
    },
    nameBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    profileName: {
      fontFamily: DisplayFont.semibold,
      fontSize: 20,
      lineHeight: 24,
      letterSpacing: -0.5,
      includeFontPadding: false,
      color: ink,
    },
    rankBadgeBox: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: isDark ? t.surfaceAlt : 'rgba(255, 255, 255, 0.72)',
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.card,
    },
    rankBadgeImg: {
      width: 17,
      height: 17,
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
    profileActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    hireBtn: {
      flex: 1,
      height: 37,
      borderRadius: 10,
      backgroundColor: JOBPOST_PALETTE.accent,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.buttonGlow,
    },
    hireBtnSent: {
      backgroundColor: JOBPOST_PALETTE.statusActive,
    },
    hireBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    chatIconBtn: {
      width: 37,
      height: 37,
      borderRadius: 10,
      backgroundColor: isDark ? t.surfaceAlt : 'rgba(255, 255, 255, 0.65)',
      borderWidth: 1,
      borderColor: glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.card,
    },
    tabsContainer: {
      paddingHorizontal: 16,
      marginTop: 12,
      marginBottom: 18,
    },
    tabsTrack: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? t.surface : 'rgba(255, 255, 255, 0.56)',
      borderWidth: 1,
      borderColor: glassBorder,
      borderRadius: 10,
      padding: 4,
      position: 'relative',
      ...Shadows.card,
    },
    tabsActiveBg: {
      position: 'absolute',
      top: 4,
      bottom: 4,
      start: 4,
      borderRadius: 10,
      backgroundColor: JOBPOST_PALETTE.accent,
      ...Shadows.buttonGlow,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabText: {
      fontSize: 13.5,
      color: ink,
      fontWeight: '400',
    },
    tabTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    panelWrap: {
      paddingHorizontal: 16,
      gap: 16,
    },
    aboutText: {
      fontSize: 14,
      lineHeight: 21,
      color: isDark ? t.textSecondary : muted,
    },
    panelStack: {
      paddingHorizontal: 16,
      gap: 12,
    },
    pastelCard: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: glassBorder,
      backgroundColor: isDark ? t.surface : '#FFFFFF',
      padding: 16,
      gap: 12,
      overflow: 'hidden',
      ...Shadows.card,
    },
    cardSerifTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: -0.4,
      includeFontPadding: false,
      color: ink,
    },
    cardBodyText: {
      fontSize: 12.5,
      lineHeight: 18,
      color: isDark ? t.textSecondary : muted,
    },
    chipsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metaGlassPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor: isDark ? t.surfaceAlt : 'rgba(255, 255, 255, 0.72)',
      borderWidth: 1,
      borderColor: glassBorder,
    },
    metaLabel: {
      fontSize: 10.5,
      color: muted,
    },
    metaValue: {
      fontSize: 11,
      fontWeight: '600',
      color: ink,
    },
    portfolioGrid: {
      paddingHorizontal: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 18,
    },
    portfolioItemCol: {
      width: '48.2%',
    },
    portfolioPressable: {
      gap: 10,
    },
    portfolioThumbWrap: {
      width: '100%',
      height: 124,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: t.surfaceAlt,
      ...Shadows.card,
    },
    portfolioTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 15.5,
      lineHeight: 20,
      letterSpacing: -0.3,
      includeFontPadding: false,
      color: ink,
    },
    reviewTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    reviewAuthor: {
      fontFamily: DisplayFont.semibold,
      fontSize: 16,
      lineHeight: 22,
      includeFontPadding: false,
      color: ink,
    },
    starsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
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
    sheetInput: {
      minHeight: 84,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surfaceAlt,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: t.text,
      textAlignVertical: 'top',
    },
    sheetPrimaryBtn: {
      height: 46,
      borderRadius: 14,
      backgroundColor: JOBPOST_PALETTE.accent,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.buttonGlow,
    },
    sheetPrimaryText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
    sheetPortfolioPreview: {
      width: '100%',
      height: 220,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: t.surfaceAlt,
    },
  });
};
