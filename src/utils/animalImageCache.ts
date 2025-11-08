import { StudyPalAnimal } from "../types";

/**
 * Centralized Animal Image Cache
 * Single source of truth for all companion animal images
 * Used by both animalUtils and StudyPal component
 * Images are loaded once and reused throughout the app
 */

// Centralized image map - loaded once at module initialization
export const ANIMAL_IMAGE_CACHE: Record<StudyPalAnimal, any> = {
  tiger: require("../../assets/studypal-tiger-1762621680467.png"),
  turtle: require("../../assets/studypal-turtle-1762621686638.png"),
  sloth: require("../../assets/studypal-sloth-1762621668662.png"),
  chipmunk: require("../../assets/studypal-chipmunk-1762621546564.png"),
  reindeer: require("../../assets/studypal-reindeer-1762621643281.png"),
  hedgehog: require("../../assets/studypal-hedgehog-1762621589524.png"),
  penguin: require("../../assets/studypal-pengin-1762621622666.png"),
  monkey: require("../../assets/image-1762363426.png"), // No new image available
  owl: require("../../assets/studypal-owl-1762621617085.png"),
  chick: require("../../assets/studypal-duck-1762621558698.png"),
  lion: require("../../assets/studypal-lion-1762621607920.png"),
  horse: require("../../assets/studypal-horse-1762621595067.png"),
  koala: require("../../assets/studypal-koala-1762621600957.png"),
  hamster: require("../../assets/studypal-hamster-1762621583773.png"),
  giraffe: require("../../assets/studypal-giraffe-1762621578511.png"),
  frog: require("../../assets/studypal-frog-1762621573281.png"),
  alpaca: require("../../assets/image-1762363456.png"), // No new image available
  goldfish: require("../../assets/studypal-fish-1762621568455.png"),
  dog: require("../../assets/image-1762363445.png"), // No new image available
  bunny: require("../../assets/studypal-bunny-1762621538001.png"),
  cat: require("../../assets/studypal-cat-1762621540963.png"),
  bear: require("../../assets/image-1762363455.png"), // No new image available
  elephant: require("../../assets/studypal-elephant-1762621564988.png"),
  redpanda: require("../../assets/studypal-redpanda-1762621635364.png"),
  pig: require("../../assets/studypal-pig-1762621629635.png"),
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
