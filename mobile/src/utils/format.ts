export const formatLiters = (liters: number): string => {
  if (liters >= 1000) {
    return `${(liters / 1000).toFixed(2)} m³`;
  }
  return `${liters.toFixed(2)} L`;
};

export const formatFlowRate = (lpm: number): string => {
  return `${lpm.toFixed(2)} L/min`;
};

export const formatBattery = (pct?: number): string => {
  if (pct === undefined || pct === null) return 'N/A';
  return `${pct}%`;
};

export const formatSignalStrength = (strength?: number): string => {
  if (strength === undefined || strength === null) return 'N/A';
  return `${strength} dBm`;
};

export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};
