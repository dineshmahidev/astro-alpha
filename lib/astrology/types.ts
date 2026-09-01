/**
 * SHARED TYPES
 * ------------
 * Core types used across all astrology engines.
 */

export interface UserBirthData {
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:mm
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PlanetPosition {
  planet: string;
  longitude: number;
  sign: string;
  signDegree: number;
  nakshatra: string;
  nakshatraPada: number;
  house: number;
  retrograde: boolean;
  combustion?: boolean;
}

export interface HouseData {
  house: number;
  sign: string;
  signLord: string;
  planets: string[];
  strength: number;
}

export interface Indicator {
  id: string;
  category: string;
  factor: string;
  condition: string;
  polarity: 'positive' | 'challenging' | 'mixed';
  weight: number;
  evidence: string[];
}

export interface Factor {
  id: string;
  description: string;
  weight: number;
  source: string;
}

export interface TimeWindow {
  start: string;
  end: string;
  significance: 'low' | 'medium' | 'high';
  reason: string;
}

export interface DashaPeriod {
  planet: string;
  level: 'maha' | 'antara' | 'pratyantara';
  start: string;
  end: string;
}

export interface DoshaResult {
  detected: boolean;
  type: string;
  marsHouse?: number;
  severity: 'none' | 'mild' | 'moderate' | 'strong';
  ruleSet: string;
  triggeredRules: string[];
  cancellationRules: string[];
  explanationData: string[];
}

export interface TransitResult {
  date: string;
  planet: string;
  natalRelationship: string;
  affectedHouses: number[];
  significance: 'low' | 'medium' | 'high';
}

export interface AnalysisMetadata {
  calculatedAt: string;
  calculationVersion: string;
  ruleSetVersion: string;
  confidence?: number;
  sourceModules: string[];
}

export interface Remedies {
  issue: string;
  tradition: string;
  remedy: string;
  sourceOrRuleId: string;
  optional: boolean;
}

export interface AnalysisResult {
  positiveFactors: Factor[];
  challengingFactors: Factor[];
  favorablePeriods: TimeWindow[];
  confidence: 'high' | 'medium' | 'low';
  metadata: AnalysisMetadata;
}

export interface MarriageAnalysis extends AnalysisResult {
  seventhHouse: HouseData;
  seventhLord: PlanetPosition;
  venus: PlanetPosition;
  marsDosha: DoshaResult;
  compatibilityIndicators: Indicator[];
}

export interface CareerAnalysis extends AnalysisResult {
  tenthHouse: HouseData;
  tenthLord: PlanetPosition;
  saturn: PlanetPosition;
  jupiter: PlanetPosition;
  careerIndicators: Indicator[];
}

export interface FamilyAnalysis extends AnalysisResult {
  fourthHouse: HouseData;
  fourthLord: PlanetPosition;
  moon: PlanetPosition;
  familyIndicators: Indicator[];
}

export interface GeneralAnalysis extends AnalysisResult {
  lagna: HouseData;
  rashi: HouseData;
  currentDasha: DashaPeriod;
  transitHighlights: TransitResult[];
}

export const HOUSE_MEANINGS: Record<number, { domain: string; keywords: string[] }> = {
  1: { domain: 'Self', keywords: ['personality', 'appearance', 'health', 'nature'] },
  2: { domain: 'Family & Wealth', keywords: ['family', 'speech', 'accumulated wealth', 'food'] },
  3: { domain: 'Courage', keywords: ['courage', 'communication', 'siblings', 'effort'] },
  4: { domain: 'Home & Mother', keywords: ['home', 'mother', 'comfort', 'property', 'vehicles'] },
  5: { domain: 'Education & Children', keywords: ['education', 'children', 'creativity', 'romance'] },
  6: { domain: 'Work & Obstacles', keywords: ['work', 'competition', 'obstacles', 'enemies', 'disease'] },
  7: { domain: 'Marriage & Partnership', keywords: ['marriage', 'partnership', 'spouse', 'business partner'] },
  8: { domain: 'Transformation', keywords: ['longevity', 'transformation', 'occult', 'inheritance'] },
  9: { domain: 'Fortune & Dharma', keywords: ['fortune', 'father', 'higher learning', 'spirituality', 'long travel'] },
  10: { domain: 'Career & Status', keywords: ['career', 'profession', 'status', 'authority', 'karma'] },
  11: { domain: 'Gains & Networks', keywords: ['gains', 'income', 'friends', 'networks', 'fulfillment'] },
  12: { domain: 'Expenses & Liberation', keywords: ['expenses', 'losses', 'isolation', 'spirituality', 'foreign lands'] },
};
