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

// Suppress Metro warnings for @anthropic-ai/sdk module resolution
// The package uses exports that Metro can't resolve statically, but fallback works fine
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args.join(' ');
  // Suppress @anthropic-ai/sdk module resolution warnings
  if (message.includes('@anthropic-ai/sdk') && message.includes('no match was resolved')) {
    return; // Suppress this warning
  }
  originalWarn.apply(console, args);
};


// Integrate NativeWind with the Metro configuration.
module.exports = withNativeWind(config, { input: "./global.css" });
