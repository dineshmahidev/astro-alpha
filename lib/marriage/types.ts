/**
 * MARRIAGE ENGINE TYPES
 * ---------------------
 * All internal identifiers are stable English strings. Localization is applied
 * ONLY at the presentation/AI layer (see i18n/en.ts, i18n/ta.ts).
 */
import type { PlanetKey } from '../astronomy/planetary-positions';

export type BirthInput = {
  date: string; // ISO yyyy-mm-dd (local birth date)
  time: string; // HH:mm local (24h)
  placeName: string;
  latitude: number;
  longitude: number; // east positive
  timezoneOffsetHours: number; // e.g. 5.5 for IST
  timeAccuracy: 'exact' | 'approximate' | 'unknown';
};

export type Dms = { degrees: number; minutes: number; seconds: number };

export type RashiPositionData = {
  rashiIndex: number;
  rashiNameEnglish: string;
  degreeInRashi: number;
  dms: Dms;
};

export type NakshatraData = {
  nakshatra: string; // stable English id e.g. "Purva Bhadrapada"
  pada: 1 | 2 | 3 | 4;
  degreeWithinNakshatra: number;
};

export type PlanetPlacement = {
  planet: PlanetKey;
  longitude: number; // sidereal
  rashiIndex: number;
  rashi: string;
  dms: Dms;
  nakshatra: string;
  pada: number;
  house: number; // whole-sign house from Lagna
  dignity: Dignity;
  combust: boolean;
  retrograde: boolean;
};

export type Dignity =
  | 'exalted'
  | 'own'
  | 'greatFriend'
  | 'friend'
  | 'neutral'
  | 'enemy'
  | 'greatEnemy'
  | 'debilitated';

export type HouseData = {
  house: number;
  rashiIndex: number;
  rashi: string;
  lord: PlanetKey;
  planets: PlanetKey[];
};

export type AspectHit = {
  fromPlanet: PlanetKey;
  fromHouse: number;
  toHouse: number;
  kind: 'seventh' | 'fourth' | 'eighth' | 'fifth' | 'ninth' | 'third' | 'tenth';
};

export type ChartSnapshot = {
  birth: BirthInput;
  jdUT: number;
  ayanamsa: number;
  lagna: RashiPositionData & { nakshatra: string; pada: number };
  moon: PlanetPlacement;
  sun: PlanetPlacement;
  planets: PlanetPlacement[];
  houses: HouseData[];
  seventhHouse: HouseData;
  seventhLord: PlanetPlacement;
  venus: PlanetPlacement;
  jupiter: PlanetPlacement;
  aspectsOnSeventhHouseSign: AspectHit[];
  aspectsOnSeventhLord: AspectHit[];
};

export type NavamsaData = {
  lagnaNavamsa: { rashiIndex: number; rashi: string };
  planets: {
    planet: PlanetKey;
    navamsaRashi: string;
    navamsaRashiIndex: number;
    houseFromNavamsaLagna: number;
    dignity: Dignity;
  }[];
  venusNavamsaStrengthNote: string;
};

export type DashaPeriodData = {
  lord: PlanetKey;
  startISO: string;
  endISO: string;
  startJd: number;
  endJd: number;
  level: 'maha' | 'antar' | 'pratyantar';
  parent?: PlanetKey;
  grandParent?: PlanetKey;
};

export type MarriageScoreComponents = {
  seventhHouseStrength: number; // 0..20
  seventhLordStrength: number; // 0..20
  venusSupport: number; // 0..15
  dashaSupport: number; // 0..20
  jupiterTransit: number; // 0..10
  saturnTransit: number; // 0..5
  secondEleventhSupport: number; // 0..5
  fifthHouseSupport: number; // 0..5
  total: number; // 0..100
  notes: string[];
};

export type MarriageWindow = {
  startISO: string;
  endISO: string;
  label: string; // e.g. "May 2028 – October 2029"
  yearRange: [number, number];
  peakYear?: number;
  peakMonthRange?: [number, number];
  score: number;
  components: MarriageScoreComponents;
  reasons: string[];
};

export type DelayAssessment = {
  category: 'no-significant-delay' | 'delay' | 'difficulty' | 'late-marriage' | 'relationship-instability' | 'marriage-denial-indicators';
  score: number; // 0..100 delay pressure
  factors: string[];
};

export type RelationshipAnalysis = {
  relationshipBeforeMarriageProbability: number; // 0..100 interpretation score
  relationshipStrength: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  factors: string[];
};

export type LoveArrangedResult = {
  loveMarriageScore: number;
  arrangedMarriageScore: number;
  loveCumArrangedScore: number;
  classification: 'Love' | 'Arranged' | 'Love-cum-Arranged' | 'Mixed/Unclear';
  confidence: number; // 0..100
  indicators: string[];
};

export type TransitSnapshot = {
  jd: number;
  dateISO: string;
  jupiterSidereal: number;
  jupiterRashiIndex: number;
  saturnSidereal: number;
  saturnRashiIndex: number;
};

export type MarriageReport = {
  generatedAt: string;
  engineVersion: string;
  birthData: BirthInput & { jdUT: number };
  chart: ChartSnapshot;
  dasha: {
    birthNakshatra: string;
    birthNakshatraLord: PlanetKey;
    balanceAtBirthYears: number;
    mahadashas: DashaPeriodData[];
    currentMaha: DashaPeriodData;
    currentAntar: DashaPeriodData;
    currentPratyantar: DashaPeriodData;
    upcoming: DashaPeriodData[];
  };
  navamsa: NavamsaData;
  marriageIndicators: {
    baseStrength: Omit<MarriageScoreComponents, 'total'>;
    baseTotal: number;
    favorableFactors: string[];
    afflictions: string[];
  };
  relationshipIndicators: RelationshipAnalysis;
  loveVsArranged: LoveArrangedResult;
  delayAssessment: DelayAssessment;
  marriageWindows: {
    primary: MarriageWindow | null;
    secondary: MarriageWindow | null;
    supporting: MarriageWindow[];
    scannedUntilYear: number;
    yearlyScores: { year: number; score: number }[];
  };
  confidence: {
    overall: number; // 0..100
    birthTimePenaltyApplied: boolean;
    notes: string[];
  };
  debug: Record<string, unknown>;
};
