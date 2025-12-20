import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Button, IconButton, Chip, Divider } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LineChart } from 'react-native-chart-kit';
import { devicesApi } from '../../api/devices';
import { readingsApi } from '../../api/readings';
import { commandsApi } from '../../api/commands';
import { StatusBadge } from '../../components/StatusBadge';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/ConfirmModal';
import { FlowRateSlider } from '../../components/FlowRateSlider';
import { formatDateShort, formatDateRelative } from '../../utils/date';
import { formatLiters, formatFlowRate } from '../../utils/format';
import { EmptyState } from '../../components/EmptyState';
import { theme } from '../../theme/theme';

const screenWidth = Dimensions.get('window').width;

export const DeviceDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { deviceId } = route.params;
  const queryClient = useQueryClient();

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    action?: 'OPEN' | 'CLOSE' | 'SHUT_OFF';
  }>({ visible: false });
  const [flowRateModal, setFlowRateModal] = useState(false);
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Fetch device data
  const { data: device, isLoading: deviceLoading, refetch: refetchDevice } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: () => devicesApi.getDevice(deviceId),
    staleTime: 30000,
  });

  const { data: readings, isLoading: readingsLoading, refetch: refetchReadings } = useQuery({
    queryKey: ['readings', deviceId, dateRange],
    queryFn: () => {
      const to = new Date();
      const from = new Date();
      if (dateRange === '24h') from.setHours(from.getHours() - 24);
      else if (dateRange === '7d') from.setDate(from.getDate() - 7);
      else from.setDate(from.getDate() - 30);

      return readingsApi.getReadings(deviceId, {
        from: from.toISOString(),
        to: to.toISOString(),
        granularity: dateRange === '24h' ? 'hour' : 'day',
      });
    },
    staleTime: 30000,
  });

  const { data: commands, refetch: refetchCommands } = useQuery({
    queryKey: ['commands', deviceId],
    queryFn: () => commandsApi.getCommands(deviceId),
    staleTime: 10000,
  });

  const sendCommandMutation = useMutation({
    mutationFn: (command: { type: 'OPEN_VALVE' | 'CLOSE_VALVE' | 'SHUT_OFF' | 'SET_FLOW_RATE'; payload?: any }) =>
      commandsApi.sendCommand(deviceId, command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands', deviceId] });
      refetchCommands();
    },
  });

  const isLoading = deviceLoading || readingsLoading;

  const handleRefresh = async () => {
    await Promise.all([refetchDevice(), refetchReadings(), refetchCommands()]);
  };

  const handleSendCommand = async (action: 'OPEN' | 'CLOSE' | 'SHUT_OFF') => {
    let commandType: 'OPEN_VALVE' | 'CLOSE_VALVE' | 'SHUT_OFF';
    if (action === 'OPEN') commandType = 'OPEN_VALVE';
    else if (action === 'CLOSE') commandType = 'CLOSE_VALVE';
    else commandType = 'SHUT_OFF';

    await sendCommandMutation.mutateAsync({ type: commandType });
    setConfirmModal({ visible: false });
  };

  const handleSetFlowRate = async (flowRate: number) => {
    await sendCommandMutation.mutateAsync({
      type: 'SET_FLOW_RATE',
      payload: { flowRateLpm: flowRate },
    });
    setFlowRateModal(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!device) {
    return <EmptyState message="Device not found" />;
  }

  // Prepare chart data
  const chartData = readings?.slice(-10) || [];
  const chartLabels = chartData.map((r) => formatDateShort(r.ts).split(' ')[1]);
  const flowRateData = chartData.map((r) => r.flowRateLpm);
  const volumeData = chartData.map((r) => r.volumeLitersDelta);

  const recentCommands = commands?.slice(0, 10) || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} />}
      >
        {/* Device Header */}
        <View style={styles.header}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <StatusBadge status={device.status} />
        </View>

        {device.location && (
          <Text style={styles.location}>{device.location}</Text>
        )}

        <View style={styles.details}>
          <Text style={styles.detailText}>UID: {device.deviceUid}</Text>
          {device.lastSeenAt && (
            <Text style={styles.detailText}>
              Last seen: {formatDateRelative(device.lastSeenAt)}
            </Text>
          )}
          {device.firmwareVersion && (
            <Text style={styles.detailText}>Firmware: {device.firmwareVersion}</Text>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controls</Text>
          <View style={styles.controlButtons}>
            <Button
              mode="contained"
              icon="valve-open"
              onPress={() => setConfirmModal({ visible: true, action: 'OPEN' })}
              style={[styles.controlButton, { backgroundColor: theme.colors.success }]}
            >
              Open
            </Button>
            <Button
              mode="contained"
              icon="valve-closed"
              onPress={() => setConfirmModal({ visible: true, action: 'CLOSE' })}
              style={[styles.controlButton, { backgroundColor: theme.colors.error }]}
            >
              Close
            </Button>
          </View>
          <View style={styles.controlButtons}>
            <Button
              mode="contained"
              icon="stop-circle"
              onPress={() => setConfirmModal({ visible: true, action: 'SHUT_OFF' })}
              style={[styles.controlButton, { backgroundColor: theme.colors.error }]}
            >
              Shut Off
            </Button>
            <Button
              mode="outlined"
              icon="speedometer"
              onPress={() => setFlowRateModal(true)}
              style={styles.controlButton}
            >
              Set Flow Rate
            </Button>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Charts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <View style={styles.dateRangeButtons}>
            <Chip
              selected={dateRange === '24h'}
              onPress={() => setDateRange('24h')}
              style={styles.chip}
            >
              24h
            </Chip>
            <Chip
              selected={dateRange === '7d'}
              onPress={() => setDateRange('7d')}
              style={styles.chip}
            >
              7d
            </Chip>
            <Chip
              selected={dateRange === '30d'}
              onPress={() => setDateRange('30d')}
              style={styles.chip}
            >
              30d
            </Chip>
          </View>

          {chartData.length > 0 ? (
            <>
              <Text style={styles.chartTitle}>Flow Rate (L/min)</Text>
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [{ data: flowRateData }],
                }}
                width={screenWidth - theme.spacing.xl}
                height={200}
                chartConfig={{
                  backgroundColor: theme.colors.surface,
                  backgroundGradientFrom: theme.colors.surface,
                  backgroundGradientTo: theme.colors.surface,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                }}
                bezier
                style={styles.chart}
              />

              <Text style={styles.chartTitle}>Volume (Liters)</Text>
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [{ data: volumeData }],
                }}
                width={screenWidth - theme.spacing.xl}
                height={200}
                chartConfig={{
                  backgroundColor: theme.colors.surface,
                  backgroundGradientFrom: theme.colors.surface,
                  backgroundGradientTo: theme.colors.surface,
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                }}
                bezier
                style={styles.chart}
              />
            </>
          ) : (
            <Text style={styles.noData}>No data available for selected range</Text>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Recent Commands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Commands</Text>
          {recentCommands.length > 0 ? (
            recentCommands.map((cmd) => (
              <View key={cmd.id} style={styles.commandItem}>
                <View style={styles.commandHeader}>
                  <Text style={styles.commandType}>
                    {cmd.type.replace(/_/g, ' ')}
                  </Text>
                  <Chip
                    mode="flat"
                    style={[
                      styles.statusChip,
                      { backgroundColor: getCommandStatusColor(cmd.status) },
                    ]}
                    textStyle={styles.statusChipText}
                  >
                    {cmd.status}
                  </Chip>
                </View>
                <Text style={styles.commandDate}>
                  {formatDateShort(cmd.requestedAt)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No commands yet</Text>
          )}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={confirmModal.visible}
        title={`Confirm ${confirmModal.action}`}
        message={`Are you sure you want to ${confirmModal.action?.toLowerCase()} this device?`}
        onConfirm={() => confirmModal.action && handleSendCommand(confirmModal.action)}
        onCancel={() => setConfirmModal({ visible: false })}
      />

      <FlowRateSlider
        visible={flowRateModal}
        currentValue={10}
        onConfirm={handleSetFlowRate}
        onCancel={() => setFlowRateModal(false)}
      />
    </View>
  );
};

const getCommandStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return theme.colors.commandPending;
    case 'SENT':
      return theme.colors.commandSent;
    case 'ACKNOWLEDGED':
      return theme.colors.commandAck;
    case 'FAILED':
      return theme.colors.commandFailed;
    case 'EXPIRED':
      return theme.colors.commandExpired;
    default:
      return theme.colors.disabled;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  deviceName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  location: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  details: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  dateRangeButtons: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  chip: {
    marginRight: theme.spacing.sm,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  noData: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  commandItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  commandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  commandType: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  commandDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
