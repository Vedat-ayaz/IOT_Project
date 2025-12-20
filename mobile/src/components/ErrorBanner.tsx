import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Banner } from 'react-native-paper';
import { theme } from '../theme/theme';

interface ErrorBannerProps {
  message: string;
  visible: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  visible,
  onRetry,
  onDismiss,
}) => {
  if (!visible) return null;

  return (
    <Banner
      visible={visible}
      actions={[
        ...(onRetry ? [{ label: 'Retry', onPress: onRetry }] : []),
        ...(onDismiss ? [{ label: 'Dismiss', onPress: onDismiss }] : []),
      ]}
      icon="alert-circle"
      style={styles.banner}
    >
      {message}
    </Banner>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.colors.error,
  },
});
