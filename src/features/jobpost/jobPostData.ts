export type JobListingStatus = 'Active' | 'Filled' | 'Expired' | 'Closed';

export interface JobPostDraft {
  id?: string;
  title: string;
  company: string;
  category: string;
  duration: string;
  location: string;
  budget: string;
  validTillDate: string;
  description: string;
  photoUri?: string | null;
}

export interface PostedJobItem {
  id: string;
  initials: string;
  avatarColors: readonly [string, string];
  title: string;
  company: string;
  location: string;
  category: string;
  postedLabel: string;
  budget: string;
  validTillDate: string;
  description: string;
  status: JobListingStatus;
  photoUri?: string | null;
}

export interface MyGigItem {
  id: string;
  title: string;
  summary: string;
  startsFrom: string;
  deliveryTime: string;
  category: string;
  status: JobListingStatus;
}

export interface TalentService {
  id: string;
  title: string;
  description: string;
  startsFrom: string;
  deliveryTime: string;
}

export interface TalentPortfolioItem {
  id: string;
  title: string;
  image: number;
  category: string;
}

export interface TalentReview {
  id: string;
  author: string;
  rating: number;
  quote: string;
}

export const INITIAL_POSTED_JOBS: PostedJobItem[] = [
  {
    id: 'my-job-1',
    initials: 'HR',
    avatarColors: ['#D34E53', '#E4898C'],
    title: 'Copywriter',
    company: 'Grey Advertising',
    location: 'Karachi',
    category: 'Creative',
    postedLabel: 'Just now',
    budget: '70k-80k',
    validTillDate: '26-Sep-2026',
    description:
      'Craft persuasive ATL, BTL, and social copy for fast-moving consumer brand launches across Pakistan.',
    status: 'Active',
  },
  {
    id: 'my-job-2',
    initials: 'BD',
    avatarColors: ['#2CA6A4', '#63C9C7'],
    title: 'Brand Designer',
    company: 'Pakistan Creative Web',
    location: 'Karachi',
    category: 'Creative',
    postedLabel: 'Just now',
    budget: '70k-80k',
    validTillDate: '26-Sep-2026',
    description:
      'Build visual identities, typography guides, and digital launch assets for emerging brands.',
    status: 'Filled',
  },
  {
    id: 'my-job-3',
    initials: 'PM',
    avatarColors: ['#2196F3', '#60B7FA'],
    title: 'PR Manager',
    company: 'Grey Advertising',
    location: 'Karachi',
    category: 'PR & Comms',
    postedLabel: 'Just now',
    budget: '70k-80k',
    validTillDate: '26-Sep-2026',
    description:
      'Lead media outreach, creator partnerships, and press launch activations.',
    status: 'Expired',
  },
];

export const MY_INITIAL_GIGS: MyGigItem[] = [
  {
    id: 'my-gig-1',
    title: 'UI/UX Design',
    summary:
      'We design intuitive, engaging digital experiences built around real user needs across mobile apps and web platforms.',
    startsFrom: '20k-25k',
    deliveryTime: '1 week',
    category: 'Digital Design',
    status: 'Active',
  },
  {
    id: 'my-gig-2',
    title: 'Copywriting',
    summary:
      'Clear, compelling campaign copy that connects with your audience across websites, social ads, and launches.',
    startsFrom: '15k',
    deliveryTime: '3 days',
    category: 'Content & Copy',
    status: 'Active',
  },
  {
    id: 'my-gig-3',
    title: 'Brand Designing',
    summary:
      'Memorable visual identities, logos, and campaign systems that give your brand a consistent presence.',
    startsFrom: '30k',
    deliveryTime: '2 weeks',
    category: 'Branding',
    status: 'Active',
  },
];

export const TALENT_PROFILE = {
  name: 'Abdullah Amir',
  location: 'Karachi',
  avatar: require('@/assets/images/jobpost/avatar-sample.jpg'),
  rankBadge: require('@/assets/images/jobpost/rank-star.png'),
  aboutParagraphs: [
    'Multidisciplinary product designer and creative strategist with over 6 years shaping digital products, agency campaigns, and high-converting brand systems across Pakistan and the MENA region.',
    'Focused on translating complex business goals into clean mobile experiences, cohesive visual languages, and launch-ready social creative that audiences recognize immediately.',
  ],
  services: [
    {
      id: 'srv-1',
      title: 'UI/UX Design',
      description:
        'We design intuitive, engaging digital experiences that are easy to use and built around real user needs. From websites and mobile apps to complete product experiences.',
      startsFrom: '20k-25k',
      deliveryTime: '1 week',
    },
    {
      id: 'srv-2',
      title: 'Copywriting',
      description:
        'We create clear, compelling copy that connects with your audience and strengthens your brand. From website content and ads to social media and marketing campaigns.',
      startsFrom: '15k',
      deliveryTime: '3 days',
    },
    {
      id: 'srv-3',
      title: 'Brand Designing',
      description:
        'We build memorable visual identities that give your brand a consistent and distinctive presence. From logos and brand systems to social media and marketing visuals.',
      startsFrom: '30k',
      deliveryTime: '2 weeks',
    },
  ] as TalentService[],
  portfolio: [
    {
      id: 'port-1',
      title: 'Social Media Posts',
      image: require('@/assets/images/jobpost/portfolio-1.jpg'),
      category: 'Campaign Socials',
    },
    {
      id: 'port-2',
      title: 'Website Redesign',
      image: require('@/assets/images/jobpost/portfolio-2.jpg'),
      category: 'Web Experience',
    },
    {
      id: 'port-3',
      title: 'Mobile App Screens',
      image: require('@/assets/images/jobpost/portfolio-3.jpg'),
      category: 'iOS & Android UI',
    },
    {
      id: 'port-4',
      title: 'Dashboard Design',
      image: require('@/assets/images/jobpost/portfolio-4.jpg'),
      category: 'SaaS Product',
    },
  ] as TalentPortfolioItem[],
  reviews: [
    {
      id: 'rev-1',
      author: 'Jibran Ali',
      rating: 5,
      quote:
        '"We design intuitive, engaging digital experiences that are easy to use and built around real user needs. From websites and mobile apps to complete product experiences."',
    },
    {
      id: 'rev-2',
      author: 'Adeel Haider',
      rating: 5,
      quote:
        '"We create clear, compelling copy that connects with your audience and strengthens your brand. From website content and ads to social media and marketing campaigns."',
    },
    {
      id: 'rev-3',
      author: 'Burhan Sheikh',
      rating: 5,
      quote:
        '"We build memorable visual identities that give your brand a consistent and distinctive presence. From logos and brand systems to social media and marketing visuals."',
    },
  ] as TalentReview[],
};

export const POST_JOB_CATEGORIES = [
  'Creative',
  'Content Creators',
  'Digital Marketing',
  'Media Buying',
  'PR & Comms',
  'Strategy',
  'AI',
  'Architecture + Design',
] as const;

export const POST_JOB_DURATIONS = [
  '2 Weeks',
  '1 Month',
  '2 Month(s)',
  '3 Month(s)',
  '6 Month(s)',
  'Full Time',
] as const;

export const POST_JOB_LOCATIONS = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Remote',
] as const;

export const POST_JOB_BUDGETS = [
  '35k-50k',
  '50k-70k',
  '70k-80k',
  '80k-120k',
  '120k+',
] as const;

export const POST_JOB_DATES = [
  '26-Sep-2026',
  '15-Oct-2026',
  '30-Nov-2026',
  '12-Feb-2027',
] as const;

export const makeCompanyInitials = (name: string): string => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'AD';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};
