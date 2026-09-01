/**
 * CONTEXT BUILDER
 * ---------------
 * Builds verified structured context to send to the AI.
 * The AI must ONLY use this data — never invent calculations.
 */

import { Chart } from '../astrology/chart';
import { VimshottariResult } from '../astronomy/dasha';
import { TransitPosition } from '../astronomy/transits';
import { MarriageAnalysis } from '../astrology/rules/marriage';
import { CareerAnalysis } from '../astrology/rules/career';
import { FamilyAnalysis } from '../astrology/rules/family';
import { DoshaResult } from '../astrology/types';
import { TarotSpread } from '../tarot/draw';
import { ClassifiedIntent } from './intent-classifier';
import { DetectedLanguage } from './language-detector';

export interface UserContext {
  name: string;
  dob?: string;
  tob?: string;
  place?: string;
  rashi?: string;
  nakshatra?: string;
  gothram?: string;
}

export interface VerifiedContext {
  user: UserContext;
  language: { detected: DetectedLanguage };
  question: { text: string; intent: ClassifiedIntent };
  chart?: {
    lagna: string;
    rashi: string;
    nakshatra: string;
    planetaryPositions: string[];
  };
  dasha?: {
    currentMaha: string;
    currentAntar: string;
    period: string;
  };
  marriageAnalysis?: MarriageAnalysis;
  careerAnalysis?: CareerAnalysis;
  familyAnalysis?: FamilyAnalysis;
  doshaResults?: DoshaResult[];
  tarotSpread?: TarotSpread;
  transitHighlights?: string[];
  remediesAnalysis?: import('../specialists/remedies').RemediesAnalysis;
}

/**
 * Build verified context for general analysis.
 */
export function buildGeneralContext(
  user: UserContext,
  language: DetectedLanguage,
  question: string,
  intent: ClassifiedIntent,
  chart: Chart,
  dasha: VimshottariResult,
  transits: TransitPosition[],
): VerifiedContext {
  const byKey = new Map(chart.planets.map((p) => [p.key, p]));

  return {
    user,
    language: { detected: language },
    question: { text: question, intent },
    chart: {
      lagna: byKey.get('Sun')?.rashi || 'Unknown',
      rashi: byKey.get('Moon')?.rashi || 'Unknown',
      nakshatra: byKey.get('Moon')?.nakshatra || 'Unknown',
      planetaryPositions: chart.planets.map(
        (p) => `${p.key} in ${p.rashi} (house ${p.houseNumber}, ${p.retrograde ? 'retrograde' : 'direct'})`
      ),
    },
    dasha: {
      currentMaha: dasha.birthMahadasha.lord,
      currentAntar: 'Current',
      period: `${dasha.birthMahadasha.startDate} to ${dasha.birthMahadasha.endDate}`,
    },
    transitHighlights: transits
      .filter((t) => ['Jupiter', 'Saturn', 'Rahu'].includes(t.planet))
      .map((t) => `${t.planet} transits house ${t.houseFromJanmaRashi} from rashi`),
  };
}

/**
 * Build verified context for marriage analysis.
 */
export function buildMarriageContext(
  user: UserContext,
  language: DetectedLanguage,
  question: string,
  intent: ClassifiedIntent,
  marriageAnalysis: MarriageAnalysis,
): VerifiedContext {
  return {
    user,
    language: { detected: language },
    question: { text: question, intent },
    marriageAnalysis,
  };
}

/**
 * Build verified context for career analysis.
 */
export function buildCareerContext(
  user: UserContext,
  language: DetectedLanguage,
  question: string,
  intent: ClassifiedIntent,
  careerAnalysis: CareerAnalysis,
): VerifiedContext {
  return {
    user,
    language: { detected: language },
    question: { text: question, intent },
    careerAnalysis,
  };
}

/**
 * Build verified context for family analysis.
 */
export function buildFamilyContext(
  user: UserContext,
  language: DetectedLanguage,
  question: string,
  intent: ClassifiedIntent,
  familyAnalysis: FamilyAnalysis,
): VerifiedContext {
  return {
    user,
    language: { detected: language },
    question: { text: question, intent },
    familyAnalysis,
  };
}

/**
 * Build verified context for dosha check.
 */
export function buildDoshaContext(
  user: UserContext,
  language: DetectedLanguage,
  question: string,
  intent: ClassifiedIntent,
  doshaResults: DoshaResult[],
): VerifiedContext {
  return {
    user,
    language: { detected: language },
    question: { text: question, intent },
    doshaResults,
  };
}

/**
 * Build verified context for tarot reading.
 */
export function buildTarotContext(
  user: UserContext,
  language: DetectedLanguage,
  question: string,
  intent: ClassifiedIntent,
  tarotSpread: TarotSpread,
): VerifiedContext {
  return {
    user,
    language: { detected: language },
    question: { text: question, intent },
    tarotSpread,
  };
}

/**
 * Build verified context for remedies analysis.
 */
export function buildRemediesContext(
  user: UserContext,
  language: DetectedLanguage,
  question: string,
  intent: ClassifiedIntent,
  remediesAnalysis: import('../specialists/remedies').RemediesAnalysis,
): VerifiedContext {
  return {
    user,
    language: { detected: language },
    question: { text: question, intent },
    remediesAnalysis,
  };
}

/**
 * Format context as system prompt for the AI.
 */
export function formatContextAsSystemPrompt(context: VerifiedContext): string {
  const sections: string[] = [];

  // User data
  sections.push(`USER DATA:
Name: ${context.user.name}
DOB: ${context.user.dob || 'Not provided'}
Birth Time: ${context.user.tob || 'Not provided'}
Birth Place: ${context.user.place || 'Not provided'}
Rashi: ${context.user.rashi || 'Calculated from chart'}
Nakshatra: ${context.user.nakshatra || 'Calculated from chart'}
Gothram: ${context.user.gothram || 'Not provided'}`);

  // Language
  sections.push(`LANGUAGE: ${context.language.detected}`);

  // Question
  sections.push(`QUESTION: "${context.question.text}"
INTENT: ${context.question.intent.category}`);

  // Chart data
  if (context.chart) {
    sections.push(`BIRTH CHART:
Lagna: ${context.chart.lagna}
Rashi: ${context.chart.rashi}
Nakshatra: ${context.chart.nakshatra}
Planetary Positions:
${context.chart.planetaryPositions.map((p) => `  - ${p}`).join('\n')}`);
  }

  // Dasha
  if (context.dasha) {
    sections.push(`CURRENT DASHA:
Mahadasha: ${context.dasha.currentMaha}
Antardasha: ${context.dasha.currentAntar}
Period: ${context.dasha.period}`);
  }

  // Transit
  if (context.transitHighlights?.length) {
    sections.push(`TRANSIT HIGHLIGHTS:
${context.transitHighlights.map((t) => `  - ${t}`).join('\n')}`);
  }

  // Marriage analysis
  if (context.marriageAnalysis) {
    const ma = context.marriageAnalysis;
    sections.push(`MARRIAGE ANALYSIS (Confidence: ${ma.confidence}):
7th House: ${ma.seventhHouse.sign} (Lord: ${ma.seventhLord.planet})
Venus: ${ma.venus.sign} in house ${ma.venus.house}
Mars Dosha: ${ma.marsDosha.detected ? 'DETECTED (' + ma.marsDosha.severity + ')' : 'NOT DETECTED'}
Positive Factors:
${ma.positiveFactors.map((f) => `  + ${f.description}`).join('\n')}
Challenging Factors:
${ma.challengingFactors.map((f) => `  - ${f.description}`).join('\n')}
Favorable Periods:
${ma.favorablePeriods.map((p) => `  - ${p.reason} (${p.start} to ${p.end})`).join('\n')}`);
  }

  // Career analysis
  if (context.careerAnalysis) {
    const ca = context.careerAnalysis;
    sections.push(`CAREER ANALYSIS (Confidence: ${ca.confidence}):
10th House: ${ca.tenthHouse.sign} (Lord: ${ca.tenthLord.planet})
Saturn: ${ca.saturn.sign} in house ${ca.saturn.house}
Jupiter: ${ca.jupiter.sign} in house ${ca.jupiter.house}
Positive Factors:
${ca.positiveFactors.map((f) => `  + ${f.description}`).join('\n')}
Challenging Factors:
${ca.challengingFactors.map((f) => `  - ${f.description}`).join('\n')}`);
  }

  // Family analysis
  if (context.familyAnalysis) {
    const fa = context.familyAnalysis;
    sections.push(`FAMILY ANALYSIS (Confidence: ${fa.confidence}):
4th House: ${fa.fourthHouse.sign} (Lord: ${fa.fourthLord.planet})
Moon: ${fa.moon.sign} in house ${fa.moon.house}
Positive Factors:
${fa.positiveFactors.map((f) => `  + ${f.description}`).join('\n')}
Challenging Factors:
${fa.challengingFactors.map((f) => `  - ${f.description}`).join('\n')}`);
  }

  // Dosha results
  if (context.doshaResults?.length) {
    sections.push(`DOSHA RESULTS:
${context.doshaResults.map((d) =>
      `${d.type}: ${d.detected ? 'DETECTED (' + d.severity + ')' : 'NOT DETECTED'}
  Rule Set: ${d.ruleSet}
  Triggered Rules: ${d.triggeredRules.join(', ') || 'None'}
  Cancellation Rules: ${d.cancellationRules.join(', ') || 'None'}
  Details: ${d.explanationData.join(' ')}`
    ).join('\n')}`);
  }

  // Tarot spread
  if (context.tarotSpread) {
    sections.push(`TAROT READING:
Spread: ${context.tarotSpread.spread}
Cards:
${context.tarotSpread.cards.map((c) =>
      `  ${c.position}: ${c.card.name} (${c.orientation})`
    ).join('\n')}`);
  }

  // Remedies
  if (context.remediesAnalysis) {
    const ra = context.remediesAnalysis;
    sections.push(`REMEDIES ANALYSIS (Confidence: ${ra.confidence}):
${ra.remedies.map((r) =>
      `- Issue: ${r.issue}
  Tradition: ${r.tradition}
  Remedy: ${r.remedy}
  Source: ${r.sourceOrRuleId}
  Optional: ${r.optional ? 'Yes' : 'No'}`
    ).join('\n')}`);
  }

  return sections.join('\n\n');
}

/**
 * MASTER LLM SYSTEM PROMPT
 * -------------------------
 * The 15 core rules that the AI must follow at all times.
 * This is prepended to every AI conversation.
 */
export const MASTER_SYSTEM_PROMPT = `You are Koshmira's intelligent interpretation and conversation assistant.

Your role is NOT to independently calculate astrology, detect palm lines,
select tarot cards, or invent spiritual data.

You must use ONLY the verified structured context supplied to you.

CORE RULES:
1. First understand the user's actual question and conversation context.
2. Use only the provided calculated data.
3. NEVER invent: Planetary positions, Houses, Doshas, Dasha periods,
   Transit dates, Palm lines, Features, Tarot cards, Orientations,
   Remedies, Future dates, Missing user data.
4. If required data is unavailable, say so honestly.
5. Do not force every answer to mention astrology.
6. Explain reasoning naturally.
7. If positive and challenging indicators both exist, explain both fairly.
8. Never present prediction as guaranteed fact.
9. Do not be robotic or repetitive.
10. Adapt to user's actual language naturally.
11. Never force user into one language.
12. Match user's tone.
13. Remember recent conversation and resolve follow-up references.
14. Do not ask follow-up unless more information genuinely required.
15. Keep answer focused on user's exact question.

You are an INTERPRETER, not the calculation engine.`;

/**
 * Build complete system prompt with master rules + verified context.
 */
export function buildCompleteSystemPrompt(context: VerifiedContext): string {
  const verifiedData = formatContextAsSystemPrompt(context);
  const tanglishInstruction = context.language.detected === 'tanglish' || context.language.detected === 'tamil_script'
    ? 'Reply in Tanglish - mix Tamil words in English script naturally.'
    : context.language.detected === 'hindi_script' || context.language.detected === 'hinglish'
      ? 'Reply in Hindi in English script mixed with English.'
      : 'Reply in English with Tamil astrological terms.';

  return [
    MASTER_SYSTEM_PROMPT,
    '',
    tanglishInstruction,
    '',
    verifiedData,
  ].join('\n');
}
