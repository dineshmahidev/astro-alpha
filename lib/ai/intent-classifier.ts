/**
 * INTENT CLASSIFIER
 * -----------------
 * Classifies user questions into domain-specific intents.
 * The specialist engine then uses this to route to the correct analysis.
 */

export type IntentCategory =
  | 'general'
  | 'marriage_timing'
  | 'love_marriage'
  | 'dosha_check'
  | 'career_decision'
  | 'financial_period'
  | 'family_issue'
  | 'remedies'
  | 'health'
  | 'palm_reading'
  | 'tarot_reading'
  | 'transit_question';

export interface ClassifiedIntent {
  category: IntentCategory;
  confidence: number;
  keywords: string[];
}

// Intent patterns - order matters (more specific first)
const INTENT_PATTERNS: { category: IntentCategory; patterns: RegExp[] }[] = [
  {
    category: 'dosha_check',
    patterns: [
      /sevvai\s*dosham/i,
      /mangal\s*dosha/i,
      /mars\s*dosha/i,
      /dosham\s*irukka/i,
      /dosha\s*irukka/i,
      /dosham\s*irukkuma/i,
      /dosha\s*irukkuma/i,
    ],
  },
  {
    category: 'marriage_timing',
    patterns: [
      /marriage\s*eppo/i,
      /marriage\s*when/i,
      /marriage\s*epd/i,
      /thirumanam\s*eppo/i,
      /thirumanam\s*when/i,
      /kalyanam\s*eppo/i,
      /get\s*married/i,
      /wedding\s*when/i,
      /marriage\s*aagum/i,
      /marriage\s*aaguma/i,
      /thirumanam\s*aagum/i,
      /enakku\s*marriage/i,
      /enakku\s*thirumanam/i,
    ],
  },
  {
    category: 'love_marriage',
    patterns: [
      /love\s*marriage/i,
      /love\s*marriage\s*chance/i,
      /love\s*marriage\s*aaguma/i,
      /love\s*marriage\s*aagum/i,
      /love\s*marriage\s*possibility/i,
      /love\s*marriage\s*yogam/i,
      /enakku\s*love\s*marriage/i,
    ],
  },
  {
    category: 'career_decision',
    patterns: [
      /job\s*change/i,
      /career/i,
      /job/i,
      /work/i,
      /profession/i,
      /business/i,
      /promotion/i,
      /salary/i,
      /new\s*job/i,
      /career\s*change/i,
      /job\s*visaiyil/i,
      /velai/i,
      /thozhil/i,
      /velai\s*visaiyil/i,
      /velai\s*change/i,
    ],
  },
  {
    category: 'financial_period',
    patterns: [
      /money/i,
      /finance/i,
      /financial/i,
      /wealth/i,
      /income/i,
      /savings/i,
      /investment/i,
      /panam/i,
      /pana/i,
      /money\s*growth/i,
      /financial\s*period/i,
    ],
  },
  {
    category: 'family_issue',
    patterns: [
      /family/i,
      /home/i,
      /domestic/i,
      /parents/i,
      /mother/i,
      /father/i,
      /siblings/i,
      /kudumbam/i,
      /veedu/i,
      /amma/i,
      /appa/i,
    ],
  },
  {
    category: 'health',
    patterns: [
      /health/i,
      /wellness/i,
      /disease/i,
      /illness/i,
      /medical/i,
      /hospital/i,
      /arokiyam/i,
      /health\s*epdi/i,
    ],
  },
  {
    category: 'remedies',
    patterns: [
      /remedy/i,
      /remedies/i,
      /parikaram/i,
      /parigaram/i,
      /upayam/i,
      /upay/i,
      /pooja/i,
      /mantra/i,
      /gemstone/i,
      /ratnam/i,
      /enna\s*parikaram/i,
      /enna\s*parigaram/i,
    ],
  },
  {
    category: 'palm_reading',
    patterns: [
      /palm\s*reading/i,
      /palm/i,
      /hand\s*reading/i,
      /hastha/i,
      /kai/i,
      /kai\s*olaichol/,
      /palm\s*photo/i,
    ],
  },
  {
    category: 'tarot_reading',
    patterns: [
      /tarot/i,
      /tarot\s*card/i,
      /tarot\s*reading/i,
      /card\s*reading/i,
      /cards/i,
    ],
  },
  {
    category: 'transit_question',
    patterns: [
      /transit/i,
      /gochara/i,
      /current\s*position/i,
      /today/i,
      /this\s*week/i,
      /this\s*month/i,
      /this\s*year/i,
      /inaku/i,
      /inniku/i,
    ],
  },
];

/**
 * Classify user intent from question text.
 */
export function classifyIntent(question: string): ClassifiedIntent {
  const q = question.toLowerCase().trim();

  for (const intent of INTENT_PATTERNS) {
    for (const pattern of intent.patterns) {
      if (pattern.test(q)) {
        return {
          category: intent.category,
          confidence: 0.9,
          keywords: extractKeywords(q),
        };
      }
    }
  }

  // Default to general
  return {
    category: 'general',
    confidence: 0.5,
    keywords: extractKeywords(q),
  };
}

/**
 * Extract relevant keywords from question.
 */
function extractKeywords(question: string): string[] {
  const words = question.split(/\s+/);
  const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'shall', 'can', 'i', 'me', 'my', 'mine', 'enakku', 'enna',
    'epdi', 'eppo', 'yaaru', 'edhu', 'how', 'what', 'when', 'where', 'why', 'who'];

  return words
    .filter((w) => w.length > 2 && !stopWords.includes(w))
    .slice(0, 10);
}

/**
 * Get specialist required for the intent.
 */
export function getSpecialistForIntent(intent: IntentCategory): string {
  const mapping: Record<IntentCategory, string> = {
    general: 'general',
    marriage_timing: 'marriage',
    love_marriage: 'marriage',
    dosha_check: 'general',
    career_decision: 'career',
    financial_period: 'career',
    family_issue: 'family',
    remedies: 'remedies',
    health: 'health',
    palm_reading: 'palm',
    tarot_reading: 'tarot',
    transit_question: 'general',
  };

  return mapping[intent];
}
