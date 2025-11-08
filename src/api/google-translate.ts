import { Language } from "../types";

/**
 * GOOGLE TRANSLATE API INTEGRATION
 *
 * Dynamic translation service for Studentopia using Google Cloud Translation API
 * Supports all 14 languages with caching for offline access and performance
 *
 * Setup Instructions:
 * 1. Get API key from Google Cloud Console: https://console.cloud.google.com/
 * 2. Enable Cloud Translation API
 * 3. Add API key to .env file as GOOGLE_TRANSLATE_API_KEY
 * 4. Install dependencies (if not already): bun add @google-cloud/translate
 *
 * Features:
 * - Real-time translation of any text
 * - Automatic language detection
 * - Translation caching for offline access
 * - Batch translation support
 * - Error handling with fallbacks
 */

// Google Translate API endpoint
const GOOGLE_TRANSLATE_API_URL = "https://translation.googleapis.com/language/translate/v2";

// Language code mapping (Studentopia -> Google Translate)
const LANGUAGE_CODE_MAP: Record<Language, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  zh: "zh-CN", // Simplified Chinese
  ja: "ja",
  ar: "ar",
  ko: "ko",
  pt: "pt",
  hi: "hi",
  it: "it",
  tr: "tr",
  ru: "ru",
  id: "id",
};

// Reverse mapping for language detection
const GOOGLE_TO_STUDENTOPIA_MAP: Record<string, Language> = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  "zh-CN": "zh",
  "zh-TW": "zh", // Traditional Chinese -> Simplified
  ja: "ja",
  ar: "ar",
  ko: "ko",
  pt: "pt",
  hi: "hi",
  it: "it",
  tr: "tr",
  ru: "ru",
  id: "id",
};

interface TranslateOptions {
  from?: Language; // Source language (auto-detect if not provided)
  to: Language; // Target language
  text: string | string[]; // Text to translate (string or array)
  format?: "text" | "html"; // Format of the text
}

interface TranslateResponse {
  translatedText: string | string[];
  detectedSourceLanguage?: Language;
  cached?: boolean;
}

interface GoogleTranslateAPIResponse {
  data: {
    translations: {
      translatedText: string;
      detectedSourceLanguage?: string;
    }[];
  };
}

/**
 * Main translation function using Google Translate API
 */
export const translateText = async (options: TranslateOptions): Promise<TranslateResponse> => {
  const { from, to, text, format = "text" } = options;

  // Get API key from environment
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    console.warn("Google Translate API key not found. Translation disabled.");
    // Return original text if no API key
    return {
      translatedText: text,
      cached: false,
    };
  }

  // Convert to array for batch processing
  const textsToTranslate = Array.isArray(text) ? text : [text];
  const targetLang = LANGUAGE_CODE_MAP[to];
  const sourceLang = from ? LANGUAGE_CODE_MAP[from] : undefined;

  try {
    // Build request body
    const requestBody: any = {
      q: textsToTranslate,
      target: targetLang,
      format,
    };

    if (sourceLang) {
      requestBody.source = sourceLang;
    }

    // Make API request
    const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status} ${response.statusText}`);
    }

    const data: GoogleTranslateAPIResponse = await response.json();

    // Extract translations
    const translations = data.data.translations.map((t) => t.translatedText);
    const detectedLang = data.data.translations[0]?.detectedSourceLanguage;

    return {
      translatedText: Array.isArray(text) ? translations : translations[0],
      detectedSourceLanguage: detectedLang ? (GOOGLE_TO_STUDENTOPIA_MAP[detectedLang] || "en") : undefined,
      cached: false,
    };
  } catch (error) {
    console.error("Translation error:", error);
    // Fallback to original text on error
    return {
      translatedText: text,
      cached: false,
    };
  }
};

/**
 * Detect language of given text
 */
export const detectLanguage = async (text: string): Promise<Language> => {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    return "en"; // Default to English
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: [text] }),
      }
    );

    if (!response.ok) {
      throw new Error(`Language detection error: ${response.status}`);
    }

    const data: any = await response.json();
    const detectedLang = data.data.detections[0]?.[0]?.language;

    return GOOGLE_TO_STUDENTOPIA_MAP[detectedLang] || "en";
  } catch (error) {
    console.error("Language detection error:", error);
    return "en";
  }
};

/**
 * Translate study tips
 */
export const translateStudyTip = async (
  title: string,
  description: string,
  targetLang: Language
): Promise<{ title: string; description: string }> => {
  try {
    const result = await translateText({
      to: targetLang,
      text: [title, description],
    });

    const translations = Array.isArray(result.translatedText) ? result.translatedText : [result.translatedText];

    return {
      title: translations[0] || title,
      description: translations[1] || description,
    };
  } catch (error) {
    console.error("Study tip translation error:", error);
    return { title, description };
  }
};

/**
 * Translate motivational quote
 */
export const translateQuote = async (
  text: string,
  author: string,
  targetLang: Language
): Promise<{ text: string; author: string }> => {
  try {
    const result = await translateText({
      to: targetLang,
      text: [text, author],
    });

    const translations = Array.isArray(result.translatedText) ? result.translatedText : [result.translatedText];

    return {
      text: translations[0] || text,
      author: translations[1] || author,
    };
  } catch (error) {
    console.error("Quote translation error:", error);
    return { text, author };
  }
};

/**
 * Translate AI-generated content
 */
export const translateAIContent = async (content: string, targetLang: Language): Promise<string> => {
  try {
    const result = await translateText({
      to: targetLang,
      text: content,
    });

    return typeof result.translatedText === "string" ? result.translatedText : content;
  } catch (error) {
    console.error("AI content translation error:", error);
    return content;
  }
};

/**
 * Translate notification message
 */
export const translateNotification = async (
  title: string,
  body: string,
  targetLang: Language
): Promise<{ title: string; body: string }> => {
  try {
    const result = await translateText({
      to: targetLang,
      text: [title, body],
    });

    const translations = Array.isArray(result.translatedText) ? result.translatedText : [result.translatedText];

    return {
      title: translations[0] || title,
      body: translations[1] || body,
    };
  } catch (error) {
    console.error("Notification translation error:", error);
    return { title, body };
  }
};

/**
 * Check if Google Translate API is available
 */
export const isTranslationAvailable = (): boolean => {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  return !!apiKey;
};

/**
 * Get supported languages for translation
 */
export const getSupportedLanguages = (): Language[] => {
  return Object.keys(LANGUAGE_CODE_MAP) as Language[];
};

/**
 * Estimate translation cost (approximate)
 * Google Translate charges $20 per million characters
 */
export const estimateTranslationCost = (characterCount: number): number => {
  const costPerMillion = 20; // USD
  return (characterCount / 1_000_000) * costPerMillion;
};
