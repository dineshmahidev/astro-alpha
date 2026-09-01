import { planetLongitude } from '../astronomy/planetary-positions';
import { lahariAyanamsa, tropicalToSidereal } from '../astronomy/sidereal';
import { julianDayToDate } from '../astronomy/julian-day';
import type { AspectHit, ChartSnapshot, TransitSnapshot } from './types';
import { TRANSIT_WEIGHTS } from './marriageRules';

/**
 * FUTURE TRANSIT ENGINE
 * ---------------------
 * Computes sidereal Jupiter & Saturn for any JD (fully offline — Meeus element
 * method already bundled). Scans future years month-by-month; nothing is
 * hardcoded. Marriage windows emerge from the scan.
 */

export function jupiterSaturnSidereal(jd: number): TransitSnapshot {
  const ayanamsa = lahariAyanamsa(jd);
  const jup = tropicalToSidereal(planetLongitude('Jupiter', jd), ayanamsa);
  const sat = tropicalToSidereal(planetLongitude('Saturn', jd), ayanamsa);
  const d = julianDayToDate(jd + ayanamsa / 24); // approximate local date
  void d;
  return {
    jd,
    dateISO: julianDayToLocalISO(jd),
    jupiterSidereal: jup,
    jupiterRashiIndex: Math.floor(jup / 30) % 12,
    saturnSidereal: sat,
    saturnRashiIndex: Math.floor(sat / 30) % 12,
  };
}

function julianDayToLocalISO(jd: number): string {
  // display in IST-like offset handled by caller; here plain UTC date label
  const d = julianDayToDate(jd);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate(),
  ).padStart(2, '0')}`;
}

export type ChartTargets = {
  seventhSignIndex: number;
  lagnaSignIndex: number;
  moonSignIndex: number;
  venusSignIndex: number;
  seventhLordSignIndex: number;
};

export function scoreTransit(
  t: TransitSnapshot,
  chart: ChartSnapshot,
): { score: number; reasons: string[]; jupiterHits: string[]; saturnHits: string[] } {
  const targets: ChartTargets = {
    seventhSignIndex: chart.seventhHouse.rashiIndex,
    lagnaSignIndex: chart.lagna.rashiIndex,
    moonSignIndex: chart.moon.rashiIndex,
    venusSignIndex: chart.venus.rashiIndex,
    seventhLordSignIndex: chart.seventhLord.rashiIndex,
  };

  let score = 0;
  const reasons: string[] = [];
  const jupiterHits: string[] = [];
  const saturnHits: string[] = [];

  const jupAsp = vedicAspectSigns(t.jupiterRashiIndex, 'Jupiter');
  const satAsp = vedicAspectSigns(t.saturnRashiIndex, 'Saturn');

  if (t.jupiterRashiIndex === targets.seventhSignIndex) {
    score += TRANSIT_WEIGHTS.jupiterOnSeventhSign;
    jupiterHits.push('Jupiter transiting 7th house sign');
  }
  if (
    t.jupiterRashiIndex === targets.lagnaSignIndex ||
    t.jupiterRashiIndex === targets.moonSignIndex
  ) {
    score += TRANSIT_WEIGHTS.jupiterOnLagnaOrMoon;
    jupiterHits.push('Jupiter on Lagna/Moon sign');
  }
  if (jupAsp.includes(targets.seventhSignIndex)) {
    score += TRANSIT_WEIGHTS.jupiterAspectingSeventh;
    jupiterHits.push('Jupiter aspecting 7th house');
  }
  if (
    t.jupiterRashiIndex === targets.venusSignIndex ||
    t.jupiterRashiIndex === targets.seventhLordSignIndex ||
    jupAsp.includes(targets.venusSignIndex)
  ) {
    score += TRANSIT_WEIGHTS.jupiterOnSeventhLordOrVenus;
    jupiterHits.push('Jupiter with 7th lord/Venus');
  }

  if (t.saturnRashiIndex === targets.seventhSignIndex) {
    score += TRANSIT_WEIGHTS.saturnOnSeventhSign;
    saturnHits.push('Saturn on 7th house sign (commitment pressure → often event period)');
  }
  if (satAsp.includes(targets.seventhSignIndex)) {
    score += TRANSIT_WEIGHTS.saturnAspectingSeventh;
    saturnHits.push('Saturn aspecting 7th house');
  }
  if (t.saturnRashiIndex === targets.lagnaSignIndex) {
    score += TRANSIT_WEIGHTS.saturnOnLagna;
    saturnHits.push('Saturn on Lagna');
  }

  return { score: Math.min(15, Math.round(score / 10)), reasons, jupiterHits, saturnHits };
}

/** Whole-sign Vedic aspects cast by a planet located in `fromSign`. */
export function vedicAspectSigns(fromSign: number, planet: string): number[] {
  const offs =
    planet === 'Mars' ? [4, 7, 8]
    : planet === 'Jupiter' ? [5, 7, 9]
    : planet === 'Saturn' ? [3, 7, 10]
    : [7];
  return offs.map((o) => (fromSign + o - 1) % 12);
}
