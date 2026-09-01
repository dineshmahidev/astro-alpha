import { Chart, ChartPlanet } from './chart';
import { PlanetKey } from '../astronomy/planetary-positions';

/**
 * SARPA / SEVA DOSHA (Rahu-Ketu)
 * -----------------------------
 * Serpent (Naga) dosha arises when the lunar nodes Rahu or Ketu occupy
 * sensitive houses. Following the South-Indian (Tamil/Telugu) tradition used
 * by jathagam services, the dosha houses are 1, 2, 4, 5, 7, 8, 9 and 12 —
 * counted both from the Lagna (ascendant) and from the Moon sign (Chandra
 * Lagna). Kaal Sarp Dosha forms when all seven classical planets (Sun through
 * Saturn) fall on the same side of the Rahu–Ketu axis (inside the 180° arc
 * from Rahu forward to Ketu).
 *
 * House-from counts: chart planets already carry houseNumber (from Lagna).
 * House from the Moon is derived from the difference of rashi indices.
 */

export const SARPA_DOSHA_HOUSES = [1, 2, 4, 5, 7, 8, 9, 12];

export type NodalPosition = {
  key: 'Rahu' | 'Ketu';
  sign: string;
  nakshatra: string;
  pada: number;
  houseFromLagna: number;
  houseFromMoon: number;
};

export type NodalDosha = {
  present: boolean;
  name: string;
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  rahu: NodalPosition;
  ketu: NodalPosition;
  details: string[];
  remedies: string[];
};

/** House number of a planet counting from a given rashi index (1-based). */
export function houseFromSign(rashiIndex: number, fromRashiIndex: number): number {
  return ((rashiIndex - fromRashiIndex + 12) % 12) + 1;
}

/** Compute Sarpa/Seva + Kaal Sarp dosha from a birth chart. */
export function computeNodalDosha(chart: Chart, moonRashiIndex: number): NodalDosha {
  const byKey = new Map<PlanetKey, ChartPlanet>();
  for (const p of chart.planets) byKey.set(p.key, p);

  const rahuP = byKey.get('Rahu')!;
  const ketuP = byKey.get('Ketu')!;

  const rahu: NodalPosition = {
    key: 'Rahu',
    sign: rahuP.rashi,
    nakshatra: rahuP.nakshatra,
    pada: rahuP.pada,
    houseFromLagna: rahuP.houseNumber,
    houseFromMoon: houseFromSign(rahuP.rashiIndex, moonRashiIndex),
  };
  const ketu: NodalPosition = {
    key: 'Ketu',
    sign: ketuP.rashi,
    nakshatra: ketuP.nakshatra,
    pada: ketuP.pada,
    houseFromLagna: ketuP.houseNumber,
    houseFromMoon: houseFromSign(ketuP.rashiIndex, moonRashiIndex),
  };

  const details: string[] = [];
  const hits: string[] = [];

  for (const node of [rahu, ketu]) {
    if (SARPA_DOSHA_HOUSES.includes(node.houseFromLagna)) {
      hits.push(`${node.key} in house ${node.houseFromLagna} from Lagna`);
      details.push(
        `${node.key} occupies the ${ordinal(node.houseFromLagna)} house from Lagna — ${houseEffect(
          node.key,
          node.houseFromLagna,
        )}`,
      );
    }
    if (SARPA_DOSHA_HOUSES.includes(node.houseFromMoon)) {
      hits.push(`${node.key} in house ${node.houseFromMoon} from Moon`);
      details.push(
        `${node.key} sits in the ${ordinal(node.houseFromMoon)} house from the Moon — ${houseEffect(
          node.key,
          node.houseFromMoon,
        )}`,
      );
    }
  }

  // Kaal Sarp: all 7 classical planets on one side of the Rahu–Ketu axis.
  const rahuLon = rahuP.siderealLongitude;
  const ketuLon = ketuP.siderealLongitude;
  const classical: PlanetKey[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const allBetween =
    classical.every((k) => {
      const lon = byKey.get(k)!.siderealLongitude;
      const rel = (lon - rahuLon + 360) % 360;
      return rel >= 0 && rel < 180;
    }) ||
    classical.every((k) => {
      const lon = byKey.get(k)!.siderealLongitude;
      const rel = (lon - ketuLon + 360) % 360;
      return rel >= 0 && rel < 180;
    });

  if (allBetween) {
    hits.push('Kaal Sarp Dosha');
    details.push(
      'All seven classical planets (Sun to Saturn) lie on one side of the Rahu–Ketu axis — Kaal Sarp Dosha.',
    );
  }

  const severity = severityOf(hits.length, allBetween);
  const present = hits.length > 0;

  return {
    present,
    name: allBetween ? 'Kaal Sarp Dosha' : 'Sarpa (Seva) Dosha',
    severity,
    rahu,
    ketu,
    details,
    remedies: present ? REMEDIES : [],
  };
}

function severityOf(hitCount: number, kaalSarp: boolean): 'None' | 'Mild' | 'Moderate' | 'Severe' {
  if (kaalSarp) return 'Severe';
  if (hitCount >= 5) return 'Severe';
  if (hitCount >= 3) return 'Moderate';
  if (hitCount >= 1) return 'Mild';
  return 'None';
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function houseEffect(node: 'Rahu' | 'Ketu', house: number): string {
  const base: Record<number, string> =
    node === 'Rahu'
      ? {
          1: 'shapes identity and drives ambition',
          2: 'disturbs family speech and wealth matters',
          4: 'troubles domestic peace and mother',
          5: 'delays or complicates children and romance',
          7: 'brings unconventional or karmic relationships',
          8: 'creates sudden upheavals and hidden anxieties',
          9: 'strains fortune, faith and father',
          12: 'causes expenses, foreign moves and disturbed sleep',
        }
      : {
          1: 'creates identity confusion and detachment from self',
          2: 'affects speech, savings and family ties',
          4: 'causes domestic unrest and emotional disconnect',
          5: 'diminishes romance and delays progeny',
          7: 'brings karmic or strained partnerships',
          8: 'grants occult insight but hidden sorrows',
          9: 'erodes luck and ancestral blessings',
          12: 'pulls toward seclusion, losses and unrest',
        };
  return base[house] ?? 'influences the karmic theme of that house';
}

const REMEDIES = [
  'Rahu-Ketu Shanti puja at a Navagraha temple (Kalahasti / Rameswaram).',
  'Chant Rahu beej mantra "Om Bhram Bhreem Bhroum Sah Rahave Namah" and Ketu beej mantra "Om Shram Shreem Shroum Sah Ketave Namah" 108x daily.',
  'Worship Lord Shiva and feed dogs, crows and the needy on Saturdays.',
  'Wear Gomedh (Hessonite) for Rahu or Cat\'s Eye for Ketu only after astrological consultation.',
  'Donate black sesame, coconut and iron items on Saturdays.',
];