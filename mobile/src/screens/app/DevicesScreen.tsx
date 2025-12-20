import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { devicesApi } from '../../api/devices';
import { DeviceCard } from '../../components/DeviceCard';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { theme } from '../../theme/theme';

export const DevicesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: devices, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['devices'],
    queryFn: devicesApi.getDevices,
    staleTime: 30000,
  });

  const filteredDevices = devices?.filter((device) =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.deviceUid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.location?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search devices..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DeviceCard
            device={item}
            onPress={() => navigation.navigate('DeviceDetail', { deviceId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <EmptyState message="No devices found" />
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
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  searchBar: {
    elevation: 0,
  },
  list: {
    padding: theme.spacing.md,
  },
});
