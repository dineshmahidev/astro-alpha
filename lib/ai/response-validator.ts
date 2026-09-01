/**
 * RESPONSE VALIDATOR
 * ------------------
 * Validates AI responses to ensure no invented data is presented as fact.
 * The AI must NEVER invent: planetary positions, doshas, dates, cards, etc.
 */

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  violations: string[];
}

// Patterns that indicate the AI may have invented data
const INVENTED_DATA_PATTERNS = [
  // Invented planetary positions
  /planet\s+\w+\s+(is|are)\s+in\s+\w+\s+at\s+\d+/i,
  /sun\s+is\s+at\s+\d+/i,
  /moon\s+is\s+at\s+\d+/i,
  /mars\s+is\s+at\s+\d+/i,

  // Invented dates
  /you\s+will\s+(get\s+)?married\s+(on|in|by)\s+\w+\s+\d{4}/i,
  /marriage\s+(will|shall)\s+happen\s+(on|in|by)\s+\w+\s+\d{4}/i,
  /you\s+will\s+get\s+a\s+job\s+(on|in|by)\s+\w+\s+\d{4}/i,

  // Invented doshas (without calculation)
  /you\s+(have|has)\s+sevvai\s+dosham/i,
  /you\s+(have|has)\s+mangal\s+dosha/i,
  /your\s+chart\s+shows\s+dosham/i,

  // Invented tarot cards
  /you\s+drew\s+the\s+\w+/i,
  /the\s+card\s+(is|shows)\s+the\s+\w+/i,

  // Invented remedies without source
  /you\s+must\s+(wear|buy|purchase)\s+\w+\s+gemstone/i,
  /you\s+must\s+donate\s+\w+/i,
];

// Safe patterns (allowed expressions)
const SAFE_PATTERNS = [
  /based\s+on\s+(your|the)\s+(calculated|provided|detected)/i,
  /according\s+to\s+(your|the)\s+(chart|analysis|reading)/i,
  /the\s+(calculated|detected|analyzed)\s+data\s+shows/i,
  /your\s+(birth\s+)?chart\s+(indicates|shows|suggests)/i,
  /if\s+(the|your)\s+(data|chart|calculation)/i,
  /when\s+(the|your)\s+(data|chart|calculation)/i,
];

/**
 * Validate AI response for invented data.
 */
export function validateResponse(
  response: string,
  context?: string,
): ValidationResult {
  const warnings: string[] = [];
  const violations: string[] = [];

  // Check for invented data patterns
  for (const pattern of INVENTED_DATA_PATTERNS) {
    if (pattern.test(response)) {
      violations.push(`Potential invented data detected: ${pattern.source}`);
    }
  }

  // Check if response references verified context
  const hasContextReference = SAFE_PATTERNS.some((p) => p.test(response));
  if (!hasContextReference && response.length > 100) {
    warnings.push('Response may not reference verified calculation data');
  }

  // Check for absolute predictions
  if (/\b(will|shall|must|definitely|certainly|guaranteed)\b/i.test(response)) {
    warnings.push('Response contains absolute predictions — should be softened');
  }

  // Check for excessive confidence
  if (/\b(100%|always|never|every time)\b/i.test(response)) {
    warnings.push('Response contains excessive confidence claims');
  }

  // Check if response mentions data not in context
  if (context) {
    const mentionedPlanets = response.match(/\b(sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu)\b/gi) || [];
    const contextPlanets = context.match(/\b(sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu)\b/gi) || [];
    const uniqueMentioned = new Set(mentionedPlanets.map((p) => p.toLowerCase()));
    const uniqueContext = new Set(contextPlanets.map((p) => p.toLowerCase()));

    for (const planet of uniqueMentioned) {
      if (!uniqueContext.has(planet)) {
        warnings.push(`Mentions ${planet} but not in provided context`);
      }
    }
  }

  return {
    valid: violations.length === 0,
    warnings,
    violations,
  };
}

/**
 * Sanitize AI response — remove any invented data if detected.
 */
export function sanitizeResponse(
  response: string,
  validationResult: ValidationResult,
): string {
  if (validationResult.valid) return response;

  // If there are violations, add a disclaimer
  let sanitized = response;

  if (validationResult.violations.length > 0) {
    sanitized += '\n\nNote: Some parts of this response may not be based on verified calculation data. Please treat with caution.';
  }

  if (validationResult.warnings.length > 0) {
    sanitized += '\n\nDisclaimer: Predictions are based on traditional Vedic astrology rules and should be used as guidance, not as certainty.';
  }

  return sanitized;
}
