import { normalize360 } from './angles';
import { rashiFromSidereal } from '../astrology/rasi-nakshatra';
import { PlanetKey } from './planetary-positions';

/**
 * BHAVA / HOUSE CALCULATION
 * -------------------------
 * Uses the calculated Ascendant as house 1 cusp. This module is intentionally
 * isolated so the house system can be changed later (whole-sign, Placidus,
 * etc.) without rewriting planetary calculations. Default: equal houses —
 * each house is exactly 30° starting from the sidereal ascendant.
 */

export const SIGN_RULERS: Record<number, PlanetKey> = {
  0: 'Mars', // Mesha
  1: 'Venus', // Vrishabha
  2: 'Mercury', // Mithuna
  3: 'Moon', // Karka
  4: 'Sun', // Simha
  5: 'Mercury', // Kanya
  6: 'Venus', // Tula
  7: 'Mars', // Vrishchika
  8: 'Jupiter', // Dhanu
  9: 'Saturn', // Makara
  10: 'Saturn', // Kumbha
  11: 'Jupiter', // Meena
};

export type House = {
  houseNumber: number;
  startDeg: number;
  endDeg: number;
  rashiIndex: number;
  rashi: string;
  lord: PlanetKey;
  planets: PlanetKey[];
};

export type HouseSystem = 'equal' | 'whole-sign';

export type HouseInput = {
  siderealAscendant: number;
  planets: { key: PlanetKey; siderealLongitude: number }[];
};

/** Build 12 houses from the ascendant. */
export function computeHouses(input: HouseInput, system: HouseSystem = 'equal'): House[] {
  const asc = normalize360(input.siderealAscendant);
  const cusps: number[] = [];
  for (let i = 0; i < 12; i++) {
    if (system === 'equal') {
      cusps.push(normalize360(asc + i * 30));
    } else {
      // whole-sign: house 1 = sign containing the ascendant, each house is a whole 30° sign
      const signStart = Math.floor(asc / 30) * 30;
      cusps.push(normalize360(signStart + i * 30));
    }
  }

  const houses: House[] = cusps.map((cusp, i) => {
    const start = cusp;
    const end = normalize360(cusps[(i + 1) % 12]);
    const rashi = rashiFromSidereal(start);
    return {
      houseNumber: i + 1,
      startDeg: start,
      endDeg: end,
      rashiIndex: rashi.rashiIndex,
      rashi: rashi.rashi,
      lord: SIGN_RULERS[rashi.rashiIndex],
      planets: [],
    };
  });

  for (const p of input.planets) {
    const lon = normalize360(p.siderealLongitude);
    for (const h of houses) {
      if (h.houseNumber === 12) {
        const prev = houses[10].endDeg;
        if (lon >= prev || lon < h.endDeg) {
          h.planets.push(p.key);
          break;
        }
      } else {
        if (lon >= h.startDeg && lon < h.endDeg) {
          h.planets.push(p.key);
          break;
        }
      }
    }
  }
  return houses;
}