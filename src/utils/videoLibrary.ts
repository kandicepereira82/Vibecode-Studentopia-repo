/**
 * Curated library of age-appropriate educational videos
 * Organized by subject and topic for AI Helper suggestions
 */

export interface VideoResource {
  id: string;
  title: string;
  description: string;
  url: string;
  topics: string[];
  subject: string;
  duration?: string;
  ageAppropriate: boolean;
}

export const VIDEO_LIBRARY: VideoResource[] = [
  // Math Videos
  {
    id: "math-algebra-basics",
    title: "Introduction to Algebra",
    description: "Learn the fundamentals of algebra with clear step-by-step examples",
    url: "https://www.youtube.com/watch?v=NybHckSEQBI",
    topics: ["algebra", "equations", "variables", "math basics"],
    subject: "Math",
    duration: "10 min",
    ageAppropriate: true,
  },
  {
    id: "math-fractions",
    title: "Understanding Fractions",
    description: "Master fractions with visual explanations and practice problems",
    url: "https://www.youtube.com/watch?v=uemUglczpJo",
    topics: ["fractions", "division", "numerator", "denominator"],
    subject: "Math",
    duration: "8 min",
    ageAppropriate: true,
  },
  {
    id: "math-geometry",
    title: "Geometry Basics: Shapes and Angles",
    description: "Explore geometric shapes, angles, and their properties",
    url: "https://www.youtube.com/watch?v=5Mfm4JVzv4s",
    topics: ["geometry", "shapes", "angles", "triangles", "circles"],
    subject: "Math",
    duration: "12 min",
    ageAppropriate: true,
  },
  {
    id: "math-calculus-intro",
    title: "Introduction to Calculus",
    description: "Get started with calculus concepts including limits and derivatives",
    url: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
    topics: ["calculus", "derivatives", "limits", "advanced math"],
    subject: "Math",
    duration: "15 min",
    ageAppropriate: true,
  },

  // Science Videos
  {
    id: "science-cell-biology",
    title: "Cell Structure and Function",
    description: "Discover the parts of a cell and how they work together",
    url: "https://www.youtube.com/watch?v=URUJD5NEXC8",
    topics: ["biology", "cells", "organelles", "life science"],
    subject: "Science",
    duration: "10 min",
    ageAppropriate: true,
  },
  {
    id: "science-photosynthesis",
    title: "Photosynthesis Explained",
    description: "Learn how plants make their own food through photosynthesis",
    url: "https://www.youtube.com/watch?v=uixA8ZXx0KU",
    topics: ["photosynthesis", "plants", "biology", "chlorophyll"],
    subject: "Science",
    duration: "7 min",
    ageAppropriate: true,
  },
  {
    id: "science-periodic-table",
    title: "The Periodic Table Explained",
    description: "Understand the organization of elements in the periodic table",
    url: "https://www.youtube.com/watch?v=rz4Dd1I_fX0",
    topics: ["chemistry", "periodic table", "elements", "atoms"],
    subject: "Science",
    duration: "11 min",
    ageAppropriate: true,
  },
  {
    id: "science-newton-laws",
    title: "Newton's Laws of Motion",
    description: "Explore the three fundamental laws that govern motion",
    url: "https://www.youtube.com/watch?v=kKKM8Y-u7ds",
    topics: ["physics", "motion", "newton", "forces", "mechanics"],
    subject: "Science",
    duration: "9 min",
    ageAppropriate: true,
  },

  // English/Writing Videos
  {
    id: "english-essay-writing",
    title: "How to Write a Great Essay",
    description: "Learn the structure and techniques for writing effective essays",
    url: "https://www.youtube.com/watch?v=eC7xzavzEKY",
    topics: ["writing", "essays", "english", "composition", "thesis"],
    subject: "English",
    duration: "12 min",
    ageAppropriate: true,
  },
  {
    id: "english-grammar",
    title: "English Grammar Basics",
    description: "Master essential grammar rules including parts of speech and sentence structure",
    url: "https://www.youtube.com/watch?v=Rp5lqeoxR-w",
    topics: ["grammar", "english", "parts of speech", "sentences"],
    subject: "English",
    duration: "14 min",
    ageAppropriate: true,
  },
  {
    id: "english-punctuation",
    title: "Punctuation Rules Made Easy",
    description: "Learn when and how to use commas, semicolons, and other punctuation marks",
    url: "https://www.youtube.com/watch?v=TnYWXx21x-Q",
    topics: ["punctuation", "grammar", "commas", "semicolons", "writing"],
    subject: "English",
    duration: "8 min",
    ageAppropriate: true,
  },

  // History Videos
  {
    id: "history-wwii",
    title: "World War II Overview",
    description: "Understand the causes, major events, and outcomes of World War II",
    url: "https://www.youtube.com/watch?v=fo2Rb9h788s",
    topics: ["history", "world war 2", "wwii", "20th century"],
    subject: "History",
    duration: "18 min",
    ageAppropriate: true,
  },
  {
    id: "history-american-revolution",
    title: "The American Revolution",
    description: "Learn about the founding of the United States and the Revolutionary War",
    url: "https://www.youtube.com/watch?v=LV1rLi2RiTs",
    topics: ["history", "american revolution", "independence", "founding fathers"],
    subject: "History",
    duration: "13 min",
    ageAppropriate: true,
  },

  // Study Skills Videos
  {
    id: "study-note-taking",
    title: "Effective Note-Taking Strategies",
    description: "Master different note-taking methods to improve learning and retention",
    url: "https://www.youtube.com/watch?v=MSwfP88p62E",
    topics: ["study skills", "notes", "learning", "organization"],
    subject: "Study Skills",
    duration: "10 min",
    ageAppropriate: true,
  },
  {
    id: "study-time-management",
    title: "Time Management for Students",
    description: "Learn proven techniques to manage your time effectively and stay organized",
    url: "https://www.youtube.com/watch?v=WXBA4eWskrc",
    topics: ["time management", "productivity", "organization", "planning"],
    subject: "Study Skills",
    duration: "11 min",
    ageAppropriate: true,
  },
  {
    id: "study-memory-techniques",
    title: "Memory Improvement Techniques",
    description: "Discover strategies to enhance memory and recall information better",
    url: "https://www.youtube.com/watch?v=MhQfYPNYR8k",
    topics: ["memory", "mnemonics", "learning", "study techniques"],
    subject: "Study Skills",
    duration: "9 min",
    ageAppropriate: true,
  },
];

/**
 * Detect topics from user question and find relevant videos
 */
export function findRelevantVideos(question: string, maxResults: number = 3): VideoResource[] {
  const questionLower = question.toLowerCase();

  // Calculate relevance scores for each video
  const scoredVideos = VIDEO_LIBRARY.map((video) => {
    let score = 0;

    // Check if any topic matches
    for (const topic of video.topics) {
      if (questionLower.includes(topic.toLowerCase())) {
        score += 10;
      }
    }

    // Check if subject matches
    if (questionLower.includes(video.subject.toLowerCase())) {
      score += 5;
    }

    // Check if title or description contains keywords
    const titleLower = video.title.toLowerCase();
    const descLower = video.description.toLowerCase();

    const words = questionLower.split(/\s+/);
    for (const word of words) {
      if (word.length > 3) { // Only check words longer than 3 characters
        if (titleLower.includes(word)) score += 3;
        if (descLower.includes(word)) score += 1;
      }
    }

    return { video, score };
  });

  // Filter videos with score > 0 and sort by score
  const relevantVideos = scoredVideos
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((item) => item.video);

  return relevantVideos;
}

/**
 * Format video suggestion for AI response
 */
export function formatVideoSuggestion(video: VideoResource): string {
  return `📺 **${video.title}** (${video.duration || "Educational video"})\n${video.description}\n🔗 [Watch video](${video.url})`;
}

/**
 * Generate video suggestions text for AI prompt
 */
export function generateVideoSuggestionsForPrompt(question: string): string {
  const videos = findRelevantVideos(question, 3);

  if (videos.length === 0) {
    return "";
  }

  const suggestions = videos.map((video) => {
    return `- "${video.title}" (${video.duration || "video"}) about ${video.topics.slice(0, 3).join(", ")}: ${video.url}`;
  }).join("\n");

  return `\n\nRELEVANT VIDEO RESOURCES (include these in your response if helpful):\n${suggestions}\n\nWhen mentioning videos, format them like: "📺 Watch this video on [topic]: [url]"`;
}
