/**
 * MARRIAGE ANALYSIS RULE ENGINE
 * -----------------------------
 * Deterministic marriage analysis based on Vedic astrology rules.
 * Uses 7th house, Venus, Mars, dosha results, dasha periods.
 *
 * The LLM must NOT calculate — only explain these results.
 */

import { Chart, ChartPlanet } from '../chart';
import { PlanetKey } from '../../astronomy/planetary-positions';
import { VimshottariResult } from '../../astronomy/dasha';
import { TransitPosition } from '../../astronomy/transits';
import { DoshaResult, HouseData, PlanetPosition, Factor, TimeWindow, Indicator, AnalysisMetadata } from '../types';

export interface MarriageAnalysis extends AnalysisResult {
  seventhHouse: HouseData;
  seventhLord: PlanetPosition;
  venus: PlanetPosition;
  marsDosha: DoshaResult;
  compatibilityIndicators: Indicator[];
}

interface AnalysisResult {
  positiveFactors: Factor[];
  challengingFactors: Factor[];
  favorablePeriods: TimeWindow[];
  confidence: 'high' | 'medium' | 'low';
  metadata: AnalysisMetadata;
}

// 7th house sign lords
const SEVENTH_LORDS: Record<string, PlanetKey> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

export function analyzeMarriage(
  chart: Chart,
  dasha: VimshottariResult,
  transits: TransitPosition[],
  marsDosha: DoshaResult,
): MarriageAnalysis {
  const positiveFactors: Factor[] = [];
  const challengingFactors: Factor[] = [];
  const favorablePeriods: TimeWindow[] = [];
  const compatibilityIndicators: Indicator[] = [];

  const byKey = new Map<PlanetKey, ChartPlanet>();
  for (const p of chart.planets) byKey.set(p.key, p);

  // 7th House analysis
  const seventhHouseData = chart.houses.find((h) => h.houseNumber === 7);
  const seventhHouse: HouseData = seventhHouseData
    ? {
        house: 7,
        sign: seventhHouseData.rashi,
        signLord: seventhHouseData.lord,
        planets: seventhHouseData.planets,
        strength: seventhHouseData.planets.length > 0 ? 0.7 : 0.3,
      }
    : { house: 7, sign: 'Unknown', signLord: 'Unknown', planets: [], strength: 0 };

  // 7th Lord
  const seventhLordKey = seventhHouse.signLord as PlanetKey | undefined;
  const seventhLordPlanet = seventhLordKey ? byKey.get(seventhLordKey) : undefined;
  const seventhLord: PlanetPosition = seventhLordPlanet
    ? {
        planet: seventhLordKey!,
        longitude: seventhLordPlanet.siderealLongitude,
        sign: seventhLordPlanet.rashi,
        signDegree: seventhLordPlanet.degreeInRashi,
        nakshatra: seventhLordPlanet.nakshatra,
        nakshatraPada: seventhLordPlanet.pada,
        house: seventhLordPlanet.houseNumber,
        retrograde: seventhLordPlanet.retrograde,
      }
    : { planet: 'Unknown', longitude: 0, sign: 'Unknown', signDegree: 0, nakshatra: 'Unknown', nakshatraPada: 0, house: 0, retrograde: false };

  // Venus analysis
  const venusPlanet = byKey.get('Venus');
  const venus: PlanetPosition = venusPlanet
    ? {
        planet: 'Venus',
        longitude: venusPlanet.siderealLongitude,
        sign: venusPlanet.rashi,
        signDegree: venusPlanet.degreeInRashi,
        nakshatra: venusPlanet.nakshatra,
        nakshatraPada: venusPlanet.pada,
        house: venusPlanet.houseNumber,
        retrograde: venusPlanet.retrograde,
      }
    : { planet: 'Venus', longitude: 0, sign: 'Unknown', signDegree: 0, nakshatra: 'Unknown', nakshatraPada: 0, house: 0, retrograde: false };

  // Positive factors
  if (seventhHouse.planets.length > 0) {
    positiveFactors.push({
      id: '7th_house_occupied',
      description: `7th house has ${seventhHouse.planets.join(', ')} — partnership energy is active`,
      weight: 2,
      source: '7th house analysis',
    });
  }

  if (seventhLord.house >= 1 && seventhLord.house <= 6) {
    positiveFactors.push({
      id: '7th_lord_in_kendra',
      description: `7th lord ${seventhLordKey} in house ${seventhLord.house} — strong partnership potential`,
      weight: 2,
      source: '7th lord placement',
    });
  }

  if (venus.sign === 'Libra' || venus.sign === 'Taurus' || venus.sign === 'Pisces') {
    positiveFactors.push({
      id: 'venus_strong',
      description: `Venus in ${venus.sign} — natural karaka for marriage is well-placed`,
      weight: 2,
      source: 'Venus analysis',
    });
  }

  if (!venus.retrograde) {
    positiveFactors.push({
      id: 'venus_direct',
      description: 'Venus is direct — smooth romantic energy',
      weight: 1,
      source: 'Venus motion',
    });
  }

  // Challenging factors
  if (marsDosha.detected) {
    challengingFactors.push({
      id: 'mars_dosha',
      description: `Mars Dosham detected (${marsDosha.severity} severity) — potential delays or conflicts in marriage`,
      weight: -2,
      source: 'Mars Dosha engine',
    });
  }

  if (venus.retrograde) {
    challengingFactors.push({
      id: 'venus_retrograde',
      description: 'Venus retrograde — relationship misunderstandings possible',
      weight: -1,
      source: 'Venus motion',
    });
  }

  if (seventhLord.retrograde) {
    challengingFactors.push({
      id: '7th_lord_retrograde',
      description: `7th lord ${seventhLordKey} retrograde — delays in partnership`,
      weight: -1,
      source: '7th lord motion',
    });
  }

  if (seventhHouse.sign === 'Scorpio' || seventhHouse.sign === 'Capricorn') {
    challengingFactors.push({
      id: '7th_house_tough_sign',
      description: `7th house in ${seventhHouse.sign} — requires extra effort for harmony`,
      weight: -1,
      source: '7th house sign',
    });
  }

  // Favorable periods from Dasha
  const currentMaha = dasha.birthMahadasha.lord;
  const favorablePlanets: PlanetKey[] = ['Venus', 'Jupiter', 'Moon'];

  if (favorablePlanets.includes(currentMaha)) {
    favorablePeriods.push({
      start: dasha.birthMahadasha.startDate,
      end: dasha.birthMahadasha.endDate,
      significance: 'high',
      reason: `${currentMaha} Mahadasha is favorable for marriage`,
    });
  }

  // Transit highlights
  for (const t of transits) {
    if (t.planet === 'Jupiter' && [5, 7, 9, 11].includes(t.houseFromJanmaRashi)) {
      favorablePeriods.push({
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        significance: 'medium',
        reason: `Jupiter transits house ${t.houseFromJanmaRashi} — favorable for relationships`,
      });
    }
  }

  // Compatibility indicators
  compatibilityIndicators.push({
    id: 'venus_7th_relation',
    category: 'planetary',
    factor: 'Venus',
    condition: `Venus in ${venus.sign}, house ${venus.house}`,
    polarity: venus.house >= 1 && venus.house <= 6 ? 'positive' : 'mixed',
    weight: venus.house >= 1 && venus.house <= 6 ? 2 : 0,
    evidence: [`Venus placement: ${venus.sign} in house ${venus.house}`],
  });

  // Confidence
  const confidence = calculateConfidence(positiveFactors, challengingFactors);

  const metadata: AnalysisMetadata = {
    calculatedAt: new Date().toISOString(),
    calculationVersion: '1.0.0',
    ruleSetVersion: '1.0.0',
    confidence: confidence === 'high' ? 0.85 : confidence === 'medium' ? 0.65 : 0.45,
    sourceModules: ['marriage-rule-engine', 'mars-dosha-engine', 'dasha-engine'],
  };

  return {
    seventhHouse,
    seventhLord,
    venus,
    marsDosha,
    compatibilityIndicators,
    positiveFactors,
    challengingFactors,
    favorablePeriods,
    confidence,
    metadata,
  };
}

function calculateConfidence(positive: Factor[], challenging: Factor[]): 'high' | 'medium' | 'low' {
  const score = positive.reduce((sum, f) => sum + f.weight, 0) +
    challenging.reduce((sum, f) => sum + Math.abs(f.weight), 0);

  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}
