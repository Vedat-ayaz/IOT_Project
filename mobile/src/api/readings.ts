import client from './client';
import { Reading } from './types';

export interface ReadingsParams {
  from?: string;
  to?: string;
  granularity?: 'hour' | 'day';
}

export const readingsApi = {
  getReadings: async (deviceId: number, params?: ReadingsParams): Promise<Reading[]> => {
    const response = await client.get<Reading[]>(`/devices/${deviceId}/readings`, {
      params,
    });
    return response.data;
  },

  getAggregatedData: async (): Promise<{
    todayLiters: number;
    weekLiters: number;
    activeDevicesCount: number;
    unreadAlertsCount: number;
  }> => {
    // This might need to be a separate endpoint or calculated from multiple endpoints
    try {
      const response = await client.get('/telemetry/aggregated');
      return response.data;
    } catch (error) {
      // Fallback: calculate from available data
      return {
        todayLiters: 0,
        weekLiters: 0,
        activeDevicesCount: 0,
        unreadAlertsCount: 0,
      };
    }
  },
};
