/**
 * Content Moderation Utility
 * Validates usernames and companion names for inappropriate content
 */

// Comprehensive blocklist for inappropriate content
const BLOCKED_WORDS = [
  // Profanity and vulgar terms
  "damn", "hell", "crap", "shit", "fuck", "bitch", "ass", "bastard", "dick",
  "piss", "cock", "pussy", "cunt", "fag", "slut", "whore", "rape",

  // Sexual content
  "sex", "porn", "nude", "naked", "horny", "xxx", "anal", "oral",
  "boob", "penis", "vagina", "orgasm", "erotic", "sexi", "sexy",

  // Hate speech and slurs
  "nigger", "nigga", "chink", "spic", "kike", "retard", "fag", "faggot",
  "tranny", "nazi", "hitler",

  // Violence and threats
  "kill", "murder", "death", "bomb", "terror", "shoot", "stab", "blood",
  "suicide", "kys",

  // Drug references
  "weed", "drug", "cocaine", "heroin", "meth", "crack", "high", "stoned",

  // Inappropriate usernames
  "admin", "moderator", "support", "official", "staff", "teacher", "studentopia",

  // Common variations and l33t speak
  "fck", "fuk", "sh1t", "b1tch", "a55", "s3x", "p0rn", "n1gga"
];

// Pattern-based detection for variations
const BLOCKED_PATTERNS = [
  /f+u+c+k+/gi,
  /s+h+i+t+/gi,
  /b+i+t+c+h+/gi,
  /n+i+g+g+a+/gi,
  /s+e+x+/gi,
  /p+o+r+n+/gi,
  /a+s+s+h+o+l+e+/gi,
  /d+a+m+n+/gi,
  /h+e+l+l+/gi,
  /c+r+a+p+/gi
];

// Character length constraints
export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 20;

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

/**
 * Normalize text for comparison (remove special characters, numbers, extra spaces)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[0-9]/g, "") // Remove numbers
    .replace(/[@_\-\.!]/g, "") // Remove special chars
    .replace(/\s+/g, "") // Remove spaces
    .trim();
}

/**
 * Check if text contains blocked words
 */
function containsBlockedWord(text: string): boolean {
  const normalized = normalizeText(text);

  // Check exact matches
  for (const word of BLOCKED_WORDS) {
    if (normalized.includes(word)) {
      return true;
    }
  }

  // Check pattern matches
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(normalized)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate friendly suggestions based on rejected name
 */
function generateSuggestions(rejectedName: string): string[] {
  const suggestions: string[] = [];

  // Generate random suffixes
  const suffixes = ["Study", "Learn", "Brain", "Smart", "Star", "Pro", "Ace", "Plus"];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  // Try to salvage the name by removing problematic parts
  const cleaned = rejectedName.replace(/[^a-zA-Z0-9]/g, "").substring(0, 15);
  if (cleaned.length >= 2 && !containsBlockedWord(cleaned)) {
    suggestions.push(cleaned);
  }

  // Generate random alternatives
  suggestions.push(`${randomSuffix}${Math.floor(Math.random() * 999)}`);
  suggestions.push(`Student${Math.floor(Math.random() * 9999)}`);
  suggestions.push(`Learner${Math.floor(Math.random() * 999)}`);

  return suggestions.slice(0, 3);
}

/**
 * Validate username or companion name
 */
export function validateName(name: string, type: "username" | "companion" = "username"): ValidationResult {
  // Check if empty
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: `Please enter a ${type === "username" ? "username" : "name for your companion"}`
    };
  }

  const trimmedName = name.trim();

  // Check minimum length
  if (trimmedName.length < USERNAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Name must be at least ${USERNAME_MIN_LENGTH} characters long`
    };
  }

  // Check maximum length
  if (trimmedName.length > USERNAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Name must be no more than ${USERNAME_MAX_LENGTH} characters long`
    };
  }

  // Check for inappropriate content
  if (containsBlockedWord(trimmedName)) {
    return {
      isValid: false,
      error: "This name contains inappropriate content. Please choose a different name.",
      suggestions: generateSuggestions(trimmedName)
    };
  }

  // Check for valid characters (letters, numbers, spaces, basic punctuation)
  const validCharPattern = /^[a-zA-Z0-9\s\-_\.]+$/;
  if (!validCharPattern.test(trimmedName)) {
    return {
      isValid: false,
      error: "Name can only contain letters, numbers, spaces, hyphens, and underscores"
    };
  }

  // Check for excessive special characters
  const specialCharCount = (trimmedName.match(/[\-_\.]/g) || []).length;
  if (specialCharCount > 3) {
    return {
      isValid: false,
      error: "Name contains too many special characters"
    };
  }

  // Check for repeated characters (e.g., "aaaaaaa")
  const repeatedCharPattern = /(.)\1{4,}/;
  if (repeatedCharPattern.test(trimmedName)) {
    return {
      isValid: false,
      error: "Name contains too many repeated characters"
    };
  }

  return { isValid: true };
}

/**
 * Real-time validation for input fields
 * Returns error message or empty string if valid
 */
export function validateNameRealtime(name: string, type: "username" | "companion" = "username"): string {
  if (!name || name.length === 0) return "";

  const result = validateName(name, type);
  return result.isValid ? "" : (result.error || "");
}

/**
 * Check if any text content contains inappropriate language
 * Can be used for messages, comments, posts, task titles, etc.
 */
export function containsInappropriateContent(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  return containsBlockedWord(text);
}

/**
 * Validate and filter inappropriate content from messages
 * Returns validation result with error message if inappropriate
 */
export function filterInappropriateContent(text: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: "Content cannot be empty" };
  }
  
  if (containsBlockedWord(text)) {
    return { 
      isValid: false, 
      error: "Your content contains inappropriate language. Please revise." 
    };
  }
  
  return { isValid: true };
}

/**
 * AI-based content moderation (optional, for context-sensitive detection)
 * This is a placeholder - in production you'd integrate with OpenAI Moderation API
 */
export async function moderateWithAI(text: string): Promise<ValidationResult> {
  // For now, just use the blocklist validation
  // In production, you could call OpenAI's moderation endpoint:
  // const response = await fetch("https://api.openai.com/v1/moderations", { ... });

  return validateName(text);
}
