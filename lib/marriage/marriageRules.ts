import type { PlanetKey } from '../astronomy/planetary-positions';

/**
 * MARRIAGE ENGINE CONFIGURATION
 * -----------------------------
 * All scoring weights live here so the methodology can be audited and tuned
 * in ONE file. Classical Vedic rules take precedence over these numbers;
 * change them only with astrological justification.
 */

export const NODE_MODE: 'mean' | 'true' = 'mean'; // consistent across the app
export const HOUSE_SYSTEM = 'whole-sign' as const;
export const SCAN_YEARS_AHEAD = 10; // configurable up to 15
export type NodeAspectConvention = 'none' | 'jupiterLike' | 'saturnLike';
export const NODE_ASPECT_CONVENTION: NodeAspectConvention = 'none';

// ---- Dignity tables (classical) ------------------------------------------
// Natural friendships (friend / neutral / enemy)
export const FRIENDSHIP: Record<string, { friends: PlanetKey[]; enemies: PlanetKey[] }> = {
  Sun: { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'] },
  Moon: { friends: ['Sun', 'Mercury'], enemies: [] },
  Mars: { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'], enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'] },
  Venus: { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'] },
  Saturn: { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'] },
};

// sign index -> owning planet
export const SIGN_LORDS: Record<number, PlanetKey> = {
  0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon', 4: 'Sun', 5: 'Mercury',
  6: 'Venus', 7: 'Mars', 8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter',
};

export const EXALTATION: Partial<Record<PlanetKey, number>> = {
  Sun: 0, Moon: 1, Jupiter: 3, Mercury: 5, Venus: 11, Mars: 9, Saturn: 6,
};
export const DEBILITATION: Partial<Record<PlanetKey, number>> = {
  Sun: 6, Moon: 7, Jupiter: 9, Mercury: 11, Venus: 5, Mars: 3, Saturn: 0,
};
export const MOOLTRIKONA: Partial<Record<PlanetKey, number>> = {
  Sun: 4, Moon: 1, Jupiter: 8, Mercury: 5, Venus: 6, Mars: 0, Saturn: 10,
};

/** Deep exaltation degrees (used for combustion-style proximity nuance). */
export const COMBUSTION_ORB: Partial<Record<PlanetKey, number>> = {
  Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15,
};

// ---- Score component weights (section 16 of the spec) --------------------
export const WEIGHTS = {
  seventhHouseStrength: { max: 20 },
  seventhLordStrength: { max: 20 },
  venusSupport: { max: 15 },
  dashaSupport: { max: 20 },
  jupiterTransit: { max: 10 },
  saturnTransit: { max: 5 },
  secondEleventhSupport: { max: 5 },
  fifthHouseSupport: { max: 5 },
} as const;

// Dasha-lord relevance multipliers for marriage timing
export const TIMING_LORD_WEIGHTS: Record<string, number> = {
  seventhLord: 30,
  venus: 25,
  planetsInSeventh: 20,
  jupiterAsNaturalKaraka: 18,
  secondEleventhLords: 14,
  moon: 10,
  lagnaLord: 12,
  eighthLordPenalty: -12,
  sixthTwelfthPenalty: -8,
};

// Transit scoring
export const TRANSIT_WEIGHTS = {
  jupiterOnSeventhSign: 40,
  jupiterOnLagnaOrMoon: 30,
  jupiterAspectingSeventh: 25,
  jupiterOnSeventhLordOrVenus: 28,
  saturnOnSeventhSign: 15,
  saturnAspectingSeventh: 10,
  saturnOnLagna: 8,
} as const;

// Relationship (pre-marriage) scoring caps
export const RELATIONSHIP_RULES = {
  maxScore: 100,
  points: {
    fifthLordConnectedToSeventhLord: 22,
    fifthLordInSeventhOrViceVersa: 18,
    venusWithFifthOrSeventhConnection: 16,
    rahuInfluencingFifthOrSeventh: 12,
    strongFifthHouseOccupants: 12,
    moonVenusConnection: 10,
    loveDashaActivation: 10,
    afflictionPenaltyPerHit: 6,
  } as Record<string, number>,
};

// Love vs arranged
export const LOVE_ARRANGED_RULES = {
  loveIndicators: {
    fifthLordToSeventhLordLink: 24,
    fifthHouseSeventhLink: 18,
    venusStrongWithFifthSeventh: 18,
    rahuRomanceInfluence: 14,
    strongFifthHouse: 12,
    strongVenus: 14,
  } as Record<string, number>,
  arrangedIndicators: {
    strongSecondHouse: 16,
    strongSeventhWithoutFifthLink: 22,
    familyHousesSecondFourthNinth: 16,
    jupiterTraditionalInfluence: 18,
    saturnDisciplineSeventh: 14,
  } as Record<string, number>,
};
