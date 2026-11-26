import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenStatusBar } from '@/components/navigation/ScreenStatusBar';
import { SwipeBackContainer, SwipeBackHandle } from '@/components/navigation/SwipeBackContainer';
import { FLOATING_BAR_CLEARANCE } from '@/components/navigation/FloatingTabBarOverlay';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { DisplayFont } from '@/constants/fonts';
import { HomeTopBar } from '@/features/home/HomeTopBar';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';
import { JobListing } from './PopularJobs';

const ACCENT = '#EC2029';
const LIGHT_CANVAS = '#F9F2F2';
const LIGHT_WASH = '#F7CFD1';
const DARK_WASH = '#3A1418';
const APPLIED_GREEN = '#16A34A';

// Dummy copy until the jobs API provides structured responsibilities / requirements.
const DEFAULT_RESPONSIBILITIES = [
  'Write copy for websites, social media, ads, campaigns, emails, and marketing materials.',
  'Develop engaging headlines, taglines, captions, and long-form content.',
  'Research topics, audiences, and industry trends to create relevant content.',
  'Collaborate with designers, marketers, and other teams to bring campaigns to life.',
  'Edit and proofread content for clarity, grammar, tone, and consistency.',
  'Adapt messaging for different audiences and platforms.',
  'Maintain and follow brand voice and communication guidelines.',
];
const DEFAULT_REQUIREMENTS = [
  'Excellent command of English.',
  'Ability to write in different tones and formats.',
  'Strong research and attention to detail.',
  'A portfolio of relevant writing samples is preferred.',
];

interface JobDetailsScreenViewProps {
  job: JobListing;
  onBack: () => void;
  /** Screen revealed underneath while this page slides away (swipe / hardware back). */
  renderPreviousScreen?: () => React.ReactNode;
  onApply?: (job: JobListing) => void;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'AD';

const BulletList: React.FC<{ items: string[] }> = ({ items }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.bullets}>
      {items.map((line) => (
        <View key={line} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <Text style={styles.bodyText}>{line}</Text>
        </View>
      ))}
    </View>
  );
};

/** AdBazaar job page: header, role summary + Apply, about, responsibilities, requirements, poster. */
export const JobDetailsScreenView: React.FC<JobDetailsScreenViewProps> = ({
  job,
  onBack,
  renderPreviousScreen,
  onApply,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const swipeBackRef = useRef<SwipeBackHandle>(null);
  const applied = false;

  const isDark = theme.scheme === 'dark';
  const canvas = isDark ? theme.canvas : LIGHT_CANVAS;
  const company = job.postedBy?.name ?? job.subCategory ?? 'AdStreet';
  const tags = [job.category, job.duration].filter(Boolean) as string[];

  const handleHeaderBack = () => {
    if (swipeBackRef.current) {
      swipeBackRef.current.goBack();
    } else {
      onBack();
    }
  };

  const handleApply = () => {
    if (applied) return;
    Haptics.selectionAsync().catch(() => {});
    onApply?.(job); // opens the "Apply to this role" page
  };

  return (
    <SwipeBackContainer
      ref={swipeBackRef}
      onBack={onBack}
      backgroundColor={canvas}
      renderPrevious={renderPreviousScreen}
      previousMounted>
      <Animated.View
        entering={reduceMotion ? undefined : FadeInRight.duration(260)}
        style={[styles.root, { backgroundColor: canvas }]}>
        <ScreenStatusBar style={theme.statusBar} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + FLOATING_BAR_CLEARANCE }}>
          <LinearGradient
            colors={isDark ? [DARK_WASH, canvas] : [LIGHT_WASH, canvas]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
            {/* Same header row as Home */}
            <HomeTopBar tone="onLight" ink={isDark ? theme.text : '#3A3A3A'} onBack={handleHeaderBack} />

            <Image
              source={require('@/assets/images/adbazaar/adbazaar-logo.png')}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="AdBazaar"
            />

            {/* Role summary */}
            <View style={styles.roleRow}>
              <LinearGradient
                colors={['#F0545B', '#C92F35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.roleAvatar}>
                <Text style={styles.roleAvatarText}>{initialsOf(company)}</Text>
              </LinearGradient>
              <View style={styles.roleText}>
                <Text style={styles.roleTitle} numberOfLines={2} accessibilityRole="header">
                  {job.title}
                </Text>
                <Text style={styles.roleMeta} numberOfLines={1}>
                  {company}
                </Text>
              </View>
              <HapticPressable
                haptic={applied ? 'none' : 'medium'}
                scaleTo={0.94}
                borderRadius={10}
                disabled={applied}
                onPress={handleApply}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel={applied ? 'Application sent' : `Apply for ${job.title}`}
                style={[styles.applyBtn, applied && styles.applyBtnApplied]}>
                <Text style={styles.applyBtnText}>{applied ? 'Applied' : 'Apply'}</Text>
              </HapticPressable>
            </View>

            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(320).delay(60)}
            style={styles.body}>
            <View style={styles.aboutHeader}>
              <Text style={styles.sectionTitle}>About this role</Text>
              <View style={styles.budgetPill}>
                <Text style={styles.budgetLabel}>Budget: </Text>
                <Text style={styles.budgetValue}>{job.budget}</Text>
              </View>
            </View>
            <Text style={styles.bodyText}>
              {job.description ??
                'Professional services tailored to your brand goals, campaign timelines, and audience.'}
            </Text>

            <Text style={[styles.sectionTitle, styles.sectionGap]}>Responsibilities</Text>
            <BulletList items={DEFAULT_RESPONSIBILITIES} />

            <Text style={[styles.sectionTitle, styles.sectionGap]}>Requirements</Text>
            <BulletList items={DEFAULT_REQUIREMENTS} />

            {/* Poster */}
            <View style={styles.posterCard}>
              <Text style={styles.postedByLabel}>Posted by:</Text>
              <View style={styles.posterRow}>
                <LinearGradient
                  colors={['#2FC6A6', '#1B9E83']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.posterAvatar}>
                  <Text style={styles.posterAvatarText}>{initialsOf(job.postedBy?.name ?? 'AA')}</Text>
                </LinearGradient>
                <View style={styles.posterInfo}>
                  <Text style={styles.posterName} numberOfLines={1}>
                    {job.postedBy?.name ?? 'Abdullah Amir'}
                  </Text>
                  <Text style={styles.posterRole} numberOfLines={1}>
                    {job.postedBy?.role ?? company}
                  </Text>
                </View>
                <View style={styles.costPill}>
                  <Text style={styles.costLabel}>AdDemo Cost</Text>
                  <Image
                    source={require('@/assets/images/adstreet-coin.png')}
                    style={styles.costCoin}
                    contentFit="contain"
                  />
                  <Text style={styles.costValue}>18</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

      </Animated.View>
    </SwipeBackContainer>
  );
};

const createStyles = (t: AppTheme) => {
  const isDark = t.scheme === 'dark';
  const ink = isDark ? t.text : '#2A2A2E';
  const muted = isDark ? t.textMuted : '#6B6B73';
  return StyleSheet.create({
    root: { flex: 1 },
    header: { paddingHorizontal: 20, paddingBottom: 18 },
    logo: { width: 101, height: 24, marginTop: 6, marginBottom: 16, borderRadius: 4 },
    roleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    roleAvatar: {
      width: 54,
      height: 54,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    roleAvatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.4 },
    roleText: { flex: 1, gap: 2 },
    roleTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.5,
      includeFontPadding: false,
      color: ink,
    },
    roleMeta: { fontSize: 12.5, color: muted },
    applyBtn: {
      height: 32,
      paddingHorizontal: 18,
      borderRadius: 10,
      backgroundColor: ACCENT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    applyBtnApplied: { backgroundColor: APPLIED_GREEN },
    applyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 14,
      backgroundColor: isDark ? t.primaryTint : '#F9DCDD',
    },
    tagText: { fontSize: 12, fontWeight: '500', color: isDark ? t.text : '#C92F35' },
    body: { paddingHorizontal: 20, paddingTop: 6 },
    aboutHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 10,
    },
    sectionTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 21,
      lineHeight: 27,
      letterSpacing: -0.4,
      includeFontPadding: false,
      color: ink,
    },
    sectionGap: { marginTop: 22, marginBottom: 10 },
    budgetPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor: isDark ? t.surfaceAlt : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? t.border : '#F0E3E4',
    },
    budgetLabel: { fontSize: 11, color: muted },
    budgetValue: { fontSize: 11, fontWeight: '700', color: ink },
    bodyText: { flex: 1, fontSize: 14, lineHeight: 21, color: isDark ? t.textSecondary : '#4B4B53' },
    bullets: { gap: 9 },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    bulletDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      marginTop: 8,
      backgroundColor: ACCENT,
    },
    posterCard: {
      marginTop: 26,
      borderRadius: 18,
      padding: 14,
      gap: 10,
      backgroundColor: isDark ? t.surface : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? t.border : '#F0E3E4',
    },
    postedByLabel: { fontSize: 11.5, color: muted },
    posterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    posterAvatar: {
      width: 46,
      height: 46,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    posterAvatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    posterInfo: { flex: 1, gap: 2 },
    posterName: {
      fontFamily: DisplayFont.semibold,
      fontSize: 17,
      lineHeight: 22,
      includeFontPadding: false,
      color: ink,
    },
    posterRole: { fontSize: 12, color: muted },
    costPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: isDark ? t.surfaceAlt : '#FBF4F4',
    },
    costLabel: { fontSize: 10.5, color: muted },
    costCoin: { width: 16, height: 16 },
    costValue: { fontSize: 12, fontWeight: '700', color: ink },
  });
};
