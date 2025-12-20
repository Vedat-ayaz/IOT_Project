import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../../api/alerts';
import { AlertCard } from '../../components/AlertCard';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { theme } from '../../theme/theme';

export const AlertsScreen: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  const { data: alerts, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertsApi.getAlerts,
    staleTime: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (alertId: number) => alertsApi.markAlertAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const filteredAlerts = alerts?.filter((alert) =>
    filter === 'all' ? true : !alert.isRead
  ) || [];

  const handleAlertPress = async (alert: any) => {
    if (!alert.isRead) {
      await markAsReadMutation.mutateAsync(alert.id);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as 'all' | 'unread')}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread' },
          ]}
        />
      </View>

      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            onPress={() => handleAlertPress(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <EmptyState
            message={
              filter === 'unread'
                ? 'No unread alerts'
                : 'No alerts yet'
            }
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  list: {
    padding: theme.spacing.md,
  },
});
