import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Water Management Overview</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        <View style={styles.kpiContainer}>
          <Text style={styles.sectionTitleTop}>Water Usage Statistics</Text>
          <View style={styles.kpiRow}>
            <KPIWidget
              title="Today's Usage"
              value={formatLiters(aggregated?.todayLiters || 0)}
              icon="💧"
              color={theme.colors.primary}
            />
            <KPIWidget
              title="This Week"
              value={formatLiters(aggregated?.weekLiters || 0)}
              icon="📊"
              color={theme.colors.secondary}
            />
          </View>
          <View style={styles.kpiRow}>
            <KPIWidget
              title="Active Devices"
              value={aggregated?.activeDevicesCount || 0}
              icon="✅"
              color={theme.colors.success}
            />
            <KPIWidget
              title="Alerts"
              value={unreadAlerts.length}
              icon="⚠️"
              color={theme.colors.warning}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💧 My Devices</Text>
            {devices && devices.length > 3 && (
              <TouchableOpacity onPress={() => navigation.navigate('Devices')}>
                <Text style={styles.viewAllLink}>View All →</Text>
              </TouchableOpacity>
            )}
          </View>
          {activeDevices.slice(0, 3).map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onPress={() => navigation.navigate('DeviceDetail', { deviceId: device.id })}
              onQuickAction={(action) => handleQuickAction(device.id, device.name, action)}
            />
          ))}
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  kpiContainer: {
    padding: 20,
  },
  sectionTitleTop: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  kpiRow: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
