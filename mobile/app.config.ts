import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Smart Faucet',
  slug: 'smart-faucet-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.iot.smartfaucet'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.iot.smartfaucet'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  extra: {
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080/api'
  },
  plugins: [
    'expo-secure-store'
  ]
});
