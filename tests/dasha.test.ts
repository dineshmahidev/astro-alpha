import { test } from 'node:test';
import assert from 'node:assert';
import { buildDashaTree, antardashasOf, pratyantardashasOf } from '../lib/marriage/dashaTree';
import { DASHA_LORDS, DASHA_YEARS } from '../lib/astronomy/dasha';
import type { PlanetKey } from '../lib/astronomy/planetary-positions';
import { YEAR_DAYS } from '../lib/marriage/constants';

/**
 * VIMSHOTTARI DASHA TESTS
 * Verify mathematical invariants — no hardcoded predictions.
 */

const MOON_SIDEREAL = 355.63; // Revati (from Erode test case)
const BIRTH_JD = 2452787.75;
const TZ = 5.5;

test('dasha: birth lord matches moon nakshatra lord', () => {
  const tree = buildDashaTree(MOON_SIDEREAL, BIRTH_JD, TZ);
  // Revati index 26 -> lord Mercury
  assert.strictEqual(tree.birthLord, 'Mercury');
});

test('dasha: balance is fraction of birth lord years', () => {
  const tree = buildDashaTree(MOON_SIDEREAL, BIRTH_JD, TZ);
  const elapsedFraction = ((MOON_SIDEREAL % (360 / 27)) / (360 / 27));
  const expectedBalance = DASHA_YEARS[tree.birthLord as PlanetKey] * (1 - elapsedFraction);
  assert.ok(Math.abs(tree.balanceYears - expectedBalance) < 1e-6);
  assert.ok(tree.balanceYears > 0 && tree.balanceYears <= DASHA_YEARS[tree.birthLord as PlanetKey]);
});

test('dasha: mahadashas are contiguous and total 120 years', () => {
  const tree = buildDashaTree(MOON_SIDEREAL, BIRTH_JD, TZ);
  let sum = 0;
  for (let i = 0; i < tree.mahadashas.length; i++) {
    const m = tree.mahadashas[i];
    if (i > 0) {
      assert.strictEqual(m.startJd, tree.mahadashas[i - 1].endJd, 'contiguous periods');
    }
    sum += (m.endJd - m.startJd) / YEAR_DAYS;
    assert.ok(DASHA_YEARS[m.lord] === Math.round((m.endJd - m.startJd) / YEAR_DAYS));
  }
  assert.ok(Math.abs(sum - 120) < 1e-6);
  // sequence follows canonical order cyclically
  const startIdx = DASHA_LORDS.indexOf(tree.mahadashas[0].lord);
  tree.mahadashas.forEach((m, i) => {
    assert.strictEqual(m.lord, DASHA_LORDS[(startIdx + i) % 9]);
  });
});

test('dasha: first mahadasha starts before birth by the elapsed fraction', () => {
  const tree = buildDashaTree(MOON_SIDEREAL, BIRTH_JD, TZ);
  const first = tree.mahadashas[0];
  const elapsedYears = (BIRTH_JD - first.startJd) / YEAR_DAYS;
  assert.ok(elapsedYears > 0 && elapsedYears <= DASHA_YEARS[first.lord]);
  assert.ok(Math.abs((DASHA_YEARS[first.lord] - elapsedYears) - tree.balanceYears) < 1e-6);
});

test('dasha: antardashas of any mahadasha sum to its length', () => {
  const tree = buildDashaTree(MOON_SIDEREAL, BIRTH_JD, TZ);
  for (const maha of tree.mahadashas.slice(0, 3)) {
    const antars = antardashasOf(maha, TZ);
    let sum = 0;
    antars.forEach((a, i) => {
      if (i > 0) assert.strictEqual(a.startJd, antars[i - 1].endJd);
      sum += a.endJd - a.startJd;
    });
    assert.ok(Math.abs(sum - (maha.endJd - maha.startJd)) < 1e-6);
    // pratyantardashas of first antardasha also contiguous and sum correctly
    const prats = pratyantardashasOf(maha, antars[0], TZ);
    let psum = 0;
    prats.forEach((p) => (psum += p.endJd - p.startJd));
    assert.ok(Math.abs(psum - (antars[0].endJd - antars[0].startJd)) < 1e-6);
  }
});
