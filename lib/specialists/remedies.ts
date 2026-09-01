/**
 * REMEDIES SPECIALIST
 * -------------------
 * Generates traditional Vedic remedies based on actual chart positions.
 * Every remedy must map to a detected issue — no invented remedies.
 * Never forces gemstones or expensive rituals.
 */

import { Chart, ChartPlanet } from '../astrology/chart';
import { PlanetKey } from '../astronomy/planetary-positions';
import { Remedies, AnalysisMetadata } from '../astrology/types';

export interface RemediesAnalysis {
  remedies: Remedies[];
  confidence: 'high' | 'medium' | 'low';
  metadata: AnalysisMetadata;
}

// Mars dosha houses — same rule set as mars-dosha.ts
const MARS_DOSHA_HOUSES = [1, 2, 4, 7, 8, 12];

// Saturn affliction houses (Kendra from Lagna)
const SATURN_AFFLICTION_HOUSES = [1, 4, 7, 10];

// Rahu/Ketu affliction houses
const RAHU_AFFLICTION_HOUSES = [1, 5, 7, 8, 9, 12];
const KETU_AFFLICTION_HOUSES = [1, 5, 7, 8, 9, 12];

// Debilitation signs for each planet
const DEBILITATION_SIGN: Record<PlanetKey, string> = {
  Sun: 'Tula',
  Moon: 'Vrishchika',
  Mars: 'Karka',
  Mercury: 'Meena',
  Jupiter: 'Makara',
  Venus: 'Kanya',
  Saturn: 'Mesha',
  Rahu: '',
  Ketu: '',
};

// Exaltation signs for reference in confidence calculation
const EXALTATION_SIGN: Record<PlanetKey, string> = {
  Sun: 'Mesha',
  Moon: 'Vrishabha',
  Mars: 'Makara',
  Mercury: 'Kanya',
  Jupiter: 'Karka',
  Venus: 'Meena',
  Saturn: 'Tula',
  Rahu: '',
  Ketu: '',
};

export function analyzeRemedies(chart: Chart, moonRashiIndex: number): RemediesAnalysis {
  const remedies: Remedies[] = [];

  const byKey = new Map<PlanetKey, ChartPlanet>();
  for (const p of chart.planets) byKey.set(p.key, p);

  const mars = byKey.get('Mars');
  const saturn = byKey.get('Saturn');
  const rahu = byKey.get('Rahu');
  const ketu = byKey.get('Ketu');

  const lagnaHouse = chart.lagnaRashiIndex;

  // --- Mars Dosha Remedies ---
  if (mars && MARS_DOSHA_HOUSES.includes(mars.houseNumber)) {
    remedies.push(
      {
        issue: `Mars in ${ordinal(mars.houseNumber)} house from Lagna — Mars Dosha detected`,
        tradition: 'Vedic (South Indian)',
        remedy: 'Chant Mars beej mantra "Om Ang Angarakaya Namah" 108 times on Tuesdays.',
        sourceOrRuleId: 'mars_dosha_beej_mantra',
        optional: false,
      },
      {
        issue: `Mars in ${ordinal(mars.houseNumber)} house from Lagna — Mars Dosha detected`,
        tradition: 'Vedic (South Indian)',
        remedy: 'Offer red lentils (masoor dal), red flowers, and jaggery to a Navagraha temple on Tuesdays.',
        sourceOrRuleId: 'mars_dosha_navagraha_offering',
        optional: false,
      },
      {
        issue: `Mars in ${ordinal(mars.houseNumber)} house from Lagna — Mars Dosha detected`,
        tradition: 'Vedic (South Indian)',
        remedy: 'Fast on Tuesdays or eat one simple meal. Help brothers and male relatives to channel Mars energy.',
        sourceOrRuleId: 'mars_dosha_fasting_siblings',
        optional: true,
      },
    );

    if (mars.rashi === 'Karka') {
      remedies.push({
        issue: 'Mars debilitated in Cancer — increased Mars Dosha severity',
        tradition: 'Vedic',
        remedy: 'Light a mustard oil lamp at a Hanuman temple on Tuesdays. Read Hanuman Chalisa regularly.',
        sourceOrRuleId: 'mars_debilitated_hanuman',
        optional: false,
      });
    }
  }

  // --- Saturn Affliction Remedies ---
  if (saturn && SATURN_AFFLICTION_HOUSES.includes(saturn.houseNumber)) {
    remedies.push(
      {
        issue: `Saturn in ${ordinal(saturn.houseNumber)} house from Lagna — Saturn affliction`,
        tradition: 'Vedic',
        remedy: 'Chant Saturn beej mantra "Om Sham Shanaishcharaya Namah" 108 times on Saturdays.',
        sourceOrRuleId: 'saturn_affliction_beej_mantra',
        optional: false,
      },
      {
        issue: `Saturn in ${ordinal(saturn.houseNumber)} house from Lagna — Saturn affliction`,
        tradition: 'Vedic',
        remedy: 'Donate black sesame seeds, iron utensils, or black cloth on Saturdays.',
        sourceOrRuleId: 'saturn_affliction_donation',
        optional: false,
      },
      {
        issue: `Saturn in ${ordinal(saturn.houseNumber)} house from Lagna — Saturn affliction`,
        tradition: 'Vedic',
        remedy: 'Light a mustard oil lamp at a Shani temple on Saturdays. Visit Shani Shingnapur or any Shani temple.',
        sourceOrRuleId: 'saturn_affliction_temple',
        optional: true,
      },
      {
        issue: `Saturn in ${ordinal(saturn.houseNumber)} house from Lagna — Saturn affliction`,
        tradition: 'Vedic',
        remedy: 'Serve elderly people and workers. Saturn rewards patience, discipline, and service.',
        sourceOrRuleId: 'saturn_affliction_service',
        optional: false,
      },
    );

    if (saturn.rashi === 'Mesha') {
      remedies.push({
        issue: 'Saturn debilitated in Aries — weakened Saturn causes delays',
        tradition: 'Vedic',
        remedy: 'Chant Shani Dashrath Krit Stotra on Saturdays. Wear blue sapphire only after thorough astrological consultation.',
        sourceOrRuleId: 'saturn_debilitated_stotra',
        optional: false,
      });
    }
  }

  // --- Rahu Affliction Remedies ---
  if (rahu && RAHU_AFFLICTION_HOUSES.includes(rahu.houseNumber)) {
    remedies.push(
      {
        issue: `Rahu in ${ordinal(rahu.houseNumber)} house from Lagna — Rahu affliction`,
        tradition: 'Vedic',
        remedy: 'Chant Rahu beej mantra "Om Ram Rahave Namah" 108 times during Rahu kaal on Saturdays.',
        sourceOrRuleId: 'rahu_affliction_beej_mantra',
        optional: false,
      },
      {
        issue: `Rahu in ${ordinal(rahu.houseNumber)} house from Lagna — Rahu affliction`,
        tradition: 'Vedic',
        remedy: 'Donate coconut, mustard oil, and blue/black cloth on Saturdays. Avoid intoxicants and dishonesty.',
        sourceOrRuleId: 'rahu_affliction_donation',
        optional: false,
      },
      {
        issue: `Rahu in ${ordinal(rahu.houseNumber)} house from Lagna — Rahu affliction`,
        tradition: 'Vedic',
        remedy: 'Worship Lord Shiva. Offer water mixed with milk to a Shivling on Mondays to calm Rahu.',
        sourceOrRuleId: 'rahu_affliction_shiva',
        optional: true,
      },
    );
  }

  // --- Ketu Affliction Remedies ---
  if (ketu && KETU_AFFLICTION_HOUSES.includes(ketu.houseNumber)) {
    remedies.push(
      {
        issue: `Ketu in ${ordinal(ketu.houseNumber)} house from Lagna — Ketu affliction`,
        tradition: 'Vedic',
        remedy: 'Chant Ketu beej mantra "Om Kem Ketave Namah" 108 times on Tuesdays or Saturdays.',
        sourceOrRuleId: 'ketu_affliction_beej_mantra',
        optional: false,
      },
      {
        issue: `Ketu in ${ordinal(ketu.houseNumber)} house from Lagna — Ketu affliction`,
        tradition: 'Vedic',
        remedy: 'Worship Lord Ganesha. Offer durva grass and modak to Ganesha on Wednesdays.',
        sourceOrRuleId: 'ketu_affliction_ganesha',
        optional: false,
      },
      {
        issue: `Ketu in ${ordinal(ketu.houseNumber)} house from Lagna — Ketu affliction`,
        tradition: 'Vedic',
        remedy: 'Donate multi-colored cloth, sesame, or blankets to temples or needy people.',
        sourceOrRuleId: 'ketu_affliction_donation',
        optional: true,
      },
    );
  }

  // --- General Planetary Debilitation Remedies ---
  const grahaPlanets: PlanetKey[] = ['Sun', 'Moon', 'Mercury', 'Jupiter', 'Venus'];
  for (const pk of grahaPlanets) {
    const planet = byKey.get(pk);
    if (!planet) continue;
    if (planet.rashi === DEBILITATION_SIGN[pk]) {
      const remedy = getDebilitationRemedy(pk, planet);
      if (remedy) remedies.push(remedy);
    }
  }

  const confidence = calculateRemediesConfidence(remedies);

  const metadata: AnalysisMetadata = {
    calculatedAt: new Date().toISOString(),
    calculationVersion: '1.0.0',
    ruleSetVersion: '1.0.0',
    confidence: confidence === 'high' ? 0.85 : confidence === 'medium' ? 0.65 : 0.45,
    sourceModules: ['remedies-specialist', 'chart-engine'],
  };

  return { remedies, confidence, metadata };
}

function getDebilitationRemedy(planet: PlanetKey, pos: ChartPlanet): Remedies | null {
  const sign = pos.rashi;
  switch (planet) {
    case 'Sun':
      return {
        issue: `Sun debilitated in ${sign} — weak vitality and authority`,
        tradition: 'Vedic',
        remedy: 'Practice Surya Namaskar at sunrise. Offer water facing east every morning. Chant "Om Suryaya Namah" 12 times.',
        sourceOrRuleId: 'sun_debilitated_surya',
        optional: false,
      };
    case 'Moon':
      return {
        issue: `Moon debilitated in ${sign} — emotional instability`,
        tradition: 'Vedic',
        remedy: 'Chant Moon beej mantra "Om Shram Shreem Shraum Sah Chandramase Namah" 108 times on Mondays. Donate white rice, milk, or white cloth.',
        sourceOrRuleId: 'moon_debilitated_mantra',
        optional: false,
      };
    case 'Mercury':
      return {
        issue: `Mercury debilitated in ${sign} — communication and intellect challenges`,
        tradition: 'Vedic',
        remedy: 'Chant Vishnu Sahasranama or Mercury beej mantra "Om Bram Breem Braum Sah Budhaya Namah" on Wednesdays. Donate green moong dal.',
        sourceOrRuleId: 'mercury_debilitated_mantra',
        optional: false,
      };
    case 'Jupiter':
      return {
        issue: `Jupiter debilitated in ${sign} — wisdom and fortune weakened`,
        tradition: 'Vedic',
        remedy: 'Chant Jupiter beej mantra "Om Gram Greem Graum Sah Gurave Namah" 108 times on Thursdays. Donate chana dal and yellow cloth.',
        sourceOrRuleId: 'jupiter_debilitated_mantra',
        optional: false,
      };
    case 'Venus':
      return {
        issue: `Venus debilitated in ${sign} — relationship and luxury challenges`,
        tradition: 'Vedic',
        remedy: 'Chant Venus beej mantra "Om Draam Dreem Draum Sah Shukraya Namah" on Fridays. Donate white sweets, rice, or camphor.',
        sourceOrRuleId: 'venus_debilitated_mantra',
        optional: false,
      };
    default:
      return null;
  }
}

function calculateRemediesConfidence(remedies: Remedies[]): 'high' | 'medium' | 'low' {
  if (remedies.length === 0) return 'low';
  if (remedies.length >= 6) return 'high';
  if (remedies.length >= 3) return 'medium';
  return 'low';
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}
