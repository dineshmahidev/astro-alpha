import { RASHIS } from '../../constants/birth';
import { buildChart, buildNavamsa } from './chart';
import { buildDashaTree } from './dashaTree';
import {
  computeMarriageWindows,
} from './marriageTiming';
import { scoreMarriageBase, analyzeRelationship, scoreLoveVsArranged } from './relationshipRules';
import { assessDelay } from './delay';
import type { BirthInput, MarriageReport } from './types';
import { NODE_MODE, HOUSE_SYSTEM, SCAN_YEARS_AHEAD, NODE_ASPECT_CONVENTION } from './marriageRules';

export const ENGINE_VERSION = 'marriage-engine/1.0.0';

/**
 * MARRIAGE ENGINE ORCHESTRATOR
 * ----------------------------
 * Order of operations (strict):
 *   1. validate birth data
 *   2. build D1 chart (planets → lagna → whole-sign houses)
 *   3. Vimshottari dasha tree
 *   4. Navamsa (D9)
 *   5. marriage indicator scoring
 *   6. relationship + love/arranged scoring
 *   7. delay assessment
 *   8. future transit scan → candidate windows
 * Only AFTER all calculation is the structured JSON returned for AI narration.
 */

export function validateBirth(birth: BirthInput): string[] {
  const errors: string[] = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth.date)) errors.push('date must be yyyy-mm-dd');
  if (!/^\d{2}:\d{2}$/.test(birth.time)) errors.push('time must be HH:mm');
  if (birth.latitude < -90 || birth.latitude > 90) errors.push('latitude out of range');
  if (birth.longitude < -180 || birth.longitude > 180) errors.push('longitude out of range');
  if (birth.timezoneOffsetHours < -12 || birth.timezoneOffsetHours > 14) errors.push('timezone offset invalid');
  return errors;
}

export function computeMarriageReport(
  birth: BirthInput,
  nowJd?: number,
): MarriageReport {
  const errors = validateBirth(birth);
  if (errors.length) throw new Error(`Invalid birth data: ${errors.join('; ')}`);

  // 1-2. chart
  const chart = buildChart(birth);
  void NODE_MODE; // node mode is applied inside planetary-positions (mean)

  // 3. dasha tree
  const tree = buildDashaTree(chart.moon.longitude, chart.jdUT, birth.timezoneOffsetHours);

  // windows
  const base = scoreMarriageBase(chart, buildNavamsa(chart));
  const timing = computeMarriageWindows(
    chart,
    chart.moon.longitude,
    chart.jdUT,
    birth.timezoneOffsetHours,
    base.components,
  );

  // 4. navamsa
  const navamsa = buildNavamsa(chart);

  // 5-7. indicators / relationship / delay
  const relationship = analyzeRelationship(chart);
  const loveVsArranged = scoreLoveVsArranged(chart, navamsa);
  const delay = assessDelay(chart);

  // confidence: reduce when birth time is uncertain (affects Lagna/D9/houses)
  const timePenalty =
    birth.timeAccuracy === 'approximate' ? 25 : birth.timeAccuracy === 'unknown' ? 45 : 0;
  const overallConfidence = Math.max(20, Math.min(95, 85 - timePenalty));

  const sortedWindows = timing.windows;
  const primary = sortedWindows[0] ?? null;
  const secondary = sortedWindows[1] ?? null;
  const supporting = sortedWindows.slice(2, 5);

  return {
    generatedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    birthData: {
      ...birth,
      jdUT: chart.jdUT,
    },
    chart,
    dasha: {
      birthNakshatra: tree.birthNakshatra,
      birthNakshatraLord: tree.birthLord,
      balanceAtBirthYears: Math.round(tree.balanceYears * 100) / 100,
      mahadashas: tree.mahadashas,
      currentMaha: timing.currentMaha,
      currentAntar: timing.currentAntar,
      currentPratyantar: timing.currentPratyantar,
      upcoming: tree.mahadashas.filter((m) => m.startJd > (Date.now() / 86400000 + 2440587.5)).slice(0, 3),
    },
    navamsa,
    marriageIndicators: {
      baseStrength: base.components,
      baseTotal:
        base.components.seventhHouseStrength +
        base.components.seventhLordStrength +
        base.components.venusSupport +
        base.components.secondEleventhSupport +
        base.components.fifthHouseSupport,
      favorableFactors: base.favorable,
      afflictions: base.afflictions,
    },
    relationshipIndicators: relationship,
    loveVsArranged,
    delayAssessment: delay,
    marriageWindows: {
      primary,
      secondary,
      supporting,
      scannedUntilYear: timing.scannedUntilYear,
      yearlyScores: timing.yearlyScores,
    },
    confidence: {
      overall: overallConfidence,
      birthTimePenaltyApplied: timePenalty > 0,
      notes: [
        `Methodology: ${HOUSE_SYSTEM} houses, Lahiri ayanamsa`,
        `Node mode: mean | Node aspect convention: ${NODE_ASPECT_CONVENTION}`,
        ...(birth.timeAccuracy !== 'exact'
          ? ['Birth time not exact — Lagna, houses and D9-based findings carry reduced weight']
          : []),
        'Scores are astrological interpretation values, not scientific probabilities',
      ],
    },
    debug: {
      jdUT: chart.jdUT,
      ayanamsa: chart.ayanamsa,
      scanYearsAhead: SCAN_YEARS_AHEAD,
      yearlyScores: timing.yearlyScores,
      houseSystem: HOUSE_SYSTEM,
      validationErrors: errors,
    },
  };
}
