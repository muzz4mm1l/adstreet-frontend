import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkState } from 'expo-network';
import { useLocalSearchParams } from 'expo-router';
import Animated, {
  Easing,
  FadeInUp,
  FadeOutUp,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useIsPeek } from '@/components/navigation/SwipeBackContainer';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { DisplayFont } from '@/constants/fonts';
import { Shadows } from '@/constants/theme';
import { AppTheme } from '@/theme/colors';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';

/* -------------------------------------------------------------------------- */
/* Feed state                                                                 */
/* -------------------------------------------------------------------------- */

export type FeedStatus = 'loading' | 'ready' | 'error';

const LOAD_MS = 1100;
const REFRESH_MS = 900;

/**
 * Loading / refreshing / error state for the Home feed. The content is local dummy data today, so
 * the delay is simulated; swap `fetchFeed` for the real request when the API exists and the UI
 * states keep working. Dev: `/?screen=home&feed=error` makes the first load fail, `feed=slow` keeps the skeleton up.
 */
export function useHomeFeed() {
  const params = useLocalSearchParams<{ feed?: string }>();
  const inPeek = useIsPeek();
  // the frozen back-navigation preview must look like the finished screen, never a skeleton
  const [status, setStatus] = useState<FeedStatus>(inPeek ? 'ready' : 'loading');
  const [refreshing, setRefreshing] = useState(false);
  const failFirst = __DEV__ && params.feed === 'error';
  const slow = __DEV__ && params.feed === 'slow';
  const attempts = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFeed = useCallback(
    (ms: number, done: (ok: boolean) => void) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        attempts.current += 1;
        done(!(failFirst && attempts.current === 1));
      }, ms);
    },
    [failFirst],
  );

  useEffect(() => {
    if (inPeek) return;
    fetchFeed(slow ? 60000 : LOAD_MS, (ok) => setStatus(ok ? 'ready' : 'error'));
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [fetchFeed, inPeek, slow]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchFeed(REFRESH_MS, (ok) => {
      setRefreshing(false);
      setStatus(ok ? 'ready' : 'error');
    });
  }, [fetchFeed]);

  const retry = useCallback(() => {
    setStatus('loading');
    fetchFeed(LOAD_MS, (ok) => setStatus(ok ? 'ready' : 'error'));
  }, [fetchFeed]);

  return { status, refreshing, refresh, retry };
}

/* -------------------------------------------------------------------------- */
/* Skeletons                                                                  */
/* -------------------------------------------------------------------------- */

/** One shared breathing pulse per block (UI thread). Collapses to a flat tone with reduced motion. */
export const SkeletonBlock: React.FC<{
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ width = '100%', height, radius = 10, style }) => {
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(pulse);
  }, [reduceMotion, pulse]);

  const animated = useAnimatedStyle(() => ({ opacity: 0.55 + pulse.value * 0.45 }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: theme.skeleton }, animated, style]}
    />
  );
};

/** Mirrors the real sections below the categories so nothing jumps when content arrives. */
export const HomeSkeleton: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  return (
    <View accessibilityLabel="Loading" accessibilityRole="progressbar" style={styles.skeleton}>
      {/* shelf */}
      <SkeletonBlock width="55%" height={20} radius={6} />
      <View style={styles.skelRow}>
        <View style={styles.skelCard}>
          <SkeletonBlock height={92} radius={10} />
          <SkeletonBlock width="70%" height={12} radius={6} style={styles.skelCaption} />
        </View>
        <View style={styles.skelCard}>
          <SkeletonBlock height={92} radius={10} />
          <SkeletonBlock width="60%" height={12} radius={6} style={styles.skelCaption} />
        </View>
      </View>

      {/* feature rows */}
      <SkeletonBlock width="70%" height={26} radius={6} style={styles.skelHeading} />
      {[0, 1].map((i) => (
        <View key={i} style={styles.skelFeature}>
          <SkeletonBlock width={104} height={128} radius={18} />
          <View style={styles.skelFeatureText}>
            <SkeletonBlock width="45%" height={16} radius={8} />
            <SkeletonBlock width="85%" height={18} radius={6} />
            <SkeletonBlock height={12} radius={6} />
            <SkeletonBlock width="80%" height={12} radius={6} />
            <SkeletonBlock width={140} height={34} radius={17} />
          </View>
        </View>
      ))}

      {/* list rows */}
      <SkeletonBlock width="60%" height={26} radius={6} style={styles.skelHeading} />
      {[0, 1].map((i) => (
        <SkeletonBlock key={i} height={84} radius={20} style={styles.skelRowCard} />
      ))}
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Error / empty                                                              */
/* -------------------------------------------------------------------------- */

interface StateCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}

/** Centred message card. Used for both "couldn't load" and "nothing here yet". */
export const StateCard: React.FC<StateCardProps> = ({ icon, title, body, action, onAction }) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  return (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>
        <Ionicons name={icon} size={26} color={theme.primary} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateBody}>{body}</Text>
      {action ? (
        <HapticPressable
          haptic="light"
          borderRadius={999}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={action}
          style={styles.stateButton}>
          <Text style={styles.stateButtonText}>{action}</Text>
        </HapticPressable>
      ) : null}
    </View>
  );
};

export const FeedError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <StateCard
    icon="cloud-offline-outline"
    title="Couldn't load the latest"
    body="Check your connection and try again. Your categories are still available above."
    action="Try again"
    onAction={onRetry}
  />
);

export const EmptyState: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <StateCard icon="sparkles-outline" title={title} body={body} />
);

/* -------------------------------------------------------------------------- */
/* Offline banner                                                             */
/* -------------------------------------------------------------------------- */

/** Slides in under the status bar while the device has no connection. */
export const OfflineBanner: React.FC<{ top: number }> = ({ top }) => {
  const styles = useThemedStyles(createStyles);
  const net = useNetworkState();
  const offline = net.isConnected === false || net.isInternetReachable === false;
  if (!offline) return null;
  return (
    <Animated.View
      entering={FadeInUp.duration(260)}
      exiting={FadeOutUp.duration(200)}
      pointerEvents="none"
      accessibilityRole="alert"
      style={[styles.offline, { top }]}>
      <Ionicons name="cloud-offline-outline" size={15} color="#FFFFFF" />
      <Text style={styles.offlineText}>You're offline. Showing saved content.</Text>
    </Animated.View>
  );
};

/* -------------------------------------------------------------------------- */

const createStyles = (t: AppTheme) =>
  StyleSheet.create({
    skeleton: {
      gap: 14,
    },
    skelRow: {
      flexDirection: 'row',
      gap: 14,
    },
    skelCard: {
      width: 150,
      gap: 10,
    },
    skelCaption: {
      alignSelf: 'center',
    },
    skelHeading: {
      marginTop: 18,
    },
    skelFeature: {
      flexDirection: 'row',
      gap: 14,
      alignItems: 'center',
    },
    skelFeatureText: {
      flex: 1,
      gap: 8,
    },
    skelRowCard: {
      marginBottom: 2,
    },
    stateCard: {
      alignItems: 'center',
      paddingVertical: 28,
      paddingHorizontal: 22,
      gap: 8,
      borderRadius: 20,
      backgroundColor: t.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      ...Shadows.card,
    },
    stateIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.primaryTint,
      marginBottom: 4,
    },
    stateTitle: {
      fontFamily: DisplayFont.bold,
      fontSize: 19,
      lineHeight: 25,
      color: t.text,
      textAlign: 'center',
    },
    stateBody: {
      fontSize: 13.5,
      lineHeight: 20,
      color: t.textMuted,
      textAlign: 'center',
      maxWidth: 280,
    },
    stateButton: {
      marginTop: 10,
      backgroundColor: t.primary,
      paddingHorizontal: 24,
      paddingVertical: 11,
    },
    stateButtonText: {
      color: t.onPrimary,
      fontSize: 13.5,
      fontWeight: '600',
    },
    offline: {
      position: 'absolute',
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: 'rgba(20, 20, 24, 0.92)',
      zIndex: 50,
    },
    offlineText: {
      color: '#FFFFFF',
      fontSize: 12.5,
      fontWeight: '600',
    },
  });
