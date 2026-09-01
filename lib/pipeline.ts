/**
 * MASTER PIPELINE
 * ---------------
 * Orchestrates the entire deterministic calculation → AI explanation flow.
 *
 * User Profile + Birth Data
 * → Astronomical / Astrology Calculation Engine
 * → Structured Birth Chart
 * → Derived Rules and Indicators
 * → Specialist-Specific Analysis Engine
 * → Verified Structured Context
 * → LLM Conversation Layer
 */

import { buildChart, Chart } from './astrology/chart';
import { getPlanetLongitudes, PlanetLongitude } from './astronomy/planetary-positions';
import { computeAscendant } from './astronomy/ascendant';
import { computeVimshottari, VimshottariResult } from './astronomy/dasha';
import { computeTransits as computeTransitsEngine, TransitPosition } from './astronomy/transits';
import { gregorianToJulianDay } from './astronomy/julian-day';
import { classifyIntent, ClassifiedIntent, IntentCategory } from './ai/intent-classifier';
import { detectLanguage, DetectedLanguage } from './ai/language-detector';
import { UserContext, VerifiedContext } from './ai/context-builder';
import { routeToSpecialist, SpecialistResult } from './specialists/index';
import { formatContextAsSystemPrompt } from './ai/context-builder';
import { validateResponse, ValidationResult } from './ai/response-validator';

export interface PipelineInput {
  user: UserContext;
  question: string;
  // Birth data for chart calculation
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:mm
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PipelineOutput {
  specialist: string;
  systemPrompt: string;
  verifiedContext: VerifiedContext;
  intent: ClassifiedIntent;
  language: DetectedLanguage;
  chartReady: boolean;
}

/**
 * Master pipeline — from user question to verified AI context.
 */
export async function executePipeline(input: PipelineInput): Promise<PipelineOutput> {
  // Step 1: Classify intent
  const intent = classifyIntent(input.question);

  // Step 2: Detect language
  const language = detectLanguage(input.question);

  // Step 3: Calculate birth chart (deterministic)
  const chart = calculateBirthChart(
    input.dateOfBirth,
    input.timeOfBirth,
    input.latitude,
    input.longitude,
  );

  // Step 4: Calculate Dasha
  const dasha = calculateDasha(
    input.dateOfBirth,
    input.timeOfBirth,
    input.latitude,
    input.longitude,
  );

  // Step 5: Calculate transits
  const transits = calculateTransits(
    input.dateOfBirth,
    input.timeOfBirth,
    input.latitude,
    input.longitude,
  );

  // Step 6: Get moon rashi index for dosha calculation
  const moonRashiIndex = chart.planets.find((p) => p.key === 'Moon')?.rashiIndex ?? 0;

  // Step 7: Route to specialist
  const specialistResult = routeToSpecialist(
    intent,
    input.user,
    chart,
    dasha,
    transits,
    moonRashiIndex,
    input.question,
  );

  // Step 8: Build system prompt
  const systemPrompt = formatContextAsSystemPrompt(specialistResult.context);

  return {
    specialist: specialistResult.specialist,
    systemPrompt,
    verifiedContext: specialistResult.context,
    intent,
    language: language.detected,
    chartReady: true,
  };
}

/**
 * Calculate birth chart deterministically.
 */
function calculateBirthChart(
  dateOfBirth: string,
  timeOfBirth: string,
  latitude: number,
  longitude: number,
): Chart {
  const jd = gregorianToJulianDay(new Date(`${dateOfBirth}T${timeOfBirth}`));
  const planets: PlanetLongitude[] = getPlanetLongitudes(jd);
  const lagna = computeAscendant(jd, latitude, longitude);

  return buildChart(planets, lagna.siderealAscendant);
}

/**
 * Calculate Dasha timeline.
 */
function calculateDasha(
  dateOfBirth: string,
  timeOfBirth: string,
  latitude: number,
  longitude: number,
): VimshottariResult {
  const jd = gregorianToJulianDay(new Date(`${dateOfBirth}T${timeOfBirth}`));
  // Use existing dasha engine - need moon position
  const planets = getPlanetLongitudes(jd);
  const moon = planets.find((p) => p.key === 'Moon');
  return computeVimshottari(jd, moon?.siderealLongitude ?? 0);
}

/**
 * Calculate current transits.
 */
function calculateTransits(
  dateOfBirth: string,
  timeOfBirth: string,
  latitude: number,
  longitude: number,
): TransitPosition[] {
  const jd = gregorianToJulianDay(new Date(`${dateOfBirth}T${timeOfBirth}`));
  const planets = getPlanetLongitudes(jd);
  const moon = planets.find((p) => p.key === 'Moon');
  const lagna = computeAscendant(jd, latitude, longitude);
  const moonRashiIndex = moon ? Math.floor(moon.siderealLongitude / 30) : 0;
  return computeTransitsEngine(jd, moonRashiIndex, lagna.rashiIndex);
}

/**
 * Build AI messages for the specialist chat.
 */
export function buildAIMessages(
  pipelineOutput: PipelineOutput,
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  userQuestion: string,
): { role: 'system' | 'user' | 'assistant'; content: string }[] {
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];

  // System prompt with verified context
  messages.push({
    role: 'system',
    content: pipelineOutput.systemPrompt,
  });

  // Chat history
  for (const msg of chatHistory) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  // Current question
  messages.push({
    role: 'user',
    content: userQuestion,
  });

  return messages;
}

/**
 * Validate and sanitize AI response.
 */
export function validateAndSanitize(
  aiResponse: string,
  context: VerifiedContext,
): { response: string; validation: ValidationResult } {
  const contextString = JSON.stringify(context);
  const validation = validateResponse(aiResponse, contextString);

  let response = aiResponse;
  if (!validation.valid) {
    response += '\n\nNote: This response is based on traditional Vedic astrology rules and should be used as guidance.';
  }

  return { response, validation };
}

// ============================================================
const PLACE_COORDS: Record<string, { latitude: number; longitude: number }> = {
  'Erode': { latitude: 11.3410, longitude: 77.7172 },
  'Chennai': { latitude: 13.0827, longitude: 80.2707 },
  'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
  'Delhi': { latitude: 28.6139, longitude: 77.2090 },
  'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
  'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
  'Kolkata': { latitude: 22.5726, longitude: 88.3639 },
  'Pune': { latitude: 18.5204, longitude: 73.8567 },
  'Coimbatore': { latitude: 11.0168, longitude: 76.9558 },
  'Madurai': { latitude: 9.9252, longitude: 78.1198 },
  'Tiruchirappalli': { latitude: 10.7905, longitude: 78.7047 },
  'Salem': { latitude: 11.6643, longitude: 78.1460 },
  'Tirunelveli': { latitude: 8.7139, longitude: 77.7567 },
  'Thanjavur': { latitude: 10.7870, longitude: 79.1378 },
  'Vellore': { latitude: 12.9165, longitude: 79.1325 },
  'Nagercoil': { latitude: 8.1833, longitude: 77.4119 },
  'Kanchipuram': { latitude: 12.8342, longitude: 79.7036 },
  'Udhagamandalam': { latitude: 11.4102, longitude: 76.6950 },
  'Pondicherry': { latitude: 11.9416, longitude: 79.8083 },
  'Tirupati': { latitude: 13.6288, longitude: 79.4192 },
  'Mysore': { latitude: 12.2958, longitude: 76.6394 },
  'Manipal': { latitude: 13.3485, longitude: 74.7884 },
};

function resolveCoords(place: string): { latitude: number; longitude: number } {
  const normalized = place.charAt(0).toUpperCase() + place.slice(1).toLowerCase();
  if (PLACE_COORDS[normalized]) return PLACE_COORDS[normalized];
  return { latitude: 13.0827, longitude: 80.2707 };
}

// BACKWARD COMPATIBILITY — old exports used by existing screens
// ============================================================

export type AstroReport = {
  lagna: { rashiIndex: number; rashi: string; pada: number } | null;
  moonRashi: string;
  moonNakshatra: string;
  moonRashiIndex: number;
  moonNakshatraIndex: number;
  moonPada: number;
  planets: {
    key: string;
    rashi: string;
    rashiIndex: number;
    nakshatra: string;
    nakshatraPada: number;
    house: number;
    retrograde: boolean;
    degreeInRashi: number;
    siderealLongitude: number;
  }[];
  houses: {
    houseNumber: number;
    sign: string;
    planets: string[];
    rashiIndex: number;
    lord: string;
    startDeg: number;
  }[];
  dasha: VimshottariResult;
  transitToday: TransitPosition[];
  dailyHoroscope: import('./astrology/interpretation').DailyHoroscope;
  nodalDosha: import('./astrology/dosha').NodalDosha;
  navamsa: { planets: Record<string, any> };
  birthPanchanga: any;
  _rawChart: Chart;
  _rawDasha: VimshottariResult;
  _rawTransits: TransitPosition[];
};

/**
 * Compute full astro report (used by Kundli, Jathagam, Chat screens).
 */
export function computeAstroReport(
  input: { birthDate: Date; place?: string },
  referenceDate?: Date,
): AstroReport {
  const dob = input.birthDate;
  const dateOfBirth = dob.toISOString().split('T')[0];
  const hours = dob.getHours();
  const minutes = dob.getMinutes();
  const timeOfBirth = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const coords = input.place ? resolveCoords(input.place) : { latitude: 13.0827, longitude: 80.2707 };
  const { latitude, longitude } = coords;

  const jd = gregorianToJulianDay(new Date(`${dateOfBirth}T${timeOfBirth}`));
  const planets = getPlanetLongitudes(jd);
  const lagna = computeAscendant(jd, latitude, longitude);
  const chart = buildChart(planets, lagna.siderealAscendant);
  const moonPlanet = chart.planets.find((p) => p.key === 'Moon');
  const lagnaPlanet = chart.planets.find((p) => p.key === 'Sun');
  const moonSidereal = moonPlanet?.siderealLongitude ?? 0;
  const dasha = computeVimshottari(jd, moonSidereal);
  const transits = calculateTransits(dateOfBirth, timeOfBirth, latitude, longitude);
  const { interpretDaily } = require('./astrology/interpretation');
  const panchanga = require('./astronomy/panchanga').computePanchanga(jd, latitude, longitude);

  const dailyHoroscope = interpretDaily(
    chart,
    transits,
    { mahaLord: dasha.birthMahadasha.lord, antarLord: dasha.birthMahadasha.lord },
    panchanga,
  );

  // Compute nodal dosha
  const { computeNodalDosha } = require('./astrology/dosha');
  const nodalDosha = computeNodalDosha(chart, moonPlanet?.rashiIndex ?? 0);

  return {
    lagna: lagnaPlanet
      ? { rashiIndex: lagnaPlanet.rashiIndex, rashi: lagnaPlanet.rashi, pada: lagnaPlanet.pada }
      : null,
    moonRashi: moonPlanet?.rashi ?? '',
    moonNakshatra: moonPlanet?.nakshatra ?? '',
    moonRashiIndex: moonPlanet?.rashiIndex ?? 0,
    moonNakshatraIndex: moonPlanet?.nakshatraIndex ?? 0,
    moonPada: moonPlanet?.pada ?? 0,
    planets: chart.planets.map((p) => ({
      key: p.key,
      rashi: p.rashi,
      rashiIndex: p.rashiIndex,
      nakshatra: p.nakshatra,
      nakshatraPada: p.pada,
      house: p.houseNumber,
      retrograde: p.retrograde,
      degreeInRashi: p.degreeInRashi,
      siderealLongitude: p.siderealLongitude,
    })),
    houses: chart.houses.map((h) => ({
      houseNumber: h.houseNumber,
      sign: h.rashi,
      planets: h.planets,
      rashiIndex: h.rashiIndex,
      lord: h.lord,
      startDeg: h.startDeg,
    })),
    dasha,
    transitToday: transits,
    dailyHoroscope,
    nodalDosha,
    navamsa: { planets: {} },
    birthPanchanga: panchanga,
    _rawChart: chart,
    _rawDasha: dasha,
    _rawTransits: transits,
  };
}

/**
 * Compute daily horoscope (used by Home screen).
 */
export function computeDailyHoroscope(
  input: { birthDate: Date; place?: string },
  referenceDate?: Date,
) {
  const report = computeAstroReport(input, referenceDate);
  return {
    report: {
      moonRashi: report.planets.find((p) => p.key === 'Moon')?.rashi || '',
      moonNakshatra: report.planets.find((p) => p.key === 'Moon')?.nakshatra || '',
    },
    panchanga: report.birthPanchanga,
    horoscope: report.dailyHoroscope,
    transits: report.transitToday,
  };
}
