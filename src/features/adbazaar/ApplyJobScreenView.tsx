import React, { useRef, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, FadeInRight, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenStatusBar } from '@/components/navigation/ScreenStatusBar';
import { SwipeBackContainer, SwipeBackHandle } from '@/components/navigation/SwipeBackContainer';
import { FLOATING_BAR_CLEARANCE } from '@/components/navigation/FloatingTabBarOverlay';
import { CenterModal } from '@/components/ui/CenterModal';
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
const ADCOIN_COST = 16;

const RATE_OPTIONS = ['PKR 50,000 – 60,000', 'PKR 60,000 – 70,000', 'PKR 70,000 – 80,000', 'PKR 80,000 +'];
const RATING_TAGS = ['Great communication', 'On time', 'Fair budget', 'Clear brief', 'Would work again'];

interface Props {
  job: JobListing;
  onBack: () => void;
  renderPreviousScreen?: () => React.ReactNode;
  onSubmitted?: (job: JobListing) => void;
}

/** "26-September-2026" -> "26-Sep-2026". */
const shortDate = (d: string) => d.replace(/-([A-Za-z]{3})[A-Za-z]*-/, '-$1-');

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'AD';

/** A tappable field that expands an inline list of options (used for rate and rating tags). */
const SelectField: React.FC<{
  placeholder: string;
  value: string | null;
  options: string[];
  onChange: (v: string) => void;
}> = ({ placeholder, value, options, onChange }) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <HapticPressable
        haptic="selection"
        scaleTo={0.99}
        borderRadius={16}
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
        accessibilityState={{ expanded: open }}
        style={styles.field}>
        <Text style={[styles.fieldText, !value && styles.fieldPlaceholder]} numberOfLines={1}>
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-expand" size={17} color={theme.text} />
      </HapticPressable>
      {open ? (
        <Animated.View entering={FadeInDown.duration(160)} style={styles.optionList}>
          {options.map((opt) => (
            <HapticPressable
              key={opt}
              haptic="selection"
              borderRadius={10}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={styles.optionRow}>
              <Text style={[styles.optionText, opt === value && styles.optionTextActive]}>{opt}</Text>
              {opt === value ? <Ionicons name="checkmark" size={16} color={ACCENT} /> : null}
            </HapticPressable>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
};

/** "Apply to this role": proposal, rate, attachment, AdCoin cost, plus rating and dispute dialogs. */
export const ApplyJobScreenView: React.FC<Props> = ({
  job,
  onBack,
  renderPreviousScreen,
  onSubmitted,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const swipeBackRef = useRef<SwipeBackHandle>(null);

  const [proposal, setProposal] = useState('');
  const [rate, setRate] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [ratingOpen, setRatingOpen] = useState(false);
  const [stars, setStars] = useState(2);
  const [ratingPhotos, setRatingPhotos] = useState<string[]>([]);
  const [ratingTag, setRatingTag] = useState<string | null>(null);
  const [ratingText, setRatingText] = useState('');

  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  const isDark = theme.scheme === 'dark';
  const canvas = isDark ? theme.canvas : LIGHT_CANVAS;
  const company = job.postedBy?.name ?? job.subCategory ?? 'AdStreet';

  const handleHeaderBack = () => {
    if (swipeBackRef.current) swipeBackRef.current.goBack();
    else onBack();
  };

  const pickImage = async (): Promise<string | null> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.8 });
      if (!result.canceled && result.assets[0]) return result.assets[0].uri;
    } catch {
      /* permission denied or picker unavailable */
    }
    return null;
  };

  const canSubmit = proposal.trim().length > 0 && rate !== null;
  const submit = () => {
    if (!canSubmit || submitted) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSubmitted(true);
    onSubmitted?.(job);
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

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + FLOATING_BAR_CLEARANCE + 12 }}>
            <LinearGradient
              colors={isDark ? [DARK_WASH, canvas] : [LIGHT_WASH, canvas]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
              <HomeTopBar tone="onLight" ink={isDark ? theme.text : '#3A3A3A'} onBack={handleHeaderBack} />
              <Image
                source={require('@/assets/images/adbazaar/adbazaar-logo.png')}
                style={styles.logo}
                contentFit="contain"
                accessibilityLabel="AdBazaar"
              />

              {/* Role summary card */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                  <LinearGradient
                    colors={['#F0545B', '#C92F35']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.summaryAvatar}>
                    <Text style={styles.summaryAvatarText}>{initialsOf(company)}</Text>
                  </LinearGradient>
                  <View style={styles.flex}>
                    <Text style={styles.summaryTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={styles.summaryCompany} numberOfLines={1}>
                      {company}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={11} color={ACCENT} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {job.location ?? 'Remote'}
                    </Text>
                  </View>
                  <View style={styles.factPill}>
                    <Text style={styles.factLabel}>Budget: </Text>
                    <Text style={styles.factValue}>{job.budgetShort ?? job.budget}</Text>
                  </View>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.summaryTags}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{job.category}</Text>
                    </View>
                    <Text style={styles.postedText}>{job.postedAt === 'Today' || !job.postedAt ? 'Just now' : job.postedAt}</Text>
                  </View>
                  <View style={styles.factPill}>
                    <Text style={styles.factLabel}>Last day to apply: </Text>
                    <Text style={styles.factValue}>{shortDate(job.validTillFull ?? job.validTill)}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            <Animated.View
              entering={reduceMotion ? undefined : FadeInDown.duration(320).delay(60)}
              style={styles.form}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Apply to this role
              </Text>
              <TextInput
                value={proposal}
                onChangeText={setProposal}
                placeholder="Proposal Message"
                placeholderTextColor={theme.textMuted}
                multiline
                textAlignVertical="top"
                autoCorrect={false}
                underlineColorAndroid="transparent"
                selectionColor={ACCENT}
                cursorColor={ACCENT}
                editable={!submitted}
                style={styles.textArea}
                accessibilityLabel="Proposal message"
              />
              <SelectField placeholder="Proposed Rate *" value={rate} options={RATE_OPTIONS} onChange={setRate} />

              <Text style={[styles.sectionTitle, styles.sectionGap]}>Attachment Upload</Text>
              <View style={styles.field}>
                <Text style={[styles.fieldText, !attachment && styles.fieldPlaceholder]} numberOfLines={1}>
                  {attachment ? attachment.split('/').pop() : 'No attachment uploaded yet'}
                </Text>
                <HapticPressable
                  haptic="light"
                  scaleTo={0.95}
                  borderRadius={14}
                  onPress={async () => {
                    const uri = await pickImage();
                    if (uri) setAttachment(uri);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Browse attachment"
                  style={styles.browseBtn}>
                  <Text style={styles.browseText}>Browse</Text>
                </HapticPressable>
              </View>

              <Text style={[styles.sectionTitle, styles.sectionGap]}>AdCoin Cost</Text>
              <View style={styles.costPill}>
                <Text style={styles.factLabel}>AdCoins Cost:</Text>
                <Image
                  source={require('@/assets/images/adstreet-coin.png')}
                  style={styles.coin}
                  contentFit="contain"
                />
                <Text style={styles.factValue}>{ADCOIN_COST}</Text>
              </View>

              <HapticPressable
                haptic="medium"
                scaleTo={0.98}
                borderRadius={14}
                disabled={!canSubmit || submitted}
                onPress={submit}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSubmit || submitted }}
                accessibilityLabel="Submit application"
                style={[styles.submitBtn, (!canSubmit || submitted) && styles.submitBtnOff, submitted && styles.submitBtnDone]}>
                <Text style={styles.submitText}>{submitted ? 'Application Sent' : 'Submit Application'}</Text>
              </HapticPressable>

              {submitted ? (
                <View style={styles.afterRow}>
                  <HapticPressable
                    haptic="selection"
                    borderRadius={12}
                    onPress={() => setRatingOpen(true)}
                    accessibilityRole="button"
                    style={styles.linkBtn}>
                    <Ionicons name="star-outline" size={15} color={ACCENT} />
                    <Text style={styles.linkText}>Rate this job</Text>
                  </HapticPressable>
                  <HapticPressable
                    haptic="selection"
                    borderRadius={12}
                    onPress={() => setDisputeOpen(true)}
                    accessibilityRole="button"
                    style={styles.linkBtn}>
                    <Ionicons name="shield-checkmark-outline" size={15} color={ACCENT} />
                    <Text style={styles.linkText}>Job dispute</Text>
                  </HapticPressable>
                </View>
              ) : null}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>


        {/* Ratings dialog */}
        <CenterModal visible={ratingOpen} onClose={() => setRatingOpen(false)}>
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>Ratings to this job</Text>
            <TouchableOpacity
              onPress={() => setRatingOpen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.starsRow} accessibilityRole="adjustable" accessibilityLabel={`${stars} of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setStars(n);
                }}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                accessibilityRole="button"
                accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}>
                <Ionicons name={n <= stars ? 'star' : 'star-outline'} size={34} color={ACCENT} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.photoRow}>
            {ratingPhotos.map((uri) => (
              <View key={uri} style={styles.photoWrap}>
                <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                <TouchableOpacity
                  onPress={() => setRatingPhotos((p) => p.filter((u) => u !== uri))}
                  style={styles.photoRemove}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo">
                  <Ionicons name="close" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.flex} />
            <HapticPressable
              haptic="light"
              scaleTo={0.94}
              borderRadius={20}
              onPress={async () => {
                const uri = await pickImage();
                if (uri) setRatingPhotos((p) => [...p, uri].slice(0, 3));
              }}
              accessibilityRole="button"
              accessibilityLabel="Add photo"
              style={styles.cameraBtn}>
              <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
            </HapticPressable>
          </View>
          <SelectField placeholder="Select Tags" value={ratingTag} options={RATING_TAGS} onChange={setRatingTag} />
          <TextInput
            value={ratingText}
            onChangeText={setRatingText}
            placeholder="Description *"
            placeholderTextColor={theme.textMuted}
            multiline
            textAlignVertical="top"
            underlineColorAndroid="transparent"
            selectionColor={ACCENT}
            cursorColor={ACCENT}
            style={[styles.textArea, styles.ratingText]}
            accessibilityLabel="Rating description"
          />
          <HapticPressable
            haptic="medium"
            borderRadius={14}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              setRatingOpen(false);
            }}
            accessibilityRole="button"
            accessibilityLabel="Submit rating"
            style={styles.submitBtn}>
            <Text style={styles.submitText}>Submit</Text>
          </HapticPressable>
        </CenterModal>

        {/* Dispute dialog */}
        <CenterModal visible={disputeOpen} onClose={() => setDisputeOpen(false)}>
          <View style={styles.dialogHeader}>
            <Text style={[styles.dialogTitle, styles.centered]}>Job Dispute</Text>
            <TouchableOpacity
              onPress={() => setDisputeOpen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.disputeCard}>
            <LinearGradient colors={['#F0545B', '#B3161D']} style={styles.shield}>
              <Ionicons name="shield-checkmark" size={46} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.disputeLabel}>Dispute Status</Text>
            <View style={[styles.statusPill, !disputeSubmitted && styles.statusPillIdle]}>
              <Text style={[styles.statusText, !disputeSubmitted && styles.statusTextIdle]}>
                {disputeSubmitted ? 'Submitted' : 'Not raised'}
              </Text>
            </View>
          </View>
          {!disputeSubmitted ? (
            <HapticPressable
              haptic="medium"
              borderRadius={14}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                setDisputeSubmitted(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Raise dispute"
              style={styles.submitBtn}>
              <Text style={styles.submitText}>Raise Dispute</Text>
            </HapticPressable>
          ) : null}
        </CenterModal>
      </Animated.View>
    </SwipeBackContainer>
  );
};

const createStyles = (t: AppTheme) => {
  const isDark = t.scheme === 'dark';
  const ink = isDark ? t.text : '#2A2A2E';
  const muted = isDark ? t.textMuted : '#6B6B73';
  const cardFill = isDark ? t.surface : '#FDF6F6';
  const line = isDark ? t.border : '#F3E4E5';
  return StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1 },
    header: { paddingHorizontal: 20, paddingBottom: 12 },
    logo: { width: 101, height: 24, marginTop: 6, marginBottom: 14, borderRadius: 4 },
    summaryCard: {
      borderRadius: 22,
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 10,
      backgroundColor: isDark ? t.surface : '#FCEFEF',
      borderWidth: 1,
      borderColor: isDark ? t.border : '#FFFFFF',
    },
    summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    summaryAvatar: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    summaryAvatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
    summaryTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 20,
      lineHeight: 25,
      letterSpacing: -0.3,
      includeFontPadding: false,
      color: ink,
    },
    summaryCompany: { fontSize: 11.5, fontWeight: '500', color: ink },
    summaryMeta: { fontSize: 12, color: muted },
    summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    summaryTags: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
    locationText: { fontSize: 11.5, color: muted },
    postedText: { fontSize: 10.5, color: muted },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 14,
      backgroundColor: isDark ? t.primaryTint : '#F9DCDD',
    },
    tagText: { fontSize: 12, fontWeight: '500', color: isDark ? t.text : '#C92F35' },
    factPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: isDark ? t.surfaceAlt : '#F8E6E6',
    },
    factLabel: { fontSize: 10.5, color: muted },
    factValue: { fontSize: 10.5, fontWeight: '700', color: ink },
    form: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
    sectionTitle: {
      fontFamily: DisplayFont.semibold,
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: -0.3,
      includeFontPadding: false,
      color: ink,
    },
    sectionGap: { marginTop: 8 },
    textArea: {
      minHeight: 108,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 14,
      fontSize: 15,
      color: ink,
      backgroundColor: cardFill,
      borderWidth: 1,
      borderColor: line,
    },
    ratingText: { minHeight: 88 },
    field: {
      minHeight: 48,
      borderRadius: 24,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      backgroundColor: cardFill,
      borderWidth: 1,
      borderColor: line,
    },
    fieldText: { flex: 1, fontSize: 15, color: ink },
    fieldPlaceholder: { color: muted },
    optionList: {
      marginTop: 6,
      borderRadius: 16,
      padding: 6,
      backgroundColor: cardFill,
      borderWidth: 1,
      borderColor: line,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 11,
    },
    optionText: { fontSize: 14, color: ink },
    optionTextActive: { color: ACCENT, fontWeight: '600' },
    browseBtn: {
      height: 34,
      borderRadius: 17,
      marginRight: -10,
      paddingHorizontal: 20,
      backgroundColor: ACCENT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    browseText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    costPill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: cardFill,
      borderWidth: 1,
      borderColor: line,
    },
    coin: { width: 18, height: 18 },
    submitBtn: {
      height: 50,
      borderRadius: 14,
      backgroundColor: ACCENT,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
    },
    submitBtnOff: { opacity: 0.5 },
    submitBtnDone: { backgroundColor: '#16A34A', opacity: 1 },
    submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    afterRow: { flexDirection: 'row', gap: 18, justifyContent: 'center', marginTop: 4 },
    linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 6 },
    linkText: { fontSize: 13, fontWeight: '600', color: ACCENT },
    dialogHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    dialogTitle: {
      flex: 1,
      fontFamily: DisplayFont.semibold,
      fontSize: 22,
      lineHeight: 28,
      includeFontPadding: false,
      color: t.text,
    },
    centered: { textAlign: 'center', paddingStart: 22 },
    starsRow: { flexDirection: 'row', gap: 6 },
    photoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 64,
      padding: 6,
      borderRadius: 18,
      backgroundColor: t.surfaceAlt,
    },
    photoWrap: { width: 60, height: 52, borderRadius: 10, overflow: 'hidden' },
    photo: { width: '100%', height: '100%' },
    photoRemove: {
      position: 'absolute',
      top: 3,
      right: 3,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraBtn: {
      width: 40,
      height: 40,
      backgroundColor: ACCENT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disputeCard: {
      alignItems: 'center',
      gap: 10,
      padding: 20,
      borderRadius: 20,
      backgroundColor: t.surfaceAlt,
    },
    shield: { width: 76, height: 84, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    disputeLabel: { fontFamily: DisplayFont.semibold, fontSize: 18, color: t.text },
    statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: '#F9DCDD' },
    statusPillIdle: { backgroundColor: t.border },
    statusText: { fontSize: 12, fontWeight: '600', color: '#C92F35' },
    statusTextIdle: { color: t.textSecondary },
  });
};
