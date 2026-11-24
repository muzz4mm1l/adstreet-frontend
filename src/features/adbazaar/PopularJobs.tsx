import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { Shadows, SurfaceColors } from '@/constants/theme';

export interface JobListing {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  duration: string;
  budget: string;
  validTill: string;
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
  },
];

const BLUE = '#3B82F6';
const RED = '#E8222A';

interface PopularJobsProps {
  jobs?: JobListing[];
  onPressJob?: (job: JobListing) => void;
}

/** "Popular Jobs" list: image, title, category, duration, budget pill, validity and a Details CTA. */
export const PopularJobs: React.FC<PopularJobsProps> = ({ jobs = POPULAR_JOBS, onPressJob }) => (
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

const JobCard: React.FC<{ job: JobListing; onPress: () => void }> = ({ job, onPress }) => (
  <View style={styles.card}>
    <View style={styles.top}>
      <View style={styles.imageFrame}>
        {job.image ? (
          <Image source={job.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={26} color="#B6BAC3" />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {job.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="apps-outline" size={14} color="#9AA0A6" />
          <Text style={styles.metaText} numberOfLines={1}>
            {job.category}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color="#9AA0A6" />
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
        <Ionicons name="calendar-clear-outline" size={15} color="#6B7280" />
        <View>
          <Text style={styles.footerLabel}>Valid till</Text>
          <Text style={styles.footerValue}>{job.validTill}</Text>
        </View>
      </View>
      <View style={styles.footerItem}>
        <Ionicons name="time-outline" size={15} color="#6B7280" />
        <View>
          <Text style={styles.footerLabel}>Duration</Text>
          <Text style={styles.footerValue}>{job.duration}</Text>
        </View>
      </View>
      <HapticPressable
        haptic="light"
        borderRadius={8}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Details for ${job.title}`}
        style={styles.detailsButton}>
        <Text style={styles.detailsText}>Details</Text>
      </HapticPressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 18.0,
    lineHeight: 27,
    fontWeight: '600',
    color: SurfaceColors.textPrimary,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.10)',
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
    backgroundColor: '#ECEEF2',
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
    color: SurfaceColors.textPrimary,
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
    color: '#4B5563',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
  },
  budgetLabel: {
    fontSize: 13.5,
    color: '#374151',
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
    backgroundColor: RED,
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
    borderTopColor: 'rgba(0, 0, 0, 0.14)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLabel: {
    fontSize: 12.0,
    color: '#6B7280',
  },
  footerValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: SurfaceColors.textPrimary,
  },
  detailsButton: {
    backgroundColor: RED,
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
