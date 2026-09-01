import { normalize360 } from './angles';

/**
 * Lahiri (Chitrapaksha) ayanamsa in degrees — standard for South Indian charts.
 * ~23.856° at J2000, increasing ~50.29″/yr.
 * This is the exact implementation previously living in lib/vedic.ts.
 */
export function lahariAyanamsa(jd: number): number {
  const years = (jd - 2451545.0) / 365.25;
  return 23.856 + (50.29 / 3600) * years;
}

/** Tropical ecliptic longitude -> sidereal (nirayana) longitude. */
export function tropicalToSidereal(tropicalLongitude: number, ayanamsa: number): number {
  return normalize360(tropicalLongitude - ayanamsa);
}

/** Sidereal (nirayana) longitude -> tropical (sayana) longitude. */
export function siderealToTropical(siderealLongitude: number, ayanamsa: number): number {
  return normalize360(siderealLongitude + ayanamsa);
}