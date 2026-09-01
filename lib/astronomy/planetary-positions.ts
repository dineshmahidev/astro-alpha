import { atan2D, cosD, normalize360, sinD } from './angles';
import { lahariAyanamsa, tropicalToSidereal } from './sidereal';
import { meanLunarNode, moonLongitude } from './moon';
import { sunLongitude } from './sun';

/**
 * PLANETARY POSITIONS
 * -------------------
 * Low-precision element method (Meeus, "Astronomical Formulae for
 * Calculators", planetary elements valid ~1800–2050). Accuracy ≈ 1′ for the
 * inner planets and a few arcminutes for the outer planets — far below the
 * 3°20′ nakshatra-pada resolution, so rashi/nakshatra/pada are unaffected.
 *
 * The Moon uses the exact existing Meeus ELP-2000 truncated series
 * (moonLongitude) so the Rashi/Nakshatra/Pada results are bit-identical to
 * the existing engine. The Sun uses Meeus ch. 25 (~0.01°). Rahu/Ketu use the
 * mean lunar node.
 *
 * This module is intentionally isolated so it can later be upgraded to a
 * full VSOP87 implementation without touching any downstream code.
 */

export type PlanetKey =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

export const PLANET_KEYS: PlanetKey[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
];

type Elements = {
  N0: number;
  N1: number;
  i0: number;
  i1: number;
  w0: number;
  w1: number;
  a0: number;
  e0: number;
  e1: number;
  L0: number;
  L1: number;
};

/**
 * Element table (Meeus AFC ch. 22). T = centuries from J1900 (T=(jd-2415020)/36525),
 * d = days from J1900 (d = jd-2415020). Longitudes in degrees.
 */
const PLANET_ELEMENTS: Record<Exclude<PlanetKey, 'Sun' | 'Moon' | 'Rahu' | 'Ketu'> | 'Earth', Elements> = {
  Mercury: {
    N0: 48.3313, N1: 3.24587e-5,
    i0: 7.0047, i1: 5.0e-8,
    w0: 29.1241, w1: 1.01444e-5,
    a0: 0.387098,
    e0: 0.205635, e1: 5.59e-10,
    L0: 168.6562, L1: 4.0923344368,
  },
  Venus: {
    N0: 76.6799, N1: 2.4659e-5,
    i0: 3.3946, i1: 2.75e-8,
    w0: 54.891, w1: 1.38374e-5,
    a0: 0.72333,
    e0: 0.006773, e1: -1.302e-9,
    L0: 48.0052, L1: 1.6021302244,
  },
  Earth: {
    N0: 0, N1: 0,
    i0: 0, i1: 0,
    w0: 282.9404, w1: 4.70935e-5,
    a0: 1.0,
    e0: 0.016709, e1: -1.151e-9,
    L0: 356.047, L1: 0.9856002585,
  },
  Mars: {
    N0: 49.5574, N1: 2.11081e-5,
    i0: 1.8497, i1: -1.78e-8,
    w0: 286.5016, w1: 2.92961e-5,
    a0: 1.523688,
    e0: 0.093405, e1: 2.516e-9,
    L0: 18.6021, L1: 0.5240207766,
  },
  Jupiter: {
    N0: 100.4542, N1: 2.76854e-5,
    i0: 1.303, i1: -1.557e-7,
    w0: 273.8777, w1: 1.64505e-5,
    a0: 5.20256,
    e0: 0.048498, e1: 4.469e-9,
    L0: 19.895, L1: 0.0830853001,
  },
  Saturn: {
    N0: 113.6634, N1: 2.3898e-5,
    i0: 2.4886, i1: -1.081e-7,
    w0: 339.3939, w1: 2.97661e-5,
    a0: 9.55475,
    e0: 0.055546, e1: -9.499e-9,
    L0: 316.967, L1: 0.0334442282,
  },
};

type Helio = { x: number; y: number; z: number };

function keplerSolve(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 12; i++) {
    const dE = (M - (E - e * sinD(E))) / (1 - e * cosD(E));
    E += dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

/** Heliocentric ecliptic coordinates of a body from its orbital elements.
 *
 * Element-table convention (Schlyter, epoch 2000 Jan 0.0 UT = JD 2451543.5):
 *   ALL rates (N1, i1, w1, e1) are PER DAY against the same d as L.
 *   L0, L1  -> MEAN ANOMALY  M = L0 + L1·d      (NOT mean longitude)
 *   w0, w1  -> argument of perihelion ω        (NOT perihelion longitude)
 *   N       -> longitude of ascending node Ω
 */
function heliocentric(elem: Elements, d: number): Helio {
  const N = elem.N0 + elem.N1 * d;
  const i = elem.i0 + elem.i1 * d;
  const w = elem.w0 + elem.w1 * d; // argument of perihelion
  const a = elem.a0;
  const e = elem.e0 + elem.e1 * d;

  const M = normalize360(elem.L0 + elem.L1 * d); // mean anomaly
  const E = keplerSolve(M, e);
  // true anomaly in DEGREES (Math.atan2 returns radians)
  const v = normalize360((2 * Math.atan2(Math.sqrt(1 + e) * sinD(E / 2), Math.sqrt(1 - e) * cosD(E / 2))) * (180 / Math.PI));
  const r = a * (1 - e * cosD(E));

  const u = v + w;
  const x = r * (cosD(N) * cosD(u) - sinD(N) * sinD(u) * cosD(i));
  const y = r * (sinD(N) * cosD(u) + cosD(N) * sinD(u) * cosD(i));
  const z = r * sinD(u) * sinD(i);
  return { x, y, z };
}

/** Geocentric tropical ecliptic longitude of a planet (element method).
 *
 * Planets use their heliocentric Keplerian elements (epoch 2000 Jan 0.0).
 * Earth's heliocentric position is derived as Sun's geocentric longitude
 * + 180° — the element row labelled "Earth" is the classic geocentric
 * solar-orbit parameterisation and must not be propagated heliocentrically.
 * Verified against Swiss-Ephemeris-based Vedic sites (Jupiter Karka,
 * Saturn Meena Rx on 2026-08-26).
 */
export function planetLongitude(planet: Exclude<PlanetKey, 'Sun' | 'Moon' | 'Rahu' | 'Ketu'>, jd: number): number {
  const d = jd - 2451543.5; // days since 2000 Jan 0.0 UT
  const p = heliocentric(PLANET_ELEMENTS[planet], d);
  const earthLon = normalize360(sunLongitude(jd) + 180);
  const ex = cosD(earthLon);
  const ey = sinD(earthLon);
  const x = p.x - ex;
  const y = p.y - ey;
  return normalize360(atan2D(y, x));
}

export type PlanetLongitude = {
  key: PlanetKey;
  tropicalLongitude: number;
  siderealLongitude: number;
  ayanamsa: number;
  retrograde: boolean;
  combustion?: boolean;
};

function isRetrograde(planet: Exclude<PlanetKey, 'Sun' | 'Moon' | 'Rahu' | 'Ketu'>, jd: number): boolean {
  const l1 = planetLongitude(planet, jd);
  const l2 = planetLongitude(planet, jd + 0.5);
  const diff = normalize360(l2 - l1);
  return diff > 180;
}

/** All 9 graha tropical+sidereal longitudes at a Julian day. */
export function getPlanetLongitudes(jd: number): PlanetLongitude[] {
  const ayanamsa = lahariAyanamsa(jd);
  const sunT = sunLongitude(jd);
  const moonT = moonLongitude(jd);
  const nodeT = meanLunarNode(jd);

  const planets: { key: PlanetKey; tropical: number; retrograde: boolean }[] = [
    { key: 'Sun', tropical: sunT, retrograde: false },
    { key: 'Moon', tropical: moonT, retrograde: false },
    { key: 'Mars', tropical: planetLongitude('Mars', jd), retrograde: isRetrograde('Mars', jd) },
    { key: 'Mercury', tropical: planetLongitude('Mercury', jd), retrograde: isRetrograde('Mercury', jd) },
    { key: 'Jupiter', tropical: planetLongitude('Jupiter', jd), retrograde: isRetrograde('Jupiter', jd) },
    { key: 'Venus', tropical: planetLongitude('Venus', jd), retrograde: isRetrograde('Venus', jd) },
    { key: 'Saturn', tropical: planetLongitude('Saturn', jd), retrograde: isRetrograde('Saturn', jd) },
    { key: 'Rahu', tropical: nodeT, retrograde: true },
    { key: 'Ketu', tropical: nodeT + 180, retrograde: true },
  ];

  const COMBUSTION_RANGES: Partial<Record<PlanetKey, number>> = {
    Mercury: 14,
    Venus: 10,
    Mars: 17,
    Jupiter: 11,
    Saturn: 15,
  };

  const sunSidereal = tropicalToSidereal(sunT, ayanamsa);

  return planets.map(({ key, tropical, retrograde }) => {
    const sidereal = tropicalToSidereal(tropical, ayanamsa);
    let combustion: boolean | undefined;
    const range = COMBUSTION_RANGES[key];
    if (range !== undefined) {
      const diff = Math.abs(sidereal - sunSidereal);
      const angularDiff = Math.min(diff, 360 - diff);
      combustion = angularDiff < range;
    }
    return {
      key,
      tropicalLongitude: normalize360(tropical),
      siderealLongitude: sidereal,
      ayanamsa,
      retrograde,
      ...(combustion !== undefined ? { combustion } : {}),
    };
  });
}