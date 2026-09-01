import { nakshatraFromSidereal, nakshatraLord } from '../astrology/rasi-nakshatra';
import { julianDayToLocalString } from './julian-day';
import { PlanetKey } from './planetary-positions';

/**
 * VIMSHOTTARI DASHA
 * -----------------
 * 120-year cycle across 9 lords. Birth nakshatra determines the birth
 * Mahadasha; the balance at birth comes from the Moon's exact position inside
 * its nakshatra (not just the nakshatra name):
 *   balanceYears = lordYears * (1 - fraction elapsed inside the nakshatra)
 * Sub-periods scale proportionally: antar = maha * (subLordYears/120),
 * pratyantar = antar * (subLordYears/120).
 */

export const DASHA_LORDS: PlanetKey[] = [
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
];

export const DASHA_YEARS: Record<PlanetKey, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export type DashaPeriod = {
  lord: PlanetKey;
  startJd: number;
  endJd: number;
  years: number;
  startDate: string;
  endDate: string;
};

export type VimshottariResult = {
  birthNakshatraIndex: number;
  birthNakshatra: string;
  birthNakshatraLord: PlanetKey;
  birthMahadasha: DashaPeriod;
  balanceYears: number;
  elapsedYears: number;
  mahadashas: DashaPeriod[];
  antardashas: DashaPeriod[];
  pratyantardasha: DashaPeriod;
  utcOffsetHours: number;
};

const YEARS_TO_DAYS = 365.25;

function lordIndex(lord: PlanetKey): number {
  return DASHA_LORDS.indexOf(lord);
}

/** Convert years offset to a JD. */
function offsetJd(startJd: number, years: number): number {
  return startJd + years * YEARS_TO_DAYS;
}

export function computeVimshottari(
  birthJd: number,
  moonSiderealLongitude: number,
  utcOffsetHours = 5.5,
): VimshottariResult {
  const nak = nakshatraFromSidereal(moonSiderealLongitude);
  const birthLord = nakshatraLord(nak.nakshatraIndex) as PlanetKey;
  const lordYears = DASHA_YEARS[birthLord];

  // fraction of the nakshatra already elapsed at birth
  const elapsedFraction = (moonSiderealLongitude - nak.spanStartLongitude) / nak.nakshatraSpan;
  const balanceYears = lordYears * (1 - elapsedFraction);
  const elapsedYears = lordYears * elapsedFraction;

  // birth mahadasha started (lordYears - balanceYears) years before birth
  const mahaStartJd = offsetJd(birthJd, -(lordYears - balanceYears));
  const birthMaha: DashaPeriod = {
    lord: birthLord,
    startJd: mahaStartJd,
    endJd: mahaStartJd + lordYears * YEARS_TO_DAYS,
    years: lordYears,
    startDate: julianDayToLocalString(mahaStartJd, utcOffsetHours),
    endDate: julianDayToLocalString(mahaStartJd + lordYears * YEARS_TO_DAYS, utcOffsetHours),
  };

  // full mahadasha sequence across 120 years from the birth mahadasha start
  const mahadashas: DashaPeriod[] = [];
  const startIdx = lordIndex(birthLord);
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_LORDS[(startIdx + i) % 9];
    const years = DASHA_YEARS[lord];
    const sJd = mahadashas.length === 0 ? mahaStartJd : mahadashas[mahadashas.length - 1].endJd;
    const eJd = sJd + years * YEARS_TO_DAYS;
    mahadashas.push({
      lord,
      startJd: sJd,
      endJd: eJd,
      years,
      startDate: julianDayToLocalString(sJd, utcOffsetHours),
      endDate: julianDayToLocalString(eJd, utcOffsetHours),
    });
  }

  // antardashas within the birth mahadasha
  const antardashas: DashaPeriod[] = [];
  for (let i = 0; i < 9; i++) {
    const sub = DASHA_LORDS[(startIdx + i) % 9];
    const years = (lordYears * DASHA_YEARS[sub]) / 120;
    const sJd = antardashas.length === 0 ? mahaStartJd : antardashas[antardashas.length - 1].endJd;
    const eJd = sJd + years * YEARS_TO_DAYS;
    antardashas.push({
      lord: sub,
      startJd: sJd,
      endJd: eJd,
      years,
      startDate: julianDayToLocalString(sJd, utcOffsetHours),
      endDate: julianDayToLocalString(eJd, utcOffsetHours),
    });
  }

  // pratyantardasha running at the birth moment (inside the birth antardasha)
  let currentAntar = antardashas[0];
  for (const a of antardashas) {
    if (birthJd >= a.startJd && birthJd < a.endJd) {
      currentAntar = a;
      break;
    }
  }
  const antarIdx = lordIndex(currentAntar.lord);
  const pratyantarYears = (currentAntar.years * DASHA_YEARS[currentAntar.lord]) / 120;
  const pStartJd = currentAntar.startJd;
  const pratyantardasha: DashaPeriod = {
    lord: currentAntar.lord,
    startJd: pStartJd,
    endJd: pStartJd + pratyantarYears * YEARS_TO_DAYS,
    years: pratyantarYears,
    startDate: julianDayToLocalString(pStartJd, utcOffsetHours),
    endDate: julianDayToLocalString(pStartJd + pratyantarYears * YEARS_TO_DAYS, utcOffsetHours),
  };

  return {
    birthNakshatraIndex: nak.nakshatraIndex,
    birthNakshatra: nak.nakshatra,
    birthNakshatraLord: birthLord,
    birthMahadasha: birthMaha,
    balanceYears,
    elapsedYears,
    mahadashas,
    antardashas,
    pratyantardasha,
    utcOffsetHours,
  };
}

/** Generic antardashas for ANY mahadasha period. */
export function antardashasFor(maha: DashaPeriod): DashaPeriod[] {
  const idx = lordIndex(maha.lord);
  const out: DashaPeriod[] = [];
  let cursor = maha.startJd;
  for (let i = 0; i < 9; i++) {
    const sub = DASHA_LORDS[(idx + i) % 9];
    const years = (maha.years * DASHA_YEARS[sub]) / 120;
    out.push({
      lord: sub,
      startJd: cursor,
      endJd: cursor + years * YEARS_TO_DAYS,
      years,
      startDate: julianDayToLocalString(cursor, 5.5),
      endDate: julianDayToLocalString(cursor + years * YEARS_TO_DAYS, 5.5),
    });
    cursor += years * YEARS_TO_DAYS;
  }
  return out;
}

/** The Mahadasha + Antardasha actually running at a given JD ("today"). */
export function currentDashaAt(
  dasha: VimshottariResult,
  jd: number,
): { maha: DashaPeriod; antar: DashaPeriod } {
  const maha =
    dasha.mahadashas.find((m) => jd >= m.startJd && jd < m.endJd) ??
    dasha.birthMahadasha;
  const antars = antardashasFor(maha);
  const antar = antars.find((a) => jd >= a.startJd && jd < a.endJd) ?? antars[0];
  return { maha, antar };
}