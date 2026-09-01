/**
 * FAMILY ANALYSIS RULE ENGINE
 * ---------------------------
 * Deterministic family analysis based on Vedic astrology rules.
 * Uses 2nd house, 4th house, Moon, family indicators.
 */

import { Chart, ChartPlanet } from '../chart';
import { PlanetKey } from '../../astronomy/planetary-positions';
import { VimshottariResult } from '../../astronomy/dasha';
import { TransitPosition } from '../../astronomy/transits';
import { HouseData, PlanetPosition, Factor, TimeWindow, Indicator, AnalysisMetadata } from '../types';

export interface FamilyAnalysis extends AnalysisResult {
  fourthHouse: HouseData;
  fourthLord: PlanetPosition;
  moon: PlanetPosition;
  familyIndicators: Indicator[];
}

interface AnalysisResult {
  positiveFactors: Factor[];
  challengingFactors: Factor[];
  favorablePeriods: TimeWindow[];
  confidence: 'high' | 'medium' | 'low';
  metadata: AnalysisMetadata;
}

const FOURTH_LORDS: Record<string, PlanetKey> = {
  Aries: 'Moon',
  Taurus: 'Mercury',
  Gemini: 'Venus',
  Cancer: 'Mars',
  Leo: 'Jupiter',
  Virgo: 'Saturn',
  Libra: 'Rahu',
  Scorpio: 'Ketu',
  Sagittarius: 'Sun',
  Capricorn: 'Moon',
  Aquarius: 'Mercury',
  Pisces: 'Venus',
};

export function analyzeFamily(
  chart: Chart,
  dasha: VimshottariResult,
  transits: TransitPosition[],
): FamilyAnalysis {
  const positiveFactors: Factor[] = [];
  const challengingFactors: Factor[] = [];
  const favorablePeriods: TimeWindow[] = [];
  const familyIndicators: Indicator[] = [];

  const byKey = new Map<PlanetKey, ChartPlanet>();
  for (const p of chart.planets) byKey.set(p.key, p);

  // 4th House
  const fourthHouseData = chart.houses.find((h) => h.houseNumber === 4);
  const fourthHouse: HouseData = fourthHouseData
    ? {
        house: 4,
        sign: fourthHouseData.rashi,
        signLord: fourthHouseData.lord,
        planets: fourthHouseData.planets,
        strength: fourthHouseData.planets.length > 0 ? 0.7 : 0.3,
      }
    : { house: 4, sign: 'Unknown', signLord: 'Unknown', planets: [], strength: 0 };

  // 4th Lord
  const fourthLordKey = fourthHouse.signLord as PlanetKey | undefined;
  const fourthLordPlanet = fourthLordKey ? byKey.get(fourthLordKey) : undefined;
  const fourthLord: PlanetPosition = fourthLordPlanet
    ? {
        planet: fourthLordKey!,
        longitude: fourthLordPlanet.siderealLongitude,
        sign: fourthLordPlanet.rashi,
        signDegree: fourthLordPlanet.degreeInRashi,
        nakshatra: fourthLordPlanet.nakshatra,
        nakshatraPada: fourthLordPlanet.pada,
        house: fourthLordPlanet.houseNumber,
        retrograde: fourthLordPlanet.retrograde,
      }
    : { planet: 'Unknown', longitude: 0, sign: 'Unknown', signDegree: 0, nakshatra: 'Unknown', nakshatraPada: 0, house: 0, retrograde: false };

  // Moon
  const moonPlanet = byKey.get('Moon');
  const moon: PlanetPosition = moonPlanet
    ? {
        planet: 'Moon',
        longitude: moonPlanet.siderealLongitude,
        sign: moonPlanet.rashi,
        signDegree: moonPlanet.degreeInRashi,
        nakshatra: moonPlanet.nakshatra,
        nakshatraPada: moonPlanet.pada,
        house: moonPlanet.houseNumber,
        retrograde: moonPlanet.retrograde,
      }
    : { planet: 'Moon', longitude: 0, sign: 'Unknown', signDegree: 0, nakshatra: 'Unknown', nakshatraPada: 0, house: 0, retrograde: false };

  // Positive factors
  if (fourthHouse.planets.length > 0) {
    positiveFactors.push({
      id: '4th_house_occupied',
      description: `4th house has ${fourthHouse.planets.join(', ')} — home and family energy is active`,
      weight: 2,
      source: '4th house analysis',
    });
  }

  if (fourthLord.house >= 1 && fourthLord.house <= 6) {
    positiveFactors.push({
      id: '4th_lord_in_kendra',
      description: `4th lord ${fourthLordKey} in house ${fourthLord.house} — family harmony potential`,
      weight: 2,
      source: '4th lord placement',
    });
  }

  if (moon.sign === 'Cancer' || moon.sign === 'Taurus' || moon.sign === 'Pisces') {
    positiveFactors.push({
      id: 'moon_strong',
      description: `Moon in ${moon.sign} — emotional well-being supports family bonds`,
      weight: 2,
      source: 'Moon analysis',
    });
  }

  if (!moon.retrograde) {
    positiveFactors.push({
      id: 'moon_direct',
      description: 'Moon is direct — stable emotional energy',
      weight: 1,
      source: 'Moon motion',
    });
  }

  // Challenging factors
  if (moon.retrograde) {
    challengingFactors.push({
      id: 'moon_retrograde',
      description: 'Moon retrograde — emotional ups and downs in family matters',
      weight: -1,
      source: 'Moon motion',
    });
  }

  if (fourthLord.retrograde) {
    challengingFactors.push({
      id: '4th_lord_retrograde',
      description: `4th lord ${fourthLordKey} retrograde — domestic unsettledness`,
      weight: -1,
      source: '4th lord motion',
    });
  }

  if (fourthHouse.sign === 'Scorpio' || fourthHouse.sign === 'Capricorn') {
    challengingFactors.push({
      id: '4th_house_tough_sign',
      description: `4th house in ${fourthHouse.sign} — domestic peace requires effort`,
      weight: -1,
      source: '4th house sign',
    });
  }

  // Favorable periods
  const currentMaha = dasha.birthMahadasha.lord;
  const familyPlanets: PlanetKey[] = ['Moon', 'Venus', 'Jupiter'];

  if (familyPlanets.includes(currentMaha)) {
    favorablePeriods.push({
      start: dasha.birthMahadasha.startDate,
      end: dasha.birthMahadasha.endDate,
      significance: 'high',
      reason: `${currentMaha} Mahadasha is favorable for family harmony`,
    });
  }

  // Transit highlights
  for (const t of transits) {
    if (t.planet === 'Jupiter' && [1, 2, 4, 5, 7, 9].includes(t.houseFromJanmaRashi)) {
      favorablePeriods.push({
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        significance: 'medium',
        reason: `Jupiter transits house ${t.houseFromJanmaRashi} — family blessings`,
      });
    }
  }

  // Family indicators
  familyIndicators.push({
    id: 'moon_family',
    category: 'planetary',
    factor: 'Moon',
    condition: `Moon in ${moon.sign}, house ${moon.house}`,
    polarity: moon.house >= 1 && moon.house <= 6 ? 'positive' : 'mixed',
    weight: moon.house >= 1 && moon.house <= 6 ? 2 : 0,
    evidence: [`Moon placement: ${moon.sign} in house ${moon.house}`],
  });

  const confidence = calculateConfidence(positiveFactors, challengingFactors);

  const metadata: AnalysisMetadata = {
    calculatedAt: new Date().toISOString(),
    calculationVersion: '1.0.0',
    ruleSetVersion: '1.0.0',
    confidence: confidence === 'high' ? 0.85 : confidence === 'medium' ? 0.65 : 0.45,
    sourceModules: ['family-rule-engine', 'dasha-engine'],
  };

  return {
    fourthHouse,
    fourthLord,
    moon,
    familyIndicators,
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
