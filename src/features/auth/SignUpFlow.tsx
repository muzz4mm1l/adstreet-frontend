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
import {
  UploadPortfolioModal,
  PortfolioAttachment,
} from './UploadPortfolioModal';
import { SocialProvider } from './SocialButton';

type SignUpStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface SignUpFlowProps {
  onBackToOnboarding?: () => void;
  onComplete?: () => void;
  onNavigateLogin?: () => void;
}

export const SignUpFlow: React.FC<SignUpFlowProps> = ({
  onBackToOnboarding,
  onComplete,
  onNavigateLogin,
}) => {
  const [step, setStep] = useState<SignUpStep>(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Form States (01-03)
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

  // Language & Auth States (10-12)
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [loginEmail, setLoginEmail] = useState('abc@gmail.com');
  const [forgotEmail, setForgotEmail] = useState('abc@gmail.com');

  // Full Bidirectional Back Navigation with Synced Haptics
  const handleBack = () => {
    Keyboard.dismiss();
    Haptics.selectionAsync().catch(() => {});
    setDirection('backward');

    if (step === 12) setStep(11);
    else if (step === 11) setStep(1);
    else if (step === 10) setStep(9);
    else if (step === 9) setStep(7);
    else if (step === 8) setStep(7);
    else if (step === 7) setStep(6);
    else if (step === 6) setStep(5);
    else if (step === 5) setStep(4);
    else if (step === 4) setStep(3);
    else if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else onBackToOnboarding?.();
  };

  const advanceStep = (nextStep: SignUpStep) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setDirection('forward');
    setStep(nextStep);
  };

  // Step 1: Email
  const handleStep1Continue = () => {
    if (!email.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Email Required', 'Please enter your email address to continue.');
      return;
    }
    advanceStep(2);
  };

  // Step 2: Password
  const handleStep2Submit = () => {
    if (!password || !confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Password Required', 'Please enter and confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Password Mismatch', 'Passwords do not match. Please verify.');
      return;
    }
    advanceStep(3);
  };

  // Step 3: OTP Verification -> advances to Step 4 (Role Selection)
  const handleVerifyOtp = () => {
    const fullCode = otpCode.join('');
    if (fullCode.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Incomplete Code', 'Please enter all 6 digits of the verification code.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    advanceStep(4);
  };

  // Step 4: Role Selection -> advances to Step 5 (Profile Setup)
  const handleStep4Continue = () => {
    advanceStep(5);
  };

  // Step 5: Profile Setup -> advances to Step 6 (Skills)
  const handleStep5Continue = () => {
    if (!fullName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    advanceStep(6);
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
    if (!loginEmail.trim() || !enteredPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
      Alert.alert('Fields Required', 'Please enter your email and password.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
    Alert.alert('Welcome Back! 👋', `Successfully signed in as ${loginEmail}`);
  };

  // Step 12: Forgot Password Reset Code
  const handleSendResetCode = () => {
    if (!forgotEmail.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
      Alert.alert(
        'Email Required',
        'Please enter your registered email address.'
      );
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
    Alert.alert(
      'Reset Code Sent ✉️',
      `A 6-digit password reset code has been sent to ${forgotEmail}.`
    );
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
    Alert.alert('Social Authentication', `Signing in with ${provider}...`);
  };

  const handleLoginPress = () => {
    advanceStep(11);
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
    <AuthBackground style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              {/* STEP 01 */}
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

              {/* STEP 02 */}
              {step === 2 && (
                <Animated.View
                  key="step-2"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp02View
                    email={email}
                    onChangeEmail={setEmail}
                    password={password}
                    onChangePassword={setPassword}
                    confirmPassword={confirmPassword}
                    onChangeConfirmPassword={setConfirmPassword}
                    onSubmit={handleStep2Submit}
                    onLogin={handleLoginPress}
                  />
                </Animated.View>
              )}

              {/* STEP 03 */}
              {step === 3 && (
                <Animated.View
                  key="step-3"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp03View
                    email={email}
                    code={otpCode}
                    onChangeCode={setOtpCode}
                    onVerify={handleVerifyOtp}
                    onChangeEmail={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setDirection('backward');
                      setStep(1);
                    }}
                    onResend={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      Alert.alert(
                        'Code Resent',
                        `A new verification code was sent to ${email}`
                      );
                    }}
                  />
                </Animated.View>
              )}

              {/* STEP 04: Role Selection */}
              {step === 4 && (
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
              )}

              {/* STEP 05: Profile Setup */}
              {step === 5 && (
                <Animated.View
                  key="step-5"
                  entering={enteringAnimation}
                  exiting={exitingAnimation}>
                  <SignUp05View
                    fullName={fullName}
                    onChangeFullName={setFullName}
                    bio={bio}
                    onChangeBio={setBio}
                    location={location}
                    onChangeLocation={setLocation}
                    onContinue={handleStep5Continue}
                    onSkip={() => advanceStep(6)}
                  />
                </Animated.View>
              )}

              {/* STEP 06: Skills & Services */}
              {step === 6 && (
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
              )}

              {/* STEP 07: Upload Portfolio (Empty State) */}
              {step === 7 && (
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
              )}

              {/* STEP 08: Upload Modal Preview Screen */}
              {step === 8 && (
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
              )}

              {/* STEP 09: Upload Portfolio (Populated State) */}
              {step === 9 && (
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
              )}

              {/* STEP 10: Language Selection */}
              {step === 10 && (
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
              )}

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
                      setDirection('backward');
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
        </TouchableWithoutFeedback>

        {/* Global Upload Portfolio Modal (Triggers on Step 7 & 9) */}
        <UploadPortfolioModal
          visible={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={(attachments) => {
            setPortfolioAttachments(attachments);
            setShowUploadModal(false);
            advanceStep(9);
          }}
        />
      </SafeAreaView>
    </AuthBackground>
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
