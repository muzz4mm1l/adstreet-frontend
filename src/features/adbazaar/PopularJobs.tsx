import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Shadows } from '@/constants/theme';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';

export interface JobListing {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  duration: string;
  budget: string;
  validTill: string;
  validTillFull?: string;
  postedAt?: string;
  location?: string;
  /** Compact budget label, e.g. "70k-80k". */
  budgetShort?: string;
  description?: string;
  postedBy?: {
    name: string;
    role?: string;
    avatar?: any;
  };
  featured?: boolean;
  /** Artwork (require(...) or { uri }). A placeholder shows until provided. */
  image?: any;
}

// Dummy data until the jobs API exists. Images are the sample photos (assets/images/jobs); swap for real job artwork.
export const POPULAR_JOBS: JobListing[] = [
  {
    id: 'job-1',
    image: require('@/assets/images/jobs/job-1.jpg'),
    title: 'Copywriting',
    category: 'Writing & Story Telling',
    subCategory: '',
    duration: '2 Month(s)',
    budget: 'PKR 80000',
    validTill: '12 February',
    validTillFull: '12-February-2027',
    postedAt: '12 February 2026',
    description:
      'Professional copywriting services for ads, websites, emails, and social media. Crafting compelling messages that convert and resonate with your audience.',
    postedBy: { name: 'Maliha' },
    featured: true,
  },
  {
    id: 'job-2',
    image: require('@/assets/images/jobs/job-2.jpg'),
    title: 'App & Website Development',
    category: 'Web & App Designers',
    subCategory: '',
    duration: '1 Month(s)',
    budget: 'PKR 100000',
    validTill: '12 February',
    validTillFull: '12-February-2027',
    postedAt: '10 February 2026',
    description:
      'End-to-end mobile app and responsive website development with modern UI/UX, clean architecture, and smooth performance across iOS, Android, and web.',
    postedBy: { name: 'Hamza Tariq' },
    featured: true,
  },
  {
    id: 'job-3',
    image: require('@/assets/images/jobs/job-3.jpg'),
    title: 'Brand Identity Design',
    category: 'Design House',
    subCategory: '',
    duration: '3 Week(s)',
    budget: 'PKR 55000',
    validTill: '20 February',
    validTillFull: '20-February-2027',
    postedAt: '14 February 2026',
    description:
      'Complete brand identity system including logo suite, typography guidelines, color palette, and social media launch templates tailored for a growing consumer brand.',
    postedBy: { name: 'Zara Ahmed' },
  },
  {
    id: 'job-4',
    image: require('@/assets/images/jobs/job-4.jpg'),
    title: 'Product Photography',
    category: 'Photographers',
    subCategory: '',
    duration: '5 Day(s)',
    budget: 'PKR 35000',
    validTill: '28 February',
    validTillFull: '28-February-2027',
    postedAt: '15 February 2026',
    description:
      'Studio and lifestyle product photography for an upcoming skincare launch, including 20 retouched high-resolution hero shots and e-commerce cutouts.',
    postedBy: { name: 'Saad Khan' },
  },
];

const BLUE = '#3B82F6';
const RED = BrandColors.primary;

interface PopularJobsProps {
  jobs?: JobListing[];
  onPressJob?: (job: JobListing) => void;
}

/** "Popular Jobs" list: image, title, category, duration, budget pill, validity and a Details CTA. */
export const PopularJobs: React.FC<PopularJobsProps> = ({ jobs = POPULAR_JOBS, onPressJob }) => {
  const styles = useThemedStyles(createStyles);
  return (
  <View style={styles.section}>
    <Text style={styles.heading} accessibilityRole="header">
      Popular Jobs
    </Text>
    {jobs.map((job, i) => (
      <Animated.View key={job.id} entering={FadeInDown.duration(380).delay(Math.min(i, 5) * 70)}>
        <JobCard job={job} onPress={() => onPressJob?.(job)} />
      </Animated.View>
    ))}
  </View>
  );
};

const JobCard: React.FC<{ job: JobListing; onPress: () => void }> = ({ job, onPress }) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  return (
  <HapticPressable
    haptic="light"
    scaleTo={0.985}
    borderRadius={14}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`View details for ${job.title}`}
    style={styles.card}>
    <View style={styles.top}>
      <View style={styles.imageFrame}>
        {job.image ? (
          <Image source={job.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={26} color={theme.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {job.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="apps-outline" size={14} color={theme.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {job.category}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={theme.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {job.duration}
          </Text>
        </View>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Budget :</Text>
          <View style={styles.budgetPill}>
            <Text style={styles.budgetText}>{job.budget}</Text>
          </View>
        </View>
      </View>

      {job.featured && (
        <View style={styles.featured}>
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
    </View>

    <View style={styles.footer}>
      <View style={styles.footerItem}>
        <Ionicons name="calendar-clear-outline" size={15} color={theme.textMuted} />
        <View>
          <Text style={styles.footerLabel}>Valid till</Text>
          <Text style={styles.footerValue}>{job.validTill}</Text>
        </View>
      </View>
      <View style={styles.footerItem}>
        <Ionicons name="time-outline" size={15} color={theme.textMuted} />
        <View>
          <Text style={styles.footerLabel}>Duration</Text>
          <Text style={styles.footerValue}>{job.duration}</Text>
        </View>
      </View>
      <View style={styles.detailsButton}>
        <Text style={styles.detailsText}>Details</Text>
      </View>
    </View>
  </HapticPressable>
  );
};

const createStyles = (t: AppTheme) =>
  StyleSheet.create({
  section: {
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 18.0,
    lineHeight: 27,
    fontWeight: '600',
    color: t.text,
    marginBottom: 14,
  },
  card: {
    backgroundColor: t.surface,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.border,
    ...Shadows.card,
  },
  top: {
    flexDirection: 'row',
    padding: 12,
    gap: 14,
  },
  imageFrame: {
    width: 118,
    height: 138,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: t.surfaceAlt,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    paddingTop: 22,
  },
  title: {
    fontSize: 15.5,
    lineHeight: 22,
    fontWeight: '700',
    color: t.text,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  metaText: {
    flex: 1,
    fontSize: 13.5,
    color: t.textSecondary,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
  },
  budgetLabel: {
    fontSize: 13.5,
    color: t.text,
  },
  budgetPill: {
    backgroundColor: BLUE,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  budgetText: {
    color: '#FFFFFF',
    fontSize: 14.0,
    fontWeight: '700',
  },
  featured: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: t.primary,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 12.0,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLabel: {
    fontSize: 12.0,
    color: t.textMuted,
  },
  footerValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: t.text,
  },
  detailsButton: {
    borderRadius: 8,
    backgroundColor: t.primary,
    paddingHorizontal: 22,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsText: {
    color: '#FFFFFF',
    fontSize: 14.0,
    fontWeight: '600',
  },
});
