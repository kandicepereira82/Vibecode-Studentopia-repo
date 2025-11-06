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

  // Additional Math Videos
  {
    id: "math-trigonometry",
    title: "Trigonometry Basics: Sin, Cos, Tan",
    description: "Learn the fundamental trigonometric functions and how to use them",
    url: "https://www.youtube.com/watch?v=PUB0TaZ7bhA",
    topics: ["trigonometry", "sine", "cosine", "tangent", "trig", "math"],
    subject: "Math",
    duration: "14 min",
    ageAppropriate: true,
  },
  {
    id: "math-probability",
    title: "Probability and Statistics Introduction",
    description: "Understand probability concepts and basic statistical analysis",
    url: "https://www.youtube.com/watch?v=uzkc-qNVoOk",
    topics: ["probability", "statistics", "data", "chance", "math"],
    subject: "Math",
    duration: "10 min",
    ageAppropriate: true,
  },
  {
    id: "math-quadratic",
    title: "Solving Quadratic Equations",
    description: "Master multiple methods for solving quadratic equations",
    url: "https://www.youtube.com/watch?v=i7idZfS8t8w",
    topics: ["quadratic", "equations", "factoring", "algebra", "parabola"],
    subject: "Math",
    duration: "12 min",
    ageAppropriate: true,
  },
  {
    id: "math-linear-equations",
    title: "Linear Equations and Graphing",
    description: "Learn how to graph and solve linear equations",
    url: "https://www.youtube.com/watch?v=aq7InmoCsXU",
    topics: ["linear equations", "graphing", "slope", "y-intercept", "algebra"],
    subject: "Math",
    duration: "11 min",
    ageAppropriate: true,
  },

  // Additional Science Videos
  {
    id: "science-ecosystems",
    title: "Ecosystems and Food Chains",
    description: "Explore how living things interact in ecosystems and food webs",
    url: "https://www.youtube.com/watch?v=dCb6CIq1xZg",
    topics: ["ecosystems", "food chain", "ecology", "biology", "environment"],
    subject: "Science",
    duration: "8 min",
    ageAppropriate: true,
  },
  {
    id: "science-dna",
    title: "DNA Structure and Replication",
    description: "Discover how DNA stores genetic information and replicates",
    url: "https://www.youtube.com/watch?v=8kK2zwjRV0M",
    topics: ["dna", "genetics", "genes", "biology", "heredity"],
    subject: "Science",
    duration: "9 min",
    ageAppropriate: true,
  },
  {
    id: "science-electricity",
    title: "Electricity and Circuits Explained",
    description: "Understand electric current, voltage, and basic circuit design",
    url: "https://www.youtube.com/watch?v=mc979OhitAg",
    topics: ["electricity", "circuits", "voltage", "current", "physics"],
    subject: "Science",
    duration: "13 min",
    ageAppropriate: true,
  },
  {
    id: "science-climate",
    title: "Climate Change and Global Warming",
    description: "Learn about climate science and environmental impacts",
    url: "https://www.youtube.com/watch?v=G4H1N_yXBiA",
    topics: ["climate", "environment", "global warming", "earth science", "weather"],
    subject: "Science",
    duration: "10 min",
    ageAppropriate: true,
  },

  // Additional English Videos
  {
    id: "english-literary-devices",
    title: "Literary Devices and Figurative Language",
    description: "Master metaphors, similes, personification, and other literary techniques",
    url: "https://www.youtube.com/watch?v=ajk_AVy3lSs",
    topics: ["literary devices", "metaphor", "simile", "english", "literature"],
    subject: "English",
    duration: "11 min",
    ageAppropriate: true,
  },
  {
    id: "english-reading-comprehension",
    title: "Improving Reading Comprehension",
    description: "Strategies to understand and analyze texts more effectively",
    url: "https://www.youtube.com/watch?v=JwR0AEq_9sY",
    topics: ["reading", "comprehension", "analysis", "english", "literature"],
    subject: "English",
    duration: "9 min",
    ageAppropriate: true,
  },
  {
    id: "english-poetry-analysis",
    title: "How to Analyze Poetry",
    description: "Learn techniques for understanding and interpreting poems",
    url: "https://www.youtube.com/watch?v=mKPJfZw9mHs",
    topics: ["poetry", "analysis", "literature", "english", "interpretation"],
    subject: "English",
    duration: "12 min",
    ageAppropriate: true,
  },

  // Additional History Videos
  {
    id: "history-ancient-rome",
    title: "Ancient Rome: Rise and Fall",
    description: "Explore the history of the Roman Empire from republic to collapse",
    url: "https://www.youtube.com/watch?v=Yp-rFEzSHig",
    topics: ["rome", "roman empire", "ancient history", "history", "caesar"],
    subject: "History",
    duration: "16 min",
    ageAppropriate: true,
  },
  {
    id: "history-civil-war",
    title: "American Civil War Explained",
    description: "Understand the causes, battles, and consequences of the Civil War",
    url: "https://www.youtube.com/watch?v=tsxmyL7TUJg",
    topics: ["civil war", "american history", "history", "lincoln", "slavery"],
    subject: "History",
    duration: "14 min",
    ageAppropriate: true,
  },
  {
    id: "history-renaissance",
    title: "The Renaissance Period",
    description: "Discover the art, science, and culture of the Renaissance era",
    url: "https://www.youtube.com/watch?v=PcI5b1b5hSg",
    topics: ["renaissance", "history", "art", "europe", "culture"],
    subject: "History",
    duration: "11 min",
    ageAppropriate: true,
  },

  // Additional Study Skills Videos
  {
    id: "study-exam-preparation",
    title: "Exam Preparation Strategies",
    description: "Proven techniques to prepare effectively for tests and exams",
    url: "https://www.youtube.com/watch?v=kf2COYhWxsg",
    topics: ["exam", "test", "study", "preparation", "revision"],
    subject: "Study Skills",
    duration: "10 min",
    ageAppropriate: true,
  },
  {
    id: "study-focus-concentration",
    title: "How to Focus and Concentrate Better",
    description: "Learn techniques to improve focus and avoid distractions",
    url: "https://www.youtube.com/watch?v=fdbQwkny3jQ",
    topics: ["focus", "concentration", "attention", "study", "productivity"],
    subject: "Study Skills",
    duration: "8 min",
    ageAppropriate: true,
  },
  {
    id: "study-active-learning",
    title: "Active Learning Techniques",
    description: "Master effective active learning strategies for better retention",
    url: "https://www.youtube.com/watch?v=V-UvSKe8jW4",
    topics: ["active learning", "study", "retention", "learning techniques"],
    subject: "Study Skills",
    duration: "10 min",
    ageAppropriate: true,
  },

  // Computer Science Videos
  {
    id: "cs-algorithms",
    title: "Introduction to Algorithms",
    description: "Learn fundamental algorithm concepts and problem-solving",
    url: "https://www.youtube.com/watch?v=rL8X2mlNHPM",
    topics: ["algorithms", "computer science", "programming", "coding"],
    subject: "Computer Science",
    duration: "12 min",
    ageAppropriate: true,
  },
  {
    id: "cs-python-basics",
    title: "Python Programming for Beginners",
    description: "Get started with Python programming fundamentals",
    url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
    topics: ["python", "programming", "coding", "computer science"],
    subject: "Computer Science",
    duration: "15 min",
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

    // Check if any topic matches (highest priority)
    for (const topic of video.topics) {
      const topicLower = topic.toLowerCase();

      // Exact phrase match gets highest score
      if (questionLower.includes(topicLower)) {
        score += 15;
      }

      // Check for individual words in multi-word topics
      const topicWords = topicLower.split(/\s+/);
      for (const word of topicWords) {
        if (word.length > 3 && questionLower.includes(word)) {
          score += 5;
        }
      }
    }

    // Check if subject matches
    if (questionLower.includes(video.subject.toLowerCase())) {
      score += 8;
    }

    // Check if title or description contains keywords
    const titleLower = video.title.toLowerCase();
    const descLower = video.description.toLowerCase();

    const words = questionLower.split(/\s+/);
    for (const word of words) {
      if (word.length > 3) { // Only check words longer than 3 characters
        // Remove common punctuation
        const cleanWord = word.replace(/[.,!?;:]/g, "");

        if (titleLower.includes(cleanWord)) score += 4;
        if (descLower.includes(cleanWord)) score += 2;
      }
    }

    // Boost score for common question patterns
    if (questionLower.match(/how (do|to|can)/)) {
      if (titleLower.includes("how") || descLower.includes("learn")) {
        score += 3;
      }
    }

    if (questionLower.match(/what (is|are)/)) {
      if (titleLower.includes("introduction") || titleLower.includes("explained")) {
        score += 3;
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
