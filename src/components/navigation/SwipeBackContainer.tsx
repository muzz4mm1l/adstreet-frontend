import React, {
  createContext,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  I18nManager,
  Keyboard,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  LayoutAnimationConfig,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AnimationPresets } from '@/constants/theme';

/** Width of the screen-edge strip that starts the swipe-back gesture. */
const EDGE_WIDTH = 28;
/** Release past this fraction of the screen width commits the back navigation. */
const COMMIT_FRACTION = 0.35;
/** ...or a flick faster than this (px/s). */
const COMMIT_VELOCITY = 650;
/** How far (fraction of width) the screen underneath starts offset, for the parallax. */
const PEEK_PARALLAX = 0.28;
const DIM_OPACITY = 0.16;
const SLIDE_MS = 300;
// iOS push/pop curve
const SLIDE_EASING = Easing.bezier(0.32, 0.72, 0, 1);
/**
 * Safety net only: start the slide even if the preview layer never reports its layout.
 * Deliberately long - on a slow phone a heavy preview can take hundreds of ms to lay out, and
 * starting the slide early would show an empty frame underneath.
 */
const PEEK_LAYOUT_TIMEOUT_MS = 1500;

export type BackSource = 'hardware' | 'button' | 'gesture';

export interface SwipeBackHandle {
  /** Triggers the same back transition as the hardware button / swipe. */
  goBack: () => void;
  /**
   * Call after `onBack(source, true)` if the parent decides NOT to navigate: the screen slides
   * back in. There is intentionally no timeout doing this automatically - a timer would pull the
   * old screen back over the new one whenever the navigation merely takes long (slow phones).
   */
  cancelBack: () => void;
}

export interface SwipeBackContainerProps {
  children: React.ReactNode;
  /**
   * Called when the user goes back. `slid` is true when the container already played
   * the slide-out, so the parent should swap screens WITHOUT its own transition.
   * Contract: after `slid === true` the parent MUST navigate (change `resetKey` or unmount this
   * container) or call `cancelBack()`; otherwise the screen stays off-screen.
   */
  onBack?: (source: BackSource, slid: boolean) => void;
  enabled?: boolean;
  /**
   * Renders the screen revealed underneath while this one slides away. It is mounted only
   * while a back transition is running. Without it, back is instant (no slide) and the
   * edge swipe is disabled.
   */
  renderPrevious?: () => React.ReactNode;
  /** Opaque layer colour so the previous screen never shows through transparent areas. */
  backgroundColor?: string;
  /** Set false where an edge swipe would fight another horizontal gesture (e.g. a pager). */
  gestureEnabled?: boolean;
  /**
   * Change this when the parent has committed the back navigation (e.g. the step number),
   * so the container snaps its layers back to rest.
   */
  resetKey?: string | number;
  ref?: React.Ref<SwipeBackHandle>;
}

/** True inside the "previous screen" preview layer: nested containers/status bars go inert. */
const PeekContext = createContext(false);
export const useIsPeek = () => useContext(PeekContext);

/**
 * Cross-platform back navigation.
 * - Android: hardware back button and system back gesture (via BackHandler; RN 0.88 forwards
 *   the enforced predictive-back callback of targetSdk 36 to it).
 * - iOS (and web): interactive left-edge swipe. The current screen follows the finger and the
 *   previous screen is revealed underneath with a parallax + dim, like a native pop.
 * - Hardware / header-button back plays the same slide-out, so every back path feels identical.
 * Everything per-frame runs on the UI thread; JS only runs when the transition commits.
 */
export const SwipeBackContainer: React.FC<SwipeBackContainerProps> = (props) => {
  const inPeek = useIsPeek();
  if (inPeek) {
    return <View style={styles.fill}>{props.children}</View>;
  }
  return <ActiveSwipeBackContainer {...props} />;
};

const ActiveSwipeBackContainer: React.FC<SwipeBackContainerProps> = ({
  children,
  onBack,
  enabled = true,
  renderPrevious,
  backgroundColor = '#FAFAFA',
  gestureEnabled = true,
  resetKey,
  ref,
}) => {
  const { width: W } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const rtl = I18nManager.isRTL;
  const dir = rtl ? -1 : 1;

  // 0 = at rest, W = fully slid away
  const x = useSharedValue(0);
  // 1 while a back transition is committed (blocks double triggers)
  const locked = useSharedValue(0);
  // The preview is captured ONCE when the transition starts and then frozen. Re-asking the
  // parent every render would swap it for "the previous screen of the NEW step" the moment the
  // parent navigates (e.g. Login's own previous is Onboarding), flashing the wrong screen.
  const [peek, setPeek] = useState<{ node: React.ReactNode } | null>(null);

  const peekingRef = useRef(false);
  const slidCommitted = useRef(false);
  const alive = useRef(true);
  const pendingSlide = useRef<BackSource | null>(null);
  const layoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetFrame = useRef<number | null>(null);

  // Latest props for BackHandler / worklet callbacks, so they never go stale (e.g. after a
  // window resize on foldables / split screen).
  const latest = useRef({ onBack, renderPrevious, reduceMotion, width: W });
  useEffect(() => {
    latest.current = { onBack, renderPrevious, reduceMotion, width: W };
  });

  const showPeek = (visible: boolean) => {
    if (visible && peekingRef.current) return; // already showing the captured preview
    peekingRef.current = visible;
    setPeek(visible ? { node: latest.current.renderPrevious?.() ?? null } : null);
  };

  const clearTimers = () => {
    if (layoutTimer.current) {
      clearTimeout(layoutTimer.current);
      layoutTimer.current = null;
    }
  };

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimers();
      if (resetFrame.current !== null) cancelAnimationFrame(resetFrame.current);
    };
  }, []);

  // Reveal the (new) current screen and only then drop the preview. The UI thread confirms the
  // reveal through the animation callback, so the preview is never removed a frame early
  // (which would flash an empty frame).
  const revealCurrent = () => {
    locked.value = 0;
    x.value = withTiming(0, { duration: 1 }, (finished) => {
      'worklet';
      if (finished) scheduleOnRN(dropPreview);
    });
  };

  const dropPreview = () => {
    if (alive.current) showPeek(false);
  };

  const resetLayers = () => {
    clearTimers();
    pendingSlide.current = null;
    if (resetFrame.current !== null) {
      cancelAnimationFrame(resetFrame.current);
      resetFrame.current = null;
    }

    if (!slidCommitted.current) {
      // Nothing slid away (e.g. a forward navigation): just make sure we are at rest.
      x.value = 0;
      locked.value = 0;
      return;
    }

    // If resetKey is undefined, this container does not have internal steps (it exited as a whole screen).
    // It must stay off-screen (x = W) until unmounted rather than revealing itself again.
    if (resetKey === undefined) {
      return;
    }

    // The parent navigated after a committed slide. The new screen is mounting in the current
    // layer (still off-screen) under an identical preview. Give it two frames to mount and lay
    // out before revealing it, so images/gradients are ready and nothing pops in.
    slidCommitted.current = false;
    resetFrame.current = requestAnimationFrame(() => {
      resetFrame.current = requestAnimationFrame(() => {
        resetFrame.current = null;
        if (alive.current) revealCurrent();
      });
    });
  };

  useEffect(() => {
    resetLayers();
  }, [resetKey]);

  const commit = (source: BackSource, slid: boolean) => {
    if (!alive.current) return;
    // Programmatic back already gave its haptic when it started; a swipe gives it on release.
    if (!slid || source === 'gesture') {
      Keyboard.dismiss();
      Haptics.selectionAsync().catch(() => {});
    }
    // set before notifying the parent: its re-render triggers resetLayers
    if (slid) slidCommitted.current = true;
    latest.current.onBack?.(source, slid);
  };

  // The parent chose not to navigate after a committed slide: bring the screen back.
  const cancelBack = () => {
    if (!alive.current || !slidCommitted.current) return;
    slidCommitted.current = false;
    locked.value = 0;
    x.value = withSpring(0, AnimationPresets.spring, (finished) => {
      'worklet';
      if (finished) scheduleOnRN(dropPreview);
    });
  };

  const startPendingSlide = () => {
    const source = pendingSlide.current;
    if (!source) return;
    pendingSlide.current = null;
    if (layoutTimer.current) {
      clearTimeout(layoutTimer.current);
      layoutTimer.current = null;
    }
    x.value = withTiming(
      latest.current.width,
      { duration: SLIDE_MS, easing: SLIDE_EASING },
      (finished) => {
        'worklet';
        if (finished) scheduleOnRN(commit, source, true);
      }
    );
  };

  const slideOut = (source: BackSource) => {
    locked.value = 1;
    pendingSlide.current = source;
    // Respond to the press immediately; the transition itself takes ~300ms.
    Keyboard.dismiss();
    Haptics.selectionAsync().catch(() => {});
    if (peekingRef.current) {
      startPendingSlide();
    } else {
      showPeek(true);
      // The slide starts when the preview layer has actually laid out (onLayout below), so a
      // heavy previous screen never mounts mid-animation. This timer is only a safety net.
      layoutTimer.current = setTimeout(startPendingSlide, PEEK_LAYOUT_TIMEOUT_MS);
    }
  };

  const goBack = (source: BackSource) => {
    const { onBack: callback, renderPrevious: previous, reduceMotion: reduced } = latest.current;
    if (!callback || locked.value) return;
    if (previous && !reduced) {
      slideOut(source);
    } else {
      commit(source, false);
    }
  };

  useImperativeHandle(ref, () => ({ goBack: () => goBack('button'), cancelBack }));

  // Android hardware back button + system back gesture
  const backActive = enabled && !!onBack;
  useEffect(() => {
    if (!backActive) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!locked.value) goBack('hardware');
      return true; // consume: never exit the app from a screen that handles back
    });
    return () => subscription.remove();
  }, [backActive]);

  // Interactive edge swipe: iOS + web. On Android the system owns the edge gesture and
  // delivers it through BackHandler above, so our own pan stays off to avoid double handling.
  const panEnabled =
    gestureEnabled && enabled && !!onBack && !!renderPrevious && Platform.OS !== 'android';

  const finishGesture = () => commit('gesture', true);

  const pan = usePanGesture({
    enabled: panEnabled,
    hitSlop: rtl ? { right: 0, width: EDGE_WIDTH } : { left: 0, width: EDGE_WIDTH },
    activeOffsetX: rtl ? -12 : 12,
    failOffsetY: [-24, 24],
    onBegin: () => {
      'worklet';
      if (!locked.value) scheduleOnRN(showPeek, true);
    },
    onUpdate: (e) => {
      'worklet';
      if (locked.value) return;
      x.value = Math.min(Math.max(x.value + e.changeX * dir, 0), W);
    },
    onDeactivate: (e) => {
      'worklet';
      if (locked.value) return;
      const velocity = e.velocityX * dir;
      if (x.value > W * COMMIT_FRACTION || velocity > COMMIT_VELOCITY) {
        locked.value = 1;
        const remaining = W - x.value;
        const duration = Math.min(Math.max((remaining / Math.max(velocity, 900)) * 1000, 140), 300);
        x.value = withTiming(
          W,
          { duration, easing: Easing.out(Easing.cubic) },
          (finished) => {
            'worklet';
            if (finished) scheduleOnRN(finishGesture);
          }
        );
      } else {
        x.value = withSpring(0, AnimationPresets.spring, (finished) => {
          'worklet';
          if (finished) scheduleOnRN(showPeek, false);
        });
      }
    },
    onFinalize: () => {
      'worklet';
      // touch that never became a drag: drop the preview again
      if (x.value < 1 && !locked.value) scheduleOnRN(showPeek, false);
    },
  });

  const currentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dir * x.value }],
  }));
  const peekStyle = useAnimatedStyle(() => {
    const progress = Math.min(Math.max(x.value / W, 0), 1);
    return { transform: [{ translateX: -dir * PEEK_PARALLAX * W * (1 - progress) }] };
  });
  const dimStyle = useAnimatedStyle(() => ({
    opacity: DIM_OPACITY * (1 - Math.min(Math.max(x.value / W, 0), 1)),
  }));
  // Fades in as the screen leaves the edge and OUT again as it exits on the far side: when the
  // screen is fully gone its shadow strip would otherwise sit on the opposite screen edge for as
  // long as the swap takes (about a second on a slow phone).
  const edgeShadowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, 24, W - 36, W], [0, 1, 1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View style={[styles.fill, { backgroundColor }]}>
      {peek ? (
        <Animated.View
          pointerEvents="none"
          onLayout={startPendingSlide}
          style={[StyleSheet.absoluteFill, peekStyle]}>
          {/* The preview must be static: replaying its entering animations (cards sliding in,
              fades) made the revealed screen visibly move before it settled. */}
          <LayoutAnimationConfig skipEntering skipExiting>
            <PeekContext.Provider value>{peek.node}</PeekContext.Provider>
          </LayoutAnimationConfig>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.dim, dimStyle]}
          />
        </Animated.View>
      ) : null}

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.fill, { backgroundColor }, currentStyle]}>
          {children}
          {/* soft shadow the sliding screen casts onto the one underneath */}
          <Animated.View
            pointerEvents="none"
            style={[styles.edgeShadow, rtl ? styles.edgeShadowEnd : styles.edgeShadowStart, edgeShadowStyle]}>
            <LinearGradient
              colors={
                rtl
                  ? ['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0)']
                  : ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.2)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    overflow: 'hidden',
  },
  dim: {
    backgroundColor: '#000000',
  },
  edgeShadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 18,
  },
  edgeShadowStart: {
    left: -18,
  },
  edgeShadowEnd: {
    right: -18,
  },
});
