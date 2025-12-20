import client from './client';
import { Alert } from './types';

export const alertsApi = {
  getAlerts: async (): Promise<Alert[]> => {
    const response = await client.get<Alert[]>('/alerts');
    return response.data;
  },

  markAlertAsRead: async (alertId: number): Promise<Alert> => {
    const response = await client.put<Alert>(`/alerts/${alertId}/read`);
    return response.data;
  },

  markAllAlertsAsRead: async (): Promise<void> => {
    await client.put('/alerts/read-all');
  },
};
