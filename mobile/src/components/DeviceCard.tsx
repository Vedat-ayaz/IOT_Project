import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { Device } from '../api/types';
import { StatusBadge } from './StatusBadge';
import { formatDateRelative } from '../utils/date';
import { theme } from '../theme/theme';

interface DeviceCardProps {
  device: Device;
  onPress?: () => void;
  onQuickAction?: (action: 'OPEN' | 'CLOSE' | 'SHUT_OFF') => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onPress, onQuickAction }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{device.name}</Text>
            {device.location && (
              <Text style={styles.location}>{device.location}</Text>
            )}
          </View>
          <StatusBadge status={device.status} />
        </View>

        <View style={styles.details}>
          <Text style={styles.detailText}>
            UID: {device.deviceUid}
          </Text>
          {device.lastSeenAt && (
            <Text style={styles.detailText}>
              Last seen: {formatDateRelative(device.lastSeenAt)}
            </Text>
          )}
        </View>

        {onQuickAction && (
          <View style={styles.actions}>
            <IconButton
              icon="valve-open"
              size={20}
              iconColor={theme.colors.success}
              onPress={() => onQuickAction('OPEN')}
            />
            <IconButton
              icon="valve-closed"
              size={20}
              iconColor={theme.colors.error}
              onPress={() => onQuickAction('CLOSE')}
            />
            <IconButton
              icon="stop-circle"
              size={20}
              iconColor={theme.colors.error}
              onPress={() => onQuickAction('SHUT_OFF')}
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  details: {
    marginTop: theme.spacing.sm,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
});
