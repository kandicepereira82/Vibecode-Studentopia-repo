import { StudyPalAnimal } from "../types";
import { ANIMAL_IMAGE_CACHE } from "./animalImageCache";

/**
 * Get the display name for a study pal animal
 */
export const getAnimalDisplayName = (animal: StudyPalAnimal): string => {
  const nameMap: Record<StudyPalAnimal, string> = {
    cat: "Cat",
    redpanda: "Red Panda",
    owl: "Owl",
    penguin: "Penguin",
    horse: "Horse",
    dog: "Dog",
    chick: "Chick",
    bear: "Bear",
    hedgehog: "Hedgehog",
    tiger: "Tiger",
    turtle: "Turtle",
    bunny: "Bunny",
    giraffe: "Giraffe",
    pig: "Pig",
    alpaca: "Alpaca",
    lion: "Lion",
    frog: "Frog",
    koala: "Koala",
    sloth: "Sloth",
    monkey: "Monkey",
    hamster: "Hamster",
    reindeer: "Reindeer",
    chipmunk: "Chipmunk",
    elephant: "Elephant",
    goldfish: "Goldfish",
    shark: "Shark",
    wolf: "Wolf",
    zebra: "Zebra",
    snake: "Snake",
    rooster: "Rooster",
    otter: "Otter",
    lovebird: "Love Bird",
    lizard: "Lizard",
    dinosaur: "Dinosaur",
    arcticfox: "Arctic Fox",
  };
  return nameMap[animal] || animal;
};

/**
 * Get the image for a study pal animal
 */
export const getAnimalImage = (animal: StudyPalAnimal) => {
  return ANIMAL_IMAGE_CACHE[animal] || ANIMAL_IMAGE_CACHE.cat;
};

/**
 * All available animals
 */
export const ALL_ANIMALS: StudyPalAnimal[] = [
  "cat", "redpanda", "owl", "penguin", "horse",
  "dog", "chick", "bear", "hedgehog", "tiger",
  "turtle", "bunny", "giraffe", "pig", "alpaca",
  "lion", "frog", "koala", "sloth", "monkey",
  "hamster", "reindeer", "chipmunk", "elephant", "goldfish", "shark", "wolf",
  "zebra", "snake", "rooster", "otter", "lovebird", "lizard", "dinosaur", "arcticfox"
];
