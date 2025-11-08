import { StudyPalAnimal } from "../types";

/**
 * Centralized Animal Image Cache
 * Single source of truth for all companion animal images
 * Used by both animalUtils and StudyPal component
 * Images are loaded once and reused throughout the app
 */

// Centralized image map - loaded once at module initialization
export const ANIMAL_IMAGE_CACHE: Record<StudyPalAnimal, any> = {
  tiger: require("../../assets/image-1762363413.png"),
  turtle: require("../../assets/image-1762363411.png"),
  sloth: require("../../assets/image-1762363415.png"),
  chipmunk: require("../../assets/image-1762363447.png"),
  reindeer: require("../../assets/image-1762363417.png"),
  hedgehog: require("../../assets/image-1762363434.png"),
  penguin: require("../../assets/image-1762363422.png"),
  monkey: require("../../assets/image-1762363426.png"),
  owl: require("../../assets/image-1762363424.png"),
  chick: require("../../assets/image-1762363449.png"),
  lion: require("../../assets/image-1762363428.png"),
  horse: require("../../assets/image-1762363432.png"),
  koala: require("../../assets/image-1762363431.png"),
  hamster: require("../../assets/image-1762363436.png"),
  giraffe: require("../../assets/image-1762363438.png"),
  frog: require("../../assets/image-1762363440.png"),
  alpaca: require("../../assets/image-1762363456.png"),
  goldfish: require("../../assets/image-1762363442.png"),
  dog: require("../../assets/image-1762363445.png"),
  bunny: require("../../assets/image-1762363453.png"),
  cat: require("../../assets/image-1762363451.png"),
  bear: require("../../assets/image-1762363455.png"),
  elephant: require("../../assets/image-1762363444.png"),
  redpanda: require("../../assets/image-1762363418.png"),
  pig: require("../../assets/image-1762363420.png"),
  shark: require("../../assets/studypal - shark-1762573986744.png"),
  wolf: require("../../assets/studypal - Wolf-1762618882290.png"),
  zebra: require("../../assets/studypal-zebra-1762619358695.png"),
  snake: require("../../assets/studypal-snake-1762619345881.png"),
  rooster: require("../../assets/studypal-Rooster-1762619337829.png"),
  otter: require("../../assets/studypal-otter-1762619312827.png"),
  lovebird: require("../../assets/studypal-love bird-1762619299842.png"),
  lizard: require("../../assets/studypal-Lizard-1762619293233.png"),
  dinosaur: require("../../assets/studypal-dinosaur-1762619240784.png"),
  arcticfox: require("../../assets/studypal- Arctic fox-1762619203926.png"),
};

/**
 * Get animal image from cache
 * @param animal - The animal type
 * @returns The cached image module
 */
export const getAnimalImageFromCache = (animal: StudyPalAnimal): any => {
  return ANIMAL_IMAGE_CACHE[animal] || ANIMAL_IMAGE_CACHE.cat;
};
