import { JobListing } from './PopularJobs';

export interface AdBazaarQuickCategory {
  id: string;
  label: string;
  filterKey: string;
  iconAsset: number;
  iconWidth: number;
  iconHeight: number;
}

export const ADBAZAAR_QUICK_CATEGORIES: AdBazaarQuickCategory[] = [
  {
    id: 'creators',
    label: 'Content Creators',
    filterKey: 'Content',
    iconAsset: require('@/assets/images/adbazaar/cat-creators.png'),
    iconWidth: 30,
    iconHeight: 26,
  },
  {
    id: 'ai',
    label: 'AI',
    filterKey: 'Digital Marketing',
    iconAsset: require('@/assets/images/adbazaar/cat-ai.png'),
    iconWidth: 23,
    iconHeight: 26,
  },
  {
    id: 'pr',
    label: 'PR Agencies',
    filterKey: 'PR & Comms',
    iconAsset: require('@/assets/images/adbazaar/cat-pr.png'),
    iconWidth: 28,
    iconHeight: 26,
  },
  {
    id: 'arch-design',
    label: 'Architecture + Design',
    filterKey: 'Creative',
    iconAsset: require('@/assets/images/adbazaar/cat-arch.png'),
    iconWidth: 27,
    iconHeight: 26,
  },
];

export interface AdBazaarOpportunity {
  id: string;
  initials: string;
  avatarColors: readonly [string, string];
  title: string;
  company: string;
  location: string;
  description?: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  posted: string;
  postedDaysAgo: number;
  budgetShort: string;
  budgetMinK: number;
  budgetFull: string;
  duration: string;
  validTill: string;
  validTillFull: string;
  featured?: boolean;
  image: number;
}

export const ADBAZAAR_FEATURED_OPPORTUNITIES: AdBazaarOpportunity[] = [
  {
    id: 'ab-feat-1',
    initials: 'HR',
    avatarColors: ['#D34E53', '#E4898C'],
    title: 'Head of Brand Marketing',
    company: 'Telenor Pakistan',
    location: 'Karachi',
    description:
      'Leading brand campaigns across digital and traditional channels for a national audience.',
    tag: 'Strategy',
    tagColor: '#10B981',
    tagBg: 'rgba(16, 185, 129, 0.12)',
    posted: 'Today',
    postedDaysAgo: 0,
    budgetShort: '70k-80k',
    budgetMinK: 75,
    budgetFull: 'PKR 80,000',
    duration: 'Full Time',
    validTill: '28 February',
    validTillFull: '28-February-2027',
    featured: true,
    image: require('@/assets/images/jobs/job-1.jpg'),
  },
  {
    id: 'ab-feat-2',
    initials: 'FP',
    avatarColors: ['#D34E53', '#E4898C'],
    title: 'Performance Marketing Lead',
    company: 'Foodpanda Pakistan',
    location: 'Remote',
    description:
      'Own paid media across Meta, Google, and TikTok with full growth and P&L accountability.',
    tag: 'Digital Marketing',
    tagColor: '#0EA5E9',
    tagBg: 'rgba(14, 165, 233, 0.12)',
    posted: 'Today',
    postedDaysAgo: 0,
    budgetShort: '90k-120k',
    budgetMinK: 105,
    budgetFull: 'PKR 120,000',
    duration: 'Full Time',
    validTill: '15 March',
    validTillFull: '15-March-2027',
    featured: true,
    image: require('@/assets/images/jobs/job-2.jpg'),
  },
];

export const ADBAZAAR_LATEST_LISTINGS: AdBazaarOpportunity[] = [
  {
    id: 'ab-lat-1',
    initials: 'GA',
    avatarColors: ['#C92F35', '#EB5B60'],
    title: 'Copywriter',
    company: 'Grey Advertising',
    location: 'Karachi',
    description:
      'Professional copywriting services for ads, websites, emails, and social media campaigns.',
    tag: 'Creative',
    tagColor: '#C92F35',
    tagBg: 'rgba(201, 47, 53, 0.10)',
    posted: '1 day ago',
    postedDaysAgo: 1,
    budgetShort: '70k-80k',
    budgetMinK: 80,
    budgetFull: 'PKR 80,000',
    duration: '2 Month(s)',
    validTill: '12 February',
    validTillFull: '12-February-2027',
    featured: true,
    image: require('@/assets/images/jobs/job-1.jpg'),
  },
  {
    id: 'ab-lat-2',
    initials: 'IB',
    avatarColors: ['#F59E0B', '#FBBF24'],
    title: 'Social Media Manager',
    company: 'Inbox Business Technologies',
    location: 'Karachi',
    description:
      'Lead daily social storytelling, creator collaborations, and audience growth sprints.',
    tag: 'Social Media',
    tagColor: '#F59E0B',
    tagBg: 'rgba(245, 158, 11, 0.12)',
    posted: '2 days ago',
    postedDaysAgo: 2,
    budgetShort: '70k-80k',
    budgetMinK: 75,
    budgetFull: 'PKR 80,000',
    duration: '3 Month(s)',
    validTill: '20 February',
    validTillFull: '20-February-2027',
    image: require('@/assets/images/jobs/job-2.jpg'),
  },
  {
    id: 'ab-lat-3',
    initials: 'IP',
    avatarColors: ['#C92F35', '#EB5B60'],
    title: 'Media Planner',
    company: 'IPG Mediabrands',
    location: 'Lahore',
    description:
      'Build integrated TV, OOH, and digital media plans backed by reach efficiency metrics.',
    tag: 'Media Buying',
    tagColor: '#C92F35',
    tagBg: 'rgba(201, 47, 53, 0.10)',
    posted: '3 days ago',
    postedDaysAgo: 3,
    budgetShort: '70k-80k',
    budgetMinK: 85,
    budgetFull: 'PKR 85,000',
    duration: 'Full Time',
    validTill: '24 February',
    validTillFull: '24-February-2027',
    image: require('@/assets/images/jobs/job-3.jpg'),
  },
  {
    id: 'ab-lat-4',
    initials: 'OM',
    avatarColors: ['#C83391', '#E862B5'],
    title: 'Content Strategist',
    company: 'Orient MCL',
    location: 'Remote',
    description:
      'Architect editorial calendars, video scripts, and multi-channel brand narratives.',
    tag: 'Content',
    tagColor: '#C83391',
    tagBg: 'rgba(200, 51, 145, 0.12)',
    posted: '3 days ago',
    postedDaysAgo: 3,
    budgetShort: '70k-80k',
    budgetMinK: 78,
    budgetFull: 'PKR 80,000',
    duration: '3 Month(s)',
    validTill: '26 February',
    validTillFull: '26-February-2027',
    image: require('@/assets/images/jobs/job-1.jpg'),
  },
  {
    id: 'ab-lat-5',
    initials: 'ML',
    avatarColors: ['#C92F35', '#EB5B60'],
    title: 'Brand Designer',
    company: 'MullenLowe Rauf',
    location: 'Karachi',
    description:
      'Shape visual identities, campaign key visuals, and modern packaging systems.',
    tag: 'Creative',
    tagColor: '#C92F35',
    tagBg: 'rgba(201, 47, 53, 0.10)',
    posted: '3 days ago',
    postedDaysAgo: 3,
    budgetShort: '70k-80k',
    budgetMinK: 72,
    budgetFull: 'PKR 80,000',
    duration: '2 Month(s)',
    validTill: '28 February',
    validTillFull: '28-February-2027',
    image: require('@/assets/images/jobs/job-3.jpg'),
  },
  {
    id: 'ab-lat-6',
    initials: 'NP',
    avatarColors: ['#0EA5E9', '#38BDF8'],
    title: 'Digital Marketing Executive',
    company: 'Nestlé Pakistan',
    location: 'Lahore',
    description:
      'Execute always-on performance campaigns and optimize conversion funnels for flagship SKUs.',
    tag: 'Digital Marketing',
    tagColor: '#0EA5E9',
    tagBg: 'rgba(14, 165, 233, 0.12)',
    posted: '3 days ago',
    postedDaysAgo: 3,
    budgetShort: '70k-80k',
    budgetMinK: 90,
    budgetFull: 'PKR 90,000',
    duration: 'Full Time',
    validTill: '05 March',
    validTillFull: '05-March-2027',
    image: require('@/assets/images/jobs/job-4.jpg'),
  },
  {
    id: 'ab-lat-7',
    initials: 'EP',
    avatarColors: ['#17B233', '#3DD45A'],
    title: 'PR Manager',
    company: 'Edelman Pakistan',
    location: 'Karachi',
    description:
      'Manage press relations, executive communications, and brand launch activations.',
    tag: 'PR & Comms',
    tagColor: '#17B233',
    tagBg: 'rgba(23, 178, 51, 0.12)',
    posted: '3 days ago',
    postedDaysAgo: 3,
    budgetShort: '70k-80k',
    budgetMinK: 95,
    budgetFull: 'PKR 95,000',
    duration: 'Full Time',
    validTill: '10 March',
    validTillFull: '10-March-2027',
    image: require('@/assets/images/jobs/job-4.jpg'),
  },
];

export type AdBazaarSortOption = 'default' | 'newest' | 'budget-high' | 'budget-low';

export const ADBAZAAR_SORT_OPTIONS: { id: AdBazaarSortOption; label: string }[] = [
  { id: 'default', label: 'Sorting' },
  { id: 'newest', label: 'Newest First' },
  { id: 'budget-high', label: 'Budget: High to Low' },
  { id: 'budget-low', label: 'Budget: Low to High' },
];

export const ADBAZAAR_LOCATION_FILTERS = ['All Locations', 'Karachi', 'Lahore', 'Remote'] as const;
export type AdBazaarLocationFilter = (typeof ADBAZAAR_LOCATION_FILTERS)[number];

export interface AdBazaarCloudCategory {
  id: string;
  label: string;
  jobsCount: string;
  color: string;
  filterKey: string;
  rotateDeg: number;
  leftPct: number;
  topPx: number;
}

export const ADBAZAAR_CATEGORY_CLOUD: AdBazaarCloudCategory[] = [
  {
    id: 'cloud-tech',
    label: 'Tech & Data',
    jobsCount: '27 Jobs',
    color: '#2563EB',
    filterKey: 'Digital Marketing',
    rotateDeg: -26,
    leftPct: 18,
    topPx: 22,
  },
  {
    id: 'cloud-pr',
    label: 'PR & Communications',
    jobsCount: '18 Jobs',
    color: '#17B233',
    filterKey: 'PR & Comms',
    rotateDeg: 8,
    leftPct: 50,
    topPx: 30,
  },
  {
    id: 'cloud-content',
    label: 'Content & Copywriting',
    jobsCount: '18 Jobs',
    color: '#C83391',
    filterKey: 'Content',
    rotateDeg: -15.7,
    leftPct: 2,
    topPx: 92,
  },
  {
    id: 'cloud-strategy',
    label: 'Strategy & Consulting',
    jobsCount: '27 Jobs',
    color: '#10B981',
    filterKey: 'Strategy',
    rotateDeg: -2.1,
    leftPct: 54,
    topPx: 100,
  },
  {
    id: 'cloud-production',
    label: 'Production & Events',
    jobsCount: '18 Jobs',
    color: '#F59E0B',
    filterKey: 'Creative',
    rotateDeg: -28,
    leftPct: 1,
    topPx: 176,
  },
  {
    id: 'cloud-digital',
    label: 'Digital Marketing',
    jobsCount: '62 Jobs',
    color: '#0EA5E9',
    filterKey: 'Digital Marketing',
    rotateDeg: 36.4,
    leftPct: 44,
    topPx: 182,
  },
  {
    id: 'cloud-media',
    label: 'Media Buying & Planning',
    jobsCount: '31 Jobs',
    color: '#F97316',
    filterKey: 'Media Buying',
    rotateDeg: 20.3,
    leftPct: 40,
    topPx: 262,
  },
  {
    id: 'cloud-creative',
    label: 'Creative & Design',
    jobsCount: '48 Jobs',
    color: '#C92F35',
    filterKey: 'Creative',
    rotateDeg: 0,
    leftPct: 3,
    topPx: 290,
  },
];

export interface AdBazaarFreelancer {
  id: string;
  initials: string;
  name: string;
  role: string;
  rateLabel: string;
  rating: string;
  avatarColors: readonly [string, string];
  shadowColor: string;
  city: string;
  bio: string;
  completedProjects: number;
}

export const ADBAZAAR_FREELANCERS: AdBazaarFreelancer[] = [
  {
    id: 'ab-fl-1',
    initials: 'HR',
    name: 'Hamza Raza',
    role: 'Video Editor',
    rateLabel: 'from PKR 15,000',
    rating: '4.9',
    avatarColors: ['#0EA5E9', '#38BDF8'],
    shadowColor: 'rgba(14, 165, 233, 0.28)',
    city: 'Karachi',
    bio: 'Commercial editor specializing in TVCs, reels, color grading, and motion titles.',
    completedProjects: 38,
  },
  {
    id: 'ab-fl-2',
    initials: 'NF',
    name: 'Nida Fatima',
    role: 'Graphic Designer',
    rateLabel: 'from PKR 17,000',
    rating: '5',
    avatarColors: ['#C92F35', '#EB5B60'],
    shadowColor: 'rgba(201, 47, 53, 0.28)',
    city: 'Lahore',
    bio: 'Brand identity systems, campaign key visuals, and retail packaging specialist.',
    completedProjects: 54,
  },
  {
    id: 'ab-fl-3',
    initials: 'AS',
    name: 'Ali Shahid',
    role: 'SEO Specialist',
    rateLabel: 'from PKR 12,000',
    rating: '4.7',
    avatarColors: ['#14B8A6', '#2DD4BF'],
    shadowColor: 'rgba(20, 184, 166, 0.28)',
    city: 'Remote',
    bio: 'Technical SEO audits, search content architecture, and conversion optimization.',
    completedProjects: 29,
  },
  {
    id: 'ab-fl-4',
    initials: 'ZA',
    name: 'Zara Ahmed',
    role: 'Brand Strategist',
    rateLabel: 'from PKR 22,000',
    rating: '4.9',
    avatarColors: ['#D97706', '#FBBF24'],
    shadowColor: 'rgba(217, 119, 6, 0.28)',
    city: 'Islamabad',
    bio: 'Go-to-market positioning, brand messaging playbooks, and creative briefs.',
    completedProjects: 41,
  },
  {
    id: 'ab-fl-5',
    initials: 'SK',
    name: 'Saad Khan',
    role: 'Motion Designer',
    rateLabel: 'from PKR 18,500',
    rating: '4.8',
    avatarColors: ['#059669', '#34D399'],
    shadowColor: 'rgba(5, 150, 105, 0.28)',
    city: 'Karachi',
    bio: '3D product reveals, social launch loops, and interactive motion systems.',
    completedProjects: 33,
  },
];

export const toAdBazaarJobListing = (item: AdBazaarOpportunity): JobListing => ({
  id: item.id,
  title: item.title,
  category: item.tag,
  subCategory: item.company,
  duration: item.duration,
  budget: item.budgetFull,
  validTill: item.validTill,
  validTillFull: item.validTillFull,
  postedAt: item.posted === 'Today' ? 'Today' : item.posted,
  location: item.location,
  budgetShort: item.budgetShort,
  description:
    item.description ??
    `Join ${item.company} in ${item.location} for the ${item.title} opportunity in ${item.tag}.`,
  postedBy: { name: item.company },
  featured: item.featured,
  image: item.image,
});
