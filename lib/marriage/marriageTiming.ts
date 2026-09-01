import { YEAR_DAYS, UNIX_EPOCH_JD } from './constants';
import {
  antardashasOf,
  buildDashaTree,
  findPeriodAt,
  pratyantardashasOf,
} from './dashaTree';
import type {
  ChartSnapshot,
  DashaPeriodData,
  MarriageScoreComponents,
  MarriageWindow,
  PlanetPlacement,
} from './types';
import { aspectsFrom } from './strength';
import { SCAN_YEARS_AHEAD, TIMING_LORD_WEIGHTS, WEIGHTS } from './marriageRules';
import { jupiterSaturnSidereal, scoreTransit } from './transits';

/**
 * MARRIAGE TIMING ENGINE
 * ----------------------
 * Combines INDEPENDENT indicators — Vimshottari maha/antar/pratyantar lords,
 * 7th-lord/Venus/Jupiter/2-11 activation, and live Jupiter/Saturn transit
 * scans — into scored candidate periods. No year is ever hardcoded; windows
 * emerge from the scan of actual dasha boundaries + transits.
 */

export function dashaLordTimingScore(
  lord: string,
  chart: ChartSnapshot,
): { points: number; reasons: string[] } {
  let points = 0;
  const reasons: string[] = [];
  const add = (w: number, why: string) => {
    points += w;
    if (why) reasons.push(why);
  };

  const seventh = chart.houses[6];
  if (lord === seventh.lord)
    add(TIMING_LORD_WEIGHTS.seventhLord, `${lord} is the 7th lord`);
  if (lord === 'Venus') add(TIMING_LORD_WEIGHTS.venus, `Venus mahadasha/antardasha (marriage karaka)`);
  if (seventh.planets.includes(lord as never))
    add(TIMING_LORD_WEIGHTS.planetsInSeventh, `${lord} placed in the 7th house`);
  if (lord === 'Jupiter')
    add(TIMING_LORD_WEIGHTS.jupiterAsNaturalKaraka, `Jupiter period (expansion/blessing)`);
  if (lord === chart.houses[1].lord) add(TIMING_LORD_WEIGHTS.lagnaLord, `${lord} is Lagna lord`);
  if (lord === chart.houses[2].lord || lord === chart.houses[10].lord)
    add(TIMING_LORD_WEIGHTS.secondEleventhLords, `${lord} rules family/gain-linked house`);

  // houses owned by the lord
  for (const h of chart.houses) {
    if (h.lord === lord && [6, 12].includes(h.house)) {
      add(TIMING_LORD_WEIGHTS.sixthTwelfthPenalty, `${lord} owns house ${h.house} (6/12) — friction`);
    }
    if (h.lord === lord && h.house === 8) {
      add(Math.round(TIMING_LORD_WEIGHTS.eighthLordPenalty / 2), `${lord} linked to 8th house`);
    }
  }

  // planets conjoined / aspecting the dasha lord in chart
  const lp: PlanetPlacement | undefined = chart.planets.find((p) => p.planet === lord);
  if (lp) {
    const conjBenefic = chart.planets.filter(
      (p) => p.house === lp.house && ['Venus', 'Jupiter'].includes(p.planet),
    );
    if (conjBenefic.length) add(8, `${lord} conjunct ${conjBenefic.map((x) => x.planet).join('/')}`);
    const aspectsTo7 = aspectsFrom(lp.planet, lp.house).some((a) => a.toHouse === 7);
    if (aspectsTo7) add(10, `${lord} aspects the 7th house`);
  }
  if (lord === 'Moon') add(TIMING_LORD_WEIGHTS.moon * 0.4, '');

  return { points: Math.round(points), reasons };
}

type Cand = { antar: DashaPeriodData; maha: DashaPeriodData; score: number; reasons: string[] };

export function computeMarriageWindows(
  chart: ChartSnapshot,
  moonSidereal: number,
  birthJd: number,
  timezoneOffsetHours: number,
  baseComponents: Omit<MarriageScoreComponents, 'total' | 'dashaSupport' | 'jupiterTransit' | 'saturnTransit'>,
): {
  windows: MarriageWindow[];
  yearlyScores: { year: number; score: number }[];
  currentMaha: DashaPeriodData;
  currentAntar: DashaPeriodData;
  currentPratyantar: DashaPeriodData;
  scannedUntilYear: number;
} {
  const tree = buildDashaTree(moonSidereal, birthJd, timezoneOffsetHours);
  const nowJd = Date.now() / 86400000 + UNIX_EPOCH_JD;
  const currentMaha = findPeriodAt(tree.mahadashas, nowJd);
  const currentAntar = findPeriodAt(antardashasOf(currentMaha, timezoneOffsetHours), nowJd);
  const currentPratyantar = findPeriodAt(
    pratyantardashasOf(currentMaha, currentAntar, timezoneOffsetHours),
    nowJd,
  );

  // candidate antardasha periods within scan range
  const nowDate = new Date();
  const untilYear = nowDate.getFullYear() + SCAN_YEARS_AHEAD;
  const candidates: Cand[] = [];


  for (const maha of tree.mahadashas) {
    if (maha.endJd < nowJd - 365) continue;
    const antars = antardashasOf(maha, timezoneOffsetHours);
    for (const antar of antars) {
      if (antar.endJd < nowJd) continue;
      const startYear = new Date((antar.startJd - 2440587.5) * 86400000).getFullYear();
      if (startYear > untilYear) continue;

      const midJd = (antar.startJd + antar.endJd) / 2;
      const mahaScore = dashaLordTimingScore(maha.lord, chart);
      const antarScore = dashaLordTimingScore(antar.lord, chart);
      // pratyantar refinement at midpoint
      const prats = pratyantardashasOf(maha, antar, timezoneOffsetHours);
      const pratAtMid = findPeriodAt(prats, midJd);
      const pratScore = dashaLordTimingScore(pratAtMid.lord, chart);

      const tr = jupiterSaturnSidereal(midJd);
      const trScore = scoreTransit(tr, chart);

      const dashaPoints =
        mahaScore.points * 0.5 + antarScore.points * 0.35 + pratScore.points * 0.15;
      const dashaSupport = clamp(dashaPoints * 0.55, WEIGHTS.dashaSupport.max);

      const jupiterTransit = clamp((trScore.score / 15) * WEIGHTS.jupiterTransit.max, WEIGHTS.jupiterTransit.max);
      const saturnTransit = clamp((trScore.score / 15) * WEIGHTS.saturnTransit.max, WEIGHTS.saturnTransit.max);

      const total =
        baseComponents.seventhHouseStrength +
        baseComponents.seventhLordStrength +
        baseComponents.venusSupport +
        baseComponents.secondEleventhSupport +
        baseComponents.fifthHouseSupport +
        dashaSupport +
        jupiterTransit +
        saturnTransit;

      const reasons = [
        ...mahaScore.reasons.map((r) => `Mahadasha ${maha.lord}: ${r}`),
        ...antarScore.reasons.map((r) => `Antardasha ${antar.lord}: ${r}`),
        ...pratScore.reasons.map((r) => `Pratyantar ${pratAtMid.lord}: ${r}`),
        ...trScore.jupiterHits,
        ...trScore.saturnHits,
      ].filter(Boolean);

      candidates.push({ antar, maha, score: Math.round(clamp(total, 100)), reasons });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const top = dedupeOverlapping(candidates.slice(0, 6));

  const windows: MarriageWindow[] = top.map((c) => {
    const startY = new Date((c.antar.startJd - UNIX_EPOCH_JD) * 86400000);
    const endY = new Date((c.antar.endJd - UNIX_EPOCH_JD) * 86400000);
    return {
      startISO: c.antar.startISO,
      endISO: c.antar.endISO,
      label: `${MONTH_NAME[startY.getMonth()]} ${startY.getFullYear()} – ${MONTH_NAME[endY.getMonth()]} ${endY.getFullYear()}`,
      yearRange: [startY.getFullYear(), endY.getFullYear()],
      peakYear: endY.getFullYear(),
      score: c.score,
      components: {
        ...baseComponents,
        dashaSupport: clamp(
          (dashaLordTimingScore(c.maha.lord, chart).points * 0.5 +
            dashaLordTimingScore(c.antar.lord, chart).points * 0.5) *
            0.55,
          WEIGHTS.dashaSupport.max,
        ),
        jupiterTransit: 0,
        saturnTransit: 0,
        total: c.score,
        notes: [],
      },
      reasons: c.reasons,
    } as MarriageWindow;
  });

  // aggregate yearly scores from all candidates
  const yearMap = new Map<number, { sum: number; count: number }>();
  for (const c of candidates) {
    const midMs = ((c.antar.startJd + c.antar.endJd) / 2 - UNIX_EPOCH_JD) * 86400000;
    const yr = new Date(midMs).getFullYear();
    const prev = yearMap.get(yr) ?? { sum: 0, count: 0 };
    prev.sum += c.score;
    prev.count += 1;
    yearMap.set(yr, prev);
  }
  const yearlyScores = [...yearMap.entries()]
    .map(([year, v]) => ({ year, score: Math.round(v.sum / v.count) }))
    .sort((a, b) => a.year - b.year);

  return {
    windows,
    yearlyScores,
    currentMaha,
    currentAntar,
    currentPratyantar,
    scannedUntilYear: untilYear,
  };
}

function clamp(v: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(v)));
}

function dedupeOverlapping(cands: Cand[]): Cand[] {
  const out: typeof cands = [];
  for (const c of cands) {
    if (!out.some((o) => o.maha.lord === c.maha.lord && o.antar.lord === c.antar.lord)) {
      out.push(c);
    }
  }
  return out.slice(0, 3);
}

const MONTH_NAME = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export { YEAR_DAYS };
