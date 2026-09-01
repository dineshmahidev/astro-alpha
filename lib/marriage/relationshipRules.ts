import type { PlanetKey } from '../astronomy/planetary-positions';
import type { ChartSnapshot, NavamsaData } from './types';
import { aspectsFrom } from './strength';
import {
  LOVE_ARRANGED_RULES,
  RELATIONSHIP_RULES,
  WEIGHTS,
} from './marriageRules';

/**
 * MARRIAGE INDICATORS (D1 + D9)
 * -----------------------------
 * Deterministic scoring across independent classical indicators. Every point
 * deduction/addition is recorded in `notes` for transparency.
 */
export function scoreMarriageBase(
  chart: ChartSnapshot,
  navamsa: NavamsaData,
): {
  components: Omit<
    import('./types').MarriageScoreComponents,
    'dashaSupport' | 'jupiterTransit' | 'saturnTransit' | 'total'
  > & {
    dashaSupport: 0;
    jupiterTransit: 0;
    saturnTransit: 0;
    total: number;
  };
  favorable: string[];
  afflictions: string[];
} {
  const notes = { favorable: [] as string[], afflictions: [] as string[] };

  // ---- 7th house strength (0..20)
  let seventhHouseStrength = 8; // baseline
  const beneficsIn7 = chart.seventhHouse.planets.filter((p) =>
    ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(p),
  );
  seventhHouseStrength += beneficsIn7.length * 4;
  if (beneficsIn7.length) notes.favorable.push(`Benefic ${beneficsIn7.join(', ')} in 7th house`);
  const maleficsIn7 = chart.seventhHouse.planets.filter((p) =>
    ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'].includes(p),
  );
  if (maleficsIn7.length) {
    seventhHouseStrength -= maleficsIn7.length * 3;
    notes.afflictions.push(`Malefic ${maleficsIn7.join(', ')} in 7th house`);
  }
  const harshAspectsOn7 = chart.aspectsOnSeventhHouseSign.filter((a) =>
    ['Saturn', 'Mars', 'Rahu', 'Ketu'].includes(a.fromPlanet),
  );
  seventhHouseStrength -= harshAspectsOn7.length * 2;
  if (harshAspectsOn7.length)
    notes.afflictions.push(`7th house aspected by ${harshAspectsOn7.map((a) => a.fromPlanet).join(', ')}`);
  const jupAspectOn7 = chart.aspectsOnSeventhHouseSign.some((a) => a.fromPlanet === 'Jupiter');
  if (jupAspectOn7) {
    seventhHouseStrength += 5;
    notes.favorable.push('Jupiter aspecting 7th house');
  }

  // ---- 7th lord strength (0..20)
  const sl = chart.seventhLord;
  let seventhLordStrength = 8;
  const dignityBonus: Record<string, number> = {
    exalted: 10, own: 8, greatFriend: 5, friend: 4, neutral: 0, enemy: -5, greatEnemy: -6, debilitated: -10,
  };
  seventhLordStrength += dignityBonus[sl.dignity] ?? 0;
  if (['exalted', 'own'].includes(sl.dignity))
    notes.favorable.push(`7th lord ${sl.planet} dignified (${sl.dignity}) in house ${sl.house}`);
  if (sl.combust) {
    seventhLordStrength -= 4;
    notes.afflictions.push(`7th lord combust`);
  }
  if (sl.retrograde) notes.afflictions.push('7th lord retrograde (re-evaluate timing, not denial)');
  const kendraTrikonaHouses = [1, 4, 7, 10, 5, 9];
  if (kendraTrikonaHouses.includes(sl.house)) {
    seventhLordStrength += 4;
    notes.favorable.push(`7th lord in auspicious house ${sl.house}`);
  }
  if ([6, 8, 12].includes(sl.house)) {
    seventhLordStrength -= 4;
    notes.afflictions.push(`7th lord in dusthana ${sl.house}`);
  }
  const harshOnLord = chart.aspectsOnSeventhLord.filter((a) =>
    ['Saturn', 'Mars', 'Rahu', 'Ketu'].includes(a.fromPlanet),
  );
  seventhLordStrength -= harshOnLord.length * 2;
  if (harshOnLord.length)
    notes.afflictions.push(`7th lord aspected by ${harshOnLord.map((a) => a.fromPlanet).join(', ')}`);

  // ---- Venus support (0..15) — natural marriage karaka
  let venusSupport = 6;
  const venusBonus: Record<string, number> = {
    exalted: 9, own: 7, greatFriend: 4, friend: 3, neutral: 0, enemy: -4, greatEnemy: -5, debilitated: -8,
  };
  venusSupport += venusBonus[chart.venus.dignity] ?? 0;
  if (['exalted', 'own'].includes(chart.venus.dignity))
    notes.favorable.push(`Venus ${chart.venus.dignity}`);
  if (chart.venus.combust) {
    venusSupport -= 4;
    notes.afflictions.push('Venus combust');
  }
  if ([1, 4, 5, 7, 10, 11].includes(chart.venus.house)) {
    venusSupport += 3;
    notes.favorable.push(`Venus in supportive house ${chart.venus.house}`);
  }
  const d9Venus = navamsa.planets.find((p) => p.planet === 'Venus')!;
  if (['exalted', 'own', 'friend'].includes(d9Venus.dignity)) {
    venusSupport += 3;
    notes.favorable.push(`Venus dignified in D9`);
  }
  if (['debilitated', 'enemy'].includes(d9Venus.dignity)) {
    venusSupport -= 3;
    notes.afflictions.push(`Venus weak in D9 (${d9Venus.dignity})`);
  }

  // ---- Jupiter as karaka (counts inside venusSupport/jupiter base, capped)
  if (['exalted', 'own'].includes(chart.jupiter.dignity))
    notes.favorable.push(`Jupiter ${chart.jupiter.dignity}`);

  // clamp helper
  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, Math.round(v)));
  seventhHouseStrength = clamp(seventhHouseStrength, WEIGHTS.seventhHouseStrength.max);
  seventhLordStrength = clamp(seventhLordStrength, WEIGHTS.seventhLordStrength.max);
  venusSupport = clamp(venusSupport, WEIGHTS.venusSupport.max);

  // ---- 2nd/11th support (0..5)
  let secondEleventhSupport = 1;
  for (const h of [2, 11]) {
    const hd = chart.houses[h - 1];
    if (hd.planets.includes('Jupiter') || hd.planets.includes('Venus')) secondEleventhSupport += 2;
    else if (hd.planets.length > 0) secondEleventhSupport += 1;
  }
  secondEleventhSupport = clamp(secondEleventhSupport, WEIGHTS.secondEleventhSupport.max);

  // ---- 5th house romance support (0..5)
  let fifthHouseSupport = 1;
  const fifth = chart.houses[4];
  if (fifth.planets.includes('Venus') || fifth.planets.includes('Jupiter')) fifthHouseSupport += 2;
  if (fifth.planets.includes('Moon')) fifthHouseSupport += 1;
  if (fifth.lord === chart.seventhHouse.lord) fifthHouseSupport += 1;
  fifthHouseSupport = clamp(fifthHouseSupport, WEIGHTS.fifthHouseSupport.max);

  const total =
    seventhHouseStrength +
    seventhLordStrength +
    venusSupport +
    secondEleventhSupport +
    fifthHouseSupport;

  return {
    components: {
      seventhHouseStrength,
      seventhLordStrength,
      venusSupport,
      dashaSupport: 0,
      jupiterTransit: 0,
      saturnTransit: 0,
      secondEleventhSupport,
      fifthHouseSupport,
      total,
      notes: [],
    },
    favorable: notes.favorable,
    afflictions: notes.afflictions,
  };
}

/**
 * PRE-MARRIAGE RELATIONSHIP ANALYSIS
 * ----------------------------------
 * Astrological interpretation score (NOT scientific probability).
 */
export function analyzeRelationship(chart: ChartSnapshot): import('./types').RelationshipAnalysis {
  const P = RELATIONSHIP_RULES.points;
  let score = 0;
  const factors: string[] = [];
  const fifth = chart.houses[4];
  const seventh = chart.houses[6];
  const fifthLordPlacement = chart.planets.find((p) => p.planet === fifth.lord)!;

  // 5th lord connected to 7th lord
  if (fifth.lord === seventh.lord) {
    score += P.fifthLordConnectedToSeventhLord;
    factors.push('5th and 7th lords are the same planet — love & marriage houses unified');
  } else {
    const fl = fifthLordPlacement;
    const sl = chart.seventhLord;
    const linked =
      fl.rashiIndex === sl.rashiIndex ||
      fl.house === sl.house ||
      aspectsFrom(fl.planet, fl.house).some((a) => a.toHouse === sl.house) ||
      aspectsFrom(sl.planet, sl.house).some((a) => a.toHouse === fl.house);
    if (linked) {
      score += P.fifthLordConnectedToSeventhLord;
      factors.push('5th lord connected with 7th lord by sign/house/aspect');
    }
  }

  // 5th lord in 7th or vice versa
  if (fifthLordPlacement.house === 7) {
    score += P.fifthLordInSeventhOrViceVersa;
    factors.push('5th lord placed in the 7th house');
  }
  const seventhLordInFifth = chart.seventhLord.house === 5;
  if (seventhLordInFifth) {
    score += P.fifthLordInSeventhOrViceVersa;
    factors.push('7th lord placed in the 5th house');
  }

  // Venus connection with 5th/7th
  if ([5, 7].includes(chart.venus.house)) {
    score += P.venusWithFifthOrSeventhConnection;
    factors.push(`Venus in house ${chart.venus.house}`);
  }

  // Rahu influence on romance/marriage
  const rahu = chart.planets.find((p) => p.planet === 'Rahu')!;
  const rahuAsp = aspectsFrom('Rahu', rahu.house);
  if ([5, 7].includes(rahu.house) || rahuAsp.some((a) => [5, 7].includes(a.toHouse))) {
    score += P.rahuInfluencingFifthOrSeventh;
    factors.push('Rahu influences romance/marriage axis (unconventional element)');
  }

  // strong 5th occupancy
  const benefics5 = fifth.planets.filter((p) => ['Jupiter', 'Venus', 'Moon', 'Mercury'].includes(p));
  if (benefics5.length >= 2) {
    score += P.strongFifthHouseOccupants;
    factors.push('Strongly occupied 5th house of romance');
  }

  // Moon-Venus connection
  if (chart.moon.rashiIndex === chart.venus.rashiIndex) {
    score += P.moonVenusConnection;
    factors.push('Moon conjunct Venus sign — emotional romantic nature');
  }

  // affliction penalty
  const afflictHits = [...fifth.planets, ...seventh.planets].filter((p) =>
    ['Saturn', 'Ketu'].includes(p),
  ).length;
  score -= afflictHits * P.afflictionPenaltyPerHit;

  score = Math.max(0, Math.min(100, Math.round(score)));
  const strength =
    score >= 75 ? 'VERY_HIGH' : score >= 55 ? 'HIGH' : score >= 30 ? 'MODERATE' : 'LOW';
  return { relationshipBeforeMarriageProbability: score, relationshipStrength: strength as import('./types').RelationshipAnalysis['relationshipStrength'], factors };
}

/**
 * LOVE vs ARRANGED scoring.
 */
export function scoreLoveVsArranged(
  chart: ChartSnapshot,
  navamsa: NavamsaData,
): import('./types').LoveArrangedResult {
  const L = LOVE_ARRANGED_INDICATORS(chart, navamsa);
  const loveScore = Math.min(100, L.love);
  const arrangedScore = Math.min(100, L.arranged);
  const combined = Math.min(100, Math.round((L.love + L.arranged) / 2));
  let classification: import('./types').LoveArrangedResult['classification'];
  let confidence = Math.round(Math.abs(L.love - L.arranged));
  const diff = L.love - L.arranged;
  if (Math.abs(diff) <= 10) {
    classification = 'Love-cum-Arranged';
    confidence = 100 - Math.abs(diff) * 2 > 80 ? 80 : 100 - Math.abs(diff) * 2;
    if (combined < 25) {
      classification = 'Mixed/Unclear';
      confidence = 40;
    }
  } else if (diff > 0) {
    classification = 'Love';
  } else {
    classification = 'Arranged';
  }
  confidence = Math.max(20, Math.min(95, confidence));
  return {
    loveMarriageScore: loveScore,
    arrangedMarriageScore: arrangedScore,
    loveCumArrangedScore: combined,
    classification,
    confidence,
    indicators: L.notes,
  };
}

function LOVE_ARRANGED_INDICATORS(chart: ChartSnapshot, navamsa: NavamsaData) {
  const rules = LOVE_ARRANGED_RULES;
  let love = 0;
  let arranged = 0;
  const notes: string[] = [];

  const fifth = chart.houses[4];
  const seventh = chart.houses[6];
  const second = chart.houses[1];
  const ninth = chart.houses[8];
  const fourth = chart.houses[3];
  const fifthLordPlacement = chart.planets.find((p) => p.planet === fifth.lord)!;

  // love indicators
  if (fifth.lord === seventh.lord || fifthLordPlacement.house === 7 || chart.seventhLord.house === 5) {
    love += rules.loveIndicators.fifthLordToSeventhLordLink;
    notes.push('+5th–7th link → love element');
  }
  const flAspects7 = aspectsFrom(fifthLordPlacement.planet, fifthLordPlacement.house).some(
    (a) => a.toHouse === 7,
  );
  if (flAspects7) {
    love += rules.loveIndicators.fifthHouseSeventhLink;
    notes.push('+5th lord aspects 7th house');
  }
  if ([5, 7].includes(chart.venus.house)) {
    love += rules.loveIndicators.venusStrongWithFifthSeventh;
    notes.push('+Venus on romance/marriage axis');
  }
  const rahu = chart.planets.find((p) => p.planet === 'Rahu')!;
  if ([5, 7].includes(rahu.house)) {
    love += rules.loveIndicators.rahuRomanceInfluence;
    notes.push('+Rahu on romance axis → unconventional choice');
  }
  if (fifth.planets.filter((p) => ['Venus', 'Jupiter', 'Moon'].includes(p)).length >= 1) {
    love += rules.loveIndicators.strongFifthHouse;
    notes.push('+occupied 5th house');
  }
  if (['exalted', 'own'].includes(chart.venus.dignity)) {
    love += rules.loveIndicators.strongVenus;
    notes.push('+strong Venus');
  }

  // arranged indicators
  if (second.planets.includes('Jupiter') || second.planets.includes('Venus') || second.planets.length > 0) {
    arranged += rules.arrangedIndicators.strongSecondHouse;
    notes.push('+family house (2nd) occupied');
  }
  if (
    !([5].includes(fifthLordPlacement.house)) &&
    !(fifth.lord === seventh.lord) &&
    seventh.planets.filter((p) => ['Jupiter', 'Venus'].includes(p)).length > 0
  ) {
    arranged += rules.arrangedIndicators.strongSeventhWithoutFifthLink;
    notes.push('+strong 7th without 5th link → traditional marriage');
  }
  const familyLinks =
    [second, fourth, ninth].filter(
      (h) => h.planets.includes('Jupiter') || h.planets.includes('Moon'),
    ).length;
  arranged += familyLinks * Math.round(rules.arrangedIndicators.familyHousesSecondFourthNinth / 2);
  if (familyLinks) notes.push('+Jupiter/Moon in family houses');

  if (chart.jupiter.house === 7 || aspectsFrom('Jupiter', chart.jupiter.house).some((a) => a.toHouse === 7)) {
    arranged += rules.arrangedIndicators.jupiterTraditionalInfluence;
    notes.push('+Jupiter influence on 7th → traditional/elder-blessed union');
  }
  if (chart.seventhHouse.planets.includes('Saturn') || chart.aspectsOnSeventhHouseSign.some((a) => a.fromPlanet === 'Saturn')) {
    arranged += rules.arrangedIndicators.saturnDisciplineSeventh;
    notes.push('+Saturn discipline on 7th → conventional structure');
  }

  void navamsa;
  return { love, arranged, notes };
}
