import React, { useCallback, useEffect, useRef } from 'react';
import { LayoutChangeEvent, Platform, Text, View, ViewStyle } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import Matter from 'matter-js';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { AdBazaarCloudCategory } from './adBazaarData';

/**
 * "Explore by Category": the pills start scattered and tilted, then fall under gravity, tumble,
 * bounce and pile up on the floor of the box, like React Bits' FallingText.
 *
 * Smoothness on Android comes from NOT simulating while it plays. The fall is simulated once with
 * matter-js in small time slices (before the section is even on screen) and recorded as a
 * keyframe track; playback is a UI-thread frame callback that interpolates the track, so the JS
 * thread is idle and the motion is as smooth as the display. Touching a pill, tilting or shaking
 * the phone hands the recorded state over to a live matter-js world (drag, throw, tilt gravity,
 * wall haptics) that is eased on the UI thread.
 */

interface Props {
  items: AdBazaarCloudCategory[];
  width: number;
  height: number;
  /** True while the section is on screen: starts the fall. False re-arms it. */
  active: boolean;
  selectedKey: string | null;
  onPressItem: (item: AdBazaarCloudCategory) => void;
  styles: {
    box: ViewStyle;
    pos: ViewStyle;
    pill: ViewStyle;
    pillSelected: ViewStyle;
    title: object;
    count: object;
  };
}

const STEP = 1000 / 60;
const WALL = 400;
const GRAVITY = 2.4;
const STAGGER_FRAMES = 6; // ~100 ms between pills dropping
const MAX_FRAMES = 330; // recording cap (5.5 s)
const SLICE_MS = 5; // max JS time per recording slice
const DEG = Math.PI / 180;

interface Piece {
  id: string;
  w: number;
  h: number;
  cx: number;
  cy: number;
  angle: number;
}

interface Track {
  frames: number[]; // flat: frame * n * 3 + piece * 3 + [dx, dy, rotation]
  count: number;
  events: number[]; // flat: [frame, strong(0|1), ...]
}

const CloudPill: React.FC<{
  item: AdBazaarCloudCategory;
  left: number;
  selected: boolean;
  onPress: () => void;
  onMeasure: (id: string, w: number, h: number) => void;
  index: number;
  shown: SharedValue<number[]>;
  styles: Props['styles'];
}> = ({ item, left, selected, onPress, onMeasure, index, shown, styles }) => {
  const poseStyle = useAnimatedStyle(() => {
    const f = shown.value;
    const o = index * 3;
    return {
      transform: [{ translateX: f[o] }, { translateY: f[o + 1] }, { rotate: `${f[o + 2]}rad` }],
    };
  });

  return (
    <Animated.View
      onLayout={(e: LayoutChangeEvent) =>
        onMeasure(item.id, e.nativeEvent.layout.width, e.nativeEvent.layout.height)
      }
      style={[styles.pos, { left, top: item.topPx }, poseStyle]}>
      <HapticPressable
        haptic="selection"
        scaleTo={0.94}
        borderRadius={14}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${item.label}, ${item.jobsCount}`}
        style={[styles.pill, selected && styles.pillSelected]}>
        <Text maxFontSizeMultiplier={1.25} style={[styles.title, { color: item.color }]} numberOfLines={1}>
          {item.label}
        </Text>
        <Text maxFontSizeMultiplier={1.25} style={styles.count}>
          {item.jobsCount}
        </Text>
      </HapticPressable>
    </Animated.View>
  );
};

/** Builds a matter world with walls and one body per piece. */
const makeWorld = (pieces: Piece[], width: number, height: number) => {
  const engine = Matter.Engine.create({ enableSleeping: true, positionIterations: 6, velocityIterations: 4 });
  engine.gravity.x = 0;
  engine.gravity.y = GRAVITY;
  const wallOpts = { isStatic: true, friction: 0.6 };
  const walls = [
    Matter.Bodies.rectangle(width / 2, height + WALL / 2, 10000, WALL, wallOpts),
    Matter.Bodies.rectangle(-WALL / 2, height / 2, WALL, 10000, wallOpts),
    Matter.Bodies.rectangle(width + WALL / 2, height / 2, WALL, 10000, wallOpts),
    Matter.Bodies.rectangle(width / 2, -WALL / 2, 10000, WALL, wallOpts),
  ];
  Matter.Composite.add(engine.world, walls);
  const bodies = pieces.map((p) =>
    Matter.Bodies.rectangle(p.cx, p.cy, p.w - 1, p.h - 1, {
      chamfer: { radius: 12 },
      angle: p.angle,
      restitution: 0.2,
      friction: 0.4,
      frictionStatic: 0.8,
      frictionAir: 0.012,
      density: 0.0015,
      slop: 0.02,
    }),
  );
  Matter.Composite.add(engine.world, bodies);
  return { engine, bodies, wallSet: new Set<Matter.Body>(walls) };
};

const ExploreCloudImpl: React.FC<Props> = ({
  items,
  width,
  height,
  active,
  selectedKey,
  onPressItem,
  styles,
}) => {
  const reduceMotion = useReducedMotion();
  const n = items.length;
  const initialPose = () => items.flatMap((item) => [0, 0, item.rotateDeg * DEG]);

  // UI-thread state ------------------------------------------------------------------------
  const shown = useSharedValue<number[]>(initialPose()); // what is drawn
  const target = useSharedValue<number[]>(initialPose()); // live physics output (mode 2)
  const trackFrames = useSharedValue<number[]>([]);
  const trackCount = useSharedValue(0);
  const trackEvents = useSharedValue<number[]>([]);
  const playhead = useSharedValue(0);
  const nextEvent = useSharedValue(0);
  const mode = useSharedValue(0); // 0 hold, 1 playback, 2 live (ease towards target)

  // JS-thread state --------------------------------------------------------------------------
  const sizes = useRef(new Map<string, { w: number; h: number }>());
  const [ready, setReady] = React.useState(false);
  const [trackReady, setTrackReady] = React.useState(false);
  const track = useRef<Track | null>(null); // the track being played
  const pending = useRef<Track | null>(null); // freshly recorded, swapped in at the next fall
  const recording = useRef(0); // token: cancels a stale recording
  const phase = useRef<'idle' | 'playing' | 'live'>('idle');
  const raf = useRef(0);
  const engineRef = useRef<Matter.Engine | null>(null);
  const liveBodies = useRef<Matter.Body[]>([]);
  const livePieces = useRef<Piece[]>([]);
  const wakeRef = useRef<() => void>(() => {});
  const dragRef = useRef<Matter.Constraint | null>(null);
  const dragEndedAt = useRef(0);
  const tilt = useRef({ x: 0, y: 1 });
  const lastRaw = useRef({ x: 0, y: 0 });
  const lastBuzz = useRef(0);

  const buzz = useCallback((strong: boolean) => {
    Haptics.impactAsync(
      strong ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => {});
  }, []);

  // UI-thread frame loop: playback of the recorded track + easing for the live world ------------
  const loop = useFrameCallback((info) => {
    'worklet';
    const m = mode.value;
    const dtMs = info.timeSincePreviousFrame ?? 16;
    if (m === 1) {
      const count = trackCount.value;
      if (count < 2) return;
      const last = count - 1;
      const ph = playhead.value + dtMs / STEP;
      const clamped = Math.min(ph, last);
      const i = Math.floor(clamped);
      const a = clamped - i;
      const j = Math.min(i + 1, last);
      const fr = trackFrames.value;
      const n3 = n * 3;
      const out = new Array<number>(n3);
      for (let k = 0; k < n3; k++) {
        const v0 = fr[i * n3 + k];
        out[k] = v0 + (fr[j * n3 + k] - v0) * a;
      }
      shown.value = out;
      playhead.value = clamped;
      const ev = trackEvents.value;
      let ne = nextEvent.value;
      while (ne * 2 < ev.length && ev[ne * 2] <= clamped) {
        scheduleOnRN(buzz, ev[ne * 2 + 1] === 1);
        ne++;
      }
      nextEvent.value = ne;
      if (ph >= last) mode.value = 0;
    } else if (m === 2) {
      const tg = target.value;
      const cur = shown.value;
      const k = 1 - Math.exp(-dtMs / 22);
      let moving = false;
      for (let q = 0; q < tg.length; q++) {
        if (Math.abs(tg[q] - cur[q]) > 0.002) {
          moving = true;
          break;
        }
      }
      if (!moving) return;
      const next = new Array<number>(tg.length);
      for (let q = 0; q < tg.length; q++) {
        const d = tg[q] - cur[q];
        next[q] = Math.abs(d) > 0.002 ? cur[q] + d * k : tg[q];
      }
      shown.value = next;
    }
  }, false);

  useEffect(() => {
    if (active) {
      loop.setActive(true);
      return;
    }
    const t = setTimeout(() => loop.setActive(false), 900);
    return () => clearTimeout(t);
  }, [active, loop]);

  const onMeasure = useCallback(
    (id: string, w: number, h: number) => {
      sizes.current.set(id, { w, h });
      if (sizes.current.size >= n) setReady(true);
    },
    [n],
  );

  const getPieces = useCallback((): Piece[] | null => {
    const pieces: Piece[] = [];
    for (const item of items) {
      const size = sizes.current.get(item.id);
      if (!size) return null;
      pieces.push({
        id: item.id,
        w: size.w,
        h: size.h,
        cx: (item.leftPct / 100) * width + size.w / 2,
        cy: item.topPx + size.h / 2,
        angle: item.rotateDeg * DEG,
      });
    }
    return pieces;
  }, [items, width]);

  // Recording: simulate the whole fall in small slices, off the critical path ------------------
  const record = useCallback(() => {
    const pieces = getPieces();
    if (!pieces || reduceMotion) return;
    const token = ++recording.current;
    const { engine, bodies, wallSet } = makeWorld(pieces, width, height);
    bodies.forEach((b) => Matter.Body.setStatic(b, true));
    const order = pieces.map((_, i) => i).sort(() => Math.random() - 0.5);
    const releaseAt = bodies.map((_, i) => order.indexOf(i) * STAGGER_FRAMES);
    const released = bodies.map(() => false);
    const frames: number[] = [];
    const events: number[] = [];
    let f = 0;
    let lastEventFrame = -10;
    let quiet = 0;

    Matter.Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const aWall = wallSet.has(pair.bodyA);
        const bWall = wallSet.has(pair.bodyB);
        if (aWall === bWall) continue;
        const body = aWall ? pair.bodyB : pair.bodyA;
        if (body.speed < 2.2 || f - lastEventFrame < 4) continue;
        lastEventFrame = f;
        events.push(f, body.speed > 9 ? 1 : 0);
        break;
      }
    });

    const pushState = () => {
      pieces.forEach((p, i) => {
        frames.push(bodies[i].position.x - p.cx, bodies[i].position.y - p.cy, bodies[i].angle);
      });
    };
    pushState(); // frame 0 = the scattered start pose

    const finish = () => {
      if (token !== recording.current) return;
      Matter.Composite.clear(engine.world, false);
      Matter.Engine.clear(engine);
      const count = frames.length / (n * 3);
      pending.current = { frames, count, events };
      setTrackReady(true);
    };

    const slice = () => {
      if (token !== recording.current) {
        Matter.Engine.clear(engine);
        return;
      }
      const t0 = Date.now();
      while (f < MAX_FRAMES && Date.now() - t0 < SLICE_MS) {
        f++;
        bodies.forEach((b, i) => {
          if (!released[i] && f >= releaseAt[i]) {
            released[i] = true;
            Matter.Body.setStatic(b, false);
            Matter.Sleeping.set(b, false);
            Matter.Body.setVelocity(b, { x: (Math.random() - 0.5) * 3, y: -Math.random() * 1.2 });
            Matter.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.06);
          }
        });
        Matter.Engine.update(engine, STEP);
        pushState();
        const allSettled = released.every(Boolean) && bodies.every((b) => b.isSleeping || b.speed < 0.05);
        quiet = allSettled ? quiet + 1 : 0;
        if (quiet > 24) break;
      }
      if (f >= MAX_FRAMES || quiet > 24) finish();
      else setTimeout(slice, 0);
    };
    setTimeout(slice, 0);
  }, [getPieces, reduceMotion, width, height, n]);

  useEffect(() => {
    if (ready) record();
    return () => {
      recording.current++;
    };
  }, [ready, record]);

  // Live world (after a touch / tilt / shake) -------------------------------------------------
  const stopLive = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
    if (engineRef.current) {
      Matter.Composite.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
      engineRef.current = null;
    }
    liveBodies.current = [];
    dragRef.current = null;
    wakeRef.current = () => {};
  }, []);

  /** Hands the current recorded pose (with its velocity) over to a live matter world. */
  const goLive = useCallback(() => {
    if (phase.current === 'live' || phase.current === 'idle') return;
    const tr = track.current;
    const pieces = getPieces();
    if (!tr || !pieces) return;
    const last = tr.count - 1;
    const idx = Math.min(Math.max(Math.floor(playhead.value), 1), last);
    const n3 = n * 3;
    const { engine, bodies, wallSet } = makeWorld(pieces, width, height);
    bodies.forEach((b, i) => {
      const o = idx * n3 + i * 3;
      const p = (idx - 1) * n3 + i * 3;
      const x = tr.frames[o] + pieces[i].cx;
      const y = tr.frames[o + 1] + pieces[i].cy;
      Matter.Body.setPosition(b, { x, y });
      Matter.Body.setAngle(b, tr.frames[o + 2]);
      Matter.Body.setVelocity(b, { x: tr.frames[o] - tr.frames[p], y: tr.frames[o + 1] - tr.frames[p + 1] });
      Matter.Body.setAngularVelocity(b, tr.frames[o + 2] - tr.frames[p + 2]);
    });
    engineRef.current = engine;
    liveBodies.current = bodies;
    livePieces.current = pieces;
    phase.current = 'live';
    target.value = shown.value;
    mode.value = 2;

    Matter.Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const aWall = wallSet.has(pair.bodyA);
        const bWall = wallSet.has(pair.bodyB);
        if (aWall === bWall) continue;
        const body = aWall ? pair.bodyB : pair.bodyA;
        const now = Date.now();
        if (body.speed < 2.2 || now - lastBuzz.current < 70) continue;
        lastBuzz.current = now;
        buzz(body.speed > 9);
        break;
      }
    });

    let last2 = 0;
    let acc = 0;
    const prev = bodies.map((b) => ({ x: b.position.x, y: b.position.y, a: b.angle }));
    const tick = (now: number) => {
      raf.current = 0;
      if (phase.current !== 'live' || engineRef.current !== engine) return;
      const dt = Math.min(50, last2 ? now - last2 : 16);
      last2 = now;
      engine.gravity.x = tilt.current.x * GRAVITY;
      engine.gravity.y = tilt.current.y * GRAVITY;
      acc += dt;
      while (acc >= STEP) {
        bodies.forEach((b, i) => {
          prev[i].x = b.position.x;
          prev[i].y = b.position.y;
          prev[i].a = b.angle;
        });
        Matter.Engine.update(engine, STEP);
        acc -= STEP;
      }
      const alpha = acc / STEP;
      const out = new Array<number>(n * 3);
      bodies.forEach((b, i) => {
        out[i * 3] = prev[i].x + (b.position.x - prev[i].x) * alpha - pieces[i].cx;
        out[i * 3 + 1] = prev[i].y + (b.position.y - prev[i].y) * alpha - pieces[i].cy;
        out[i * 3 + 2] = prev[i].a + (b.angle - prev[i].a) * alpha;
      });
      target.value = out;
      const settled = bodies.every((b) => b.isSleeping || b.speed < 0.05);
      if (settled && !dragRef.current) return; // rests until woken
      raf.current = requestAnimationFrame(tick);
    };
    wakeRef.current = () => {
      if (raf.current || engineRef.current !== engine) return;
      last2 = 0;
      raf.current = requestAnimationFrame(tick);
    };
    wakeRef.current();
  }, [getPieces, n, width, height, playhead, shown, target, mode, buzz]);

  const restore = useCallback(() => {
    stopLive();
    phase.current = 'idle';
    playhead.value = 0;
    nextEvent.value = 0;
    target.value = initialPose();
    mode.value = 2; // ease back to the scattered layout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopLive, playhead, nextEvent, target, mode]);

  const fall = useCallback(() => {
    if (phase.current !== 'idle' || reduceMotion) return;
    if (pending.current) {
      // swap in the newest recording while nothing is playing
      track.current = pending.current;
      pending.current = null;
      trackFrames.value = track.current.frames;
      trackEvents.value = track.current.events;
      trackCount.value = track.current.count;
    }
    if (!track.current) return;
    phase.current = 'playing';
    playhead.value = 0;
    nextEvent.value = 0;
    shown.value = initialPose();
    mode.value = 1;
    // simulate a fresh variation in the background for the next time
    setTimeout(record, 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, playhead, nextEvent, shown, mode, record, trackFrames, trackEvents, trackCount]);

  useEffect(() => {
    if (active && ready && trackReady) fall();
    if (!active && phase.current !== 'idle') restore();
  }, [active, ready, trackReady, fall, restore]);

  useEffect(
    () => () => {
      recording.current++;
      stopLive();
    },
    [stopLive],
  );

  // Tilt (accelerometer) -----------------------------------------------------------------------
  useEffect(() => {
    if (reduceMotion || !active) return;
    let sub: { remove: () => void } | null = null;
    let cancelled = false;
    Accelerometer.isAvailableAsync()
      .then((ok) => {
        if (!ok || cancelled) return;
        Accelerometer.setUpdateInterval(33);
        sub = Accelerometer.addListener(({ x, y }) => {
          // Android reports the accelerometer with the opposite sign to iOS.
          const sign = Platform.OS === 'android' ? -1 : 1;
          let gx = x * sign;
          let gy = -y * sign;
          const len = Math.hypot(gx, gy);
          if (len < 0.2) {
            gx = 0; // lying flat: keep a gentle downward pull
            gy = 1;
          } else {
            gx /= len;
            gy /= len;
          }
          const t = tilt.current;
          const nx = t.x + (gx - t.x) * 0.7;
          const ny = t.y + (gy - t.y) * 0.7;
          const moved = Math.hypot(nx - t.x, ny - t.y);
          tilt.current = { x: nx, y: ny };
          const jolt = Math.hypot(x - lastRaw.current.x, y - lastRaw.current.y);
          lastRaw.current = { x, y };
          const tiltedAway = Math.hypot(nx, ny - 1) > 0.22;
          if (phase.current === 'playing' && (tiltedAway || jolt > 0.25)) goLive();
          if (phase.current === 'live') {
            if (jolt > 0.1) {
              const kick = Math.min(jolt, 1.5) * 6;
              liveBodies.current.forEach((b) => {
                Matter.Sleeping.set(b, false);
                Matter.Body.setVelocity(b, {
                  x: b.velocity.x + (Math.random() - 0.5) * kick,
                  y: b.velocity.y - Math.random() * kick,
                });
                Matter.Body.setAngularVelocity(b, b.angularVelocity + (Math.random() - 0.5) * 0.08 * kick);
              });
              wakeRef.current();
            }
            if (moved > 0.01) {
              liveBodies.current.forEach((b) => Matter.Sleeping.set(b, false));
              wakeRef.current();
            }
          }
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      sub?.remove();
      tilt.current = { x: 0, y: 1 };
    };
  }, [active, reduceMotion, goLive]);

  // Hold a pill briefly, then drag and throw it (hands over to the live world) ------------------
  const pan = usePanGesture({
    runOnJS: true,
    activateAfterLongPress: 140,
    onActivate: (e) => {
      if (phase.current === 'idle') return;
      goLive();
      const engine = engineRef.current;
      if (!engine || dragRef.current) return;
      const point = { x: e.x, y: e.y };
      const hit = Matter.Query.point(liveBodies.current, point)[0];
      if (!hit) return;
      Matter.Sleeping.set(hit, false);
      const constraint = Matter.Constraint.create({
        pointA: point,
        bodyB: hit,
        pointB: { x: point.x - hit.position.x, y: point.y - hit.position.y },
        stiffness: 0.2,
        damping: 0.08,
        length: 0,
      });
      Matter.Composite.add(engine.world, constraint);
      dragRef.current = constraint;
      wakeRef.current();
    },
    onUpdate: (e) => {
      if (dragRef.current) dragRef.current.pointA = { x: e.x, y: e.y };
    },
    onFinalize: () => {
      const engine = engineRef.current;
      if (dragRef.current && engine) Matter.Composite.remove(engine.world, dragRef.current);
      if (dragRef.current) dragEndedAt.current = Date.now();
      dragRef.current = null;
      wakeRef.current();
    },
  });

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.box, { width, height }]}>
        {items.map((item, index) => (
          <CloudPill
            key={item.id}
            item={item}
            left={(item.leftPct / 100) * width}
            selected={selectedKey === item.filterKey}
            onPress={() => {
              if (dragRef.current || Date.now() - dragEndedAt.current < 350) return;
              onPressItem(item);
            }}
            onMeasure={onMeasure}
            index={index}
            shown={shown}
            styles={styles}
          />
        ))}
      </View>
    </GestureDetector>
  );
};

export const ExploreCloud = React.memo(ExploreCloudImpl);
