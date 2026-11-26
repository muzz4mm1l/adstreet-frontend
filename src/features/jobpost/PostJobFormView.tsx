import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { DisplayFont } from '@/constants/fonts';
import { Radii, Shadows } from '@/constants/theme';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';
import {
  JobPostDraft,
  POST_JOB_BUDGETS,
  POST_JOB_CATEGORIES,
  POST_JOB_DATES,
  POST_JOB_DURATIONS,
  POST_JOB_LOCATIONS,
} from './jobPostData';
import { JOBPOST_PALETTE, PostJobHeader } from './PostJobHeader';

type PickerField = 'category' | 'duration' | 'location' | 'budget' | 'validTillDate' | null;

interface PostJobFormViewProps {
  draft: JobPostDraft;
  isEditing?: boolean;
  onChangeDraft: (updater: (prev: JobPostDraft) => JobPostDraft) => void;
  onReviewJob: () => void;
  onBack: () => void;
  onOpenMyListings: () => void;
  onOpenMenu: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}

/** AdBazaar "Post a Job" screen (Figma 05 - AdBazaar - 04 / node 205:536). */
export const PostJobFormView: React.FC<PostJobFormViewProps> = ({
  draft,
  isEditing = false,
  onChangeDraft,
  onReviewJob,
  onBack,
  onOpenMyListings,
  onOpenMenu,
  onOpenSearch,
  onOpenNotifications,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const isDark = theme.scheme === 'dark';

  const [activePicker, setActivePicker] = useState<PickerField>(null);
  const [focusedField, setFocusedField] = useState<'title' | 'description' | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const shakeX = useSharedValue(0);

  const formShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerValidationError = (message: string) => {
    setValidationError(message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    if (!reduceMotion) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 55 }),
        withTiming(8, { duration: 55 }),
        withTiming(-5, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  };

  const handlePickPhoto = async () => {
    Haptics.selectionAsync().catch(() => {});
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        triggerValidationError('Allow photo library access to upload a job cover image.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!res.canceled && res.assets[0]?.uri) {
        onChangeDraft((prev) => ({ ...prev, photoUri: res.assets[0].uri }));
      }
    } catch {
      triggerValidationError('Unable to open photo picker on this device.');
    }
  };

  const handleReviewPress = () => {
    if (!draft.title.trim()) {
      triggerValidationError('Please enter a Job Title to continue.');
      return;
    }
    if (!draft.category.trim()) {
      triggerValidationError('Please select a Category.');
      return;
    }
    if (!draft.location.trim()) {
      triggerValidationError('Please select a Location.');
      return;
    }
    if (!draft.budget.trim()) {
      triggerValidationError('Please select an estimated Budget.');
      return;
    }
    if (!draft.validTillDate.trim()) {
      triggerValidationError('Please select a Valid Till Date.');
      return;
    }
    if (!draft.description.trim()) {
      triggerValidationError('Please add a short Job Description.');
      return;
    }
    setValidationError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onReviewJob();
  };

  const pickerConfig = (() => {
    switch (activePicker) {
      case 'category':
        return { title: 'Select Category', options: [...POST_JOB_CATEGORIES], key: 'category' as const };
      case 'duration':
        return { title: 'Select Duration', options: [...POST_JOB_DURATIONS], key: 'duration' as const };
      case 'location':
        return { title: 'Select Location', options: [...POST_JOB_LOCATIONS], key: 'location' as const };
      case 'budget':
        return { title: 'Select Budget Range', options: [...POST_JOB_BUDGETS], key: 'budget' as const };
      case 'validTillDate':
        return { title: 'Valid Till Date', options: [...POST_JOB_DATES], key: 'validTillDate' as const };
      default:
        return null;
    }
  })();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: isDark ? theme.canvas : JOBPOST_PALETTE.lightCanvas },
      ]}>
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}>
          <PostJobHeader
            onMenuOrBack={onOpenMenu}
            onOpenSearch={onOpenSearch}
            onOpenNotifications={onOpenNotifications}
            showAdBazaarBadge
            showBackChevronOnBadge
            onBackChevron={onBack}>
            <View style={styles.titleRow}>
              <Text style={styles.screenTitle} accessibilityRole="header">
                {isEditing ? 'Edit Job Post' : 'Post a Job'}
              </Text>
              <HapticPressable
                haptic="selection"
                scaleTo={0.96}
                borderRadius={Radii.pill}
                onPress={onOpenMyListings}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Open My Listings"
                style={styles.listingsLinkPill}>
                <Text maxFontSizeMultiplier={1.3} style={styles.listingsLinkText}>
                  My Listings
                </Text>
              </HapticPressable>
            </View>
          </PostJobHeader>

          <Animated.View style={[styles.formContainer, formShakeStyle]}>
            {/* Photo Thumbnail + Upload Camera Button */}
            <View style={styles.photoRow}>
              <View style={styles.photoPreviewBox}>
                <Image
                  source={
                    draft.photoUri
                      ? { uri: draft.photoUri }
                      : require('@/assets/images/jobpost/avatar-sample.jpg')
                  }
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              </View>
              <HapticPressable
                haptic="light"
                scaleTo={0.92}
                borderRadius={12}
                onPress={handlePickPhoto}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel="Upload job cover photo"
                style={styles.cameraBtn}>
                <Ionicons name="camera-outline" size={18} color={JOBPOST_PALETTE.accent} />
              </HapticPressable>
            </View>

            {/* Form Inputs Stack */}
            <View style={styles.fieldsStack}>
              {/* 1. Job Title * */}
              <View
                style={[
                  styles.pillField,
                  focusedField === 'title' && styles.pillFieldFocused,
                ]}>
                <TextInput
                  value={draft.title}
                  onChangeText={(text) => {
                    if (validationError) setValidationError(null);
                    onChangeDraft((prev) => ({ ...prev, title: text }));
                  }}
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Job Title *"
                  placeholderTextColor={isDark ? theme.textMuted : JOBPOST_PALETTE.placeholder}
                  returnKeyType="next"
                  autoComplete="off"
                  style={styles.textInput}
                  accessibilityLabel="Job Title"
                />
              </View>

              {/* 2. Category * */}
              <HapticPressable
                haptic="selection"
                scaleTo={0.99}
                borderRadius={50}
                onPress={() => setActivePicker('category')}
                accessibilityRole="button"
                accessibilityLabel="Select Category"
                style={styles.pillField}>
                <Text
                  style={[styles.pickerText, !draft.category && styles.placeholderText]}
                  numberOfLines={1}>
                  {draft.category || 'Category *'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={15}
                  color={isDark ? theme.textMuted : JOBPOST_PALETTE.ink}
                />
              </HapticPressable>

              {/* 3. Duration */}
              <HapticPressable
                haptic="selection"
                scaleTo={0.99}
                borderRadius={50}
                onPress={() => setActivePicker('duration')}
                accessibilityRole="button"
                accessibilityLabel="Select Duration"
                style={styles.pillField}>
                <Text
                  style={[styles.pickerText, !draft.duration && styles.placeholderText]}
                  numberOfLines={1}>
                  {draft.duration || 'Duration'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={15}
                  color={isDark ? theme.textMuted : JOBPOST_PALETTE.ink}
                />
              </HapticPressable>

              {/* 4. Location * */}
              <HapticPressable
                haptic="selection"
                scaleTo={0.99}
                borderRadius={50}
                onPress={() => setActivePicker('location')}
                accessibilityRole="button"
                accessibilityLabel="Select Location"
                style={styles.pillField}>
                <Text
                  style={[styles.pickerText, !draft.location && styles.placeholderText]}
                  numberOfLines={1}>
                  {draft.location || 'Location *'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={15}
                  color={isDark ? theme.textMuted : JOBPOST_PALETTE.ink}
                />
              </HapticPressable>

              {/* 5. Budget * */}
              <HapticPressable
                haptic="selection"
                scaleTo={0.99}
                borderRadius={50}
                onPress={() => setActivePicker('budget')}
                accessibilityRole="button"
                accessibilityLabel="Select Budget"
                style={styles.pillField}>
                <Text
                  style={[styles.pickerText, !draft.budget && styles.placeholderText]}
                  numberOfLines={1}>
                  {draft.budget || 'Budget *'}
                </Text>
                <Ionicons
                  name="swap-vertical-outline"
                  size={16}
                  color={isDark ? theme.textMuted : JOBPOST_PALETTE.ink}
                />
              </HapticPressable>

              {/* 6. Valid Till Date * */}
              <HapticPressable
                haptic="selection"
                scaleTo={0.99}
                borderRadius={50}
                onPress={() => setActivePicker('validTillDate')}
                accessibilityRole="button"
                accessibilityLabel="Select Valid Till Date"
                style={styles.pillField}>
                <Text
                  style={[styles.pickerText, !draft.validTillDate && styles.placeholderText]}
                  numberOfLines={1}>
                  {draft.validTillDate || 'Valid Till Date *'}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color={JOBPOST_PALETTE.accent}
                />
              </HapticPressable>

              {/* 7. Description * */}
              <View
                style={[
                  styles.multilineField,
                  focusedField === 'description' && styles.pillFieldFocused,
                ]}>
                <TextInput
                  value={draft.description}
                  onChangeText={(text) => {
                    if (validationError) setValidationError(null);
                    onChangeDraft((prev) => ({ ...prev, description: text }));
                  }}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Description *"
                  placeholderTextColor={isDark ? theme.textMuted : JOBPOST_PALETTE.placeholder}
                  multiline
                  textAlignVertical="top"
                  style={styles.multilineInput}
                  accessibilityLabel="Job Description"
                />
              </View>
            </View>

            {/* Validation Banner */}
            {validationError ? (
              <Animated.View
                entering={reduceMotion ? undefined : FadeInDown.duration(180)}
                style={styles.errorRow}>
                <Ionicons name="alert-circle" size={16} color={JOBPOST_PALETTE.accent} />
                <Text style={styles.errorText}>{validationError}</Text>
              </Animated.View>
            ) : null}

            {/* Primary CTA: Review Job */}
            <HapticPressable
              haptic="none"
              scaleTo={0.97}
              borderRadius={16}
              onPress={handleReviewPress}
              accessibilityRole="button"
              accessibilityLabel="Review Job"
              style={styles.reviewBtn}>
              <Text maxFontSizeMultiplier={1.3} style={styles.reviewBtnText}>
                Review Job
              </Text>
            </HapticPressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Selector Bottom Sheet */}
      <BottomSheet
        visible={Boolean(pickerConfig)}
        onClose={() => setActivePicker(null)}>
        {pickerConfig ? (
          <View style={[styles.sheetBody, { backgroundColor: theme.surface }]}>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>{pickerConfig.title}</Text>
              <TouchableOpacity
                onPress={() => setActivePicker(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Close picker">
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetOptionsList}>
              {pickerConfig.options.map((opt) => {
                const selected = draft[pickerConfig.key] === opt;
                return (
                  <HapticPressable
                    key={opt}
                    haptic="selection"
                    borderRadius={14}
                    onPress={() => {
                      if (validationError) setValidationError(null);
                      onChangeDraft((prev) => ({
                        ...prev,
                        [pickerConfig.key]: opt,
                      }));
                      setActivePicker(null);
                    }}
                    style={[
                      styles.sheetOptionRow,
                      selected && styles.sheetOptionRowSelected,
                    ]}>
                    <Text
                      style={[
                        styles.sheetOptionText,
                        selected && styles.sheetOptionTextSelected,
                      ]}>
                      {opt}
                    </Text>
                    {selected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={JOBPOST_PALETTE.accent}
                      />
                    ) : null}
                  </HapticPressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
};

const createStyles = (t: AppTheme) => {
  const isDark = t.scheme === 'dark';
  const ink = isDark ? t.text : JOBPOST_PALETTE.ink;
  const fieldBg = isDark ? t.surface : 'rgba(255, 255, 255, 0.56)';
  const fieldBorder = isDark ? t.border : JOBPOST_PALETTE.inputBorder;

  return StyleSheet.create({
    root: {
      flex: 1,
    },
    flexOne: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    screenTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.6,
      includeFontPadding: false,
      color: ink,
    },
    listingsLinkPill: {
      paddingHorizontal: 13,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: isDark ? t.surfaceAlt : 'rgba(255, 255, 255, 0.72)',
      borderWidth: 1,
      borderColor: isDark ? t.border : 'rgba(255, 255, 255, 0.9)',
      ...Shadows.card,
    },
    listingsLinkText: {
      fontSize: 12,
      fontWeight: '600',
      color: JOBPOST_PALETTE.accent,
    },
    formContainer: {
      paddingHorizontal: 16,
      paddingTop: 6,
      gap: 20,
    },
    photoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    photoPreviewBox: {
      width: 100,
      height: 100,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: t.surfaceAlt,
      borderWidth: 1,
      borderColor: isDark ? t.border : 'rgba(255, 255, 255, 0.9)',
      ...Shadows.card,
    },
    cameraBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: fieldBg,
      borderWidth: 1,
      borderColor: fieldBorder,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.card,
    },
    fieldsStack: {
      gap: 10,
    },
    pillField: {
      height: 50,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: fieldBorder,
      backgroundColor: fieldBg,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    pillFieldFocused: {
      borderColor: JOBPOST_PALETTE.accent,
    },
    textInput: {
      flex: 1,
      fontSize: 15.5,
      color: ink,
      paddingVertical: 0,
    },
    pickerText: {
      flex: 1,
      fontSize: 15.5,
      color: ink,
    },
    placeholderText: {
      color: isDark ? t.textMuted : JOBPOST_PALETTE.placeholder,
    },
    multilineField: {
      minHeight: 92,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: fieldBorder,
      backgroundColor: fieldBg,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    multilineInput: {
      minHeight: 64,
      fontSize: 15.5,
      color: ink,
      paddingVertical: 0,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 4,
    },
    errorText: {
      fontSize: 13,
      color: JOBPOST_PALETTE.accent,
      fontWeight: '500',
      flex: 1,
    },
    reviewBtn: {
      height: 56,
      borderRadius: 16,
      backgroundColor: JOBPOST_PALETTE.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      shadowColor: JOBPOST_PALETTE.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    reviewBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
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
    },
    sheetTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 19,
      color: t.text,
    },
    sheetOptionsList: {
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
      borderColor: JOBPOST_PALETTE.accent,
    },
    sheetOptionText: {
      fontSize: 14.5,
      color: t.text,
    },
    sheetOptionTextSelected: {
      color: JOBPOST_PALETTE.accent,
      fontWeight: '600',
    },
  });
};
