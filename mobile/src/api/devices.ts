import client from './client';
import { Device, RegisterDeviceRequest } from './types';

export const devicesApi = {
  getDevices: async (): Promise<Device[]> => {
    const response = await client.get<Device[]>('/devices');
    return response.data;
  },

  getDevice: async (id: number): Promise<Device> => {
    const response = await client.get<Device>(`/devices/${id}`);
    return response.data;
  },

  registerDevice: async (data: RegisterDeviceRequest): Promise<Device> => {
    const response = await client.post<Device>('/devices/register', data);
    return response.data;
  },

  assignDevice: async (deviceId: number, userId: number): Promise<Device> => {
    const response = await client.put<Device>(`/devices/${deviceId}/assign/${userId}`);
    return response.data;
  },

  unassignDevice: async (deviceId: number): Promise<Device> => {
    const response = await client.put<Device>(`/devices/${deviceId}/unassign`);
    return response.data;
  },

  deleteDevice: async (deviceId: number): Promise<void> => {
    await client.delete(`/devices/${deviceId}`);
  },
};
