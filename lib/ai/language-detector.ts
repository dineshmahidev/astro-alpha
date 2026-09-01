/**
 * LANGUAGE DETECTOR
 * -----------------
 * Detects user's language and writing style from their message.
 * The AI must mirror this style naturally.
 */

export type DetectedLanguage = 'tamil_script' | 'tanglish' | 'hindi_script' | 'hinglish' | 'english';

export interface LanguageDetection {
  detected: DetectedLanguage;
  confidence: number;
  tamilPercentage: number;
  hindiPercentage: number;
  englishPercentage: number;
}

// Tamil Unicode range: \u0B80-\u0BFF
const TAMIL_REGEX = /[\u0B80-\u0BFF]/g;
// Devanagari (Hindi) Unicode range: \u0900-\u097F
const HINDI_REGEX = /[\u0900-\u097F]/g;
// Latin characters
const ENGLISH_REGEX = /[a-zA-Z]/g;

// Common Tanglish patterns
const TANGLISH_PATTERNS = [
  /\b(enakku|enna|epdi|eppo|yaaru|edhu|solren|panren|irukkum|irukku|aagum|aaguma|nu)\b/i,
  /\b(vanakkam|namaskaram|romba|konjam|illa|okke|apdi|ipdi|adhuvum|idhuvum)\b/i,
  /\b(pannalam|pannunga|seiyungalen|solunga|ketkkanum|mudiyadhu|panranum)\b/i,
];

// Common Hinglish patterns
const HINGLISH_PATTERNS = [
  /\b(aapka|bahut|accha|hai|mein|ko|ka|ke|liye|bolte|samajhte|bilkul|ekdum)\b/i,
  /\b(kya|kaise|kab|kaun|kahan|kyun|nahi|haan|ji|bhaiya|didi)\b/i,
];

/**
 * Detect the language and writing style from user's message.
 */
export function detectLanguage(text: string): LanguageDetection {
  const tamilMatches = text.match(TAMIL_REGEX) || [];
  const hindiMatches = text.match(HINDI_REGEX) || [];
  const englishMatches = text.match(ENGLISH_REGEX) || [];

  const totalChars = tamilMatches.length + hindiMatches.length + englishMatches.length || 1;

  const tamilPercentage = tamilMatches.length / totalChars;
  const hindiPercentage = hindiMatches.length / totalChars;
  const englishPercentage = englishMatches.length / totalChars;

  // Check for Tanglish patterns
  const hasTanglishPatterns = TANGLISH_PATTERNS.some((p) => p.test(text));
  const hasHinglishPatterns = HINGLISH_PATTERNS.some((p) => p.test(text));

  let detected: DetectedLanguage;
  let confidence: number;

  if (tamilPercentage > 0.5) {
    detected = 'tamil_script';
    confidence = 0.9;
  } else if (hindiPercentage > 0.5) {
    detected = 'hindi_script';
    confidence = 0.9;
  } else if (tamilPercentage > 0.1 && hasTanglishPatterns) {
    detected = 'tanglish';
    confidence = 0.85;
  } else if (hindiPercentage > 0.1 && hasHinglishPatterns) {
    detected = 'hinglish';
    confidence = 0.85;
  } else if (hasTanglishPatterns && englishPercentage > 0.3) {
    detected = 'tanglish';
    confidence = 0.8;
  } else if (hasHinglishPatterns && englishPercentage > 0.3) {
    detected = 'hinglish';
    confidence = 0.8;
  } else {
    detected = 'english';
    confidence = 0.7;
  }

  return {
    detected,
    confidence,
    tamilPercentage,
    hindiPercentage,
    englishPercentage,
  };
}

/**
 * Get AI response language instructions based on detected language.
 */
export function getLanguageInstructions(detected: DetectedLanguage): string {
  switch (detected) {
    case 'tamil_script':
      return 'Reply in Tamil script (Unicode). Use proper Tamil grammar.';
    case 'tanglish':
      return 'Reply in Tanglish — mix Tamil words written in English script with English. Example: "Vanakkam! Un health romba nalla irukkum today."';
    case 'hindi_script':
      return 'Reply in Hindi script (Devanagari). Use proper Hindi grammar.';
    case 'hinglish':
      return 'Reply in Hinglish — mix Hindi words written in English script with English. Example: "Namaste! Aapka health bahut accha hai."';
    case 'english':
      return 'Reply in English. Include Tamil astrological terms like Rahu kaalam, Nalla neram, dosham, porutham when relevant.';
  }
}

/**
 * Mirror the user's language style.
 */
export function mirrorUserStyle(text: string): string {
  const detection = detectLanguage(text);
  return getLanguageInstructions(detection.detected);
}
