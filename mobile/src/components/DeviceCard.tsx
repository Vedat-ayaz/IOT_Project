import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
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
  const statusColor = device.status === 'ACTIVE' ? theme.colors.success : 
                     device.status === 'INACTIVE' ? theme.colors.textSecondary : 
                     theme.colors.error;
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.deviceIcon}>
                <Text style={styles.deviceEmoji}>💧</Text>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.name}>{device.name}</Text>
                {device.location && (
                  <Text style={styles.location}>📍 {device.location}</Text>
                )}
              </View>
            </View>
            <StatusBadge status={device.status} />
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Device ID:</Text>
              <Text style={styles.detailValue}>{device.deviceUid}</Text>
            </View>
            {device.lastSeenAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Active:</Text>
                <Text style={styles.detailValue}>{formatDateRelative(device.lastSeenAt)}</Text>
              </View>
            )}
          </View>

          {onQuickAction && (
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.openButton]}
                onPress={() => onQuickAction('OPEN')}
              >
                <Text style={styles.actionIcon}>🔓</Text>
                <Text style={styles.actionText}>Open</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.closeButton]}
                onPress={() => onQuickAction('CLOSE')}
              >
                <Text style={styles.actionIcon}>🔒</Text>
                <Text style={styles.actionText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.shutOffButton]}
                onPress={() => onQuickAction('SHUT_OFF')}
              >
                <Text style={styles.actionIcon}>⛔</Text>
                <Text style={styles.actionText}>Stop</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statusBar: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceEmoji: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  openButton: {
    backgroundColor: `${theme.colors.success}15`,
  },
  closeButton: {
    backgroundColor: `${theme.colors.warning}15`,
  },
  shutOffButton: {
    backgroundColor: `${theme.colors.error}15`,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
