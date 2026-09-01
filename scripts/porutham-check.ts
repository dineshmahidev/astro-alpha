/**
 * Porutham verification harness.
 * Usage: npx tsx scripts/porutham-check.ts
 *
 * Computes Moon nakshatra/rashi for test birth data using the app's
 * astronomy engine, then runs the 10-porutham matcher. Compare the
 * printed nakshatra/rashi/percentage against online calculators.
 */
import { gregorianToJulianDay } from '../lib/astronomy/julian-day';
import { moonLongitude } from '../lib/astronomy/moon';
import { lahariAyanamsa, tropicalToSidereal } from '../lib/astronomy/sidereal';
import {
  nakshatraFromSidereal,
  rashiFromSidereal,
} from '../lib/astrology/rasi-nakshatra';
import { NAKSHATRAS, RASHIS } from '../constants/birth';
import { computePorutham } from '../lib/astrology/porutham';

type Birth = { label: string; y: number; m: number; d: number; hh: number; mm: number };

function moonPos(b: Birth) {
  const date = new Date(b.y, b.m - 1, b.d, b.hh, b.mm);
  const jd = gregorianToJulianDay(date);
  const sidereal = tropicalToSidereal(moonLongitude(jd), lahariAyanamsa(jd));
  return {
    nak: nakshatraFromSidereal(sidereal),
    rashi: rashiFromSidereal(sidereal),
    sidereal,
  };
}

const PAIRS: { boy: Birth; girl: Birth }[] = [
  {
    boy: { label: 'Boy', y: 1990, m: 1, d: 1, hh: 6, mm: 0 },
    girl: { label: 'Girl', y: 1992, m: 5, d: 15, hh: 10, mm: 30 },
  },
  {
    boy: { label: 'Boy', y: 1985, m: 8, d: 20, hh: 14, mm: 45 },
    girl: { label: 'Girl', y: 1988, m: 12, d: 25, hh: 8, mm: 15 },
  },
  {
    boy: { label: 'Boy', y: 1995, m: 6, d: 9, hh: 11, mm: 30 },
    girl: { label: 'Girl', y: 1997, m: 9, d: 18, hh: 16, mm: 50 },
  },
];

for (const { boy: BOY, girl: GIRL } of PAIRS) {
  console.log('==========================================');
  const boy = moonPos(BOY);
  const girl = moonPos(GIRL);
  console.log(
    `${BOY.label}: ${BOY.y}-${BOY.m}-${BOY.d} ${BOY.hh}:${String(BOY.mm).padStart(2, '0')} IST -> ` +
      `sidereal ${boy.sidereal.toFixed(2)}deg | Nakshatra: ${NAKSHATRAS[boy.nak.nakshatraIndex]} (pada ${boy.nak.pada}) | Rashi: ${RASHIS[boy.rashi.rashiIndex]}`,
  );
  console.log(
    `${GIRL.label}: ${GIRL.y}-${GIRL.m}-${GIRL.d} ${GIRL.hh}:${String(GIRL.mm).padStart(2, '0')} IST -> ` +
      `sidereal ${girl.sidereal.toFixed(2)}deg | Nakshatra: ${NAKSHATRAS[girl.nak.nakshatraIndex]} (pada ${girl.nak.pada}) | Rashi: ${RASHIS[girl.rashi.rashiIndex]}`,
  );

  const report = computePorutham(
    boy.nak.nakshatraIndex,
    girl.nak.nakshatraIndex,
    boy.rashi.rashiIndex,
    girl.rashi.rashiIndex,
  );
  console.log('\n--- 10 Porutham ---');
  for (const item of report.items) {
    console.log(`${item.matched ? '[MATCH]' : '[ FAIL]'} ${item.name}`);
  }
  console.log(
    `\nMatched: ${report.matchedCount}/10 | Percentage: ${report.percentage}% | Verdict: ${report.verdict}\n`,
  );
}
