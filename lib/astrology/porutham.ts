import { NAKSHATRAS, RASHIS } from '../../constants/birth';

/**
 * TAMIL THIRUMANA PORUTHAM (DASHAKOOT) - 10-factor marriage matching.
 *
 * Computed from the Moon's birth nakshatra + rashi of boy and girl,
 * following the classical Tamil tradition as published by standard
 * references (thirumana porutham calculators):
 *
 *   1. Dina        - counted from GIRL's star to BOY's star (1-based).
 *                    Auspicious counts: 2,4,6,8,9,11,13,15,17,18,20,24,26.
 *   2. Gana        - temperament class (Deva/Manushya/Rakshasa) of both stars.
 *   3. Mahendra    - count girl->boy in {4,7,10,13,16,19,22,25}: progeny & welfare.
 *   4. Stree Dirgha- count boy->girl >= 13: longevity & well-being of the bride.
 *   5. Yoni        - animal nature of the stars; enemy yonis must not meet.
 *   6. Rasi        - Moon signs identical or mutually 7th: mutual affection.
 *   7. Rasi Adhipa - friendship of the Moon-sign lords: mental rapport.
 *   8. Vasya       - one Moon sign under the sway (vasya) of the other: control/attractiveness.
 *   9. Rajju       - the five body ropes (Siro/Kanta/Nabhi/Kati/Pada);
 *                    SAME group is a serious dosha (spouse's longevity).
 *  10. Vedha       - the 13 affliction star-pairs must not be formed.
 */

export type PoruthamKey =
  | 'dina'
  | 'gana'
  | 'mahendra'
  | 'streedeerkha'
  | 'yoni'
  | 'rasi'
  | 'rasiAdhipa'
  | 'vasya'
  | 'rajju'
  | 'vedha';

export type PoruthamItem = {
  key: PoruthamKey;
  name: string;
  matched: boolean;
  /** What this porutham governs */
  governs: string;
  /** What happens if it fails */
  effectIfFail: string;
};

export type PoruthamReport = {
  items: PoruthamItem[];
  matchedCount: number;
  percentage: number;
  verdict: 'Excellent' | 'Good' | 'Average' | 'Not Recommended';
};

const countForward = (from: number, to: number) => ((to - from + 27) % 27) + 1;

// ---------------------------------------------------------------- Dina
const DINA_GOOD_COUNTS = new Set([2, 4, 6, 8, 9, 11, 13, 15, 17, 18, 20, 24, 26]);

// ---------------------------------------------------------------- Gana
type Gana = 'Deva' | 'Manushya' | 'Rakshasa';
const GANA_TABLE: Gana[] = [
  // 1 Ashwini .. 27 Revati (index 0-based)
  'Deva',     // Ashwini
  'Manushya', // Bharani
  'Rakshasa', // Krittika
  'Manushya', // Rohini
  'Deva',     // Mrigashira
  'Manushya', // Ardra
  'Deva',     // Punarvasu
  'Deva',     // Pushya
  'Rakshasa', // Ashlesha
  'Rakshasa', // Magha
  'Manushya', // Purva Phalguni
  'Manushya', // Uttara Phalguni
  'Deva',     // Hasta
  'Rakshasa', // Chitra
  'Deva',     // Swati
  'Rakshasa', // Vishakha
  'Deva',     // Anuradha
  'Rakshasa', // Jyeshtha
  'Rakshasa', // Mula
  'Manushya', // Purva Ashadha
  'Manushya', // Uttara Ashadha
  'Deva',     // Shravana
  'Rakshasa', // Dhanishta
  'Rakshasa', // Shatabhisha
  'Manushya', // Purva Bhadrapada
  'Manushya', // Uttara Bhadrapada
  'Deva',     // Revati
];

function ganaMatch(b: number, g: number): boolean {
  const gb = GANA_TABLE[b];
  const gg = GANA_TABLE[g];
  if (gb === gg) return true;
  // Deva-Manushya is tolerable; anything involving Rakshasa mismatch is not.
  return gb !== 'Rakshasa' && gg !== 'Rakshasa';
}

// ---------------------------------------------------------------- Mahendra
const MAHENDRA_COUNTS = new Set([4, 7, 10, 13, 16, 19, 22, 25]);

// ---------------------------------------------------------------- Yoni
type Yoni =
  | 'Horse' | 'Elephant' | 'Sheep' | 'Serpent' | 'Dog' | 'Cat'
  | 'Rat' | 'Cow' | 'Buffalo' | 'Tiger' | 'Deer' | 'Monkey' | 'Mongoose' | 'Lion';

const YONI_TABLE: Yoni[] = [
  'Horse',    // Ashwini
  'Elephant', // Bharani
  'Sheep',    // Krittika
  'Serpent',  // Rohini
  'Serpent',  // Mrigashira
  'Dog',      // Ardra
  'Cat',      // Punarvasu
  'Sheep',    // Pushya
  'Cat',      // Ashlesha
  'Rat',      // Magha
  'Rat',      // Purva Phalguni
  'Cow',      // Uttara Phalguni
  'Buffalo',  // Hasta
  'Tiger',    // Chitra
  'Buffalo',  // Swati
  'Tiger',    // Vishakha
  'Deer',     // Anuradha
  'Deer',     // Jyeshtha
  'Dog',      // Mula
  'Monkey',   // Purva Ashadha
  'Mongoose', // Uttara Ashadha
  'Monkey',   // Shravana
  'Lion',     // Dhanishta
  'Horse',    // Shatabhisha
  'Lion',     // Purva Bhadrapada
  'Cow',      // Uttara Bhadrapada
  'Elephant', // Revati
];

const YONI_ENEMIES: [Yoni, Yoni][] = [
  ['Cow', 'Tiger'],
  ['Elephant', 'Lion'],
  ['Horse', 'Buffalo'],
  ['Dog', 'Deer'],
  ['Serpent', 'Mongoose'],
  ['Monkey', 'Sheep'],
  ['Cat', 'Rat'],
];

function yoniMatch(b: number, g: number): boolean {
  const yb = YONI_TABLE[b];
  const yg = YONI_TABLE[g];
  if (yb === yg) return true;
  return !YONI_ENEMIES.some(
    ([a, c]) => (a === yb && c === yg) || (a === yg && c === yb),
  );
}

// ---------------------------------------------------------------- Rasi lords
const RASHI_LORDS = [
  'Mars',     // Mesha
  'Venus',    // Rishaba
  'Mercury',  // Mithuna
  'Moon',     // Kataka
  'Sun',      // Simha
  'Mercury',  // Kanni
  'Venus',    // Thula
  'Mars',     // Vrischika
  'Jupiter',  // Dhanus
  'Saturn',   // Makara
  'Saturn',   // Kumbha
  'Jupiter',  // Meena
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

// ---------------------------------------------------------------- Vasya
/** Signs ruled / attracted by each rashi (classical vasya circles). */
const VASYA: Record<number, number[]> = {
  0: [4, 7],   // Mesha -> Simha, Kataka
  1: [3, 6],   // Rishaba -> Kataka, Thula
  2: [5],      // Mithuna -> Kanni
  3: [7, 8],   // Kataka -> Vrischika, Dhanus
  4: [6],      // Simha -> Thula
  5: [11, 2],  // Kanni -> Meena, Mithuna
  6: [9, 5],   // Thula -> Makara, Kanni
  7: [3],      // Vrischika -> Kataka
  8: [11],     // Dhanus -> Meena
  9: [0, 10],  // Makara -> Mesha, Kumbha
  10: [0],     // Kumbha -> Mesha
  11: [9],     // Meena -> Makara
};

// ---------------------------------------------------------------- Rajju (Tamil system)
export type RajjuGroup = 'Siro' | 'Kanta' | 'Nabhi' | 'Kati' | 'Pada';
const RAJJU_TABLE: RajjuGroup[] = (() => {
  const t: RajjuGroup[] = new Array(27);
  const fill = (group: RajjuGroup, ones: number[]) =>
    ones.forEach((n) => (t[n - 1] = group));
  // Paatha (foot), Thodai (waist/thigh), Uthara (navel), Kanda (neck), Sirasu (head)
  fill('Pada', [1, 9, 10, 18, 19, 27]);
  fill('Kati', [2, 8, 11, 17, 20, 26]);
  fill('Nabhi', [3, 7, 12, 16, 21, 25]);
  fill('Kanta', [4, 6, 13, 15, 22, 24]);
  fill('Siro', [5, 14, 23]);
  return t;
})();

// ---------------------------------------------------------------- Vedha
const VEDHA_PAIRS: [number, number][] = (() => {
  const raw = [
    [1, 18], [2, 17], [3, 16], [4, 15], [5, 23], [6, 22],
    [7, 21], [8, 20], [9, 19], [10, 27], [11, 26], [12, 25],
    [13, 24],
  ];
  return raw.map(([a, b]) => [a - 1, b - 1]) as [number, number][];
})();

function vedhaConflict(b: number, g: number): boolean {
  return VEDHA_PAIRS.some(
    ([a, c]) => (a === b && c === g) || (a === g && c === b),
  );
}

// ---------------------------------------------------------------- Main
const DEFINITIONS: Record<
  PoruthamKey,
  { name: string; governs: string; effectIfFail: string }
> = {
  rajju: {
    name: 'Rajju',
    governs: 'Longevity & well-being of the spouse — the most important porutham',
    effectIfFail:
      'Same rajju rope is traditionally linked to hardship and danger to the partner\u2019s health/life',
  },
  dina: {
    name: 'Dina',
    governs: 'Health, fortune and day-to-day harmony of the couple',
    effectIfFail: 'Frequent disagreements, ill-health and loss of fortune are indicated',
  },
  gana: {
    name: 'Gana',
    governs: 'Temperament and attitude compatibility',
    effectIfFail: 'Clashing temperaments lead to constant quarrels',
  },
  mahendra: {
    name: 'Mahendra',
    governs: 'Progeny \u2014 welfare of children',
    effectIfFail: 'Difficulties related to children and their well-being',
  },
  streedeerkha: {
    name: 'Stree Dirgha',
    governs: 'Longevity and happiness of the bride',
    effectIfFail: 'The bride\u2019s well-being and comfort may suffer',
  },
  yoni: {
    name: 'Yoni',
    governs: 'Physical and intimate compatibility',
    effectIfFail: 'Lack of intimacy and instinctive discomfort between partners',
  },
  rasi: {
    name: 'Rasi',
    governs: 'Mutual affection, unity and family prosperity',
    effectIfFail: 'Emotional distance and reduced family growth',
  },
  rasiAdhipa: {
    name: 'Rasi Athipathi',
    governs: 'Mental rapport and friendship between the couple',
    effectIfFail: 'Ego clashes and weak mental connection',
  },
  vasya: {
    name: 'Vasya',
    governs: 'Mutual attraction, influence and co-operation',
    effectIfFail: 'One partner may dominate or fail to influence the other',
  },
  vedha: {
    name: 'Vedha',
    governs: 'Freedom from affliction between the birth stars',
    effectIfFail: 'Obstacles, misfortunes and instability after marriage',
  },
};

export function computePorutham(
  boyNakIndex: number,
  girlNakIndex: number,
  boyRashiIndex: number,
  girlRashiIndex: number,
): PoruthamReport {
  const dinaCount = countForward(girlNakIndex, boyNakIndex);
  const streeCount = countForward(boyNakIndex, girlNakIndex);

  const boyLord = RASHI_LORDS[boyRashiIndex];
  const girlLord = RASHI_LORDS[girlRashiIndex];
  const lordFriends =
    boyLord === girlLord ||
    PLANET_FRIENDS[boyLord]?.includes(girlLord) ||
    PLANET_FRIENDS[girlLord]?.includes(boyLord);

  const vasyaOk =
    VASYA[boyRashiIndex]?.includes(girlRashiIndex) ||
    VASYA[girlRashiIndex]?.includes(boyRashiIndex);

  const items: PoruthamItem[] = [
    {
      ...DEFINITIONS.rajju,
      key: 'rajju',
      matched: RAJJU_TABLE[boyNakIndex] !== RAJJU_TABLE[girlNakIndex],
    },
    {
      ...DEFINITIONS.dina,
      key: 'dina',
      matched: DINA_GOOD_COUNTS.has(dinaCount),
    },
    {
      ...DEFINITIONS.gana,
      key: 'gana',
      matched: ganaMatch(boyNakIndex, girlNakIndex),
    },
    {
      ...DEFINITIONS.mahendra,
      key: 'mahendra',
      matched: MAHENDRA_COUNTS.has(dinaCount),
    },
    {
      ...DEFINITIONS.streedeerkha,
      key: 'streedeerkha',
      matched: streeCount >= 13,
    },
    {
      ...DEFINITIONS.yoni,
      key: 'yoni',
      matched: yoniMatch(boyNakIndex, girlNakIndex),
    },
    {
      ...DEFINITIONS.rasi,
      key: 'rasi',
      matched:
        boyRashiIndex === girlRashiIndex ||
        (boyRashiIndex + 6) % 12 === girlRashiIndex ||
        (girlRashiIndex + 6) % 12 === boyRashiIndex,
    },
    {
      ...DEFINITIONS.rasiAdhipa,
      key: 'rasiAdhipa',
      matched: !!lordFriends,
    },
    {
      ...DEFINITIONS.vasya,
      key: 'vasya',
      matched: !!vasyaOk,
    },
    {
      ...DEFINITIONS.vedha,
      key: 'vedha',
      matched: !vedhaConflict(boyNakIndex, girlNakIndex),
    },
  ];

  const matchedCount = items.filter((i) => i.matched).length;
  const percentage = Math.round((matchedCount / items.length) * 100);
  const verdict: PoruthamReport['verdict'] =
    percentage >= 80 ? 'Excellent'
    : percentage >= 60 ? 'Good'
    : percentage >= 50 ? 'Average'
    : 'Not Recommended';

  return { items, matchedCount, percentage, verdict };
}

export const nakshatraName = (i: number) => NAKSHATRAS[i % 27];
export const rashiName = (i: number) => RASHIS[i % 12];
