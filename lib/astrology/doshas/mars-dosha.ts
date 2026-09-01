/**
 * MARS DOSHA (SEVVAI DOSHAM) ENGINE
 * ---------------------------------
 * Deterministic calculation of Mars Dosha based on traditional Vedic rules.
 * The LLM must NOT determine dosha existence — only this engine does.
 *
 * Rule Sets:
 * - South Indian (Tamil/Telugu): Mars in 1,2,4,7,8,12 from Lagna or Moon
 * - North Indian: Mars in 1,2,4,7,8,12 from Lagna only
 * - Kerala: Mars in 1,2,4,7,8 from Lagna (stricter)
 *
 * Cancellation Rules:
 * - Mars conjunct Jupiter
 * - Mars in own sign (Aries/Scorpio)
 * - Mars exalted (Capricorn)
 * - Mars aspected by Jupiter
 * - Mars in Kendra from Lagna
 */

import { Chart, ChartPlanet } from '../chart';
import { PlanetKey } from '../../astronomy/planetary-positions';
import { DoshaResult } from '../types';

export type MarsDoshaRuleSet = 'south_indian' | 'north_indian' | 'kerala';

export interface MarsDoshaConfig {
  ruleSet: MarsDoshaRuleSet;
  checkFromMoon: boolean;
  cancellationEnabled: boolean;
}

const DEFAULT_CONFIG: MarsDoshaConfig = {
  ruleSet: 'south_indian',
  checkFromMoon: true,
  cancellationEnabled: true,
};

// Mars Dosha houses by rule set
const MARS_DOSHA_HOUSES: Record<MarsDoshaRuleSet, number[]> = {
  south_indian: [1, 2, 4, 7, 8, 12],
  north_indian: [1, 2, 4, 7, 8, 12],
  kerala: [1, 2, 4, 7, 8],
};

// Mars own signs and exaltation
const MARS_OWN_SIGNS = ['Aries', 'Scorpio'];
const MARS_EXALTATION_SIGN = 'Capricorn';
const MARS_DEBILITATION_SIGN = 'Cancer';

// Jupiter aspects (from any house, aspects 5th, 7th, 9th)
function jupiterAspectsHouse(jupiterHouse: number, targetHouse: number): boolean {
  const aspects = [
    (jupiterHouse + 4) % 12 || 12,
    (jupiterHouse + 6) % 12 || 12,
    (jupiterHouse + 8) % 12 || 12,
  ];
  return aspects.includes(targetHouse);
}

export function computeMarsDosha(
  chart: Chart,
  moonRashiIndex: number,
  config: Partial<MarsDoshaConfig> = {},
): DoshaResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const ruleSet = cfg.ruleSet;

  const byKey = new Map<PlanetKey, ChartPlanet>();
  for (const p of chart.planets) byKey.set(p.key, p);

  const mars = byKey.get('Mars');
  const jupiter = byKey.get('Jupiter');

  if (!mars) {
    return {
      detected: false,
      type: 'sevvai_dosham',
      severity: 'none',
      ruleSet,
      triggeredRules: [],
      cancellationRules: [],
      explanationData: ['Mars position not available in chart.'],
    };
  }

  const triggeredRules: string[] = [];
  const explanationData: string[] = [];

  // House from Lagna
  const marsHouseFromLagna = mars.houseNumber;
  const doshaHouses = MARS_DOSHA_HOUSES[ruleSet];

  if (doshaHouses.includes(marsHouseFromLagna)) {
    triggeredRules.push(`Mars in house ${marsHouseFromLagna} from Lagna`);
    explanationData.push(
      `Mars (Sevvai) occupies the ${ordinal(marsHouseFromLagna)} house from Lagna — this is a dosha position per ${ruleSet} rules.`
    );
  }

  // House from Moon (South Indian tradition)
  if (cfg.checkFromMoon) {
    const marsHouseFromMoon = ((mars.rashiIndex - moonRashiIndex + 12) % 12) + 1;
    if (doshaHouses.includes(marsHouseFromMoon)) {
      triggeredRules.push(`Mars in house ${marsHouseFromMoon} from Moon`);
      explanationData.push(
        `Mars (Sevvai) also occupies the ${ordinal(marsHouseFromMoon)} house from Moon — additional dosha indicator.`
      );
    }
  }

  // Cancellation rules
  const cancellationRules: string[] = [];

  if (cfg.cancellationEnabled && jupiter) {
    // Mars conjunct Jupiter
    if (mars.rashiIndex === jupiter.rashiIndex) {
      cancellationRules.push('Mars conjunct Jupiter — Jupiter\'s aspect cancels dosha');
      explanationData.push('Mars is conjunct Jupiter — Jupiter\'s divine aspect reduces dosha severity.');
    }

    // Jupiter aspects Mars
    if (jupiterAspectsHouse(jupiter.houseNumber, marsHouseFromLagna)) {
      cancellationRules.push('Jupiter aspects Mars — dosha reduced');
      explanationData.push('Jupiter\'s aspects on Mars reduce the dosha intensity.');
    }
  }

  // Mars in own sign
  if (MARS_OWN_SIGNS.includes(mars.rashi)) {
    cancellationRules.push(`Mars in own sign (${mars.rashi}) — self-strengthening`);
    explanationData.push(`Mars is in its own sign ${mars.rashi} — this strengthens Mars and reduces dosha effect.`);
  }

  // Mars exalted
  if (mars.rashi === MARS_EXALTATION_SIGN) {
    cancellationRules.push('Mars exalted in Capricorn — dosha nullified');
    explanationData.push('Mars is exalted in Capricorn — exaltation cancels dosha.');
  }

  // Mars debilitated (increases dosha)
  if (mars.rashi === MARS_DEBILITATION_SIGN) {
    triggeredRules.push('Mars debilitated in Cancer');
    explanationData.push('Mars is debilitated in Cancer — this increases dosha severity.');
  }

  // Calculate severity
  const severity = calculateSeverity(
    triggeredRules.length,
    cancellationRules.length,
    mars.rashi,
    jupiter?.rashiIndex === mars.rashiIndex,
  );

  const detected = triggeredRules.length > 0 && cancellationRules.length < triggeredRules.length;

  return {
    detected,
    type: 'sevvai_dosham',
    marsHouse: marsHouseFromLagna,
    severity,
    ruleSet,
    triggeredRules,
    cancellationRules,
    explanationData,
  };
}

function calculateSeverity(
  triggerCount: number,
  cancellationCount: number,
  marsSign: string,
  marsJupiterConj: boolean,
): DoshaResult['severity'] {
  if (triggerCount === 0) return 'none';
  if (marsJupiterConj || cancellationCount >= triggerCount) return 'none';

  const net = triggerCount - cancellationCount;

  if (marsSign === MARS_DEBILITATION_SIGN) {
    if (net >= 3) return 'strong';
    if (net >= 2) return 'moderate';
    return 'mild';
  }

  if (net >= 4) return 'strong';
  if (net >= 2) return 'moderate';
  if (net >= 1) return 'mild';
  return 'none';
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

/**
 * Get remedies for Mars Dosha based on severity.
 */
export function getMarsDoshaRemedies(severity: DoshaResult['severity']): string[] {
  if (severity === 'none') return [];

  const base = [
    'Visit a Navagraha temple and perform Mars (Sevvai) puja on Tuesdays.',
    'Chant Mars beej mantra "Om Ang Angarakaya Namah" 108 times on Tuesdays.',
    'Offer red flowers, red lentils (masoor dal), and jaggery to Mars deity.',
    'Wear red coral (Moonga) only after astrological consultation.',
    'Fast on Tuesdays or eat only one meal.',
    'Help brothers and male relatives — Mars energy is strengthened through siblings.',
  ];

  if (severity === 'strong' || severity === 'moderate') {
    base.push(
      'Perform Sevvai Shanti puja at a recognized Mars temple (Vaitheeswaran Koil, Rameswaram).',
      'Donate copper items and red cloth on Tuesdays.',
      'Light a mustard oil lamp at a Hanuman temple on Tuesdays.',
    );
  }

  return base;
}
