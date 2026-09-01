import { getPlanetLongitudes, PlanetKey, PlanetLongitude } from './planetary-positions';
import { nakshatraFromSidereal, rashiFromSidereal } from '../astrology/rasi-nakshatra';

/**
 * TRANSITS
 * --------
 * Compute planetary sidereal positions at a given moment and compare them to
 * the birth chart (janma rashi = Moon sign, lagna rashi).
 */

export type TransitPosition = {
  planet: PlanetKey;
  tropicalLongitude: number;
  siderealLongitude: number;
  rashiIndex: number;
  rashi: string;
  nakshatraIndex: number;
  nakshatra: string;
  pada: number;
  retrograde: boolean;
  houseFromJanmaRashi: number;
  houseFromLagna: number;
};

function houseFrom(rashiIndex: number, refRashiIndex: number): number {
  // 1-based house distance from reference sign
  return ((rashiIndex - refRashiIndex + 12) % 12) + 1;
}

export function computeTransits(
  jd: number,
  janmaRashiIndex: number,
  lagnaRashiIndex: number,
): TransitPosition[] {
  const planets = getPlanetLongitudes(jd);
  return planets.map((p) => {
    const r = rashiFromSidereal(p.siderealLongitude);
    const nak = nakshatraFromSidereal(p.siderealLongitude);
    return {
      planet: p.key,
      tropicalLongitude: p.tropicalLongitude,
      siderealLongitude: p.siderealLongitude,
      rashiIndex: r.rashiIndex,
      rashi: r.rashi,
      nakshatraIndex: nak.nakshatraIndex,
      nakshatra: nak.nakshatra,
      pada: nak.pada,
      retrograde: p.retrograde,
      houseFromJanmaRashi: houseFrom(r.rashiIndex, janmaRashiIndex),
      houseFromLagna: houseFrom(r.rashiIndex, lagnaRashiIndex),
    };
  });
}

export type TransitResult = {
  date: string;
  planet: string;
  natalRelationship: string;
  affectedHouses: number[];
  significance: 'low' | 'medium' | 'high';
};

const SIGNIFICANCE: Record<string, 'low' | 'medium' | 'high'> = {
  Jupiter: 'high',
  Saturn: 'high',
  Mars: 'medium',
  Rahu: 'medium',
};

export function toTransitResult(pos: TransitPosition, date: string): TransitResult {
  const suffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return {
    date,
    planet: pos.planet,
    natalRelationship: `transiting ${suffix(pos.houseFromJanmaRashi)} house from your rashi`,
    affectedHouses: [pos.houseFromJanmaRashi, pos.houseFromLagna],
    significance: SIGNIFICANCE[pos.planet] ?? 'low',
  };
}

/** Planetary positions at a JD (for chart building). */
export function planetaryPositionsAt(jd: number): PlanetLongitude[] {
  return getPlanetLongitudes(jd);
}