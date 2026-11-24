import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeOut,
  useReducedMotion,
} from 'react-native-reanimated';
import { ProfileTextField, ProfileTextFieldProps, SelectField, TermsCheckbox } from './ProfileFields';

/** Values for the Seeker / Provider / Freelancer profile forms (each uses a subset). */
export interface SeekerProfileData {
  name: string;
  industry: string | null;
  services: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  companyName: string;
  currentRole: string;
  yearsOfExperience: string | null;
  areaOfExpertise: string | null;
  facebook: string;
  linkedin: string;
  twitter: string;
  /** Service Provider only. */
  webLinks: string;
  /** Service Provider only. */
  portfolio: string;
  acceptedTerms: boolean;
}

export const EMPTY_SEEKER_DATA: SeekerProfileData = {
  name: '',
  industry: null,
  services: null,
  country: null,
  state: null,
  city: null,
  companyName: '',
  currentRole: '',
  yearsOfExperience: null,
  areaOfExpertise: null,
  facebook: '',
  linkedin: '',
  twitter: '',
  webLinks: '',
  portfolio: '',
  acceptedTerms: false,
};

export type ProfileFormVariant = 'seeker' | 'provider' | 'freelancer';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type SelectKey =
  | 'industry'
  | 'services'
  | 'country'
  | 'state'
  | 'city'
  | 'yearsOfExperience'
  | 'areaOfExpertise';
type TextKey =
  | 'companyName'
  | 'currentRole'
  | 'facebook'
  | 'linkedin'
  | 'twitter'
  | 'webLinks'
  | 'portfolio';
type FieldKey = SelectKey | TextKey;

type FieldSpec =
  | { kind: 'select'; key: SelectKey; icon: IconName; label: string }
  | {
      kind: 'text';
      key: TextKey;
      icon: IconName;
      placeholder: string;
      optional?: boolean;
      props?: Pick<ProfileTextFieldProps, 'autoCapitalize' | 'keyboardType' | 'textContentType'>;
    };

const URL_PROPS = {
  autoCapitalize: 'none',
  keyboardType: 'url',
  textContentType: 'URL',
} as const;

const FIELDS: Record<FieldKey, FieldSpec> = {
  industry: { kind: 'select', key: 'industry', icon: 'layers-outline', label: 'Industry' },
  services: { kind: 'select', key: 'services', icon: 'construct-outline', label: 'Services' },
  country: { kind: 'select', key: 'country', icon: 'earth-outline', label: 'Country' },
  state: { kind: 'select', key: 'state', icon: 'map-outline', label: 'State' },
  city: { kind: 'select', key: 'city', icon: 'location-outline', label: 'City' },
  yearsOfExperience: {
    kind: 'select',
    key: 'yearsOfExperience',
    icon: 'time-outline',
    label: 'Years of experience',
  },
  areaOfExpertise: {
    kind: 'select',
    key: 'areaOfExpertise',
    icon: 'ribbon-outline',
    label: 'Area of expertise',
  },
  companyName: {
    kind: 'text',
    key: 'companyName',
    icon: 'business-outline',
    placeholder: 'Company name',
    props: { autoCapitalize: 'words', textContentType: 'organizationName' },
  },
  currentRole: {
    kind: 'text',
    key: 'currentRole',
    icon: 'briefcase-outline',
    placeholder: 'Current role',
    props: { autoCapitalize: 'words', textContentType: 'jobTitle' },
  },
  facebook: {
    kind: 'text',
    key: 'facebook',
    icon: 'logo-facebook',
    placeholder: 'Facebook (optional)',
    optional: true,
    props: URL_PROPS,
  },
  linkedin: {
    kind: 'text',
    key: 'linkedin',
    icon: 'logo-linkedin',
    placeholder: 'LinkedIn (optional)',
    optional: true,
    props: URL_PROPS,
  },
  twitter: {
    kind: 'text',
    key: 'twitter',
    icon: 'logo-twitter',
    placeholder: 'Twitter (optional)',
    optional: true,
    props: URL_PROPS,
  },
  webLinks: {
    kind: 'text',
    key: 'webLinks',
    icon: 'link-outline',
    placeholder: 'Web Links (optional)',
    optional: true,
    props: URL_PROPS,
  },
  portfolio: {
    kind: 'text',
    key: 'portfolio',
    icon: 'images-outline',
    placeholder: 'Portfolio (optional)',
    optional: true,
    props: URL_PROPS,
  },
};

/** Fields after name / phone / email, in display order, per profile type. */
const LAYOUT: Record<ProfileFormVariant, FieldKey[]> = {
  seeker: [
    'industry', 'services', 'country', 'state', 'city', 'companyName', 'currentRole',
    'yearsOfExperience', 'areaOfExpertise', 'facebook', 'linkedin', 'twitter',
  ],
  provider: [
    'industry', 'services', 'country', 'state', 'city', 'companyName', 'currentRole',
    'yearsOfExperience', 'areaOfExpertise', 'facebook', 'linkedin', 'twitter',
    'webLinks', 'portfolio',
  ],
  freelancer: [
    'companyName', 'industry', 'country', 'state', 'city', 'currentRole',
    'facebook', 'linkedin', 'twitter',
  ],
};

interface ProfileFormProps {
  data: SeekerProfileData;
  onChange: (patch: Partial<SeekerProfileData>) => void;
  variant?: ProfileFormVariant;
}

/** Staggered entrance for each field; capped so a long form never feels slow. */
const useFieldEntering = () => {
  const reduceMotion = useReducedMotion();
  return (index: number) =>
    reduceMotion ? undefined : FadeInDown.delay(Math.min(index * 30, 360)).duration(260);
};

/** First field (sits above the shared phone + email fields). */
export const SeekerNameField: React.FC<ProfileFormProps> = ({ data, onChange }) => {
  const entering = useFieldEntering();
  return (
    <Animated.View
      entering={entering(0)}
      exiting={FadeOut.duration(160)}
      style={styles.nameBlock}>
      <ProfileTextField
        icon="person-outline"
        placeholder="Full name"
        value={data.name}
        onChangeText={(name) => onChange({ name })}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />
    </Animated.View>
  );
};

/**
 * Everything after phone + email, then the terms checkbox. Choice fields open a picker
 * sheet (no options yet - pass `options` to a SelectField once the data exists).
 */
export const SeekerDetailsFields: React.FC<ProfileFormProps> = ({
  data,
  onChange,
  variant = 'seeker',
}) => {
  const entering = useFieldEntering();
  const keys = LAYOUT[variant];
  const lastTextKey = [...keys].reverse().find((k) => FIELDS[k].kind === 'text');

  return (
    <Animated.View exiting={FadeOut.duration(160)} style={styles.stack}>
      {keys.map((key, index) => {
        const spec = FIELDS[key];
        return (
          <Animated.View key={key} entering={entering(index + 1)}>
            {spec.kind === 'select' ? (
              <SelectField
                icon={spec.icon}
                label={spec.label}
                value={data[spec.key]}
                onChange={(value) => onChange({ [spec.key]: value })}
              />
            ) : (
              <ProfileTextField
                icon={spec.icon}
                placeholder={spec.placeholder}
                optional={spec.optional}
                value={data[spec.key]}
                onChangeText={(value) => onChange({ [spec.key]: value })}
                returnKeyType={key === lastTextKey ? 'done' : 'next'}
                {...spec.props}
              />
            )}
          </Animated.View>
        );
      })}
      <Animated.View entering={entering(keys.length + 1)}>
        <TermsCheckbox
          checked={data.acceptedTerms}
          onChange={(acceptedTerms) => onChange({ acceptedTerms })}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  nameBlock: {
    marginBottom: 14,
  },
  stack: {
    gap: 14,
    marginBottom: 18,
  },
});
