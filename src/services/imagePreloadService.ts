import { Asset } from "expo-asset";
import { Image } from "react-native";
import { ANIMAL_IMAGE_CACHE } from "../utils/animalImageCache";

/**
 * Image Preload Service
 * Preloads all companion animal images at app startup for instant loading
 * Uses expo-asset for efficient caching and React Native Image.prefetch
 */

// Get all companion images from centralized cache
const COMPANION_IMAGES = Object.values(ANIMAL_IMAGE_CACHE);

/**
 * Preload all companion images using expo-asset for optimal caching
 */
export const preloadCompanionImages = async (): Promise<void> => {
  try {
    console.log("[ImagePreload] Starting to preload companion images...");
    const startTime = Date.now();

    // Use Asset.loadAsync for efficient preloading
    const imageAssets = COMPANION_IMAGES.map((image) => {
      if (typeof image === "number") {
        return Asset.fromModule(image).downloadAsync();
      }
      return null;
    }).filter(Boolean);

    // Preload all images in parallel
    await Promise.all(imageAssets);

    const duration = Date.now() - startTime;
    console.log(`[ImagePreload] Successfully preloaded ${COMPANION_IMAGES.length} companion images in ${duration}ms`);
  } catch (error) {
    console.error("[ImagePreload] Error preloading companion images:", error);
    // Don't throw - app should continue even if preloading fails
  }
};

/**
 * Alternative prefetch method using React Native Image.prefetch
 * Can be used as fallback or in combination with expo-asset
 */
export const prefetchCompanionImages = async (): Promise<void> => {
  try {
    console.log("[ImagePreload] Starting to prefetch companion images...");
    const startTime = Date.now();

    // Get URIs from assets
    const prefetchPromises = COMPANION_IMAGES.map(async (image) => {
      if (typeof image === "number") {
        const asset = Asset.fromModule(image);
        if (!asset.downloaded) {
          await asset.downloadAsync();
        }
        if (asset.localUri || asset.uri) {
          return Image.prefetch(asset.localUri || asset.uri);
        }
      }
      return Promise.resolve();
    });

    await Promise.all(prefetchPromises);

    const duration = Date.now() - startTime;
    console.log(`[ImagePreload] Successfully prefetched ${COMPANION_IMAGES.length} companion images in ${duration}ms`);
  } catch (error) {
    console.error("[ImagePreload] Error prefetching companion images:", error);
  }
};

/**
 * Get total count of companion images
 */
export const getCompanionImageCount = (): number => {
  return COMPANION_IMAGES.length;
};

/**
 * Check if images are cached (approximate check)
 */
export const areImagesPreloaded = async (): Promise<boolean> => {
  try {
    // Sample check - verify first 3 images are downloaded
    const sampleImages = COMPANION_IMAGES.slice(0, 3);
    const checks = sampleImages.map((image) => {
      if (typeof image === "number") {
        const asset = Asset.fromModule(image);
        return asset.downloaded;
      }
      return false;
    });
    return checks.every((check) => check === true);
  } catch (error) {
    return false;
  }
};
