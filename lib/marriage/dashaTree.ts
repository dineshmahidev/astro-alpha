import {
  DASHA_LORDS,
  DASHA_YEARS,
} from '../astronomy/dasha';
import type { PlanetKey } from '../astronomy/planetary-positions';
import { nakshatraFromSidereal, nakshatraLord } from '../astrology/rasi-nakshatra';
import { julianDayToDate } from '../astronomy/julian-day';
import type { DashaPeriodData } from './types';

/**
 * FULL VIMSHOTTARI TREE
 * ---------------------
 * Birth mahadasha is derived from the Moon's exact position inside its
 * nakshatra:
 *   elapsedFraction = arc traversed / 13°20′
 *   balance = lordYears × (1 − elapsedFraction)
 * The sequence then runs from the START of the birth mahadasha (which began
 * before birth). Generates maha → antar → pratyantar with exact JD boundaries.
 */

const YEAR_DAYS = 365.25;

function iso(jd: number, tz: number): string {
  const d = julianDayToDate(jd + tz / 24);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate(),
  ).padStart(2, '0')}`;
}

export function subPeriods(
  startJd: number,
  totalYears: number,
  parentLord: PlanetKey,
  level: 'maha' | 'antar' | 'pratyantar',
  tz: number,
  grandParent?: PlanetKey,
): DashaPeriodData[] {
  const out: DashaPeriodData[] = [];
  const parentIdx = DASHA_LORDS.indexOf(parentLord);
  let cursor = startJd;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_LORDS[(parentIdx + i) % 9];
    const years = (totalYears * DASHA_YEARS[lord]) / 120;
    const endJd = cursor + years * YEAR_DAYS;
    out.push({
      lord,
      startJd: cursor,
      endJd,
      startISO: iso(cursor, tz),
      endISO: iso(endJd, tz),
      level,
      parent: level !== 'maha' ? parentLord : undefined,
      grandParent: level === 'pratyantar' ? grandParent : undefined,
    });
    cursor = endJd;
  }
  return out;
}

export function buildDashaTree(moonSidereal: number, birthJd: number, tz: number) {
  const nak = nakshatraFromSidereal(moonSidereal);
  const birthLord = nakshatraLord(nak.nakshatraIndex) as PlanetKey;
  const lordYears = DASHA_YEARS[birthLord];
  const elapsedFraction =
    (moonSidereal - nak.spanStartLongitude) / nak.nakshatraSpan;
  const balanceYears = lordYears * (1 - elapsedFraction);

  // birth mahadasha started before birth
  const firstMahaStartJd = birthJd - (lordYears - balanceYears) * YEAR_DAYS;
  const startIdx = DASHA_LORDS.indexOf(birthLord);

  const mahadashas: DashaPeriodData[] = [];
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_LORDS[(startIdx + i) % 9];
    const years = DASHA_YEARS[lord];
    const sJd = mahadashas.length
      ? mahadashas[mahadashas.length - 1].endJd
      : firstMahaStartJd;
    const eJd = sJd + years * YEAR_DAYS;
    mahadashas.push({
      lord,
      startJd: sJd,
      endJd: eJd,
      startISO: iso(sJd, tz),
      endISO: iso(eJd, tz),
      level: 'maha',
    });
  }

  return { nakshatraIndex: nak.nakshatraIndex, birthNakshatra: nak.nakshatra, birthLord, balanceYears, mahadashas };
}

/** Antardashas of a given mahadasha. */
export function antardashasOf(maha: DashaPeriodData, tz: number): DashaPeriodData[] {
  const mahaYears = (maha.endJd - maha.startJd) / YEAR_DAYS;
  return subPeriods(maha.startJd, mahaYears, maha.lord, 'antar', tz);
}

/** Pratyantardashas of a given antardasha inside its parent mahadasha. */
export function pratyantardashasOf(
  maha: DashaPeriodData,
  antar: DashaPeriodData,
  tz: number,
): DashaPeriodData[] {
  const antarYears = (antar.endJd - antar.startJd) / YEAR_DAYS;
  return subPeriods(antar.startJd, antarYears, antar.lord, 'pratyantar', tz, maha.lord);
}

export function findPeriodAt(periods: DashaPeriodData[], jd: number): DashaPeriodData {
  for (const p of periods) if (jd >= p.startJd && jd < p.endJd) return p;
  return periods[periods.length - 1];
}
