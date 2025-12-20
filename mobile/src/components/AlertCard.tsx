import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Alert } from '../api/types';
import { formatDateShort } from '../utils/date';
import { theme } from '../theme/theme';

interface AlertCardProps {
  alert: Alert;
  onPress?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress }) => {
  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'INFO':
        return theme.colors.alertInfo;
      case 'WARNING':
        return theme.colors.alertWarning;
      case 'CRITICAL':
        return theme.colors.alertCritical;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <Card
      style={[
        styles.card,
        !alert.isRead && styles.unread,
      ]}
      onPress={onPress}
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor() }]} />
          <View style={styles.headerContent}>
            <Text style={styles.type}>{alert.type.replace(/_/g, ' ')}</Text>
            <Text style={styles.date}>{formatDateShort(alert.ts)}</Text>
          </View>
        </View>
        <Text style={styles.message}>{alert.message}</Text>
        {alert.device && (
          <Text style={styles.deviceName}>{alert.device.name}</Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  severityBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  message: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  deviceName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});
