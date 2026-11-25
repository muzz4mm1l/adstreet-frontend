import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, darkTheme, lightTheme } from './colors';
import { useThemePreference } from './themePreference';

/** Theme from the user's choice (Light / Dark / System); System follows the phone setting. */
export function useAppTheme(): AppTheme {
  const system = useColorScheme();
  const preference = useThemePreference();
  const scheme = preference === 'system' ? system : preference;
  return scheme === 'dark' ? darkTheme : lightTheme;
}

/**
 * Builds a StyleSheet from the current theme, memoised per scheme:
 *   const createStyles = (t: AppTheme) => StyleSheet.create({ ... });
 *   const styles = useThemedStyles(createStyles);
 */
export function useThemedStyles<T>(factory: (t: AppTheme) => T): T {
  const theme = useAppTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(theme), [theme]);
}
