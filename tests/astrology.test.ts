import { test } from 'node:test';
import assert from 'node:assert/strict';

import { gregorianToJulianDay, julianDayToLocalString } from '../lib/astronomy/julian-day';
import { moonLongitude } from '../lib/astronomy/moon';
import { lahariAyanamsa } from '../lib/astronomy/sidereal';
import { sunLongitude } from '../lib/astronomy/sun';
import { getPlanetLongitudes } from '../lib/astronomy/planetary-positions';
import { computeAscendant } from '../lib/astronomy/ascendant';
import { computeHouses } from '../lib/astronomy/houses';
import { navamsaFromSidereal } from '../lib/astronomy/navamsa';
import { computeVimshottari } from '../lib/astronomy/dasha';
import { computePanchanga, varaIndex } from '../lib/astronomy/panchanga';
import { computeTransits } from '../lib/astronomy/transits';
import { computeAstroReport, computeDailyHoroscope } from '../lib/pipeline';
import { nakshatraFromSidereal, rashiFromSidereal } from '../lib/astrology/rasi-nakshatra';
import { computeNodalDosha, houseFromSign } from '../lib/astrology/dosha';

const J2000 = 2451545.0;

test('gregorianToJulianDay: J2000 epoch', () => {
  // 2000-01-01 12:00 UT = JD 2451545.0 (IST 17:30, so the local clock shows 17:30)
  const d = new Date(2000, 0, 1, 17, 30, 0);
  assert.ok(Math.abs(gregorianToJulianDay(d, 5.5) - J2000) < 1e-4);
});

test('gregorianToJulianDay roundtrip via julianDayToLocalString', () => {
  const d = new Date(1990, 6, 15, 8, 15, 0);
  const jd = gregorianToJulianDay(d, 5.5);
  const str = julianDayToLocalString(jd, 5.5);
  assert.ok(str.includes('1990-07-15'));
});

test('ayanamsa: Lahiri ~23.856 at J2000', () => {
  assert.ok(Math.abs(lahariAyanamsa(J2000) - 23.856) < 0.01);
});

test('moonLongitude within valid 0..360 range', () => {
  const l = moonLongitude(J2000);
  assert.ok(l >= 0 && l < 360);
});

test('sunLongitude near J2000 ~281°', () => {
  const l = sunLongitude(J2000);
  assert.ok(Math.abs(l - 281) < 1, `sunLongitude=${l}`);
});

test('planet longitudes: 9 grahas, sidereal= tropical - ayanamsa', () => {
  const planets = getPlanetLongitudes(J2000);
  assert.equal(planets.length, 9);
  const ayanamsa = planets[0].ayanamsa;
  for (const p of planets) {
    assert.equal(p.ayanamsa, ayanamsa);
    const expectedSidereal = ((p.tropicalLongitude - ayanamsa) % 360 + 360) % 360;
    assert.ok(Math.abs(p.siderealLongitude - expectedSidereal) < 1e-6);
  }
});

test('rashi/nakshatra/pada match existing engine (monstermahid → Kumbha / Purva Bhadrapada / pada 2)', () => {
  // dob 24/05/2003, tob 16:00 IST → sidereal moon 325.221° → Kumbha (10), Purva Bhadrapada (24), pada 2
  const d = new Date(2003, 4, 24, 16, 0, 0);
  const jd = gregorianToJulianDay(d, 5.5);
  const moon = moonLongitude(jd);
  const ayanamsa = lahariAyanamsa(jd);
  const sidereal = ((moon - ayanamsa) % 360 + 360) % 360;

  const rashi = rashiFromSidereal(sidereal);
  const nak = nakshatraFromSidereal(sidereal);
  assert.equal(rashi.rashiIndex, 10); // Kumbha
  assert.equal(rashi.rashi, 'Kumbha');
  assert.equal(nak.nakshatraIndex, 24); // Purva Bhadrapada
  assert.equal(nak.nakshatra, 'Purva Bhadrapada');
  assert.equal(nak.pada, 2);
});

test('ascendant: equator LST≈0 → Cancer 90° tropical', () => {
  // JD where GMST=0 at lon 0 (LST≈0): GMST advances 360.9856°/day from J2000 (280.46°)
  const jd0 = J2000 + (360 - 280.4606) / 360.985647;
  const asc = computeAscendant(jd0, 0, 0);
  assert.ok(Math.abs(asc.lst) < 1 || Math.abs(asc.lst - 360) < 1, `lst=${asc.lst}`);
  assert.ok(Math.abs(asc.tropicalAscendant - 90) < 2, `tropical asc=${asc.tropicalAscendant}`);
});

test('houses: 12 houses, house1 starts at ascendant, house lord present', () => {
  const asc = computeAscendant(J2000, 28.6, 77.2);
  const houses = computeHouses({
    siderealAscendant: asc.siderealAscendant,
    planets: getPlanetLongitudes(J2000).map((p) => ({ key: p.key, siderealLongitude: p.siderealLongitude })),
  });
  assert.equal(houses.length, 12);
  assert.equal(houses[0].houseNumber, 1);
  assert.equal(houses[0].startDeg, asc.siderealAscendant);
  assert.ok(houses[0].lord.length > 0);
});

test('navamsa: fixed sign offset is 8, movable is 0', () => {
  const movable = navamsaFromSidereal(2); // Mesha (movable), 1st navamsa → itself
  const fixed = navamsaFromSidereal(31); // Vrishabha (fixed), 1° in → 9th sign from it
  assert.equal(movable.navamsaSignIndex, 0);
  assert.equal(fixed.navamsaSignIndex, 9); // Vrishabha + 8 = Makara
});

test('vimshottari: mahadashas sum to 120 years', () => {
  const d = new Date(2003, 4, 24, 16, 0, 0);
  const jd = gregorianToJulianDay(d, 5.5);
  const moon = moonLongitude(jd);
  const ayanamsa = lahariAyanamsa(jd);
  const sidereal = ((moon - ayanamsa) % 360 + 360) % 360;
  const dashas = computeVimshottari(jd, sidereal, 5.5);
  const total = dashas.mahadashas.reduce((s, x) => s + x.years, 0);
  assert.ok(Math.abs(total - 120) < 1e-6);
  assert.ok(dashas.balanceYears > 0 && dashas.balanceYears <= 20);
  assert.equal(dashas.mahadashas.length, 9);
});

test('panchanga: 2000-01-01 was Saturday (vara index 6)', () => {
  const jd = gregorianToJulianDay(new Date(2000, 0, 1, 12, 0, 0), 5.5);
  assert.equal(varaIndex(jd), 6);
});

test('panchanga: tithi/yoga/karana ranges', () => {
  const jd = gregorianToJulianDay(new Date(2026, 7, 19, 12, 0, 0), 5.5);
  const p = computePanchanga(jd, 28.6, 77.2);
  assert.ok(p.tithiIndex >= 0 && p.tithiIndex < 30);
  assert.ok(p.yogaIndex >= 0 && p.yogaIndex < 27);
  assert.ok(p.karanaIndex >= 0 && p.karanaIndex < 60);
  assert.ok(['Shukla', 'Krishna'].includes(p.paksha));
});

test('transits: planet count and house ranges', () => {
  const jd = gregorianToJulianDay(new Date(2026, 7, 19, 12, 0, 0), 5.5);
  const t = computeTransits(jd, 0, 0);
  assert.equal(t.length, 9);
  for (const x of t) {
    assert.ok(x.houseFromJanmaRashi >= 1 && x.houseFromJanmaRashi <= 12);
    assert.ok(x.houseFromLagna >= 1 && x.houseFromLagna <= 12);
  }
});

test('pipeline: computeAstroReport produces full report', () => {
  const report = computeAstroReport({
    birthDate: new Date(2003, 4, 24, 16, 0, 0),
    place: 'Erode',
  });
  assert.equal(report.moonRashi, 'Kumbha');
  assert.equal(report.moonNakshatra, 'Purva Bhadrapada');
  assert.equal(report.moonPada, 2);
  assert.ok(report.lagna);
  assert.equal(report.houses.length, 12);
  assert.ok(report.navamsa);
  assert.ok(report.dasha.mahadashas.length === 9);
  assert.ok(report.birthPanchanga.tithiName.length > 0);
});

test('pipeline: daily horoscope is structured and deterministic', () => {
  const a = computeDailyHoroscope(
    { birthDate: new Date(2003, 4, 24, 16, 0, 0), place: 'Erode' },
    new Date(2026, 7, 19, 12, 0, 0),
  );
  const b = computeDailyHoroscope(
    { birthDate: new Date(2003, 4, 24, 16, 0, 0), place: 'Erode' },
    new Date(2026, 7, 19, 12, 0, 0),
  );
  assert.equal(a.horoscope.categories.Career, b.horoscope.categories.Career); // deterministic
  assert.ok(a.horoscope.positiveFactors.length > 0);
  assert.ok(a.horoscope.luckyPeriod.length > 0);
  assert.equal(a.transits.length, 9);
});

test('dosha: houseFromSign counts houses from a rashi', () => {
  assert.equal(houseFromSign(0, 0), 1);
  assert.equal(houseFromSign(1, 0), 2);
  assert.equal(houseFromSign(11, 0), 12);
  assert.equal(houseFromSign(10, 0), 11);
  assert.equal(houseFromSign(0, 5), 8);
});

test('dosha: report includes nodal dosha with Rahu/Ketu positions', () => {
  const report = computeAstroReport({
    birthDate: new Date(2003, 4, 24, 16, 0, 0),
    place: 'Erode',
  });
  assert.ok(report.nodalDosha);
  assert.equal(report.nodalDosha.rahu.key, 'Rahu');
  assert.equal(report.nodalDosha.ketu.key, 'Ketu');
  // monstermahid: Rahu in Vrishabha (8th from Lagna, 4th from Moon), Ketu in Vrishchika
  assert.equal(report.nodalDosha.rahu.houseFromLagna, 8);
  assert.equal(report.nodalDosha.rahu.houseFromMoon, 4);
  assert.equal(report.nodalDosha.ketu.houseFromLagna, 2);
  assert.equal(report.nodalDosha.ketu.houseFromMoon, 10);
  assert.equal(report.nodalDosha.present, true);
  assert.equal(report.nodalDosha.severity, 'Moderate');
  assert.ok(report.nodalDosha.details.length >= 3);
});