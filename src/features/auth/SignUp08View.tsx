import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignUp07View } from './SignUp07View';
import {
  UploadPortfolioModal,
  PortfolioAttachment,
} from './UploadPortfolioModal';

interface SignUp08ViewProps {
  onUploadComplete: (attachments: PortfolioAttachment[], caption: string) => void;
  onClose: () => void;
  onContinue: () => void;
  onSkip: () => void;
}

/**
 * Sign up 08 — Upload Portfolio Modal Dialog
 * Master PDF Page 5
 */
export const SignUp08View: React.FC<SignUp08ViewProps> = ({
  onUploadComplete,
  onClose,
  onContinue,
  onSkip,
}) => {
  const [modalVisible, setModalVisible] = useState(true);

  const handleClose = () => {
    setModalVisible(false);
    onClose();
  };

  const handleUpload = (
    attachments: PortfolioAttachment[],
    caption: string
  ) => {
    setModalVisible(false);
    onUploadComplete(attachments, caption);
  };

  return (
    <View style={styles.container}>
      <SignUp07View
        onOpenUploadModal={() => setModalVisible(true)}
        onContinue={onContinue}
        onSkip={onSkip}
      />

      <UploadPortfolioModal
        visible={modalVisible}
        onClose={handleClose}
        onUpload={handleUpload}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
