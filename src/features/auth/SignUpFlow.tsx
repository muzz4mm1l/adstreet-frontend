import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeInRight,
  FadeInLeft,
  FadeOutLeft,
  FadeOutRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SwipeBackContainer } from '@/components/navigation/SwipeBackContainer';
import { AuthBackground } from './AuthBackground';
import { AuthHeader } from './AuthHeader';
import { SignUp01View } from './SignUp01View';
import { SignUp02View } from './SignUp02View';
import { SignUp03View } from './SignUp03View';
import { SignUp04View, UserRole } from './SignUp04View';
import { SignUp05View } from './SignUp05View';
import { SignUp06View } from './SignUp06View';
import { SignUp07View } from './SignUp07View';
import { SignUp08View } from './SignUp08View';
import { SignUp09View } from './SignUp09View';
import { SignUp10View, AppLanguage } from './SignUp10View';
import { SignUp11View } from './SignUp11View';
import { SignUp12View } from './SignUp12View';
import { ComingSoonModal } from './ComingSoonModal';
import {
  UploadPortfolioModal,
  PortfolioAttachment,
} from './UploadPortfolioModal';
import { SocialProvider } from './SocialButton';

type SignUpStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface SignUpFlowProps {
  initialStep?: SignUpStep;
  onBackToOnboarding?: () => void;
  onComplete?: () => void;
  onNavigateLogin?: () => void;
  onLoginSuccess?: () => void;
}

export const SignUpFlow: React.FC<SignUpFlowProps> = ({
  initialStep = 11,
  onBackToOnboarding,
  onComplete,
  onNavigateLogin,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<SignUpStep>(initialStep);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Form States (01-03, 05)
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);

  // Profile & Role States (04-06)
  const [role, setRole] = useState<UserRole>('company');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [skills, setSkills] = useState<string[]>(['Design', 'Prototype']);
  const [startingPrice, setStartingPrice] = useState('100');

  // Portfolio States (07-09)
  const [portfolioAttachments, setPortfolioAttachments] = useState<
    PortfolioAttachment[]
  >([
    {
      id: 'default-portfolio',
      source: require('@/assets/images/portfolio-sample-1.png'),
      title: 'Mobile App Project',
    },
  ]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [socialModalProvider, setSocialModalProvider] = useState<SocialProvider | null>(null);

  // Language & Auth States (10-12)
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [loginEmail, setLoginEmail] = useState('abc@gmail.com');
  const [forgotEmail, setForgotEmail] = useState('abc@gmail.com');
  const [otpSource, setOtpSource] = useState<'signup' | 'forgot_password'>('signup');
  const [loginEntrySource, setLoginEntrySource] = useState<'onboarding' | 'step1' | 'flow'>('onboarding');

  // Full Bidirectional Back Navigation with Synced Haptics
  const handleBack = () => {
    Keyboard.dismiss();
    Haptics.selectionAsync().catch(() => {});
    setDirection('backward');

    if (step === 12) setStep(11);
    else if (step === 11) {
      if (loginEntrySource === 'step1') {
        setStep(1);
      } else if (loginEntrySource === 'flow') {
        setStep(5);
      } else {
        onBackToOnboarding?.();
      }
    }
    else if (step === 10) setStep(9);
    else if (step === 9) setStep(7);
    else if (step === 8) setStep(7);
    else if (step === 7) setStep(5);
    else if (step === 6) setStep(5);
    else if (step === 5) setStep(3);
    else if (step === 4) setStep(3);
    else if (step === 3) {
      if (otpSource === 'forgot_password') {
        setStep(12);
      } else {
        setStep(2);
      }
    }
    else if (step === 2) setStep(1);
    else if (step === 1) {
      setStep(11);
    }
    else onBackToOnboarding?.();
  };

  const advanceStep = (nextStep: SignUpStep) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setDirection('forward');
    setStep(nextStep);
  };

  // Step 1: Create an account (Email only) -> advances to Step 2 (Password)
  const handleStep1Continue = () => {
    advanceStep(2); // Direct to Step 2 (no input required for rapid testing)
  };

  // Step 2: Password & Confirm Password -> advances to Step 3 (OTP Verification)
  const handleStep2Submit = () => {
    setOtpSource('signup');
    advanceStep(3); // Advances to Step 3 OTP screen after entering password
  };

  // Step 3: OTP Verification (Used in Create Account & Forgot Password)
  const handleVerifyOtp = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (otpSource === 'signup') {
      advanceStep(5); // Advances to Step 5 (Profile Setup)
    } else {
      Alert.alert(
        'Code Verified ✅',
        'Your email has been verified. You can now log in.',
        [
          {
            text: 'Continue to Log in',
            onPress: () => {
              setDirection('forward');
              setStep(11);
            },
          },
        ]
      );
    }
  };

  // Step 4: Role Selection -> advances to Step 5 (Profile Setup)
  const handleStep4Continue = () => {
    advanceStep(5);
  };

  // Step 5: Profile Setup -> advances to Step 11 (Log In, Steps 6-10 bypassed for now)
  const handleStep5Continue = (data?: { phone: string; email: string }) => {
    const finalEmail = data?.email || email;
    if (finalEmail.trim()) {
      setLoginEmail(finalEmail.trim());
    }
    setLoginEntrySource('flow');
    advanceStep(11); // Steps 6-10 commented out for now
  };

  // Step 6: Skills & Services -> advances to Step 7 (Upload Portfolio)
  const handleStep6Continue = () => {
    advanceStep(7);
  };

  // Step 7/9: Portfolio Continue -> advances to Step 10 (Language Selection)
  const handlePortfolioContinue = () => {
    advanceStep(10);
  };

  // Step 10: Language Confirm -> Navigates to Log In (Step 11)
  const handleLanguageConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
    if (email.trim()) {
      setLoginEmail(email.trim());
    }
    advanceStep(11);
  };

  // Step 11: Sign In Action
  const handleSignIn = (enteredPassword: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
    if (onLoginSuccess) {
      onLoginSuccess();
    } else if (onComplete) {
      onComplete();
    } else {
      Alert.alert('Welcome Back! 👋', `Successfully signed in as ${loginEmail || 'user@adstreet.com'}`);
    }
  };

  // Step 12: Forgot Password Reset Code -> advances to Step 3 (OTP Verification)
  const handleSendResetCode = () => {
    setOtpSource('forgot_password');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
    advanceStep(3); // Navigates to Step 3 OTP screen for password recovery
  };

  const handleAddSkill = (newSkill: string) => {
    if (!skills.includes(newSkill)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setSkills((prev) => [...prev, newSkill]);
    }
  };

  const handleRemoveSkill = (removedSkill: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSkills((prev) => prev.filter((s) => s !== removedSkill));
  };

  const handleSocialLogin = (provider: SocialProvider) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSocialModalProvider(provider);
  };

  const handleLoginPress = () => {
    Keyboard.dismiss();
    Haptics.selectionAsync().catch(() => {});
    setLoginEntrySource('onboarding');
    setDirection('backward');
    setStep(11);
  };

  // Symmetrical Bidirectional Motion (Strict Skill Standard)
  const enteringAnimation =
    direction === 'forward'
      ? FadeInRight.duration(280)
      : FadeInLeft.duration(280);

  const exitingAnimation =
    direction === 'forward'
      ? FadeOutLeft.duration(180)
      : FadeOutRight.duration(180);

  return (
    <SwipeBackContainer onBack={handleBack}>
      <AuthBackground style={styles.container}>
        <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}>
          {/* Header with Centered Logo & Symmetrical Back Button */}
          <AuthHeader showBack={true} onBack={handleBack} />

          {/* Scrollable Form Body with 60fps Bidirectional Transitions */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
              {/* STEP 01: Create an Account (Email Input & Sign Up CTA) */}
              {step === 1 && (
                <Animated.View
                  key="step-1"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp01View
                    email={email}
                    onChangeEmail={setEmail}
                    onContinue={handleStep1Continue}
                    onLogin={handleLoginPress}
                    onSocialLogin={handleSocialLogin}
                  />
                </Animated.View>
              )}

              {/* STEP 02: Password & Confirm Password (Dedicated screen) */}
              {step === 2 && (
                <Animated.View
                  key="step-2"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp02View
                    password={password}
                    onChangePassword={setPassword}
                    confirmPassword={confirmPassword}
                    onChangeConfirmPassword={setConfirmPassword}
                    onSubmit={handleStep2Submit}
                    onLogin={handleLoginPress}
                  />
                </Animated.View>
              )}

              {/* STEP 03: OTP Verification (Used in Create Account & Forgot Password) */}
              {step === 3 && (
                <Animated.View
                  key="step-3"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp03View
                    email={
                      otpSource === 'forgot_password'
                        ? (forgotEmail || 'abc@gmail.com')
                        : (email || 'abc@gmail.com')
                    }
                    code={otpCode}
                    onChangeCode={setOtpCode}
                    onVerify={handleVerifyOtp}
                    onChangeEmail={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setDirection('backward');
                      if (otpSource === 'forgot_password') {
                        setStep(12);
                      } else {
                        setStep(1);
                      }
                    }}
                    onResend={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      Alert.alert(
                        'Code Resent',
                        `A new verification code was sent to ${
                          otpSource === 'forgot_password'
                            ? (forgotEmail || 'your email')
                            : (email || 'your email')
                        }`
                      );
                    }}
                  />
                </Animated.View>
              )}

              {/* STEP 04: Role Selection (Commented out for now) */}
              {/* {step === 4 && (
                <Animated.View
                  key="step-4"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp04View
                    selectedRole={role}
                    onSelectRole={setRole}
                    onContinue={handleStep4Continue}
                  />
                </Animated.View>
              )} */}

              {/* STEP 05: Profile Setup */}
              {step === 5 && (
                <Animated.View
                  key="step-5"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp05View
                    phone={phone}
                    onChangePhone={setPhone}
                    email={email}
                    onChangeEmail={setEmail}
                    onContinue={handleStep5Continue}
                    onSkip={() => {
                      if (email.trim()) setLoginEmail(email.trim());
                      setLoginEntrySource('flow');
                      advanceStep(11);
                    }}
                  />
                </Animated.View>
              )}

              {/* STEP 06: Skills & Services (Commented out for now) */}
              {/* {step === 6 && (
                <Animated.View
                  key="step-6"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp06View
                    category={category}
                    onChangeCategory={setCategory}
                    skills={skills}
                    onAddSkill={handleAddSkill}
                    onRemoveSkill={handleRemoveSkill}
                    startingPrice={startingPrice}
                    onChangeStartingPrice={setStartingPrice}
                    onContinue={handleStep6Continue}
                    onSkip={() => advanceStep(7)}
                  />
                </Animated.View>
              )} */}

              {/* STEP 07: Upload Portfolio (Empty State) (Commented out for now) */}
              {/* {step === 7 && (
                <Animated.View
                  key="step-7"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp07View
                    onOpenUploadModal={() => setShowUploadModal(true)}
                    onContinue={() => {
                      if (portfolioAttachments.length > 0) advanceStep(9);
                      else handlePortfolioContinue();
                    }}
                    onSkip={handlePortfolioContinue}
                  />
                </Animated.View>
              )} */}

              {/* STEP 08: Upload Modal Preview Screen (Commented out for now) */}
              {/* {step === 8 && (
                <Animated.View
                  key="step-8"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp08View
                    onUploadComplete={(attachments) => {
                      setPortfolioAttachments(attachments);
                      advanceStep(9);
                    }}
                    onClose={() => {
                      setDirection('backward');
                      setStep(7);
                    }}
                    onContinue={() => advanceStep(9)}
                    onSkip={handlePortfolioContinue}
                  />
                </Animated.View>
              )} */}

              {/* STEP 09: Upload Portfolio (Populated State) (Commented out for now) */}
              {/* {step === 9 && (
                <Animated.View
                  key="step-9"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp09View
                    portfolioItems={portfolioAttachments}
                    onOpenUploadModal={() => setShowUploadModal(true)}
                    onDeleteItem={(id) => {
                      const filtered = portfolioAttachments.filter(
                        (item) => item.id !== id
                      );
                      setPortfolioAttachments(filtered);
                      if (filtered.length === 0) {
                        setDirection('backward');
                        setStep(7);
                      }
                    }}
                    onContinue={handlePortfolioContinue}
                    onSkip={handlePortfolioContinue}
                  />
                </Animated.View>
              )} */}

              {/* STEP 10: Language Selection (Commented out for now) */}
              {/* {step === 10 && (
                <Animated.View
                  key="step-10"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp10View
                    selectedLanguage={language}
                    onSelectLanguage={setLanguage}
                    onConfirm={handleLanguageConfirm}
                    onSkip={handleLanguageConfirm}
                  />
                </Animated.View>
              )} */}

              {/* STEP 11: Log In */}
              {step === 11 && (
                <Animated.View
                  key="step-11"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp11View
                    email={loginEmail}
                    onChangeEmail={setLoginEmail}
                    onSignIn={handleSignIn}
                    onForgotPassword={() => advanceStep(12)}
                    onSignUp={() => {
                      Keyboard.dismiss();
                      Haptics.selectionAsync().catch(() => {});
                      setDirection('forward');
                      setStep(1);
                    }}
                    onSocialLogin={handleSocialLogin}
                  />
                </Animated.View>
              )}

              {/* STEP 12: Forgot Password */}
              {step === 12 && (
                <Animated.View
                  key="step-12"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp12View
                    email={forgotEmail}
                    onChangeEmail={setForgotEmail}
                    onSendCode={handleSendResetCode}
                  />
                </Animated.View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>

        {/* Global Upload Portfolio Modal (Triggers on Step 7 & 9, commented out for now) */}
        {/* <UploadPortfolioModal
          visible={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={(attachments) => {
            setPortfolioAttachments(attachments);
            setShowUploadModal(false);
            advanceStep(9);
          }}
        /> */}
        {/* Social Authentication Coming Soon Modal */}
        <ComingSoonModal
          visible={socialModalProvider !== null}
          provider={socialModalProvider}
          onClose={() => setSocialModalProvider(null)}
        />
      </SafeAreaView>
    </AuthBackground>
  </SwipeBackContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
});
