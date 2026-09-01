import { NAKSHATRAS, RASHIS } from '../../constants/birth';

export type RashiPosition = {
  siderealLongitude: number;
  rashiIndex: number;
  rashi: string;
  degreeInRashi: number;
};

/**
 * Rashi / nakshatra / pada from a sidereal longitude.
 * This is the exact derivation used by the existing engine (lib/vedic.ts):
 *   rashiIndex    = floor(sidereal / 30) % 12
 *   nakshatraIndex = floor(sidereal / (360/27)) % 27
 *   pada           = floor((sidereal % span) / (span/4)) + 1
 */
export function rashiFromSidereal(siderealLongitude: number): RashiPosition {
  const normalized = ((siderealLongitude % 360) + 360) % 360;
  const rashiIndex = Math.floor(normalized / 30) % 12;
  const rashi = RASHIS[rashiIndex];
  return {
    siderealLongitude: normalized,
    rashiIndex,
    rashi: rashi?.name ?? RASHIS[0]?.name ?? 'Mesha',
    degreeInRashi: normalized % 30,
  };
}

export type NakshatraPosition = {
  nakshatraIndex: number;
  nakshatra: string;
  pada: number;
  nakshatraSpan: number;
  spanStartLongitude: number;
};

const NAKSHATRA_LORD = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

export function nakshatraFromSidereal(siderealLongitude: number): NakshatraPosition {
  const normalized = ((siderealLongitude % 360) + 360) % 360;
  const nakSpan = 360 / 27;
  const nakshatraIndex = Math.floor(normalized / nakSpan) % 27;
  const pada = Math.floor((normalized % nakSpan) / (nakSpan / 4)) + 1;
  const nak = NAKSHATRAS[nakshatraIndex];
  return {
    nakshatraIndex,
    nakshatra: nak?.name ?? NAKSHATRAS[0]?.name ?? 'Ashwini',
    pada,
    nakshatraSpan: nakSpan,
    spanStartLongitude: nakshatraIndex * nakSpan,
  };
}

export function nakshatraLord(nakshatraIndex: number): string {
  return NAKSHATRA_LORD[nakshatraIndex % 27];
}

export const NAKSHATRA_LORDS = NAKSHATRA_LORD;