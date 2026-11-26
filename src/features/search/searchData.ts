import { JobListing } from '@/features/adbazaar/PopularJobs';
import { BrandColors } from '@/constants/theme';

export type SearchModuleChip =
  | 'All'
  | 'AdBazaar'
  | 'AdBooks'
  | 'AdLeaks'
  | 'Admeet'
  | 'AdGuru'
  | 'AdRead';

export const SEARCH_MODULE_CHIPS: readonly SearchModuleChip[] = [
  'All',
  'AdBazaar',
  'AdBooks',
  'AdLeaks',
  'Admeet',
  'AdGuru',
  'AdRead',
];

export const SEARCH_LOCATIONS = ['All Locations', 'Karachi', 'Lahore', 'Islamabad', 'Remote'] as const;
export type SearchLocationFilter = (typeof SEARCH_LOCATIONS)[number];

export interface SearchOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  posted: string;
  budget: string;
  duration: string;
  validTill: string;
  validTillFull: string;
  featured?: boolean;
  image: number;
}

export const FEATURED_OPPORTUNITIES: SearchOpportunity[] = [
  {
    id: 'search-feat-1',
    title: 'Head of Brand Marketing',
    company: 'Telenor Pakistan',
    location: 'Karachi',
    description:
      'Leading brand campaigns across digital and traditional channels for a national audience.',
    tag: 'Strategy',
    tagColor: '#10B981',
    tagBg: 'rgba(16, 185, 129, 0.12)',
    posted: 'Today',
    budget: 'PKR 450,000',
    duration: 'Full Time',
    validTill: '28 February',
    validTillFull: '28-February-2027',
    featured: true,
    image: require('@/assets/images/jobs/job-1.jpg'),
  },
  {
    id: 'search-feat-2',
    title: 'Performance Marketing Manager',
    company: 'Foodpanda Pakistan',
    location: 'Remote',
    description:
      'Own paid media across Meta, Google, and TikTok with full P&L accountability.',
    tag: 'Digital Marketing',
    tagColor: '#0EA5E9',
    tagBg: 'rgba(14, 165, 233, 0.12)',
    posted: 'Today',
    budget: 'PKR 260,000',
    duration: 'Full Time',
    validTill: '15 March',
    validTillFull: '15-March-2027',
    featured: true,
    image: require('@/assets/images/jobs/job-2.jpg'),
  },
];

export const LATEST_LISTINGS: SearchOpportunity[] = [
  {
    id: 'search-lat-1',
    title: 'Copywriter',
    company: 'Grey Advertising',
    location: 'Karachi',
    description:
      'Craft persuasive ATL, BTL, and digital campaign copy for consumer brands.',
    tag: 'Creative',
    tagColor: '#C92F35',
    tagBg: 'rgba(201, 47, 53, 0.10)',
    posted: '1 day ago',
    budget: 'PKR 80,000',
    duration: '2 Month(s)',
    validTill: '12 February',
    validTillFull: '12-February-2027',
    featured: true,
    image: require('@/assets/images/jobs/job-1.jpg'),
  },
  {
    id: 'search-lat-2',
    title: 'Social Media Manager',
    company: 'Inbox Business Technologies',
    location: 'Karachi',
    description:
      'Lead daily social storytelling, community growth, and creator collaborations.',
    tag: 'Social Media',
    tagColor: '#F59E0B',
    tagBg: 'rgba(245, 158, 11, 0.12)',
    posted: '2 days ago',
    budget: 'PKR 110,000',
    duration: '3 Month(s)',
    validTill: '20 February',
    validTillFull: '20-February-2027',
    image: require('@/assets/images/jobs/job-2.jpg'),
  },
  {
    id: 'search-lat-3',
    title: 'Media Planner',
    company: 'IPG Mediabrands',
    location: 'Lahore',
    description:
      'Build integrated TV, OOH, and digital media plans backed by reach efficiency metrics.',
    tag: 'Media Buying',
    tagColor: '#C92F35',
    tagBg: 'rgba(201, 47, 53, 0.10)',
    posted: '3 days ago',
    budget: 'PKR 140,000',
    duration: 'Full Time',
    validTill: '24 February',
    validTillFull: '24-February-2027',
    image: require('@/assets/images/jobs/job-3.jpg'),
  },
  {
    id: 'search-lat-4',
    title: 'Content Strategist',
    company: 'Orient MCL',
    location: 'Remote',
    description:
      'Architect editorial calendars, video scripts, and multi-channel brand narratives.',
    tag: 'Content',
    tagColor: '#C83391',
    tagBg: 'rgba(200, 51, 145, 0.12)',
    posted: '3 days ago',
    budget: 'PKR 125,000',
    duration: '3 Month(s)',
    validTill: '26 February',
    validTillFull: '26-February-2027',
    image: require('@/assets/images/jobs/job-1.jpg'),
  },
  {
    id: 'search-lat-5',
    title: 'Brand Designer',
    company: 'MullenLowe Rauf',
    location: 'Karachi',
    description:
      'Shape visual identities, campaign key visuals, and packaging systems.',
    tag: 'Creative',
    tagColor: '#C92F35',
    tagBg: 'rgba(201, 47, 53, 0.10)',
    posted: '3 days ago',
    budget: 'PKR 95,000',
    duration: '2 Month(s)',
    validTill: '28 February',
    validTillFull: '28-February-2027',
    image: require('@/assets/images/jobs/job-3.jpg'),
  },
  {
    id: 'search-lat-6',
    title: 'Digital Marketing Executive',
    company: 'Nestlé Pakistan',
    location: 'Lahore',
    description:
      'Execute always-on performance campaigns and track conversion funnels for flagship SKUs.',
    tag: 'Digital Marketing',
    tagColor: '#0EA5E9',
    tagBg: 'rgba(14, 165, 233, 0.12)',
    posted: '3 days ago',
    budget: 'PKR 135,000',
    duration: 'Full Time',
    validTill: '05 March',
    validTillFull: '05-March-2027',
    image: require('@/assets/images/jobs/job-4.jpg'),
  },
  {
    id: 'search-lat-7',
    title: 'PR Manager',
    company: 'Edelman Pakistan',
    location: 'Karachi',
    description:
      'Manage press relations, executive communications, and launch activations.',
    tag: 'PR & Comms',
    tagColor: '#17B233',
    tagBg: 'rgba(23, 178, 51, 0.12)',
    posted: '3 days ago',
    budget: 'PKR 165,000',
    duration: 'Full Time',
    validTill: '10 March',
    validTillFull: '10-March-2027',
    image: require('@/assets/images/jobs/job-4.jpg'),
  },
];

export interface ExploreCategoryBubble {
  id: string;
  label: string;
  jobsCount: string;
  color: string;
  filterKey: string;
  rotateDeg: number;
  leftPct: number;
  topPx: number;
}

export const EXPLORE_CATEGORY_BUBBLES: ExploreCategoryBubble[] = [
  {
    id: 'cat-tech',
    label: 'Tech & Data',
    jobsCount: '27 Jobs',
    color: '#4F46E5',
    filterKey: 'Digital Marketing',
    rotateDeg: -26,
    leftPct: 22,
    topPx: 8,
  },
  {
    id: 'cat-pr',
    label: 'PR & Communications',
    jobsCount: '18 Jobs',
    color: '#17B233',
    filterKey: 'PR & Comms',
    rotateDeg: 8,
    leftPct: 45,
    topPx: 42,
  },
  {
    id: 'cat-content',
    label: 'Content & Copywriting',
    jobsCount: '18 Jobs',
    color: '#C83391',
    filterKey: 'Content',
    rotateDeg: -15.7,
    leftPct: 2,
    topPx: 72,
  },
  {
    id: 'cat-strategy',
    label: 'Strategy & Consulting',
    jobsCount: '27 Jobs',
    color: '#10B981',
    filterKey: 'Strategy',
    rotateDeg: -2.1,
    leftPct: 54,
    topPx: 112,
  },
  {
    id: 'cat-production',
    label: 'Production & Events',
    jobsCount: '18 Jobs',
    color: '#F59E0B',
    filterKey: 'Creative',
    rotateDeg: -28,
    leftPct: 2,
    topPx: 146,
  },
  {
    id: 'cat-digital',
    label: 'Digital Marketing',
    jobsCount: '62 Jobs',
    color: '#0EA5E9',
    filterKey: 'Digital Marketing',
    rotateDeg: 36.4,
    leftPct: 33,
    topPx: 184,
  },
  {
    id: 'cat-media',
    label: 'Media Buying & Planning',
    jobsCount: '31 Jobs',
    color: '#F97316',
    filterKey: 'Media Buying',
    rotateDeg: 20.3,
    leftPct: 49,
    topPx: 168,
  },
  {
    id: 'cat-creative',
    label: 'Creative & Design',
    jobsCount: '48 Jobs',
    color: '#C92F35',
    filterKey: 'Creative',
    rotateDeg: 0,
    leftPct: 4,
    topPx: 222,
  },
];

export interface SearchFreelancer {
  id: string;
  initials: string;
  name: string;
  role: string;
  rateLabel: string;
  rating: string;
  avatarColors: readonly [string, string];
  shadowColor: string;
  city: string;
}

export const FREELANCERS: SearchFreelancer[] = [
  {
    id: 'fl-1',
    initials: 'HR',
    name: 'Hamza Raza',
    role: 'Video Editor',
    rateLabel: 'from PKR 15,000',
    rating: '4.9',
    avatarColors: ['#0EA5E9', '#38BDF8'],
    shadowColor: 'rgba(14, 165, 233, 0.28)',
    city: 'Karachi',
  },
  {
    id: 'fl-2',
    initials: 'NF',
    name: 'Nida Fatima',
    role: 'Graphic Designer',
    rateLabel: 'from PKR 17,000',
    rating: '5',
    avatarColors: ['#C92F35', '#EB5B60'],
    shadowColor: 'rgba(201, 47, 53, 0.28)',
    city: 'Lahore',
  },
  {
    id: 'fl-3',
    initials: 'AS',
    name: 'Ali Shahid',
    role: 'SEO Specialist',
    rateLabel: 'from PKR 12,000',
    rating: '4.7',
    avatarColors: ['#14B8A6', '#2DD4BF'],
    shadowColor: 'rgba(20, 184, 166, 0.28)',
    city: 'Remote',
  },
  {
    id: 'fl-4',
    initials: 'ZA',
    name: 'Zara Ahmed',
    role: 'Brand Strategist',
    rateLabel: 'from PKR 22,000',
    rating: '4.9',
    avatarColors: ['#8B5CF6', '#A78BFA'],
    shadowColor: 'rgba(139, 92, 246, 0.28)',
    city: 'Islamabad',
  },
  {
    id: 'fl-5',
    initials: 'SK',
    name: 'Saad Khan',
    role: 'Motion Designer',
    rateLabel: 'from PKR 18,500',
    rating: '4.8',
    avatarColors: ['#F59E0B', '#FBBF24'],
    shadowColor: 'rgba(245, 158, 11, 0.28)',
    city: 'Karachi',
  },
];

export interface ModuleSearchResult {
  id: string;
  module: Exclude<SearchModuleChip, 'All' | 'AdBazaar'>;
  title: string;
  subtitle: string;
  meta: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  ctaLabel: string;
}

export const CROSS_MODULE_RESULTS: ModuleSearchResult[] = [
  {
    id: 'mod-book-1',
    module: 'AdBooks',
    title: 'Synergy Advertising',
    subtitle: 'Full-Service Creative & Media Agency • Karachi',
    meta: 'Verified Agency Directory',
    tag: 'AdBooks',
    tagColor: '#C7661E',
    tagBg: 'rgba(245, 158, 11, 0.12)',
    ctaLabel: 'View Profile',
  },
  {
    id: 'mod-book-2',
    module: 'AdBooks',
    title: 'Mindshare Pakistan',
    subtitle: 'Media Investment & Analytics • Lahore / Karachi',
    meta: 'Top Rated Partner',
    tag: 'AdBooks',
    tagColor: '#C7661E',
    tagBg: 'rgba(245, 158, 11, 0.12)',
    ctaLabel: 'View Profile',
  },
  {
    id: 'mod-leak-1',
    module: 'AdLeaks',
    title: "Pakistan's Digital Ad Spend Crosses Rs. 50B",
    subtitle: 'Annual digital growth report & agency benchmark insights',
    meta: 'Market Report • Today',
    tag: 'AdLeaks',
    tagColor: BrandColors.primary,
    tagBg: 'rgba(236, 32, 41, 0.10)',
    ctaLabel: 'Read',
  },
  {
    id: 'mod-leak-2',
    module: 'AdLeaks',
    title: "How Unilever's Campaign Redefined Reach",
    subtitle: 'Creative breakdown & media attribution deep dive',
    meta: 'Campaign Spotlight • 1d ago',
    tag: 'AdLeaks',
    tagColor: BrandColors.primary,
    tagBg: 'rgba(236, 32, 41, 0.10)',
    ctaLabel: 'Read',
  },
  {
    id: 'mod-meet-1',
    module: 'Admeet',
    title: 'AdSummit Pakistan 2026',
    subtitle: 'Annual Marketing & Advertising Conference • Karachi',
    meta: 'Aug 20 • Conference',
    tag: 'Admeet',
    tagColor: '#0EA5E9',
    tagBg: 'rgba(14, 165, 233, 0.12)',
    ctaLabel: 'Register',
  },
  {
    id: 'mod-meet-2',
    module: 'Admeet',
    title: 'Creative Strategy Meetup',
    subtitle: 'Evening mixer for strategists and agency leads • Islamabad',
    meta: 'Sep 19 • Networking',
    tag: 'Admeet',
    tagColor: '#139A6E',
    tagBg: 'rgba(16, 185, 129, 0.12)',
    ctaLabel: 'Register',
  },
  {
    id: 'mod-guru-1',
    module: 'AdGuru',
    title: 'Amin Rammal — CEO, Synergy',
    subtitle: '1-on-1 Brand Strategy & Agency Leadership Mentorship',
    meta: '25 yrs experience • 4.9 ★',
    tag: 'AdGuru',
    tagColor: '#4F46E5',
    tagBg: 'rgba(79, 70, 229, 0.12)',
    ctaLabel: 'Book',
  },
  {
    id: 'mod-guru-2',
    module: 'AdGuru',
    title: 'Ayesha Tariq — Head of Marketing',
    subtitle: 'FMCG Brand Architecture & Portfolio Strategy',
    meta: '12 yrs experience • 5.0 ★',
    tag: 'AdGuru',
    tagColor: '#10B981',
    tagBg: 'rgba(16, 185, 129, 0.12)',
    ctaLabel: 'Book',
  },
  {
    id: 'mod-read-1',
    module: 'AdRead',
    title: "Lessons from 20 Years in Pakistan's Ad Industry",
    subtitle: 'The Guru Sessions • Audio & Video Podcast',
    meta: '32 min • Episode 14',
    tag: 'AdRead',
    tagColor: '#C83391',
    tagBg: 'rgba(200, 51, 145, 0.12)',
    ctaLabel: 'Play',
  },
  {
    id: 'mod-read-2',
    module: 'AdRead',
    title: 'Unpacking the Effies: What Won and Why',
    subtitle: 'AdRead Weekly • Creative Effectiveness Breakdown',
    meta: '28 min • Episode 19',
    tag: 'AdRead',
    tagColor: '#C83391',
    tagBg: 'rgba(200, 51, 145, 0.12)',
    ctaLabel: 'Play',
  },
];

export const toJobListing = (item: SearchOpportunity): JobListing => ({
  id: item.id,
  title: item.title,
  category: item.tag,
  subCategory: item.company,
  duration: item.duration,
  budget: item.budget,
  validTill: item.validTill,
  validTillFull: item.validTillFull,
  postedAt: item.posted === 'Today' ? 'Today' : item.posted,
  description:
    item.description ??
    `Join ${item.company} in ${item.location} for the ${item.title} role in ${item.tag}.`,
  postedBy: { name: item.company },
  featured: item.featured,
  image: item.image,
});
