/**
 * SPECIALIST MODULES
 * ------------------
 * Domain-specific analysis modules that route to the correct engine.
 * Each specialist requests only the relevant data.
 */

import { Chart } from '../astrology/chart';
import { VimshottariResult } from '../astronomy/dasha';
import { TransitPosition } from '../astronomy/transits';
import { analyzeMarriage } from '../astrology/rules/marriage';
import { analyzeCareer } from '../astrology/rules/career';
import { analyzeFamily } from '../astrology/rules/family';
import { analyzeRemedies, RemediesAnalysis } from './remedies';
import { computeMarsDosha } from '../astrology/doshas/mars-dosha';
import { drawThreeCardSpread, drawSingleCard } from '../tarot/draw';
import { ClassifiedIntent, IntentCategory } from '../ai/intent-classifier';
import { UserContext, buildGeneralContext, buildMarriageContext, buildCareerContext, buildFamilyContext, buildDoshaContext, buildTarotContext, buildRemediesContext, VerifiedContext } from '../ai/context-builder';

export interface SpecialistResult {
  specialist: string;
  context: VerifiedContext;
  analysisReady: boolean;
}

/**
 * Route to the correct specialist based on intent.
 */
export function routeToSpecialist(
  intent: ClassifiedIntent,
  user: UserContext,
  chart: Chart,
  dasha: VimshottariResult,
  transits: TransitPosition[],
  moonRashiIndex: number,
  question: string,
): SpecialistResult {
  const category = intent.category;

  switch (category) {
    case 'marriage_timing':
    case 'love_marriage':
      return analyzeMarriageSpecialist(user, chart, dasha, transits, moonRashiIndex, question, intent);

    case 'career_decision':
    case 'financial_period':
      return analyzeCareerSpecialist(user, chart, dasha, transits, question, intent);

    case 'family_issue':
      return analyzeFamilySpecialist(user, chart, dasha, transits, question, intent);

    case 'dosha_check':
      return analyzeDoshaSpecialist(user, chart, moonRashiIndex, question, intent);

    case 'tarot_reading':
      return analyzeTarotSpecialist(user, question, intent);

    case 'remedies':
      return analyzeRemediesSpecialist(user, chart, moonRashiIndex, question, intent);

    case 'health':
    case 'general':
    default:
      return analyzeGeneralSpecialist(user, chart, dasha, transits, question, intent);
  }
}

function analyzeMarriageSpecialist(
  user: UserContext,
  chart: Chart,
  dasha: VimshottariResult,
  transits: TransitPosition[],
  moonRashiIndex: number,
  question: string,
  intent: ClassifiedIntent,
): SpecialistResult {
  const marsDosha = computeMarsDosha(chart, moonRashiIndex);
  const marriageAnalysis = analyzeMarriage(chart, dasha, transits, marsDosha);
  const context = buildMarriageContext(user, 'tanglish', question, intent, marriageAnalysis);

  return {
    specialist: 'marriage',
    context,
    analysisReady: true,
  };
}

function analyzeCareerSpecialist(
  user: UserContext,
  chart: Chart,
  dasha: VimshottariResult,
  transits: TransitPosition[],
  question: string,
  intent: ClassifiedIntent,
): SpecialistResult {
  const careerAnalysis = analyzeCareer(chart, dasha, transits);
  const context = buildCareerContext(user, 'tanglish', question, intent, careerAnalysis);

  return {
    specialist: 'career',
    context,
    analysisReady: true,
  };
}

function analyzeFamilySpecialist(
  user: UserContext,
  chart: Chart,
  dasha: VimshottariResult,
  transits: TransitPosition[],
  question: string,
  intent: ClassifiedIntent,
): SpecialistResult {
  const familyAnalysis = analyzeFamily(chart, dasha, transits);
  const context = buildFamilyContext(user, 'tanglish', question, intent, familyAnalysis);

  return {
    specialist: 'family',
    context,
    analysisReady: true,
  };
}

function analyzeDoshaSpecialist(
  user: UserContext,
  chart: Chart,
  moonRashiIndex: number,
  question: string,
  intent: ClassifiedIntent,
): SpecialistResult {
  const doshaResults = [computeMarsDosha(chart, moonRashiIndex)];
  const context = buildDoshaContext(user, 'tanglish', question, intent, doshaResults);

  return {
    specialist: 'general',
    context,
    analysisReady: true,
  };
}

function analyzeTarotSpecialist(
  user: UserContext,
  question: string,
  intent: ClassifiedIntent,
): SpecialistResult {
  const tarotSpread = drawThreeCardSpread();
  const context = buildTarotContext(user, 'tanglish', question, intent, tarotSpread);

  return {
    specialist: 'tarot',
    context,
    analysisReady: true,
  };
}

function analyzeGeneralSpecialist(
  user: UserContext,
  chart: Chart,
  dasha: VimshottariResult,
  transits: TransitPosition[],
  question: string,
  intent: ClassifiedIntent,
): SpecialistResult {
  const context = buildGeneralContext(user, 'tanglish', question, intent, chart, dasha, transits);

  return {
    specialist: 'general',
    context,
    analysisReady: true,
  };
}

function analyzeRemediesSpecialist(
  user: UserContext,
  chart: Chart,
  moonRashiIndex: number,
  question: string,
  intent: ClassifiedIntent,
): SpecialistResult {
  const remediesAnalysis = analyzeRemedies(chart, moonRashiIndex);
  const context = buildRemediesContext(user, 'tanglish', question, intent, remediesAnalysis);

  return {
    specialist: 'remedies',
    context,
    analysisReady: true,
  };
}
