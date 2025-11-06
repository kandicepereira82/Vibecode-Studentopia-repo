import { StudyPalAnimal } from "../types";

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
  };
  return nameMap[animal] || animal;
};

/**
 * Get the image for a study pal animal
 */
export const getAnimalImage = (animal: StudyPalAnimal) => {
  const imageMap: Record<StudyPalAnimal, any> = {
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
  };
  return imageMap[animal] || imageMap.cat;
};

/**
 * All available animals
 */
export const ALL_ANIMALS: StudyPalAnimal[] = [
  "cat", "redpanda", "owl", "penguin", "horse",
  "dog", "chick", "bear", "hedgehog", "tiger",
  "turtle", "bunny", "giraffe", "pig", "alpaca",
  "lion", "frog", "koala", "sloth", "monkey",
  "hamster", "reindeer", "chipmunk", "elephant", "goldfish"
];
