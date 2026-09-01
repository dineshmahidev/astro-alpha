/**
 * PORUTHAM MATCH ENGINE
 * ---------------------
 * Enhanced deterministic calculation engine for the Astrologer Dashboard.
 * Wraps the existing lib/astrology/porutham.ts with detailed scoring,
 * bride/groom values, and dosha analysis.
 *
 * DATA FLOW:
 *   Bride DOB/TOB/POB + Groom DOB/TOB/POB
 *   → computeVedicChart() for Moon rashi/nakshatra
 *   → computeAscendant() for Lagna
 *   → computePoruthamMatch() for 10 poruthams
 *   → computeDoshas() for dosha analysis
 *   → full MatchResult
 */

import { computeVedicChart, gregorianToJulianDay } from '../vedic';
import { computeAscendant } from '../astronomy/ascendant';
import { getPlanetLongitudes } from '../astronomy/planetary-positions';
import { rashiFromSidereal, nakshatraFromSidereal } from './rasi-nakshatra';
import { NAKSHATRAS, RASHIS } from '../../constants/birth';
import { ZODIAC_SIGNS } from '@/constants/zodiac';

// ─── Types ──────────────────────────────────────────────────────

export type PersonData = {
  name: string;
  date: Date;
  time: Date;
  place: string;
  lat: number;
  lon: number;
};

export type PersonChart = {
  name: string;
  rashi: string;
  rashiIndex: number;
  nakshatra: string;
  nakshatraIndex: number;
  pada: number;
  lagna: string;
  lagnaIndex: number;
  lagnaNakshatra: string;
  lagnaPada: number;
  planetPositions: PlanetData[];
  housePositions: HouseData[];
};

export type PlanetData = {
  planet: string;
  sign: string;
  degree: string;
  retrograde: boolean;
  combustion: boolean;
};

export type HouseData = {
  house: number;
  sign: string;
  planets: string[];
};

export type PoruthamDetail = {
  key: string;
  name: string;
  nameTa: string;
  score: number;
  maxScore: number;
  result: 'Good' | 'Average' | 'Poor';
  brideValue: string;
  groomValue: string;
  reason: string;
  governs: string;
  effectIfFail: string;
};

export type DoshaItem = {
  name: string;
  nameTa: string;
  status: 'Clear' | 'Mild' | 'Present' | 'Needs Attention';
  detail: string;
  severity: string;
};

export type DoshaAnalysis = {
  brideDoshas: DoshaItem[];
  groomDoshas: DoshaItem[];
  combinedDoshas: DoshaItem[];
};

export type MatchResult = {
  bride: PersonChart;
  groom: PersonChart;
  poruthams: PoruthamDetail[];
  totalScore: number;
  maxScore: number;
  overallResult: 'Good Match' | 'Average Match' | 'Needs Attention';
  strongAreas: string[];
  attentionAreas: string[];
  doshas: DoshaAnalysis;
};

// ─── Nakshatra Data (same as porutham.ts) ───────────────────────

const GANA_TABLE = [
  'Deva', 'Manushya', 'Rakshasa', 'Manushya', 'Deva', 'Manushya',
  'Deva', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya',
  'Deva', 'Rakshasa', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa',
  'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Rakshasa',
  'Manushya', 'Manushya', 'Deva',
];

const YONI_TABLE = [
  'Horse', 'Elephant', 'Sheep', 'Serpent', 'Serpent', 'Dog',
  'Cat', 'Sheep', 'Cat', 'Rat', 'Rat', 'Cow',
  'Buffalo', 'Tiger', 'Buffalo', 'Tiger', 'Deer', 'Deer',
  'Dog', 'Monkey', 'Mongoose', 'Monkey', 'Lion', 'Horse',
  'Lion', 'Cow', 'Elephant',
];

const YONI_ENEMIES: [string, string][] = [
  ['Cow', 'Tiger'], ['Elephant', 'Lion'], ['Horse', 'Buffalo'],
  ['Dog', 'Deer'], ['Serpent', 'Mongoose'], ['Monkey', 'Sheep'], ['Cat', 'Rat'],
];

const RASHI_LORDS = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

const PLANET_FRIENDS: Record<string, string[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
};

const VASYA: Record<number, number[]> = {
  0: [4, 7], 1: [3, 6], 2: [5], 3: [7, 8],
  4: [6], 5: [11, 2], 6: [9, 5], 7: [3],
  8: [11], 9: [0, 10], 10: [0], 11: [9],
};

type RajjuGroup = 'Siro' | 'Kanta' | 'Nabhi' | 'Kati' | 'Pada';
const RAJJU_TABLE: RajjuGroup[] = (() => {
  const t: RajjuGroup[] = new Array(27) as any;
  const fill = (group: RajjuGroup, ones: number[]) => ones.forEach((n) => (t[n - 1] = group));
  fill('Pada', [1, 9, 10, 18, 19, 27]);
  fill('Kati', [2, 8, 11, 17, 20, 26]);
  fill('Nabhi', [3, 7, 12, 16, 21, 25]);
  fill('Kanta', [4, 6, 13, 15, 22, 24]);
  fill('Siro', [5, 14, 23]);
  return t;
})();

const VEDHA_PAIRS: [number, number][] = [
  [0, 17], [1, 16], [2, 15], [3, 14], [4, 22], [5, 21],
  [6, 20], [7, 19], [8, 18], [9, 26], [10, 25], [11, 24], [12, 23],
];

const DINA_GOOD_COUNTS = new Set([2, 4, 6, 8, 9, 11, 13, 15, 17, 18, 20, 24, 26]);
const MAHENDRA_COUNTS = new Set([4, 7, 10, 13, 16, 19, 22, 25]);

// ─── Helpers ────────────────────────────────────────────────────

const countForward = (from: number, to: number) => ((to - from + 27) % 27) + 1;
const getNakName = (i: number) => NAKSHATRAS[i % 27]?.name ?? '';
const getRashiName = (i: number) => RASHIS[i % 12]?.name ?? '';

// ─── Build Person Chart ─────────────────────────────────────────

function buildPersonChart(person: PersonData): PersonChart {
  const chart = computeVedicChart(person.date);
  const jd = gregorianToJulianDay(person.date);
  const lagna = computeAscendant(jd, person.lat, person.lon);
  const planets = getPlanetLongitudes(jd);

  const planetPositions: PlanetData[] = planets.map((p) => {
    const rashi = rashiFromSidereal(p.siderealLongitude);
    const nak = nakshatraFromSidereal(p.siderealLongitude);
    const signName = ZODIAC_SIGNS[rashi.rashiIndex]?.name ?? getRashiName(rashi.rashiIndex);
    return {
      planet: p.key,
      sign: signName,
      degree: `${rashi.degreeInRashi.toFixed(1)}°`,
      retrograde: p.retrograde,
      combustion: p.combustion ?? false,
    };
  });

  const houseSigns: HouseData[] = Array.from({ length: 12 }, (_, i) => {
    const signIdx = (lagna.rashiIndex + i) % 12;
    const signName = ZODIAC_SIGNS[signIdx]?.name ?? getRashiName(signIdx);
    const planetsInHouse = planetPositions
      .filter((pp) => pp.sign === signName)
      .map((pp) => pp.planet);
    if (i === 0) planetsInHouse.unshift('Lagna');
    return { house: i + 1, sign: signName, planets: planetsInHouse };
  });

  return {
    name: person.name,
    rashi: ZODIAC_SIGNS[chart.rashiIndex]?.name ?? chart.rashi,
    rashiIndex: chart.rashiIndex,
    nakshatra: chart.nakshatra,
    nakshatraIndex: chart.nakshatraIndex,
    pada: chart.pada,
    lagna: ZODIAC_SIGNS[lagna.rashiIndex]?.name ?? lagna.rashi,
    lagnaIndex: lagna.rashiIndex,
    lagnaNakshatra: lagna.nakshatra,
    lagnaPada: lagna.pada,
    planetPositions,
    housePositions: houseSigns,
  };
}

// ─── 10 Porutham Calculations ───────────────────────────────────

function calcDinaDetail(gNak: number, bNak: number): PoruthamDetail {
  const count = countForward(bNak, gNak);
  const matched = DINA_GOOD_COUNTS.has(count);
  const score = matched ? 1 : 0;
  return {
    key: 'dina', name: 'Dina Porutham', nameTa: 'தின பொருத்தம்',
    score, maxScore: 1,
    result: matched ? 'Good' : 'Poor',
    brideValue: getNakName(bNak),
    groomValue: getNakName(gNak),
    reason: `Star distance: ${count} — ${matched ? 'auspicious count' : 'inauspicious count'}`,
    governs: 'Health, fortune and daily harmony',
    effectIfFail: 'Frequent disagreements, ill-health, loss of fortune',
  };
}

function calcGanaDetail(gNak: number, bNak: number): PoruthamDetail {
  const gG = GANA_TABLE[gNak];
  const bG = GANA_TABLE[bNak];
  let matched = false;
  let result: 'Good' | 'Average' | 'Poor' = 'Poor';
  if (gG === bG) { matched = true; result = 'Good'; }
  else if (gG !== 'Rakshasa' && bG !== 'Rakshasa') { matched = true; result = 'Average'; }
  const score = matched ? 1 : 0;
  return {
    key: 'gana', name: 'Gana Porutham', nameTa: 'கண பொருத்தம்',
    score, maxScore: 1,
    result,
    brideValue: `${getNakName(bNak)} (${bG})`,
    groomValue: `${getNakName(gNak)} (${gG})`,
    reason: `Groom: ${gG}, Bride: ${bG}${gG === bG ? ' — same temperament' : ''}`,
    governs: 'Temperament and attitude compatibility',
    effectIfFail: 'Clashing temperaments lead to constant quarrels',
  };
}

function calcMahendraDetail(gNak: number, bNak: number): PoruthamDetail {
  const count = countForward(bNak, gNak);
  const matched = MAHENDRA_COUNTS.has(count);
  const score = matched ? 1 : 0;
  return {
    key: 'mahendra', name: 'Mahendra Porutham', nameTa: 'மகேந்திர பொருத்தம்',
    score, maxScore: 1,
    result: matched ? 'Good' : 'Poor',
    brideValue: getNakName(bNak),
    groomValue: getNakName(gNak),
    reason: `Star distance: ${count} — ${matched ? 'prosperity ensured' : 'not favorable for progeny'}`,
    governs: 'Progeny — welfare of children',
    effectIfFail: 'Difficulties related to children and their well-being',
  };
}

function calcStreeDeerghaDetail(gNak: number, bNak: number): PoruthamDetail {
  const count = countForward(gNak, bNak);
  const matched = count >= 13;
  const score = matched ? 1 : 0;
  return {
    key: 'streedeerkha', name: 'Stree Deergha', nameTa: 'ஸ்திரீ தீர்க்க பொருத்தம்',
    score, maxScore: 1,
    result: matched ? 'Good' : 'Poor',
    brideValue: getNakName(bNak),
    groomValue: getNakName(gNak),
    reason: `Boy→Girl count: ${count} — ${matched ? '≥13 auspicious' : '<13 inauspicious'}`,
    governs: 'Longevity and happiness of the bride',
    effectIfFail: "The bride's well-being and comfort may suffer",
  };
}

function calcYoniDetail(gNak: number, bNak: number): PoruthamDetail {
  const gY = YONI_TABLE[gNak];
  const bY = YONI_TABLE[bNak];
  const isEnemy = YONI_ENEMIES.some(([a, c]) => (a === gY && c === bY) || (a === bY && c === gY));
  const isSame = gY === bY;
  const matched = !isEnemy;
  let result: 'Good' | 'Average' | 'Poor' = 'Poor';
  if (isSame) result = 'Good';
  else if (matched) result = 'Average';
  const score = matched ? 1 : 0;
  return {
    key: 'yoni', name: 'Yoni Porutham', nameTa: 'யோனி பொருத்தம்',
    score, maxScore: 1,
    result,
    brideValue: `${getNakName(bNak)} (${bY})`,
    groomValue: `${getNakName(gNak)} (${gY})`,
    reason: isSame ? 'Same animal — excellent' : isEnemy ? `${gY} vs ${bY} — enemies` : `${gY} & ${bY} — compatible`,
    governs: 'Physical and intimate compatibility',
    effectIfFail: 'Lack of intimacy and instinctive discomfort',
  };
}

function calcRasiDetail(gRashi: number, bRashi: number): PoruthamDetail {
  const same = gRashi === bRashi;
  const seventh = (gRashi + 6) % 12 === bRashi || (bRashi + 6) % 12 === gRashi;
  const matched = same || seventh;
  const score = matched ? 1 : 0;
  return {
    key: 'rasi', name: 'Rasi Porutham', nameTa: 'ராசி பொருத்தம்',
    score, maxScore: 1,
    result: matched ? 'Good' : 'Poor',
    brideValue: getRashiName(bRashi),
    groomValue: getRashiName(gRashi),
    reason: same ? 'Same rashi — strong bond' : seventh ? '7th sign — mutual affection' : 'No rasi connection',
    governs: 'Mutual affection, unity and family prosperity',
    effectIfFail: 'Emotional distance and reduced family growth',
  };
}

function calcRasiAdhipaDetail(gRashi: number, bRashi: number): PoruthamDetail {
  const gLord = RASHI_LORDS[gRashi];
  const bLord = RASHI_LORDS[bRashi];
  const isFriend = gLord === bLord ||
    PLANET_FRIENDS[gLord]?.includes(bLord) ||
    PLANET_FRIENDS[bLord]?.includes(gLord);
  const matched = isFriend;
  const score = matched ? 1 : 0;
  return {
    key: 'rasiAdhipa', name: 'Rasi Adhipathi', nameTa: 'ராசியதிபதி பொருத்தம்',
    score, maxScore: 1,
    result: matched ? 'Good' : 'Poor',
    brideValue: `${getRashiName(bRashi)} Lord: ${bLord}`,
    groomValue: `${getRashiName(gRashi)} Lord: ${gLord}`,
    reason: `${gLord} & ${bLord} — ${isFriend ? 'friends' : 'not friends'}`,
    governs: 'Mental rapport and friendship between the couple',
    effectIfFail: 'Ego clashes and weak mental connection',
  };
}

function calcVasyaDetail(gRashi: number, bRashi: number): PoruthamDetail {
  const gVasya = VASYA[gRashi]?.includes(bRashi);
  const bVasya = VASYA[bRashi]?.includes(gRashi);
  const same = gRashi === bRashi;
  const matched = same || !!gVasya || !!bVasya;
  let result: 'Good' | 'Average' | 'Poor' = 'Poor';
  if (same) result = 'Good';
  else if (matched) result = 'Average';
  const score = matched ? 1 : 0;
  return {
    key: 'vasya', name: 'Vasya Porutham', nameTa: 'வசிய பொருத்தம்',
    score, maxScore: 1,
    result,
    brideValue: getRashiName(bRashi),
    groomValue: getRashiName(gRashi),
    reason: same ? 'Same rashi — natural vasya' : matched ? 'Mutual vasya exists' : 'No vasya connection',
    governs: 'Mutual attraction, influence and co-operation',
    effectIfFail: 'One partner may dominate or fail to influence the other',
  };
}

function calcRajjuDetail(gNak: number, bNak: number): PoruthamDetail {
  const gR = RAJJU_TABLE[gNak];
  const bR = RAJJU_TABLE[bNak];
  const matched = gR !== bR;
  const score = matched ? 1 : 0;
  return {
    key: 'rajju', name: 'Rajju Porutham', nameTa: 'ரஜ்ஜு பொருத்தம்',
    score, maxScore: 1,
    result: matched ? 'Good' : 'Poor',
    brideValue: `${getNakName(bNak)} (${bR})`,
    groomValue: `${getNakName(gNak)} (${gR})`,
    reason: matched ? `${gR} ≠ ${bR} — safe` : `${gR} = ${bR} — same rope, SEVERE dosha`,
    governs: 'Longevity and well-being of the spouse — MOST IMPORTANT',
    effectIfFail: 'Same rajju rope — hardship and danger to partner',
  };
}

function calcVedhaDetail(gNak: number, bNak: number): PoruthamDetail {
  const blocked = VEDHA_PAIRS.some(([a, bl]) => (a === gNak && bl === bNak) || (a === bNak && bl === gNak));
  const matched = !blocked;
  const score = matched ? 1 : 0;
  return {
    key: 'vedha', name: 'Vedha Porutham', nameTa: 'வேதா பொருத்தம்',
    score, maxScore: 1,
    result: matched ? 'Good' : 'Poor',
    brideValue: getNakName(bNak),
    groomValue: getNakName(gNak),
    reason: matched ? 'No vedha affliction' : 'Vedha affliction present — obstacles',
    governs: 'Freedom from affliction between birth stars',
    effectIfFail: 'Obstacles, misfortunes and instability after marriage',
  };
}

// ─── Dosha Analysis ─────────────────────────────────────────────

const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12];
const MANGAL_STRONG_HOUSES = [1, 7, 8, 12];

function getPlanetHouse(chart: PersonChart, planet: string): number {
  const h = chart.housePositions.findIndex((hh) => hh.planets.includes(planet));
  return h >= 0 ? h + 1 : -1;
}

function isMaleficHouse(house: number): boolean {
  return [6, 8, 12].includes(house);
}

// 1. Sevvai Dosham (Manglik) — Mars in 1,2,4,7,8,12 from Lagna
function checkSevvaiDosham(chart: PersonChart): DoshaItem {
  const marsHouse = getPlanetHouse(chart, 'Mars');
  const triggered = MANGAL_HOUSES.includes(marsHouse);
  const strong = MANGAL_STRONG_HOUSES.includes(marsHouse);
  // Cancellation: Mars in own sign (Aries/Scorpio) or exalted (Capricorn)
  const marsSign = chart.planetPositions.find((p) => p.planet === 'Mars')?.sign ?? '';
  const cancelled = ['Aries', 'Scorpio', 'Capricorn'].includes(marsSign);
  // Jupiter aspect cancellation
  const jupiterHouse = getPlanetHouse(chart, 'Jupiter');
  const jupiterAspects = triggered && Math.abs(jupiterHouse - marsHouse) % 12 <= 1;

  let status: DoshaItem['status'] = 'Clear';
  let detail = 'Mars not in dosha houses';
  let severity = 'None';

  if (triggered && !cancelled && !jupiterAspects) {
    if (strong) { status = 'Needs Attention'; severity = 'Full'; detail = `Mars in house ${marsHouse} — strong Sevvai Dosham`; }
    else { status = 'Mild'; severity = 'Partial'; detail = `Mars in house ${marsHouse} — mild dosha`; }
  } else if (triggered && (cancelled || jupiterAspects)) {
    status = 'Mild'; severity = 'Cancelled'; detail = `Mars in house ${marsHouse} but cancelled (${cancelled ? 'own sign' : 'Jupiter aspect'})`;
  }

  return { name: 'Sevvai Dosham', nameTa: 'செவ்வாய் தோஷம்', status, detail, severity };
}

// 2. Sani Dosham — Saturn in 1,7,8,12 or aspecting 7th
function checkSaniDosham(chart: PersonChart): DoshaItem {
  const saturnHouse = getPlanetHouse(chart, 'Saturn');
  const triggered = [1, 7, 8, 12].includes(saturnHouse);
  // Saturn aspects 7th from itself (7th, 10th, 12th aspect)
  const saturnAspects7th = [7, 10, 12].includes(((7 - saturnHouse + 12) % 12) + 1);
  const afflicted = triggered || saturnAspects7th;

  let status: DoshaItem['status'] = 'Clear';
  let detail = 'Saturn not in dosha houses';
  let severity = 'None';

  if (afflicted) {
    const saturnSign = chart.planetPositions.find((p) => p.planet === 'Saturn')?.sign ?? '';
    const ownSign = ['Capricorn', 'Aquarius'].includes(saturnSign);
    if (ownSign) {
      status = 'Mild'; severity = 'Mild'; detail = `Saturn in house ${saturnHouse} (own sign) — reduced effect`;
    } else {
      status = 'Present'; severity = 'Moderate'; detail = `Saturn in house ${saturnHouse} — Sani Dosham`;
    }
  }

  return { name: 'Sani Dosham', nameTa: 'சனி தோஷம்', status, detail, severity };
}

// 3. Kaal Sarpa Dosham — all 7 planets between Rahu-Ketu axis
function checkKaalSarpa(chart: PersonChart): DoshaItem {
  const rahuHouse = getPlanetHouse(chart, 'Rahu');
  const ketuHouse = getPlanetHouse(chart, 'Ketu');
  if (rahuHouse < 0 || ketuHouse < 0) {
    return { name: 'Kaal Sarpa', nameTa: 'கால சர்ப்ப தோஷம்', status: 'Clear', detail: 'Rahu/Ketu not found', severity: 'None' };
  }

  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const rahuIdx = rahuHouse - 1;
  const ketuIdx = ketuHouse - 1;

  // Check if all planets are between Rahu and Ketu (clockwise)
  let allBetween = true;
  let betweenCount = 0;
  for (const planet of planets) {
    const h = getPlanetHouse(chart, planet);
    if (h < 0) continue;
    const hIdx = h - 1;
    // Check if hIdx is between rahuIdx and ketuIdx (clockwise)
    if (rahuIdx < ketuIdx) {
      if (hIdx > rahuIdx && hIdx < ketuIdx) betweenCount++;
      else allBetween = false;
    } else {
      if (hIdx > rahuIdx || hIdx < ketuIdx) betweenCount++;
      else allBetween = false;
    }
  }

  // Check if any planet is conjunct Rahu or Ketu (cancellation)
  const conjunctNode = planets.some((p) => {
    const h = getPlanetHouse(chart, p);
    return h === rahuHouse || h === ketuHouse;
  });

  let status: DoshaItem['status'] = 'Clear';
  let detail = 'No Kaal Sarpa formation';
  let severity = 'None';

  if (allBetween && betweenCount >= 5) {
    if (conjunctNode) {
      status = 'Mild'; severity = 'Partial'; detail = 'Partial Kaal Sarpa — planet conjunct node';
    } else {
      status = 'Present'; severity = 'Full'; detail = 'All planets hemmed between Rahu-Ketu';
    }
  }

  return { name: 'Kaal Sarpa', nameTa: 'கால சர்ப்ப தோஷம்', status, detail, severity };
}

// 4. Puthra Dosham — 5th house affliction, Jupiter weak
function checkPuthraDosham(chart: PersonChart): DoshaItem {
  const fifthHouse = chart.housePositions[4]; // 5th house (index 4)
  const jupiterHouse = getPlanetHouse(chart, 'Jupiter');
  const fifthLord = RASHI_LORDS[ZODIAC_SIGNS.findIndex((z) => z.name === fifthHouse?.sign) % 12];

  const fifthAfflicted = fifthHouse?.planets.some((p) => ['Saturn', 'Rahu', 'Ketu', 'Mars'].includes(p)) ?? false;
  const fifthLordAfflicted = [6, 8, 12].includes(jupiterHouse); // simplified
  const jupiterDebilitated = chart.planetPositions.find((p) => p.planet === 'Jupiter')?.sign === 'Capricorn';

  const afflicted = fifthAfflicted || jupiterDebilitated;

  let status: DoshaItem['status'] = 'Clear';
  let detail = '5th house and Jupiter are strong';
  let severity = 'None';

  if (afflicted) {
    if (fifthAfflicted && jupiterDebilitated) {
      status = 'Needs Attention'; severity = 'Strong'; detail = '5th house afflicted + Jupiter debilitated';
    } else if (fifthAfflicted) {
      status = 'Present'; severity = 'Moderate'; detail = '5th house has malefic influence';
    } else {
      status = 'Mild'; severity = 'Mild'; detail = 'Jupiter debilitated — progeny delays possible';
    }
  }

  return { name: 'Puthra Dosham', nameTa: 'புத்ர தோஷம்', status, detail, severity };
}

// 5. Pitra Dosham — Sun afflicted by Rahu/Saturn, 9th house affliction
function checkPitraDosham(chart: PersonChart): DoshaItem {
  const sunHouse = getPlanetHouse(chart, 'Sun');
  const rahuHouse = getPlanetHouse(chart, 'Rahu');
  const saturnHouse = getPlanetHouse(chart, 'Saturn');

  const sunConjRahu = sunHouse === rahuHouse;
  const sunConjSaturn = sunHouse === saturnHouse;
  const ninthHouse = chart.housePositions[8]; // 9th house
  const ninthAfflicted = ninthHouse?.planets.some((p) => ['Rahu', 'Ketu', 'Saturn'].includes(p)) ?? false;

  const afflicted = sunConjRahu || sunConjSaturn || ninthAfflicted;

  let status: DoshaItem['status'] = 'Clear';
  let detail = 'No Pitra Dosha';
  let severity = 'None';

  if (afflicted) {
    if (sunConjRahu) {
      status = 'Present'; severity = 'Moderate'; detail = 'Sun conjunct Rahu — Grahan Dosha on Sun';
    } else if (sunConjSaturn) {
      status = 'Present'; severity = 'Moderate'; detail = 'Sun conjunct Saturn — ancestral karma';
    } else {
      status = 'Mild'; severity = 'Mild'; detail = '9th house afflicted — mild Pitra Dosha';
    }
  }

  return { name: 'Pitra Dosham', nameTa: 'பித்ரு தோஷம்', status, detail, severity };
}

// 6. Naga Dosham — Rahu/Ketu in 1st/7th house
function checkNagaDosham(chart: PersonChart): DoshaItem {
  const rahuHouse = getPlanetHouse(chart, 'Rahu');
  const ketuHouse = getPlanetHouse(chart, 'Ketu');
  const triggered = [1, 7].includes(rahuHouse) || [1, 7].includes(ketuHouse);

  let status: DoshaItem['status'] = 'Clear';
  let detail = 'Rahu/Ketu not in 1st/7th house';
  let severity = 'None';

  if (triggered) {
    const house = [1, 7].includes(rahuHouse) ? rahuHouse : ketuHouse;
    const node = [1, 7].includes(rahuHouse) ? 'Rahu' : 'Ketu';
    status = 'Present'; severity = 'Moderate'; detail = `${node} in house ${house} — Naga Dosham`;
  }

  return { name: 'Naga Dosham', nameTa: 'நாக தோஷம்', status, detail, severity };
}

// Combined doshas (Rajju, Vedha, Nadi — from both charts)
function checkCombinedDoshas(bride: PersonChart, groom: PersonChart): DoshaItem[] {
  const items: DoshaItem[] = [];

  // Rajju
  const rajjuMatch = RAJJU_TABLE[groom.nakshatraIndex] === RAJJU_TABLE[bride.nakshatraIndex];
  items.push({
    name: 'Rajju Dosham', nameTa: 'ரஜ்ஜு தோஷம்',
    status: rajjuMatch ? 'Present' : 'Clear',
    detail: rajjuMatch ? 'Same rajju group — spouse longevity risk' : 'Different rajju groups — safe',
    severity: rajjuMatch ? 'Severe' : 'None',
  });

  // Vedha
  const vedhaPresent = VEDHA_PAIRS.some(
    ([a, bl]) => (a === groom.nakshatraIndex && bl === bride.nakshatraIndex) ||
      (a === bride.nakshatraIndex && bl === groom.nakshatraIndex),
  );
  items.push({
    name: 'Vedha Dosham', nameTa: 'வேதா தோஷம்',
    status: vedhaPresent ? 'Present' : 'Clear',
    detail: vedhaPresent ? 'Vedha affliction between birth stars' : 'No vedha affliction',
    severity: vedhaPresent ? 'Severe' : 'None',
  });

  // Nadi
  const gNadi = groom.nakshatraIndex < 9 ? 'Adya' : groom.nakshatraIndex < 18 ? 'Madhya' : 'Antya';
  const bNadi = bride.nakshatraIndex < 9 ? 'Adya' : bride.nakshatraIndex < 18 ? 'Madhya' : 'Antya';
  const nadiMatch = gNadi === bNadi;
  items.push({
    name: 'Nadi Dosham', nameTa: 'நாடி தோஷம்',
    status: nadiMatch ? 'Present' : 'Clear',
    detail: nadiMatch ? `Both ${gNadi} Nadi — Nadi Dosha (health issues)` : `Groom: ${gNadi}, Bride: ${bNadi} — different Nadis`,
    severity: nadiMatch ? 'Moderate' : 'None',
  });

  return items;
}

function analyzeDoshas(bride: PersonChart, groom: PersonChart): DoshaAnalysis {
  const brideDoshas = [
    checkSevvaiDosham(bride),
    checkSaniDosham(bride),
    checkKaalSarpa(bride),
    checkPuthraDosham(bride),
    checkPitraDosham(bride),
    checkNagaDosham(bride),
  ];

  const groomDoshas = [
    checkSevvaiDosham(groom),
    checkSaniDosham(groom),
    checkKaalSarpa(groom),
    checkPuthraDosham(groom),
    checkPitraDosham(groom),
    checkNagaDosham(groom),
  ];

  const combinedDoshas = checkCombinedDoshas(bride, groom);

  return { brideDoshas, groomDoshas, combinedDoshas };
}

// ─── Main Export ─────────────────────────────────────────────────

export function computePoruthamMatch(bride: PersonData, groom: PersonData): MatchResult {
  const brideChart = buildPersonChart(bride);
  const groomChart = buildPersonChart(groom);

  const poruthams: PoruthamDetail[] = [
    calcDinaDetail(groomChart.nakshatraIndex, brideChart.nakshatraIndex),
    calcGanaDetail(groomChart.nakshatraIndex, brideChart.nakshatraIndex),
    calcMahendraDetail(groomChart.nakshatraIndex, brideChart.nakshatraIndex),
    calcStreeDeerghaDetail(groomChart.nakshatraIndex, brideChart.nakshatraIndex),
    calcYoniDetail(groomChart.nakshatraIndex, brideChart.nakshatraIndex),
    calcRasiDetail(groomChart.rashiIndex, brideChart.rashiIndex),
    calcRasiAdhipaDetail(groomChart.rashiIndex, brideChart.rashiIndex),
    calcVasyaDetail(groomChart.rashiIndex, brideChart.rashiIndex),
    calcRajjuDetail(groomChart.nakshatraIndex, brideChart.nakshatraIndex),
    calcVedhaDetail(groomChart.nakshatraIndex, brideChart.nakshatraIndex),
  ];

  const totalScore = poruthams.reduce((s, p) => s + p.score, 0);
  const maxScore = poruthams.length;

  const strongAreas = poruthams.filter((p) => p.result === 'Good').map((p) => p.name);
  const attentionAreas = poruthams.filter((p) => p.result === 'Poor').map((p) => p.name);

  let overallResult: MatchResult['overallResult'] = 'Needs Attention';
  if (totalScore >= 8) overallResult = 'Good Match';
  else if (totalScore >= 5) overallResult = 'Average Match';

  const doshas = analyzeDoshas(brideChart, groomChart);

  return { bride: brideChart, groom: groomChart, poruthams, totalScore, maxScore, overallResult, strongAreas, attentionAreas, doshas };
}
