import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Smart Faucet',
  slug: 'smart-faucet-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.iot.smartfaucet'
  },
  android: {
    package: 'com.iot.smartfaucet'
  },
  web: {
  },
  extra: {
    apiBaseUrl: process.env.API_BASE_URL || 'http://172.20.10.4:8080/api'
  },
  plugins: [
    'expo-secure-store'
  ]
});
