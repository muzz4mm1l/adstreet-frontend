/**
 * Semantic colour tokens for light and dark mode. Screens never hold raw hex for surfaces/text:
 * they read these through `useThemedStyles` / `useAppTheme`. Category colours (AdBazaar red,
 * AdLeaks orange, ...) are brand identity, not theme, so they stay in their modules.
 */
export interface AppTheme {
  scheme: 'light' | 'dark';
  canvas: string; // screen background
  surface: string; // cards, rows, sheets
  surfaceAlt: string; // input fills, image placeholders
  text: string; // primary text
  textSecondary: string;
  textMuted: string;
  border: string; // hairline borders
  divider: string; // section separator peak colour
  primary: string; // brand red (CTA, links, accents)
  onPrimary: string;
  primaryTint: string; // soft red wash (tags, chips)
  glass: string; // glass pills / floating UI fill
  skeleton: string;
  skeletonHighlight: string;
  /** Soft gradient washes used on highlighted cards. */
  washPink: string;
  washBlue: string;
  /** Subtle page-level top wash. */
  topWash: readonly [string, string];
  shadow: string;
  scrim: string;
  statusBar: 'light' | 'dark';
}

export const lightTheme: AppTheme = {
  scheme: 'light',
  canvas: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceAlt: '#ECEEF2',
  text: '#1F2024',
  textSecondary: '#4B5563',
  textMuted: '#7A7F87',
  border: 'rgba(0, 0, 0, 0.08)',
  divider: 'rgba(0, 0, 0, 0.16)',
  primary: '#E31E24',
  onPrimary: '#FFFFFF',
  primaryTint: '#FBE1E3',
  glass: 'rgba(255, 255, 255, 0.92)',
  skeleton: '#E6E8EC',
  skeletonHighlight: '#F4F5F7',
  washPink: '#FBE1E3',
  washBlue: '#CDE8F8',
  topWash: ['#FADADD', '#FAFAFA'],
  shadow: '#000000',
  scrim: 'rgba(0, 0, 0, 0.45)',
  statusBar: 'dark',
};

export const darkTheme: AppTheme = {
  scheme: 'dark',
  canvas: '#0F0F12',
  surface: '#1A1A1F',
  surfaceAlt: '#26262D',
  text: '#F3F4F6',
  textSecondary: '#C2C6CD',
  textMuted: '#8D929B',
  border: 'rgba(255, 255, 255, 0.10)',
  divider: 'rgba(255, 255, 255, 0.22)',
  primary: '#FF4048',
  onPrimary: '#FFFFFF',
  primaryTint: '#3A1519',
  glass: 'rgba(32, 32, 38, 0.92)',
  skeleton: '#26262D',
  skeletonHighlight: '#33333C',
  washPink: '#3A1D22',
  washBlue: '#1B2D3D',
  topWash: ['#2A1316', '#0F0F12'],
  shadow: '#000000',
  scrim: 'rgba(0, 0, 0, 0.6)',
  statusBar: 'light',
};

/** `#RRGGBB` + alpha (0..1) -> `#RRGGBBAA`, for tinted chips that work on both themes. */
export const withAlpha = (hex: string, alpha: number): string => {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
};
