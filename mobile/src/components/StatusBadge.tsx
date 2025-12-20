import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { theme } from '../theme/theme';

interface StatusBadgeProps {
  status: 'ACTIVE' | 'OFFLINE' | 'MAINTENANCE';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'ACTIVE':
        return theme.colors.statusActive;
      case 'OFFLINE':
        return theme.colors.statusOffline;
      case 'MAINTENANCE':
        return theme.colors.statusMaintenance;
      default:
        return theme.colors.disabled;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'OFFLINE':
        return 'Offline';
      case 'MAINTENANCE':
        return 'Maintenance';
      default:
        return status;
    }
  };

  return (
    <Chip
      mode="flat"
      style={[styles.chip, { backgroundColor: getStatusColor() }]}
      textStyle={styles.chipText}
    >
      {getStatusText()}
    </Chip>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: 28,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
