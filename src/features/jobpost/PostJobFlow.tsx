import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  FadeOutLeft,
  FadeOutRight,
  useReducedMotion,
} from 'react-native-reanimated';
import { JobPreviewView } from './JobPreviewView';
import { MyListingsView } from './MyListingsView';
import { PostJobFormView } from './PostJobFormView';
import { TalentProfileView } from './TalentProfileView';
import {
  INITIAL_POSTED_JOBS,
  JobPostDraft,
  MY_INITIAL_GIGS,
  MyGigItem,
  PostedJobItem,
  makeCompanyInitials,
} from './jobPostData';

export type JobPostScreenKey = 'form' | 'preview' | 'listings' | 'profile';

interface PostJobFlowProps {
  initialScreen?: JobPostScreenKey;
  onClose: () => void;
  onOpenMenu: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}

const createEmptyDraft = (): JobPostDraft => ({
  title: '',
  company: '',
  category: 'Creative',
  duration: '2 Month(s)',
  location: 'Karachi',
  budget: '70k-80k',
  validTillDate: '26-Sep-2026',
  description: '',
  photoUri: null,
});

const AVATAR_PALETTES: readonly (readonly [string, string])[] = [
  ['#EC2029', '#781016'],
  ['#1E293B', '#0F172A'],
  ['#2563EB', '#1E3A8A'],
  ['#0D9488', '#115E59'],
];

/**
 * Orchestrates the AdBazaar "+" Add a Job Post flow:
 * Post a Job -> Job Preview -> My Listings (My Jobs | My Gigs) -> Talent Profile.
 */
export const PostJobFlow: React.FC<PostJobFlowProps> = ({
  initialScreen = 'form',
  onClose,
  onOpenMenu,
  onOpenSearch,
  onOpenNotifications,
}) => {
  const reduceMotion = useReducedMotion();

  const [screen, setScreen] = useState<JobPostScreenKey>(initialScreen);
  const [history, setHistory] = useState<JobPostScreenKey[]>([]);
  const [navDir, setNavDir] = useState<'forward' | 'back'>('forward');

  const [draft, setDraft] = useState<JobPostDraft>(createEmptyDraft);
  const [jobs, setJobs] = useState<PostedJobItem[]>(INITIAL_POSTED_JOBS);
  const [gigs] = useState<MyGigItem[]>(MY_INITIAL_GIGS);
  const [justPublishedId, setJustPublishedId] = useState<string | null>(null);

  const navigateForward = useCallback(
    (next: JobPostScreenKey) => {
      setNavDir('forward');
      setHistory((prev) => [...prev, screen]);
      setScreen(next);
    },
    [screen],
  );

  const navigateBack = useCallback(() => {
    setNavDir('back');
    if (history.length > 0) {
      const target = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setScreen(target);
      return true;
    }
    onClose();
    return true;
  }, [history, onClose]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen !== 'form' || history.length > 0) {
        return navigateBack();
      }
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [history.length, navigateBack, onClose, screen]);

  const handlePublishJob = useCallback(() => {
    const cleanTitle = draft.title.trim() || 'Senior Designer';
    const cleanCompany = draft.company.trim() || 'Grey Advertising';
    const cleanLocation = draft.location.trim() || 'Karachi';
    const cleanBudget = draft.budget.trim() || '70k-80k';
    const cleanCategory = draft.category.trim() || 'Creative';
    const cleanValidTill = draft.validTillDate.trim() || '26-Sep-2026';
    const cleanDescription =
      draft.description.trim() ||
      'Lead campaign creative direction, visual storytelling, and client pitch decks.';

    if (draft.id) {
      setJobs((prev) =>
        prev.map((item) =>
          item.id === draft.id
            ? {
                ...item,
                initials: makeCompanyInitials(cleanCompany),
                title: cleanTitle,
                company: cleanCompany,
                location: cleanLocation,
                category: cleanCategory,
                budget: cleanBudget,
                validTillDate: cleanValidTill,
                description: cleanDescription,
                photoUri: draft.photoUri,
                status: 'Active',
              }
            : item,
        ),
      );
      setJustPublishedId(draft.id);
    } else {
      const newId = `job-${Date.now()}`;
      const palette = AVATAR_PALETTES[jobs.length % AVATAR_PALETTES.length];
      const created: PostedJobItem = {
        id: newId,
        initials: makeCompanyInitials(cleanCompany),
        avatarColors: palette,
        title: cleanTitle,
        company: cleanCompany,
        location: cleanLocation,
        category: cleanCategory,
        postedLabel: 'Just now',
        budget: cleanBudget,
        validTillDate: cleanValidTill,
        description: cleanDescription,
        status: 'Active',
        photoUri: draft.photoUri,
      };
      setJobs((prev) => [created, ...prev]);
      setJustPublishedId(newId);
    }

    setDraft(createEmptyDraft());
    setNavDir('forward');
    setHistory(['form']);
    setScreen('listings');
  }, [draft, jobs.length]);

  const handleEditJobFromList = useCallback((job: PostedJobItem) => {
    setDraft({
      id: job.id,
      title: job.title,
      company: job.company,
      category: job.category,
      duration: '2 Month(s)',
      location: job.location,
      budget: job.budget,
      validTillDate: job.validTillDate,
      description: job.description,
      photoUri: job.photoUri ?? null,
    });
    setNavDir('back');
    setHistory(['listings']);
    setScreen('form');
  }, []);

  const handleCloseJob = useCallback((id: string) => {
    setJobs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Closed' } : item)),
    );
  }, []);

  const handleRenewJob = useCallback((id: string) => {
    setJobs((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Active', postedLabel: 'Renewed today' }
          : item,
      ),
    );
  }, []);

  const handleCreateNewJob = useCallback(() => {
    setDraft(createEmptyDraft());
    setJustPublishedId(null);
    setNavDir('back');
    setHistory([]);
    setScreen('form');
  }, []);

  const enteringAnim = reduceMotion
    ? FadeIn.duration(120)
    : (navDir === 'forward' ? FadeInRight : FadeInLeft).duration(220);

  const exitingAnim = reduceMotion
    ? FadeOut.duration(120)
    : (navDir === 'forward' ? FadeOutLeft : FadeOutRight).duration(180);

  return (
    <View style={styles.root}>
      {screen === 'form' && (
        <Animated.View
          key="jobpost-form"
          entering={enteringAnim}
          exiting={exitingAnim}
          style={styles.stage}>
          <PostJobFormView
            draft={draft}
            isEditing={Boolean(draft.id)}
            onChangeDraft={setDraft}
            onReviewJob={() => navigateForward('preview')}
            onBack={navigateBack}
            onOpenMyListings={() => navigateForward('listings')}
            onOpenMenu={onOpenMenu}
            onOpenSearch={onOpenSearch}
            onOpenNotifications={onOpenNotifications}
          />
        </Animated.View>
      )}

      {screen === 'preview' && (
        <Animated.View
          key="jobpost-preview"
          entering={enteringAnim}
          exiting={exitingAnim}
          style={styles.stage}>
          <JobPreviewView
            draft={draft}
            onEdit={() => {
              setNavDir('back');
              setHistory((prev) => (prev[prev.length - 1] === 'form' ? prev.slice(0, -1) : prev));
              setScreen('form');
            }}
            onPublish={handlePublishJob}
            onOpenMenu={onOpenMenu}
            onOpenSearch={onOpenSearch}
            onOpenNotifications={onOpenNotifications}
          />
        </Animated.View>
      )}

      {screen === 'listings' && (
        <Animated.View
          key="jobpost-listings"
          entering={enteringAnim}
          exiting={exitingAnim}
          style={styles.stage}>
          <MyListingsView
            jobs={jobs}
            gigs={gigs}
            justPublishedId={justPublishedId}
            onEditJob={handleEditJobFromList}
            onCloseJob={handleCloseJob}
            onRenewJob={handleRenewJob}
            onCreateNewJob={handleCreateNewJob}
            onOpenTalentProfile={() => navigateForward('profile')}
            onOpenMenu={onOpenMenu}
            onOpenSearch={onOpenSearch}
            onOpenNotifications={onOpenNotifications}
          />
        </Animated.View>
      )}

      {screen === 'profile' && (
        <Animated.View
          key="jobpost-profile"
          entering={enteringAnim}
          exiting={exitingAnim}
          style={styles.stage}>
          <TalentProfileView
            onBack={navigateBack}
            onOpenSearch={onOpenSearch}
            onOpenNotifications={onOpenNotifications}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stage: {
    flex: 1,
  },
});
