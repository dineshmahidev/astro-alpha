import { RASHIS } from '../../constants/birth';
import { normalize360 } from './angles';
import { PlanetKey, PlanetLongitude } from './planetary-positions';

/**
 * NAVAMSA / D9
 * ------------
 * Each 30° rashi is divided into 9 navamsas of 3°20′.
 * Navamsa sign counting rule:
 *   - Movable (chara) signs: navamsa count starts from the same sign  (offset 0)
 *   - Dual (dvisvabhava) signs: navamsa count starts from the 5th sign (offset 4)
 *   - Fixed (sthira) signs: navamsa count starts from the 9th sign      (offset 8)
 * Movable: Mesha, Karka, Tula, Makara  (0,3,6,9)
 * Fixed:   Vrishabha, Simha, Vrishchika, Kumbha (1,4,7,10)
 * Dual:    Mithuna, Kanya, Dhanu, Meena (2,5,8,11)
 */

export const MOVABLE = [0, 3, 6, 9];
export const FIXED = [1, 4, 7, 10];
export const DUAL = [2, 5, 8, 11];

export function navamsaOffset(signIndex: number): number {
  if (MOVABLE.includes(signIndex)) return 0;
  if (DUAL.includes(signIndex)) return 4;
  return 8; // fixed
}

export type NavamsaPosition = {
  siderealLongitude: number;
  navamsaSignIndex: number;
  navamsaSign: string;
  degreeInNavamsa: number;
  originalRashiIndex: number;
};

/** Navamsa (D9) position of a sidereal longitude. */
export function navamsaFromSidereal(siderealLongitude: number): NavamsaPosition {
  const lon = normalize360(siderealLongitude);
  const rashiIndex = Math.floor(lon / 30) % 12;
  const offsetInRashi = lon % 30;
  const span = 30 / 9;
  const navamsaIndex = Math.floor(offsetInRashi / span); // 0..8
  const navSignIndex = (rashiIndex + navamsaOffset(rashiIndex) + navamsaIndex) % 12;
  const degreeInNavamsa = (offsetInRashi % span) * 9;
  return {
    siderealLongitude: lon,
    navamsaSignIndex: navSignIndex,
    navamsaSign: RASHIS[navSignIndex].name,
    degreeInNavamsa,
    originalRashiIndex: rashiIndex,
  };
}

export type NavamsaChart = {
  lagna: NavamsaPosition;
  planets: Record<PlanetKey, NavamsaPosition>;
};

/** Full D9 chart from the birth planets + lagna (sidereal ascendant). */
export function computeNavamsaChart(
  planets: PlanetLongitude[],
  siderealAscendant: number,
): NavamsaChart {
  const result = {} as Record<PlanetKey, NavamsaPosition>;
  for (const p of planets) {
    result[p.key] = navamsaFromSidereal(p.siderealLongitude);
  }
  return {
    lagna: navamsaFromSidereal(siderealAscendant),
    planets: result,
  };
}