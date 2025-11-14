import { ExpoConfig, ConfigContext } from 'expo/config';

// Exclude expo-network-addons from autolinking
export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    // Ensure expo-network-addons is not autolinked
    plugins: config.plugins?.filter(
      (plugin) => 
        typeof plugin !== 'string' || 
        !plugin.includes('expo-network-addons')
    ) || [],
  };
};

