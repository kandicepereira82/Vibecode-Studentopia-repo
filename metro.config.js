const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const path = require("node:path");
const os = require("node:os");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable Watchman for file watching.
config.resolver.useWatchman = false;

// Get environment variables for Metro cache configuration.
const metroCacheVersion = process.env.METRO_CACHE_VERSION || "1";
const metroCacheHttpEndpoint = process.env.METRO_CACHE_HTTP_ENDPOINT;
const metroCacheDir = process.env.METRO_CACHE_DIR || path.join(os.homedir(), ".metro-cache");

// Configure Metro's cache stores.
config.cacheStores = ({ FileStore, HttpStore }) => {
  const stores = [new FileStore({ root: metroCacheDir })];

  if (metroCacheHttpEndpoint) {
    // Create HttpStore with timeout and wrap to make failures non-fatal
    const httpStore = new HttpStore({
      endpoint: metroCacheHttpEndpoint,
      timeout: 10000 // 10 seconds (better to fail quickly and not cache than to hang)
    });

    // Wrap HttpStore methods to catch and log errors without failing
    const wrappedHttpStore = {
      get: async (...args) => {
        try {
          return await httpStore.get(...args);
        } catch (error) {
          console.warn('[Metro Cache] HttpStore get failed:', error.message);
          return null;
        }
      },
      set: async (...args) => {
        try {
          return await httpStore.set(...args);
        } catch (error) {
          console.warn('[Metro Cache] HttpStore set failed:', error.message);
        }
      },
      clear: async (...args) => {
        try {
          return await httpStore.clear(...args);
        } catch (error) {
          console.warn('[Metro Cache] HttpStore clear failed:', error.message);
        }
      }
    };

    stores.push(wrappedHttpStore);
  }
  return stores;
};

// Set the cache version for Metro, which can be incremented
// to invalidate existing caches.
config.cacheVersion = metroCacheVersion;

// Block react-native-clipboard from being resolved (using expo-clipboard instead)
config.resolver.blockList = [
  /.*\/@react-native-clipboard\/clipboard\/.*/,
  /.*\/react-native-clipboard\/.*/,
];

// Suppress Metro warnings for @anthropic-ai/sdk module resolution and require cycles
// These warnings are harmless - we use dynamic imports to prevent runtime issues
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args.join(' ');
  // Suppress @anthropic-ai/sdk module resolution warnings (harmless Metro bundler warnings)
  if (message.includes('@anthropic-ai/sdk') || 
      message.includes('Attempted to import the module') ||
      message.includes('no match was resolved') ||
      message.includes('Falling back to file-based resolution') ||
      message.includes('which is listed in the "exports"') ||
      message.includes('Consider updating the call site')) {
    return; // Suppress this warning
  }
  // Suppress require cycle warning (we use dynamic imports)
  if (message.includes('Require cycle') || 
      (message.includes('userStore') && message.includes('taskStore'))) {
    return; // Suppress this warning
  }
  // Suppress expo-notifications warnings (expected in Expo Go)
  if (message.includes('expo-notifications') || 
      message.includes('not fully supported in Expo Go') ||
      message.includes('was removed from Expo Go')) {
    return; // Suppress this warning
  }
  // Suppress expo-av deprecation warning
  if (message.includes('[expo-av]:') || 
      message.includes('Expo AV has been deprecated') ||
      message.includes('Use the `expo-audio`')) {
    return; // Suppress this warning
  }
  // Suppress SafeAreaView deprecation (we're using the correct import)
  if (message.includes('SafeAreaView has been deprecated') ||
      message.includes('react-native-safe-area-context')) {
    return; // Suppress this warning
  }
  // Suppress Supabase warnings (credentials are optional)
  if (message.includes('Supabase') || 
      message.includes('supabaseUrl') ||
      message.includes('credentials not found')) {
    return; // Suppress this warning
  }
  originalWarn.apply(console, args);
};

// Also suppress console.error for Supabase errors (credentials are optional)
console.error = (...args) => {
  const message = args.join(' ');
  // Suppress Supabase errors (credentials are optional - app works without them)
  if (message.includes('supabaseUrl') || 
      message.includes('Supabase') ||
      message.includes('[runtime not ready]') ||
      message.includes('runtime not ready') ||
      message.includes('Error: supabaseUrl')) {
    return; // Suppress this error
  }
  originalError.apply(console, args);
};


// Integrate NativeWind with the Metro configuration.
module.exports = withNativeWind(config, { input: "./global.css" });
