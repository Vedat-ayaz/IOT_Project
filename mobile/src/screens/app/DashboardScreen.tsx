import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { devicesApi } from '../../api/devices';
import { readingsApi } from '../../api/readings';
import { alertsApi } from '../../api/alerts';
import { commandsApi } from '../../api/commands';
import { KPIWidget } from '../../components/KPIWidget';
import { DeviceCard } from '../../components/DeviceCard';
import { Loading } from '../../components/Loading';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ConfirmModal } from '../../components/ConfirmModal';
import { formatLiters } from '../../utils/format';
import { theme } from '../../theme/theme';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    deviceId?: number;
    deviceName?: string;
    action?: 'OPEN' | 'CLOSE' | 'SHUT_OFF';
  }>({ visible: false });

  // Fetch dashboard data
  const { data: devices, isLoading: devicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: devicesApi.getDevices,
    staleTime: 30000,
  });

  const { data: aggregated, isLoading: aggregatedLoading, refetch: refetchAggregated } = useQuery({
    queryKey: ['aggregated'],
    queryFn: readingsApi.getAggregatedData,
    staleTime: 30000,
  });

  const { data: alerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertsApi.getAlerts,
    staleTime: 30000,
  });

  const isLoading = devicesLoading || aggregatedLoading;
  const isRefreshing = false;

  const handleRefresh = async () => {
    await Promise.all([refetchDevices(), refetchAggregated(), refetchAlerts()]);
  };

  const handleQuickAction = (deviceId: number, deviceName: string, action: 'OPEN' | 'CLOSE' | 'SHUT_OFF') => {
    setConfirmModal({
      visible: true,
      deviceId,
      deviceName,
      action,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.deviceId || !confirmModal.action) return;

    try {
      let commandType: 'OPEN_VALVE' | 'CLOSE_VALVE' | 'SHUT_OFF';
      if (confirmModal.action === 'OPEN') commandType = 'OPEN_VALVE';
      else if (confirmModal.action === 'CLOSE') commandType = 'CLOSE_VALVE';
      else commandType = 'SHUT_OFF';

      await commandsApi.sendCommand(confirmModal.deviceId, { type: commandType });
      setConfirmModal({ visible: false });
    } catch (error) {
      console.error('Failed to send command:', error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  const activeDevices = devices?.filter(d => d.status === 'ACTIVE') || [];
  const unreadAlerts = alerts?.filter(a => !a.isRead) || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.kpiContainer}>
          <View style={styles.kpiRow}>
            <KPIWidget
              title="Today"
              value={formatLiters(aggregated?.todayLiters || 0)}
              color={theme.colors.primary}
            />
            <KPIWidget
              title="This Week"
              value={formatLiters(aggregated?.weekLiters || 0)}
              color={theme.colors.secondary}
            />
          </View>
          <View style={styles.kpiRow}>
            <KPIWidget
              title="Active Devices"
              value={aggregated?.activeDevicesCount || 0}
              color={theme.colors.success}
            />
            <KPIWidget
              title="Alerts"
              value={unreadAlerts.length}
              color={theme.colors.warning}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Devices</Text>
          {activeDevices.slice(0, 3).map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onPress={() => navigation.navigate('DeviceDetail', { deviceId: device.id })}
              onQuickAction={(action) => handleQuickAction(device.id, device.name, action)}
            />
          ))}
          {devices && devices.length > 3 && (
            <Text
              style={styles.viewAll}
              onPress={() => navigation.navigate('Devices')}
            >
              View All Devices →
            </Text>
          )}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={confirmModal.visible}
        title={`Confirm ${confirmModal.action}`}
        message={`Are you sure you want to ${confirmModal.action?.toLowerCase()} ${confirmModal.deviceName}?`}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal({ visible: false })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  kpiContainer: {
    padding: theme.spacing.md,
  },
  kpiRow: {
    flexDirection: 'row',
    marginHorizontal: -theme.spacing.xs,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  viewAll: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    fontWeight: '600',
  },
});
