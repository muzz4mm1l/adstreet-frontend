import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { DisplayFont } from '@/constants/fonts';
import { Shadows } from '@/constants/theme';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';
import { JobPostDraft, makeCompanyInitials } from './jobPostData';
import { JOBPOST_PALETTE, PostJobHeader } from './PostJobHeader';

interface JobPreviewViewProps {
  draft: JobPostDraft;
  onEdit: () => void;
  onPublish: () => void;
  onOpenMenu: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}

/** AdBazaar "Job Preview" screen (Figma 05 - AdBazaar - 05 / node 205:688). */
export const JobPreviewView: React.FC<JobPreviewViewProps> = ({
  draft,
  onEdit,
  onPublish,
  onOpenMenu,
  onOpenSearch,
  onOpenNotifications,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const isDark = theme.scheme === 'dark';

  const initials = makeCompanyInitials(draft.company || 'Grey Advertising');

  const handlePublish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onPublish();
  };

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: isDark ? theme.canvas : JOBPOST_PALETTE.lightCanvas },
      ]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}>
        <PostJobHeader
          onMenuOrBack={onOpenMenu}
          onOpenSearch={onOpenSearch}
          onOpenNotifications={onOpenNotifications}
          showAdBazaarBadge
          showBackChevronOnBadge
          onBackChevron={onEdit}>
          <Text style={styles.screenTitle} accessibilityRole="header">
            Job Preview
          </Text>
        </PostJobHeader>

        <View style={styles.contentWrap}>
          {/* Signature Pastel Wash Preview Card */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(300)}
            style={styles.previewCard}>
            <LinearGradient
              colors={[theme.washPink, theme.surface, theme.washBlue]}
              locations={[0, 0.48, 1]}
              start={{ x: 0, y: 0.1 }}
              end={{ x: 1, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Header: Avatar + Job Title + Company */}
            <View style={styles.cardHeaderRow}>
              <LinearGradient
                colors={['#D34E53', '#E4898C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.squareAvatar}>
                <Text maxFontSizeMultiplier={1.2} style={styles.avatarInitials}>
                  {initials}
                </Text>
              </LinearGradient>
              <View style={styles.titleBlock}>
                <Text style={styles.jobTitle} numberOfLines={2}>
                  {draft.title || 'Copywriter'}
                </Text>
                <Text style={styles.companyName} numberOfLines={1}>
                  {draft.company || 'Grey Advertising'}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location" size={12} color={JOBPOST_PALETTE.accent} />
              <Text style={styles.locationText}>{draft.location || 'Karachi'}</Text>
            </View>

            {/* Optional Description Snippet */}
            {draft.description.trim() ? (
              <Text style={styles.descriptionText} numberOfLines={3}>
                {draft.description.trim()}
              </Text>
            ) : null}

            {/* Footer Split: Tag + Timestamp left, Budget + Last Day right */}
            <View style={styles.footerSplitRow}>
              <View style={styles.footerLeft}>
                <View style={styles.categoryPill}>
                  <Text maxFontSizeMultiplier={1.25} style={styles.categoryPillText}>
                    {draft.category || 'Creative'}
                  </Text>
                </View>
                <Text maxFontSizeMultiplier={1.25} style={styles.postedText}>
                  Just now
                </Text>
              </View>

              <View style={styles.footerRightStack}>
                <View style={styles.metaGlassPill}>
                  <Text maxFontSizeMultiplier={1.2} style={styles.metaLabel}>
                    Budget:{' '}
                  </Text>
                  <Text maxFontSizeMultiplier={1.2} style={styles.metaValue}>
                    {draft.budget || '70k-80k'}
                  </Text>
                </View>
                <View style={styles.metaGlassPill}>
                  <Text maxFontSizeMultiplier={1.2} style={styles.metaLabel}>
                    Last day to apply:{' '}
                  </Text>
                  <Text maxFontSizeMultiplier={1.2} style={styles.metaValue}>
                    {draft.validTillDate || '26-Sep-2026'}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Dual Action Buttons: Edit / Publish */}
          <View style={styles.actionsRow}>
            <HapticPressable
              haptic="light"
              scaleTo={0.97}
              borderRadius={16}
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit job details"
              style={styles.editBtn}>
              <Text maxFontSizeMultiplier={1.3} style={styles.editBtnText}>
                Edit
              </Text>
            </HapticPressable>

            <HapticPressable
              haptic="none"
              scaleTo={0.97}
              borderRadius={16}
              onPress={handlePublish}
              accessibilityRole="button"
              accessibilityLabel="Publish job post"
              style={styles.publishBtn}>
              <Text maxFontSizeMultiplier={1.3} style={styles.publishBtnText}>
                Publish
              </Text>
            </HapticPressable>
          </View>
        </View>
      </ScrollView>
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
    screenTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.6,
      includeFontPadding: false,
      color: ink,
    },
    contentWrap: {
      paddingHorizontal: 16,
      paddingTop: 6,
      gap: 24,
    },
    previewCard: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: glassBorder,
      backgroundColor: isDark ? t.surface : '#FFFFFF',
      padding: 16,
      gap: 14,
      overflow: 'hidden',
      ...Shadows.card,
    },
    cardHeaderRow: {
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
      shadowColor: JOBPOST_PALETTE.tagCreativeText,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
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
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    locationText: {
      fontSize: 12,
      color: muted,
    },
    descriptionText: {
      fontSize: 13,
      lineHeight: 19,
      color: isDark ? t.textSecondary : muted,
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
      backgroundColor: JOBPOST_PALETTE.tagCreativeBg,
      borderRadius: 15,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    categoryPillText: {
      fontSize: 12,
      color: JOBPOST_PALETTE.tagCreativeText,
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
      backgroundColor: isDark ? t.surfaceAlt : 'rgba(255, 255, 255, 0.58)',
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
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    editBtn: {
      flex: 1,
      height: 56,
      borderRadius: 16,
      borderWidth: 1.2,
      borderColor: JOBPOST_PALETTE.accent,
      backgroundColor: isDark ? t.surface : '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: JOBPOST_PALETTE.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.22,
      shadowRadius: 8,
      elevation: 4,
    },
    editBtnText: {
      fontSize: 16,
      fontWeight: '600',
      color: ink,
    },
    publishBtn: {
      flex: 1,
      height: 56,
      borderRadius: 16,
      backgroundColor: JOBPOST_PALETTE.accent,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: JOBPOST_PALETTE.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    publishBtnText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
};
