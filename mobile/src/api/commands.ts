import client from './client';
import { Command, CreateCommandRequest } from './types';

export interface CommandsParams {
  status?: 'PENDING' | 'SENT' | 'ACKNOWLEDGED' | 'FAILED' | 'EXPIRED';
}

export const commandsApi = {
  getCommands: async (deviceId: number, params?: CommandsParams): Promise<Command[]> => {
    const response = await client.get<Command[]>(`/devices/${deviceId}/commands`, {
      params,
    });
    return response.data;
  },

  sendCommand: async (deviceId: number, command: CreateCommandRequest): Promise<Command> => {
    const response = await client.post<Command>(`/devices/${deviceId}/commands`, command);
    return response.data;
  },
};
