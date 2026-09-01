/**
 * CAREER ANALYSIS RULE ENGINE
 * ---------------------------
 * Deterministic career analysis based on Vedic astrology rules.
 * Uses 10th house, Saturn, Jupiter, Mercury, career dasha periods.
 */

import { Chart, ChartPlanet } from '../chart';
import { PlanetKey } from '../../astronomy/planetary-positions';
import { VimshottariResult } from '../../astronomy/dasha';
import { TransitPosition } from '../../astronomy/transits';
import { HouseData, PlanetPosition, Factor, TimeWindow, Indicator, AnalysisMetadata } from '../types';

export interface CareerAnalysis extends AnalysisResult {
  tenthHouse: HouseData;
  tenthLord: PlanetPosition;
  saturn: PlanetPosition;
  jupiter: PlanetPosition;
  careerIndicators: Indicator[];
}

interface AnalysisResult {
  positiveFactors: Factor[];
  challengingFactors: Factor[];
  favorablePeriods: TimeWindow[];
  confidence: 'high' | 'medium' | 'low';
  metadata: AnalysisMetadata;
}

const TENTH_LORDS: Record<string, PlanetKey> = {
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

export function analyzeCareer(
  chart: Chart,
  dasha: VimshottariResult,
  transits: TransitPosition[],
): CareerAnalysis {
  const positiveFactors: Factor[] = [];
  const challengingFactors: Factor[] = [];
  const favorablePeriods: TimeWindow[] = [];
  const careerIndicators: Indicator[] = [];

  const byKey = new Map<PlanetKey, ChartPlanet>();
  for (const p of chart.planets) byKey.set(p.key, p);

  // 10th House
  const tenthHouseData = chart.houses.find((h) => h.houseNumber === 10);
  const tenthHouse: HouseData = tenthHouseData
    ? {
        house: 10,
        sign: tenthHouseData.rashi,
        signLord: tenthHouseData.lord,
        planets: tenthHouseData.planets,
        strength: tenthHouseData.planets.length > 0 ? 0.7 : 0.3,
      }
    : { house: 10, sign: 'Unknown', signLord: 'Unknown', planets: [], strength: 0 };

  // 10th Lord
  const tenthLordKey = tenthHouse.signLord as PlanetKey | undefined;
  const tenthLordPlanet = tenthLordKey ? byKey.get(tenthLordKey) : undefined;
  const tenthLord: PlanetPosition = tenthLordPlanet
    ? {
        planet: tenthLordKey!,
        longitude: tenthLordPlanet.siderealLongitude,
        sign: tenthLordPlanet.rashi,
        signDegree: tenthLordPlanet.degreeInRashi,
        nakshatra: tenthLordPlanet.nakshatra,
        nakshatraPada: tenthLordPlanet.pada,
        house: tenthLordPlanet.houseNumber,
        retrograde: tenthLordPlanet.retrograde,
      }
    : { planet: 'Unknown', longitude: 0, sign: 'Unknown', signDegree: 0, nakshatra: 'Unknown', nakshatraPada: 0, house: 0, retrograde: false };

  // Saturn
  const saturnPlanet = byKey.get('Saturn');
  const saturn: PlanetPosition = saturnPlanet
    ? {
        planet: 'Saturn',
        longitude: saturnPlanet.siderealLongitude,
        sign: saturnPlanet.rashi,
        signDegree: saturnPlanet.degreeInRashi,
        nakshatra: saturnPlanet.nakshatra,
        nakshatraPada: saturnPlanet.pada,
        house: saturnPlanet.houseNumber,
        retrograde: saturnPlanet.retrograde,
      }
    : { planet: 'Saturn', longitude: 0, sign: 'Unknown', signDegree: 0, nakshatra: 'Unknown', nakshatraPada: 0, house: 0, retrograde: false };

  // Jupiter
  const jupiterPlanet = byKey.get('Jupiter');
  const jupiter: PlanetPosition = jupiterPlanet
    ? {
        planet: 'Jupiter',
        longitude: jupiterPlanet.siderealLongitude,
        sign: jupiterPlanet.rashi,
        signDegree: jupiterPlanet.degreeInRashi,
        nakshatra: jupiterPlanet.nakshatra,
        nakshatraPada: jupiterPlanet.pada,
        house: jupiterPlanet.houseNumber,
        retrograde: jupiterPlanet.retrograde,
      }
    : { planet: 'Jupiter', longitude: 0, sign: 'Unknown', signDegree: 0, nakshatra: 'Unknown', nakshatraPada: 0, house: 0, retrograde: false };

  // Positive factors
  if (tenthHouse.planets.length > 0) {
    positiveFactors.push({
      id: '10th_house_occupied',
      description: `10th house has ${tenthHouse.planets.join(', ')} — strong career energy`,
      weight: 2,
      source: '10th house analysis',
    });
  }

  if (tenthLord.house >= 1 && tenthLord.house <= 6) {
    positiveFactors.push({
      id: '10th_lord_in_kendra',
      description: `10th lord ${tenthLordKey} in house ${tenthLord.house} — career growth potential`,
      weight: 2,
      source: '10th lord placement',
    });
  }

  if (saturn.sign === 'Capricorn' || saturn.sign === 'Aquarius' || saturn.sign === 'Libra') {
    positiveFactors.push({
      id: 'saturn_strong',
      description: `Saturn in ${saturn.sign} — discipline and hard work yield results`,
      weight: 2,
      source: 'Saturn analysis',
    });
  }

  if (jupiter.house >= 1 && jupiter.house <= 6) {
    positiveFactors.push({
      id: 'jupiter_favorable',
      description: `Jupiter in house ${jupiter.house} — wisdom supports career decisions`,
      weight: 1,
      source: 'Jupiter placement',
    });
  }

  // Challenging factors
  if (saturn.retrograde) {
    challengingFactors.push({
      id: 'saturn_retrograde',
      description: 'Saturn retrograde — career delays and re-evaluation needed',
      weight: -2,
      source: 'Saturn motion',
    });
  }

  if (tenthLord.retrograde) {
    challengingFactors.push({
      id: '10th_lord_retrograde',
      description: `10th lord ${tenthLordKey} retrograde — career path may change`,
      weight: -1,
      source: '10th lord motion',
    });
  }

  if (tenthHouse.sign === 'Cancer' || tenthHouse.sign === 'Pisces') {
    challengingFactors.push({
      id: '10th_house_weak_sign',
      description: `10th house in ${tenthHouse.sign} — career may lack stability`,
      weight: -1,
      source: '10th house sign',
    });
  }

  // Favorable periods
  const currentMaha = dasha.birthMahadasha.lord;
  const careerPlanets: PlanetKey[] = ['Sun', 'Saturn', 'Mercury', 'Mars'];

  if (careerPlanets.includes(currentMaha)) {
    favorablePeriods.push({
      start: dasha.birthMahadasha.startDate,
      end: dasha.birthMahadasha.endDate,
      significance: 'high',
      reason: `${currentMaha} Mahadasha is favorable for career growth`,
    });
  }

  // Transit highlights
  for (const t of transits) {
    if (t.planet === 'Saturn' && [1, 2, 3, 6, 10, 11].includes(t.houseFromJanmaRashi)) {
      favorablePeriods.push({
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        significance: 'medium',
        reason: `Saturn transits house ${t.houseFromJanmaRashi} — steady career progress`,
      });
    }
  }

  // Career indicators
  careerIndicators.push({
    id: 'saturn_career',
    category: 'planetary',
    factor: 'Saturn',
    condition: `Saturn in ${saturn.sign}, house ${saturn.house}`,
    polarity: saturn.house >= 1 && saturn.house <= 6 ? 'positive' : 'challenging',
    weight: saturn.house >= 1 && saturn.house <= 6 ? 2 : -1,
    evidence: [`Saturn placement: ${saturn.sign} in house ${saturn.house}`],
  });

  const confidence = calculateConfidence(positiveFactors, challengingFactors);

  const metadata: AnalysisMetadata = {
    calculatedAt: new Date().toISOString(),
    calculationVersion: '1.0.0',
    ruleSetVersion: '1.0.0',
    confidence: confidence === 'high' ? 0.85 : confidence === 'medium' ? 0.65 : 0.45,
    sourceModules: ['career-rule-engine', 'dasha-engine'],
  };

  return {
    tenthHouse,
    tenthLord,
    saturn,
    jupiter,
    careerIndicators,
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
