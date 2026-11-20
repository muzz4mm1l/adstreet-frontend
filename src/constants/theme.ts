import '@/global.css';
import { Platform } from 'react-native';

/**
 * AdStreet Core Brand Colors
 */
export const BrandColors = {
  primary: '#E31E24',
  primaryHover: '#C8161B',
  primaryDark: '#A81218',
  primaryLight: '#FFF1F2',
  crimsonGradient: ['#A81218', '#E31E24'] as const,
  splashGradient: ['#5B161B', '#7A1E24', '#AC2128', '#C92029', '#E22029'] as const,
} as const;

/**
 * Canvas & Surface Tokens
 */
export const SurfaceColors = {
  canvas: '#FAFAFA',
  card: '#FFFFFF',
  cardSecondary: '#F5F5F7',
  borderHairline: 'rgba(0, 0, 0, 0.06)',
  borderLight: 'rgba(0, 0, 0, 0.10)',
  borderActive: '#E31E24',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textInverted: '#FFFFFF',
} as const;

/**
 * Module Ambient Top Wash Gradients (Vertical fade into Canvas #FAFAFA)
 */
export const ModuleTopWash = {
  auth: {
    start: '#FADADD',
    end: '#FAFAFA',
    colors: ['#FADADD', '#FAFAFA'] as const,
  },
  home: {
    start: '#FADADD',
    end: '#FAFAFA',
    colors: ['#FADADD', '#FAFAFA'] as const,
  },
  adBazaar: {
    start: '#FADADD',
    end: '#FAFAFA',
    colors: ['#FADADD', '#FAFAFA'] as const,
  },
  wallet: {
    start: '#FADADD',
    end: '#FAFAFA',
    colors: ['#FADADD', '#FAFAFA'] as const,
  },
  adBooks: {
    start: '#FDEBD0',
    end: '#FAFAFA',
    colors: ['#FDEBD0', '#FAFAFA'] as const,
  },
  adLeaks: {
    start: '#FDE2D2',
    end: '#FAFAFA',
    colors: ['#FDE2D2', '#FAFAFA'] as const,
  },
  adMeet: {
    start: '#D6EAF8',
    end: '#FAFAFA',
    colors: ['#D6EAF8', '#FAFAFA'] as const,
  },
  adGuru: {
    start: '#E5E7EB',
    end: '#FAFAFA',
    colors: ['#E5E7EB', '#FAFAFA'] as const,
  },
  adRead: {
    start: '#EFE0E2',
    end: '#FAFAFA',
    colors: ['#EFE0E2', '#FAFAFA'] as const,
  },
} as const;

/**
 * Signature Pastel Card Gradient (Blush -> White -> Sky Blue)
 */
export const SignaturePastelGradient = {
  colors: ['#FDE8EA', '#FFFFFF', '#D8EEFA'] as const,
  locations: [0, 0.5, 1] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;

/**
 * Radius Tokens
 */
export const Radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  card: 18,
  xl: 20,
  xxl: 24,
  pill: 999,
  full: 9999,
} as const;

/**
 * Spacing Scale
 */
export const Spacing = {
  none: 0,
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

/**
 * Typography Helpers
 */
export const Typography = {
  fontFamilies: {
    serif: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    sans: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'normal',
    }),
    mono: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
} as const;

/**
 * Reanimated 60fps Spring & Timing Presets
 */
export const AnimationPresets = {
  spring: {
    damping: 18,
    stiffness: 220,
    mass: 0.8,
  },
  gentleSpring: {
    damping: 24,
    stiffness: 180,
    mass: 1,
  },
  bouncySpring: {
    damping: 14,
    stiffness: 240,
    mass: 0.7,
  },
  pressScale: 0.96,
  durations: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
} as const;

/**
 * Cross-Platform Shadows & Elevations
 */
export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
    },
  }),
  floatingBar: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
    },
    android: {
      elevation: 6,
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
    },
  }),
  modal: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.18,
      shadowRadius: 28,
    },
    android: {
      elevation: 10,
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.18,
      shadowRadius: 28,
    },
  }),
  buttonGlow: Platform.select({
    ios: {
      shadowColor: '#E31E24',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: '#E31E24',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
  }),
} as const;

/**
 * Backward-compatible exports for existing components
 */
export const Colors = {
  light: {
    text: SurfaceColors.textPrimary,
    background: SurfaceColors.card,
    backgroundElement: SurfaceColors.canvas,
    backgroundSelected: '#FDE8EA',
    textSecondary: SurfaceColors.textSecondary,
    brandRed: BrandColors.primary,
  },
  dark: {
    text: '#FFFFFF',
    background: '#121214',
    backgroundElement: '#1F2023',
    backgroundSelected: '#2C1D20',
    textSecondary: '#A0A4AB',
    brandRed: BrandColors.primary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const FloatingBarBottomPadding = 96;
export const MaxContentWidth = 800;
