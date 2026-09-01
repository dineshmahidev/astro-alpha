/**
 * ASTROLOGY CALCULATION DEBUG — prints every intermediate value.
 * Run: PRINT_REPORT=1 npx tsx tests/marriage.test.ts
 *  or: npx tsx scripts/marriage-debug.ts
 */
import { computeMarriageReport } from '../lib/marriage/calculator';

const report = computeMarriageReport({
  date: '2003-05-24',
  time: '16:00',
  placeName: 'Erode, Tamil Nadu, India',
  latitude: 11.341,
  longitude: 77.7172,
  timezoneOffsetHours: 5.5,
  timeAccuracy: 'exact',
});

const d = report.debug as Record<string, unknown>;
console.log('=== ASTROLOGY CALCULATION DEBUG ===');
console.log('Birth UTC Julian Day :', d.jdUT);
console.log('Ayanamsa (Lahiri)    :', (d.ayanamsa as number).toFixed(4));
console.log('');
console.log('Lagna   :', `${report.chart.lagna.rashiNameEnglish} ${report.chart.lagna.dms.degrees}°${report.chart.lagna.dms.minutes}′${report.chart.lagna.dms.seconds}″ | ${report.chart.lagna.nakshatra} P${report.chart.lagna.pada}`);
const m = report.chart.moon;
console.log('Moon    :', `lon ${m.longitude.toFixed(3)}° | rashi ${m.rashi} ${m.dms.degrees}°${m.dms.minutes}′${m.dms.seconds}″ | ${m.nakshatra} P${m.pada}`);
console.log('');
console.log('--- Planets ---');
for (const p of report.chart.planets) {
  console.log(
    `${p.planet.padEnd(8)} lon=${p.longitude.toFixed(2).padStart(7)} ${p.rashi.padEnd(11)} H${String(p.house).padEnd(2)} ${p.nakshatra}-P${p.pada} ${p.dignity}${p.combust ? ' [combust]' : ''}${p.retrograde ? ' [Rx]' : ''}`,
  );
}
console.log('');
console.log('--- Houses (whole-sign) ---');
for (const h of report.chart.houses) {
  console.log(`H${String(h.house).padEnd(2)} ${h.rashi.padEnd(11)} lord=${h.lord.padEnd(8)} occupants=[${h.planets.join(', ')}]`);
}
console.log('7th house:', `${report.chart.seventhHouse.rashi}, lord ${report.chart.seventhHouse.lord} (in H${report.chart.seventhLord.house})`);
console.log('Venus   :', `${report.chart.venus.rashi} H${report.chart.venus.house} ${report.chart.venus.dignity}`);
console.log('Jupiter :', `${report.chart.jupiter.rashi} H${report.chart.jupiter.house} ${report.chart.jupiter.dignity}`);
console.log('');
console.log('--- Vimshottari Dasha ---');
console.log('Birth star:', report.dasha.birthNakshatra, '| lord', report.dasha.birthNakshatraLord, '| balance', report.dasha.balanceAtBirthYears, 'y');
console.log('Current  : MD', report.dasha.currentMaha.lord, `(${report.dasha.currentMaha.startISO} → ${report.dasha.currentMaha.endISO})`);
console.log('           AD', report.dasha.currentAntar.lord, `(${report.dasha.currentAntar.startISO} → ${report.dasha.currentAntar.endISO})`);
console.log('           PD', report.dasha.currentPratyantar.lord);
console.log('');
console.log('--- Navamsa (D9) ---');
console.log('D9 lagna:', report.navamsa.lagnaNavamsa.rashi);
for (const p of report.navamsa.planets) {
  console.log(`${p.planet.padEnd(8)} D9=${p.navamsaRashi.padEnd(11)} house=${p.houseFromNavamsaLagna} ${p.dignity}`);
}
console.log('');
console.log('--- Marriage scores ---');
console.log('Components:', JSON.stringify(report.marriageIndicators.baseStrength, null, 0));
console.log('Favorable :', report.marriageIndicators.favorableFactors);
console.log('Afflictions:', report.marriageIndicators.afflictions);
console.log('Relationship before marriage:', report.relationshipIndicators.relationshipBeforeMarriageProbability, report.relationshipIndicators.relationshipStrength);
console.log('Love vs arranged:', report.loveVsArranged.classification, `(L${report.loveVsArranged.loveMarriageScore}/A${report.loveVsArranged.arrangedMarriageScore}) conf ${report.loveVsArranged.confidence}%`);
console.log('Delay:', report.delayAssessment.category, report.delayAssessment.score);
console.log('');
console.log('--- Marriage candidate windows ---');
console.log('Yearly scores:', JSON.stringify(report.marriageWindows.yearlyScores));
if (report.marriageWindows.primary) {
  console.log('PRIMARY  :', report.marriageWindows.primary.label, '| score', report.marriageWindows.primary.score);
  console.log('REASONS  :', report.marriageWindows.primary.reasons.slice(0, 8));
}
if (report.marriageWindows.secondary) {
  console.log('SECONDARY:', report.marriageWindows.secondary.label, '| score', report.marriageWindows.secondary.score);
}
for (const s of report.marriageWindows.supporting) {
  console.log('SUPPORT  :', s.label, '| score', s.score);
}
