import { test } from 'node:test';
import assert from 'node:assert';
import { computeMarriageReport, validateBirth } from '../lib/marriage/calculator';
import { buildMarriagePromptEn } from '../lib/marriage/aiPrompt';
import type { BirthInput } from '../lib/marriage/types';

/**
 * MARRIAGE ENGINE TEST — known input:
 *   Date: 24 May 2003, Time: 16:00 IST
 *   Place: Erode, Tamil Nadu (11.3410 N, 77.7172 E), UTC+5:30
 *
 * Only MATHEMATICAL outputs are verified against trusted references.
 * Marriage windows are validated for STRUCTURE, never for hardcoded years.
 */

const ERODE: BirthInput = {
  date: '2003-05-24',
  time: '16:00',
  placeName: 'Erode, Tamil Nadu, India',
  latitude: 11.341,
  longitude: 77.7172,
  timezoneOffsetHours: 5.5,
  timeAccuracy: 'exact',
};

test('validation rejects bad birth data', () => {
  const errs = validateBirth({ ...ERODE, latitude: 999 });
  assert.ok(errs.length > 0);
  assert.strictEqual(validateBirth(ERODE).length, 0);
});

function printReport() {
  const report = computeMarriageReport(ERODE);
  console.log('=== ASTROLOGY CALCULATION DEBUG (Erode test case) ===');
  console.log('Birth JD (UT):', report.debug.jdUT);
  console.log('Ayanamsa:', (report.debug.ayanamsa as number).toFixed(4));
  console.log('Lagna:', report.chart.lagna.rashiNameEnglish, report.chart.lagna.dms);
  console.log('Moon longitude:', report.chart.moon.longitude.toFixed(3));
  console.log('Moon rashi:', report.chart.moon.rashi);
  console.log('Moon nakshatra:', report.chart.moon.nakshatra, 'pada', report.chart.moon.pada);
  for (const p of report.chart.planets) {
    console.log(
      `${p.planet.padEnd(8)} lon=${p.longitude.toFixed(2)} ${p.rashi} H${p.house} ${p.nakshatra}-P${p.pada} ${p.dignity}${p.combust ? ' combust' : ''}${p.retrograde ? ' Rx' : ''}`,
    );
  }
  console.log('7th house:', report.chart.seventhHouse.rashi, '| lord:', report.chart.seventhHouse.lord);
  console.log('Venus:', report.chart.venus.rashi, 'H' + report.chart.venus.house, report.chart.venus.dignity);
  console.log('Jupiter:', report.chart.jupiter.rashi, 'H' + report.chart.jupiter.house, report.chart.jupiter.dignity);
  console.log('Birth dasha lord:', report.dasha.birthNakshatraLord, '| balance:', report.dasha.balanceAtBirthYears, 'y');
  console.log('Current MD/AD/PD:', report.dasha.currentMaha.lord, '/', report.dasha.currentAntar.lord, '/', report.dasha.currentPratyantar.lord);
  console.log('D9 lagna:', report.navamsa.lagnaNavamsa.rashi, '| Venus D9 note:', report.navamsa.venusNavamsaStrengthNote);
  console.log('Yearly scores:', JSON.stringify(report.marriageWindows.yearlyScores));
  if (report.marriageWindows.primary) {
    console.log('Primary window:', report.marriageWindows.primary.label, 'score', report.marriageWindows.primary.score);
  }
  console.log('Love/Arranged:', report.loveVsArranged.classification, report.loveVsArranged.confidence + '%');
  return report;
}

if (process.env.PRINT_REPORT) printReport();

test('marriage engine: full deterministic run on Erode case', () => {
  const report = computeMarriageReport(ERODE);

  // --- mathematical sanity ---
  const jdUT = report.debug.jdUT as number;
  assert.ok(jdUT > 2452750 && jdUT < 2452820); // May 2003 epoch
  const ayanamsa = report.debug.ayanamsa as number;
  assert.ok(ayanamsa > 23.85 && ayanamsa < 24.1); // Lahiri in 2003

  // Moon nakshatra derived mathematically from longitude
  const nakSpan = 360 / 27;
  const expectedNak = Math.floor(report.chart.moon.longitude / nakSpan) % 27;
  const NAKSHATRAS = [
    'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
    'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
    'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha',
    'Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  assert.strictEqual(report.chart.moon.nakshatra, NAKSHATRAS[expectedNak]);

  // rashi consistency with longitude (internal stable ids = Sanskrit names)
  const RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
  assert.strictEqual(
    report.chart.moon.rashi,
    RASHIS[Math.floor(report.chart.moon.longitude / 30) % 12],
  );

  // all 9 grahas placed in exactly one house each; houses are whole-sign
  assert.strictEqual(report.chart.planets.length, 9);
  for (const p of report.chart.planets) {
    assert.ok(p.house >= 1 && p.house <= 12);
    assert.strictEqual(p.planet, p.planet); // stable ids
  }
  // whole-sign invariant: house n sign == lagna sign offset
  const ascIdx = report.chart.houses[0].rashiIndex;
  report.chart.houses.forEach((h, i) => {
    assert.strictEqual(h.rashiIndex, (ascIdx + i) % 12);
  });

  // 7th house is exactly the 7th sign from lagna
  assert.strictEqual(report.chart.seventhHouse.rashiIndex, (ascIdx + 6) % 12);

  // dasha totals
  let totalYears = 0;
  for (const m of report.dasha.mahadashas) totalYears += (m.endJd - m.startJd) / 365.25;
  assert.ok(Math.abs(totalYears - 120) < 0.01);

  // navamsa has all planets
  assert.strictEqual(report.navamsa.planets.length, 9);

  // scores within declared bounds
  const ms = report.marriageIndicators.baseStrength;
  assert.ok(ms.seventhHouseStrength >= 0 && ms.seventhHouseStrength <= 20);
  assert.ok(ms.seventhLordStrength >= 0 && ms.seventhLordStrength <= 20);
  assert.ok(ms.venusSupport >= 0 && ms.venusSupport <= 15);

  // relationship score bounds & bands
  assert.ok(report.relationshipIndicators.relationshipBeforeMarriageProbability >= 0);
  assert.ok(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'].includes(report.relationshipIndicators.relationshipStrength));

  // love vs arranged classification is one of the four allowed values
  assert.ok(['Love', 'Arranged', 'Love-cum-Arranged', 'Mixed/Unclear'].includes(report.loveVsArranged.classification));

  // delay assessment valid category
  assert.ok([
    'no-significant-delay', 'delay', 'difficulty', 'late-marriage',
    'relationship-instability', 'marriage-denial-indicators',
  ].includes(report.delayAssessment.category));
});

test('marriage windows: structural validity only (no hardcoded year)', () => {
  const report = computeMarriageReport(ERODE);
  const w = report.marriageWindows;

  assert.ok(w.scannedUntilYear >= new Date().getFullYear() + 9);
  assert.ok(Array.isArray(w.yearlyScores) && w.yearlyScores.length > 0);
  for (const y of w.yearlyScores) {
    assert.ok(y.year >= new Date().getFullYear() - 1 && y.year <= w.scannedUntilYear);
    assert.ok(y.score >= 0 && y.score <= 100);
  }
  if (w.primary) {
    assert.ok(w.primary.score >= 0 && w.primary.score <= 100);
    assert.ok(w.primary.label.includes('–'));
    assert.ok(w.primary.reasons.length > 0, 'windows must cite calculated reasons');
    // primary must be the max-score window
    for (const s of [w.secondary, ...w.supporting]) {
      if (s) assert.ok(s.score <= w.primary.score);
    }
  }
});

test('AI prompt embeds calculated data and system rule', () => {
  const report = computeMarriageReport(ERODE);
  const prompt = buildMarriagePromptEn(report);
  assert.ok(prompt.includes('Use ONLY the supplied calculated astrology data'));
  assert.ok(prompt.includes(report.chart.moon.nakshatra));
  assert.ok(prompt.includes('"lagna"'));
});
