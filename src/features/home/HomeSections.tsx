import React, { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { Image } from 'expo-image';
import { DisplayFont } from '@/constants/fonts';
import { BrandColors, Shadows } from '@/constants/theme';
import { withAlpha } from '@/theme/colors';
import { useAppTheme } from '@/theme/useAppTheme';
import { AppTheme } from '@/theme/colors';
import { useThemedStyles } from '@/theme/useAppTheme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Stops = readonly [string, string, ...string[]];

const RED = BrandColors.primary;
const SERIF = DisplayFont.bold;
const PAGE_PAD = 20;
const BANNER_RADIUS = 16;
const BANNER_ASPECT = 2.34; // advision-banner.jpg is 1170 x 500

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                              */
/* -------------------------------------------------------------------------- */

interface TitlePart {
  text: string;
  accent?: boolean;
}

/** Serif title where one phrase is picked out in brand red, as in the design. */
const TwoToneTitle: React.FC<{ parts: TitlePart[]; center?: boolean; size?: number }> = ({
  parts,
  center,
  size = 27,
}) => {
  const styles = useThemedStyles(createStyles);
  return (
  <Text
    accessibilityRole="header"
    style={[styles.title, { fontSize: size, lineHeight: size * 1.25 }, center && styles.center]}>
    {parts.map((p, i) => (
      <Text key={i} style={p.accent ? styles.titleAccent : undefined}>
        {p.text}
      </Text>
    ))}
  </Text>
  );
};

interface SectionHeaderProps {
  tag: string;
  tagColor: string;
  tagBg: string;
  title: TitlePart[];
  action?: string;
  onAction?: () => void;
  center?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  tag,
  tagColor,
  tagBg,
  title,
  action,
  onAction,
  center,
}) => {
  const styles = useThemedStyles(createStyles);
  return (
  <View style={[styles.sectionHeader, center && styles.sectionHeaderCenter]}>
    <View style={[styles.headerText, center && styles.headerTextCenter]}>
      <View style={[styles.tag, { backgroundColor: withAlpha(tagColor, 0.16) }]}>
        <Text style={[styles.tagText, { color: tagColor }]}>{tag}</Text>
      </View>
      <TwoToneTitle parts={title} center={center} />
    </View>
    {action ? (
      <HapticPressable
        haptic="selection"
        scaleTo={0.96}
        borderRadius={8}
        onPress={onAction}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={action}
        style={styles.action}>
        <Text style={styles.actionText}>{action}</Text>
      </HapticPressable>
    ) : null}
  </View>
  );
};

interface RedButtonProps {
  label: string;
  onPress?: () => void;
  size?: 'sm' | 'md';
  fill?: boolean;
  pill?: boolean;
}

const RedButton: React.FC<RedButtonProps> = ({ label, onPress, size = 'md', fill, pill }) => {
  const styles = useThemedStyles(createStyles);
  return (
  <HapticPressable
    haptic="light"
    borderRadius={pill ? 999 : size === 'sm' ? 9 : 11}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={[styles.redButton, size === 'sm' && styles.redButtonSm, fill && styles.fill]}>
    <Text style={[styles.redButtonText, size === 'sm' && styles.redButtonTextSm]}>{label}</Text>
  </HapticPressable>
  );
};

const Chip: React.FC<{ label: string; color: string; bg: string }> = ({ label, color, bg }) => {
  const styles = useThemedStyles(createStyles);
  return (
  <View style={[styles.chip, { backgroundColor: withAlpha(color, 0.16) }]}>
    <Text style={[styles.chipText, { color }]} numberOfLines={1}>
      {label}
    </Text>
  </View>
  );
};

/** Soft separator between Home sections: a hairline that fades out at both ends. */
export const SectionDivider: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  return (
  <View style={styles.divider} pointerEvents="none" accessibilityElementsHidden>
    <LinearGradient
      colors={[theme.divider.replace(/[\d.]+\)$/, '0)'), theme.divider, theme.divider.replace(/[\d.]+\)$/, '0)')]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.dividerLine}
    />
  </View>
  );
};

/** Photo slot: shows `image` when provided, otherwise a tinted placeholder. */
const Photo: React.FC<{ tint: Stops; icon: IconName; style?: object }> = ({ tint, icon, style }) => {
  const styles = useThemedStyles(createStyles);
  return (
  <LinearGradient colors={tint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.photo, style]}>
    <Ionicons name={icon} size={30} color="rgba(255,255,255,0.9)" />
  </LinearGradient>
  );
};

/** Page-dot indicator: red pill for the active page, grey dots for the rest. */
const Dots: React.FC<{ count: number; active: number }> = ({ count, active }) => {
  const styles = useThemedStyles(createStyles);
  return (
  <View style={styles.dotsWrap}>
    <View style={styles.dotsPill}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
      ))}
    </View>
  </View>
  );
};

interface StripProps {
  cardWidth: number;
  gap?: number;
  count: number;
  children: React.ReactNode;
}

/** Edge-bleeding horizontal card strip with snapping and page dots. */
const Strip: React.FC<StripProps> = ({ cardWidth, gap = 12, count, children }) => {
  const styles = useThemedStyles(createStyles);
  const [active, setActive] = useState(0);
  const step = cardWidth + gap;
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / step);
    setActive(Math.min(Math.max(i, 0), count - 1));
  };
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={step}
        onMomentumScrollEnd={onEnd}
        style={styles.strip}
        contentContainerStyle={[styles.stripContent, { gap }]}>
        {children}
      </ScrollView>
      <Dots count={count} active={active} />
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Built for Everyone                                                         */
/* -------------------------------------------------------------------------- */

interface Audience {
  id: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  title: string;
  body: string;
  cta: string;
  image: number;
}

const AUDIENCES: Audience[] = [
  {
    id: 'pro',
    tag: 'Professionals & Job Seekers',
    tagColor: '#2A7CB8',
    tagBg: '#DCEEFA',
    title: 'Your Career, Accelerated.',
    body: 'Find jobs, connect with Gurus, attend events, and keep learning. Everything you need to grow in Pakistan\'s marketing and advertising industry.',
    cta: 'Join as a Professional',
    image: require('@/assets/images/home/audience-professionals.jpg'),
  },
  {
    id: 'company',
    tag: 'Agencies & Brands',
    tagColor: '#139A6E',
    tagBg: '#D9F2E8',
    title: 'Find Talent. Build Visibility.',
    body: 'Post jobs, list your company in Pakistan\'s most comprehensive industry directory, and connect with the right people.',
    cta: 'Join as a Company',
    image: require('@/assets/images/home/audience-companies.jpg'),
  },
  {
    id: 'guru',
    tag: 'Industry Gurus',
    tagColor: '#B58A12',
    tagBg: '#FBF0CC',
    title: 'Share Your Knowledge.',
    body: 'Create your Guru profile, offer sessions, speak at events, and contribute to the platform that the next generation of marketers learns from.',
    cta: 'Join as a Guru',
    image: require('@/assets/images/home/audience-gurus.jpg'),
  },
];

export const BuiltForEveryone: React.FC<{ onJoin?: (id: string) => void }> = ({ onJoin }) => {
  const styles = useThemedStyles(createStyles);
  return (
  <View style={styles.block}>
    <SectionHeader
      center
      tag="Who AdStreet Is For"
      tagColor={RED}
      tagBg="#FBE1E3"
      title={[{ text: 'Built for ' }, { text: 'Everyone', accent: true }, { text: '\nin the Industry' }]}
    />
    {AUDIENCES.map((a, i) => (
      <Animated.View
        key={a.id}
        entering={FadeInDown.duration(420).delay(i * 80)}
        style={[styles.audienceRow, i === 1 && styles.audienceRowReverse]}>
        <View style={styles.audiencePhotoWrap}>
          <Image source={a.image} style={styles.audiencePhoto} contentFit="cover" transition={200} />
        </View>
        <View style={styles.audienceText}>
          <Chip label={a.tag} color={a.tagColor} bg={a.tagBg} />
          <Text style={styles.audienceTitle}>{a.title}</Text>
          <Text style={styles.audienceBody} numberOfLines={3}>
            {a.body}
          </Text>
          <HapticPressable
            haptic="light"
            borderRadius={999}
            onPress={() => onJoin?.(a.id)}
            accessibilityRole="button"
            accessibilityLabel={a.cta}
            style={styles.joinButton}>
            <Text style={styles.joinText}>{a.cta}</Text>
            <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
          </HapticPressable>
        </View>
      </Animated.View>
    ))}
  </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Event ad banner (full bleed, sits above Opportunities)                     */
/* -------------------------------------------------------------------------- */

export const EventBanner: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const styles = useThemedStyles(createStyles);
  // Explicit screen width, pulled left by the page padding: spans edge to edge on every device
  // (negative margins on both sides left a gap on the right).
  const { width } = useWindowDimensions();
  return (
  <HapticPressable
    haptic="light"
    scaleTo={0.99}
    borderRadius={BANNER_RADIUS}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel="AdVision, reserve your seats now"
    style={[styles.eventBanner, { width, height: width / BANNER_ASPECT }]}>
    <Image
      source={require('@/assets/images/home/advision-banner.jpg')}
      style={StyleSheet.absoluteFill}
      contentFit="fill"
      transition={200}
    />
  </HapticPressable>
  );
};

/* -------------------------------------------------------------------------- */
/* AdBazaar: Opportunities Right Now                                          */
/* -------------------------------------------------------------------------- */

interface Opportunity {
  id: string;
  title: string;
  company: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  posted: string;
}

const OPPORTUNITIES: Opportunity[] = [
  { id: 'o1', title: 'Media Buyer', company: 'Apex Media', tag: 'Media Buying', tagColor: '#139A6E', tagBg: '#D9F2E8', posted: '1 day ago' },
  { id: 'o2', title: 'Social Media Strategist', company: 'BrandCo Pakistan', tag: 'Digital Marketing', tagColor: '#2A7CB8', tagBg: '#DCEEFA', posted: '2 days ago' },
  { id: 'o3', title: 'Creative Director', company: 'Interflow Communications', tag: 'Creative', tagColor: RED, tagBg: '#FBE1E3', posted: '3 days ago' },
];


export const OpportunitiesSection: React.FC<{
  onViewAll?: () => void;
  onApply?: (o: Opportunity) => void;
}> = ({ onViewAll, onApply }) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  return (
  <View style={styles.block}>
    <SectionHeader
      tag="AdBazaar"
      tagColor={RED}
      tagBg="#FBE1E3"
      title={[{ text: 'Opportunities', accent: true }, { text: ' Right Now' }]}
      action="View All"
      onAction={onViewAll}
    />
    {OPPORTUNITIES.map((o, i) => (
      <Animated.View key={o.id} entering={FadeInDown.duration(360).delay(i * 60)} style={styles.cardShadow}>
        <View style={styles.opportunity}>
          {i === 0 ? (
            <LinearGradient
              colors={[theme.washPink, theme.surface, theme.washBlue]}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 1, y: 0.8 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View style={styles.opportunityText}>
            <Text style={styles.opportunityTitle} numberOfLines={1}>
              {o.title}
            </Text>
            <Text style={styles.opportunityCompany} numberOfLines={1}>
              {o.company}
            </Text>
            <View style={styles.opportunityMeta}>
              <Chip label={o.tag} color={o.tagColor} bg={o.tagBg} />
              <Text style={styles.posted}>{o.posted}</Text>
            </View>
          </View>
          <RedButton label="Apply" size="sm" onPress={() => onApply?.(o)} />
        </View>
      </Animated.View>
    ))}
  </View>
  );
};

/* -------------------------------------------------------------------------- */
/* AdGuru: Voices That Shape the Industry                                     */
/* -------------------------------------------------------------------------- */

interface Guru {
  id: string;
  initials: string;
  color: string;
  name: string;
  role: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  years: string;
}

const GURUS: Guru[] = [
  { id: 'g1', initials: 'AR', color: '#3FBFAE', name: 'Amin Rammal', role: 'CEO, Synergy', tag: 'Brand Strategy', tagColor: RED, tagBg: '#FBE1E3', years: '25 yrs' },
  { id: 'g2', initials: 'AT', color: '#EF7D7D', name: 'Ayesha Tariq', role: 'Head of Marketing, Unilever', tag: 'FMCG & Brand', tagColor: '#139A6E', tagBg: '#D9F2E8', years: '12 yrs' },
  { id: 'g3', initials: 'HM', color: '#6C8BE0', name: 'Hamza Malik', role: 'Creative Lead, Orbit', tag: 'Creative', tagColor: '#2A7CB8', tagBg: '#DCEEFA', years: '9 yrs' },
  { id: 'g4', initials: 'SN', color: '#E0A04A', name: 'Sana Noor', role: 'Media Director, Mindshare', tag: 'Media Planning', tagColor: '#B58A12', tagBg: '#FBF0CC', years: '15 yrs' },
  { id: 'g5', initials: 'BK', color: '#9B7BD1', name: 'Bilal Khan', role: 'Founder, Pixel House', tag: 'Digital', tagColor: '#6B4FA8', tagBg: '#E8E0F6', years: '11 yrs' },
];

const GURU_W = 166;

export const GurusSection: React.FC<{
  onViewAll?: () => void;
  onBook?: (g: Guru) => void;
}> = ({ onViewAll, onBook }) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  return (
  <View style={styles.block}>
    <SectionHeader
      tag="AdGuru"
      tagColor="#6B7280"
      tagBg="#ECEDEF"
      title={[{ text: 'Voices That ' }, { text: 'Shape', accent: true }, { text: '\nthe Industry' }]}
      action="Meet All Gurus"
      onAction={onViewAll}
    />
    <Strip cardWidth={GURU_W} count={GURUS.length}>
      {GURUS.map((g, i) => (
        <View key={g.id} style={[styles.guruCard, styles.cardShadow]}>
          {i === 0 ? (
            <LinearGradient
              colors={[theme.washBlue, theme.surface, theme.washPink]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View style={[styles.avatar, { backgroundColor: g.color }]}>
            <Text style={styles.avatarText}>{g.initials}</Text>
          </View>
          <View style={styles.guruNames}>
            <Text style={styles.guruName} numberOfLines={1}>
              {g.name}
            </Text>
            <Text style={styles.guruRole} numberOfLines={1}>
              {g.role}
            </Text>
          </View>
          <View style={styles.guruMeta}>
            <Chip label={g.tag} color={g.tagColor} bg={g.tagBg} />
            <Text style={styles.years}>{g.years}</Text>
          </View>
          <RedButton label="Book a Session" size="sm" fill onPress={() => onBook?.(g)} />
        </View>
      ))}
    </Strip>
  </View>
  );
};

/* -------------------------------------------------------------------------- */
/* AdLeaks: What's Happening                                                  */
/* -------------------------------------------------------------------------- */

interface NewsItem {
  id: string;
  kicker: string;
  headline: string;
  summary: string;
  colors: Stops;
  /** Ready-made card artwork (text included). When set, the gradient and text overlay are skipped. */
  image?: number;
  /** Background photo only; the text overlay is still drawn on top. */
  photo?: number;
}

const NEWS: NewsItem[] = [
  { id: 'n1', image: require('@/assets/images/home/news-digital-adspend.jpg'), kicker: 'Market Report', headline: 'Pakistan\'s Digital Ad Spend Crosses Rs. 50 Billion', summary: 'The industry has grown a billion as digital overtakes traditional spend for the first time.', colors: ['#0F3B2C', '#1E6A4C'] },
  { id: 'n2', photo: require('@/assets/images/home/news-unilever.jpg'), kicker: 'Campaign Spotlight', headline: 'How Unilever\'s Latest Campaign Redefined Reach', summary: 'A deep dive into the creative and media decisions behind the quarter\'s most talked-about campaign.', colors: ['#27384F', '#5B748F'] },
];

const NEWS_W = 236;

export const HappeningSection: React.FC<{ onReadMore?: () => void; onOpen?: (n: NewsItem) => void }> = ({
  onReadMore,
  onOpen,
}) => {
  const styles = useThemedStyles(createStyles);
  return (
  <View style={styles.block}>
    <SectionHeader
      tag="AdLeaks"
      tagColor="#C7661E"
      tagBg="#FCE9D6"
      title={[{ text: 'What\'s ' }, { text: 'Happening', accent: true }]}
      action="Read More"
      onAction={onReadMore}
    />
    <Strip cardWidth={NEWS_W} count={NEWS.length}>
      {NEWS.map((n) => (
        <HapticPressable
          key={n.id}
          haptic="light"
          scaleTo={0.98}
          borderRadius={18}
          onPress={() => onOpen?.(n)}
          accessibilityRole="button"
          accessibilityLabel={n.headline}
          style={styles.newsCard}>
          {n.image ? (
            <Image source={n.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <>
              {n.photo ? (
                <Image source={n.photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
              ) : (
                <LinearGradient colors={n.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              )}
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.78)']}
                start={{ x: 0, y: 0.15 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.newsBody}>
                <Text style={styles.newsKicker}>{n.kicker}</Text>
                <Text style={styles.newsHeadline} numberOfLines={3}>
                  {n.headline}
                </Text>
                <Text style={styles.newsSummary} numberOfLines={3}>
                  {n.summary}
                </Text>
              </View>
            </>
          )}
        </HapticPressable>
      ))}
    </Strip>
  </View>
  );
};

/* -------------------------------------------------------------------------- */
/* AdMeet: Coming Up                                                          */
/* -------------------------------------------------------------------------- */

interface EventItem {
  id: string;
  date: string;
  kind: string;
  kindColor: string;
  kindBg: string;
  title: string;
  place: string;
}

const EVENTS: EventItem[] = [
  { id: 'e1', date: 'Aug 20', kind: 'Conference', kindColor: '#2A7CB8', kindBg: '#DCEEFA', title: 'AdSummit Pakistan 2025', place: 'Karachi' },
  { id: 'e2', date: 'Sep 5', kind: 'Workshop', kindColor: '#2A7CB8', kindBg: '#DCEEFA', title: 'Digital Marketing Masterclass', place: 'Lahore' },
  { id: 'e3', date: 'Sep 19', kind: 'Networking', kindColor: '#139A6E', kindBg: '#D9F2E8', title: 'Creative Strategy Meetup', place: 'Islamabad' },
];

const EVENT_W = 248;

export const ComingUpSection: React.FC<{ onSeeAll?: () => void; onRegister?: (e: EventItem) => void }> = ({
  onSeeAll,
  onRegister,
}) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  return (
  <View style={styles.block}>
    <SectionHeader
      tag="AdMeet"
      tagColor="#139A6E"
      tagBg="#D9F2E8"
      title={[{ text: 'Coming', accent: true }, { text: ' Up' }]}
      action="See All"
      onAction={onSeeAll}
    />
    <Strip cardWidth={EVENT_W} count={EVENTS.length}>
      {EVENTS.map((e, i) => (
        <View key={e.id} style={[styles.eventCard, styles.cardShadow]}>
          {i === 0 ? (
            <LinearGradient
              colors={[theme.washPink, theme.surface, theme.washBlue]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View style={styles.eventChips}>
            <Chip label={e.date} color="#C7661E" bg="#FCE9D6" />
            <Chip label={e.kind} color={e.kindColor} bg={e.kindBg} />
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {e.title}
            </Text>
            <View style={styles.eventPlace}>
              <Ionicons name="location" size={12} color={RED} />
              <Text style={styles.eventPlaceText}>{e.place}</Text>
            </View>
          </View>
          <RedButton label="Register" size="sm" fill onPress={() => onRegister?.(e)} />
        </View>
      ))}
    </Strip>
  </View>
  );
};

/* -------------------------------------------------------------------------- */
/* AdRead: Latest Sessions                                                    */
/* -------------------------------------------------------------------------- */

interface Session {
  id: string;
  kicker: string;
  kickerColor: string;
  title: string;
  length: string;
  tint: Stops;
}

const SESSIONS: Session[] = [
  { id: 's1', kicker: 'The Guru Sessions', kickerColor: '#1FA8D6', title: 'Lessons from 20 Years in Pakistan\'s Ad Industry', length: '32 min', tint: ['#7C93B5', '#C7D3E6'] },
  { id: 's2', kicker: 'AdStreet Originals', kickerColor: '#139A6E', title: 'Why Brand Consistency Is Your Best Growth Asset', length: '24 min', tint: ['#2A2A30', '#6B5560'] },
  { id: 's3', kicker: 'AdRead Weekly', kickerColor: RED, title: 'Unpacking the Effies: What Won and Why', length: '28 min', tint: ['#3E5F86', '#B7C9DD'] },
];

export const SessionsSection: React.FC<{ onBrowseAll?: () => void; onPlay?: (s: Session) => void }> = ({
  onBrowseAll,
  onPlay,
}) => {
  const styles = useThemedStyles(createStyles);
  return (
  <View style={styles.block}>
    <SectionHeader
      tag="AdRead"
      tagColor="#1FA8D6"
      tagBg="#DDF1F9"
      title={[{ text: 'Latest Sessions' }]}
      action="Browse All"
      onAction={onBrowseAll}
    />
    {SESSIONS.map((s, i) => (
      <Animated.View
        key={s.id}
        entering={FadeInDown.duration(340).delay(i * 60)}
        style={[styles.sessionRow, styles.cardShadow]}>
        <Photo tint={s.tint} icon="person" style={styles.sessionThumb} />
        <View style={styles.sessionText}>
          <Text style={[styles.sessionKicker, { color: s.kickerColor }]} numberOfLines={1}>
            {s.kicker}
          </Text>
          <Text style={styles.sessionTitle} numberOfLines={1}>
            {s.title}
          </Text>
          <Text style={styles.sessionLength}>{s.length}</Text>
        </View>
        <HapticPressable
          haptic="light"
          scaleTo={0.9}
          borderRadius={20}
          onPress={() => onPlay?.(s)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Play ${s.title}`}
          style={styles.playButton}>
          <Ionicons name="play" size={16} color="#FFFFFF" style={styles.playIcon} />
        </HapticPressable>
      </Animated.View>
    ))}
  </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Final CTA                                                                  */
/* -------------------------------------------------------------------------- */

export const JoinCta: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  return (
  <View style={styles.block}>
    <View style={[styles.cta, styles.cardShadow]}>
      <LinearGradient
        colors={
          theme.scheme === 'dark'
            ? ['#7A2D33', '#3A1D22', '#1A1A1F', '#1B2D3D', '#2C5878']
            : ['#F28B8F', '#FBE9EA', '#FFFFFF', '#E3F1FA', '#7DBFE8']
        }
        locations={[0, 0.28, 0.5, 0.72, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <TwoToneTitle
        center
        size={25}
        parts={[
          { text: 'Your Place in ' },
          { text: 'Pakistan\'s\nIndustry', accent: true },
          { text: ' Starts Here.' },
        ]}
      />
      <Text style={styles.ctaBody}>
        Join thousands of professionals, agencies, and brands already on AdStreet.
      </Text>
      <HapticPressable
        haptic="medium"
        borderRadius={12}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Create your free account"
        style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Create Your Free Account</Text>
      </HapticPressable>
    </View>
  </View>
  );
};

/* -------------------------------------------------------------------------- */

const createStyles = (t: AppTheme) =>
  StyleSheet.create({
  block: {
    marginTop: 0,
  },
  divider: {
    marginVertical: 20,
    alignItems: 'center',
  },
  dividerLine: {
    width: '100%',
    height: 1,
  },
  fill: {
    alignSelf: 'stretch',
  },
  center: {
    textAlign: 'center',
  },
  alignStart: {
    alignSelf: 'flex-start',
  },
  cardShadow: {
    ...Shadows.card,
    marginBottom: 10,
  },
  photo: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // titles + headers
  title: {
    fontFamily: SERIF,
    color: t.text,
    letterSpacing: -0.3,
  },
  titleAccent: {
    color: t.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  sectionHeaderCenter: {
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 8,
  },
  headerTextCenter: {
    flex: 1,
    alignItems: 'center',
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  action: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginBottom: 2,
  },
  actionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: t.primary,
    textDecorationLine: 'underline',
  },

  // shared controls
  redButton: {
    backgroundColor: t.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.buttonGlow,
  },
  redButtonSm: {
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  redButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  redButtonTextSm: {
    fontSize: 13.5,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // strips + dots
  strip: {
    marginHorizontal: -PAGE_PAD,
    overflow: 'visible',
  },
  stripContent: {
    paddingHorizontal: PAGE_PAD,
    paddingTop: 2,
    paddingBottom: 8,
  },
  dotsWrap: {
    alignItems: 'center',
    marginTop: 2,
  },
  dotsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: t.surface,
    ...Shadows.card,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: withAlpha(t.textMuted, 0.4),
  },
  dotActive: {
    width: 20,
    backgroundColor: t.primary,
  },

  // built for everyone
  audienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  audienceRowReverse: {
    flexDirection: 'row-reverse',
  },
  audiencePhotoWrap: {
    width: 118,
    height: 148,
    borderRadius: 20,
    backgroundColor: t.surfaceAlt,
    ...Shadows.card,
  },
  audiencePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  audienceText: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 6,
  },
  audienceTitle: {
    fontFamily: SERIF,
    fontSize: 20,
    lineHeight: 28,
    color: t.text,
    letterSpacing: -0.3,
  },
  audienceBody: {
    fontSize: 14,
    lineHeight: 22,
    color: t.textMuted,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: t.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 4,
    ...Shadows.buttonGlow,
  },
  joinText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // event banner
  eventBanner: {
    marginLeft: -PAGE_PAD,
    overflow: 'hidden',
    marginBottom: 20,
  },

  // opportunities
  opportunity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: t.surface,
    overflow: 'hidden',
  },
  opportunityText: {
    flex: 1,
    gap: 4,
  },
  opportunityTitle: {
    fontFamily: SERIF,
    fontSize: 18,
    color: t.text,
    letterSpacing: -0.2,
  },
  opportunityCompany: {
    fontSize: 13.5,
    color: t.textMuted,
  },
  opportunityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  posted: {
    fontSize: 12.5,
    color: t.textMuted,
  },

  // gurus
  guruCard: {
    width: GURU_W,
    borderRadius: 18,
    padding: 14,
    gap: 10,
    backgroundColor: t.surface,
    overflow: 'hidden',
    marginBottom: 0,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  guruNames: {
    gap: 1,
  },
  guruName: {
    fontFamily: SERIF,
    fontSize: 16.5,
    color: t.text,
  },
  guruRole: {
    fontSize: 12.5,
    color: t.textMuted,
  },
  guruMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  years: {
    fontSize: 12,
    color: t.textMuted,
  },

  // news
  newsCard: {
    width: NEWS_W,
    height: 224,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    ...Shadows.card,
  },
  newsBody: {
    padding: 14,
    gap: 6,
  },
  newsKicker: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#E5D26B',
  },
  newsHeadline: {
    fontFamily: SERIF,
    fontSize: 17,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  newsSummary: {
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.88)',
  },

  // events
  eventCard: {
    width: EVENT_W,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    backgroundColor: t.surface,
    overflow: 'hidden',
    marginBottom: 0,
  },
  eventChips: {
    flexDirection: 'row',
    gap: 6,
  },
  eventInfo: {
    gap: 4,
  },
  eventTitle: {
    fontFamily: SERIF,
    fontSize: 17,
    color: t.text,
    letterSpacing: -0.2,
  },
  eventPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventPlaceText: {
    fontSize: 13,
    color: t.textMuted,
  },

  // sessions
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 18,
    backgroundColor: t.surface,
  },
  sessionThumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  sessionText: {
    flex: 1,
    gap: 2,
  },
  sessionKicker: {
    fontSize: 12,
    fontWeight: '600',
  },
  sessionTitle: {
    fontFamily: SERIF,
    fontSize: 15,
    color: t.text,
  },
  sessionLength: {
    fontSize: 12.5,
    color: t.textMuted,
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: t.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.buttonGlow,
  },
  playIcon: {
    marginStart: 2,
  },

  // cta
  cta: {
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 22,
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    backgroundColor: t.surface,
    marginBottom: 0,
  },
  ctaBody: {
    fontSize: 13.5,
    lineHeight: 20,
    color: t.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
    maxWidth: 260,
  },
  ctaButton: {
    borderRadius: 12,
    backgroundColor: t.surface,
    paddingHorizontal: 26,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: t.text,
  },
});

