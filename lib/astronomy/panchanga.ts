import { acosD, atan2D, cosD, normalize360, sinD } from './angles';
import { meanObliquity } from './moon';
import { lahariAyanamsa, tropicalToSidereal } from './sidereal';
import { nakshatraFromSidereal } from '../astrology/rasi-nakshatra';
import { sunLongitude, eclipticToEquatorial } from './sun';
import { moonLongitude } from './moon';

/**
 * PANCHANGA
 * ---------
 * Tithi, vara (weekday), nakshatra, yoga, karana and sunrise/sunset for a
 * given date+location. Uses tropical elongations for tithi (ayanamsa cancels
 * out) and sidereal longitudes for nakshatra. Sunrise/sunset uses the
 * standard solar hour-angle method with -0.833° refraction correction.
 * Moonrise is computed where mathematically practical (returns null near
 * poles / long moonless periods).
 */

export const VARA_NAMES = [
  'Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar',
];

export const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
  'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
  'Trayodashi', 'Chaturdashi', 'Purnima', 'Pratipada', 'Dwitiya',
  'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami',
  'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

export const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata',
  'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha',
  'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti',
];

export const KARANA_NAMES = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti',
];

export type Panchanga = {
  jd: number;
  tithiIndex: number; // 0..29
  tithiName: string;
  paksha: 'Shukla' | 'Krishna';
  varaIndex: number; // 0..6 (Sunday first)
  varaName: string;
  nakshatraIndex: number;
  nakshatra: string;
  yogaIndex: number; // 0..26
  yogaName: string;
  karanaIndex: number; // 0..59
  karanaName: string;
  sunriseJd: number | null;
  sunsetJd: number | null;
  moonriseJd: number | null;
};

/** Elongation (Moon - Sun) mod 360, degrees. */
function elongation(moonTropical: number, sunTropical: number): number {
  return normalize360(moonTropical - sunTropical);
}

/** Vara index (0=Sunday) from JD. */
export function varaIndex(jd: number): number {
  // 2000-01-01 12:00 TT (JD 2451545) was a Saturday (index 6).
  return ((Math.floor(jd + 0.5) + 1) % 7 + 7) % 7;
}

function karanaName(index: number): string {
  // 60 karanas: 7 movable repeating (56) + 4 fixed at the start.
  const fixed = ['Kimstughna', 'Sakuni', 'Chatushpada', 'Naga'];
  if (index < 4) return fixed[index];
  return KARANA_NAMES[(index - 4) % 7];
}

/** Sunrise/sunset/moonrise (JD) for a location. Approx ±2 min. */
function riseSetForBody(
  jdNoon: number,
  latitudeDeg: number,
  eastLongitudeDeg: number,
  body: { rightAscension: number; declination: number; distance?: number },
): { riseJd: number | null; setJd: number | null } {
  const phi = latitudeDeg;
  const parallax = body.distance ? asinParallax(body.distance) : 0;
  const alt0 = -0.833 - parallax; // refraction + semi-diameter + moon parallax
  const cosH = (sinD(alt0) - sinD(phi) * sinD(body.declination)) / (cosD(phi) * cosD(body.declination));
  if (cosH < -1 || cosH > 1) return { riseJd: null, setJd: null };
  const H = acosD(cosH);
  const gmst = greenwichSidereal(jdNoon);
  const lst = normalize360(gmst + eastLongitudeDeg);
  const transitOffsetDeg = normalize180(body.rightAscension - lst);
  const transitJd = jdNoon + transitOffsetDeg / 360;
  return { riseJd: transitJd - H / 360, setJd: transitJd + H / 360 };
}

function asinParallax(distance: number): number {
  // horizontal parallax ~ 8.8"/AU for sun, ~57' for moon
  return (8.794 / 3600) / distance;
}

function greenwichSidereal(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return normalize360(
    280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000,
  );
}

function normalize180(deg: number): number {
  return normalize360(deg + 180) - 180;
}

/** Full panchanga for a given JD (UT) and location. */
export function computePanchanga(
  jd: number,
  latitudeDeg: number,
  eastLongitudeDeg: number,
): Panchanga {
  const sunT = sunLongitude(jd);
  const moonT = moonLongitude(jd);
  const elong = elongation(moonT, sunT);
  const tithiIndex = Math.floor(elong / 12) % 30;
  const paksha: 'Shukla' | 'Krishna' = tithiIndex < 15 ? 'Shukla' : 'Krishna';

  const vara = varaIndex(jd);
  const ayanamsa = lahariAyanamsa(jd);
  const moonSidereal = tropicalToSidereal(moonT, ayanamsa);
  const nak = nakshatraFromSidereal(moonSidereal);

  const yogaIndex = Math.floor(normalize360(sunT + moonT) / (360 / 27)) % 27;
  const karanaIndex = Math.floor(elong / 6) % 60;

  // approximate local noon as the date's noon UT + longitude
  const jdNoon = Math.floor(jd + 0.5) + 0.5 - eastLongitudeDeg / 360;

  const sunEq = eclipticToEquatorial(sunT, meanObliquity(jdNoon));
  const sunTimes = riseSetForBody(jdNoon, latitudeDeg, eastLongitudeDeg, { ...sunEq, distance: 1 });

  // Moon equatorial from ecliptic longitude using mean obliquity
  const moonEq = eclipticToEquatorial(moonT, meanObliquity(jdNoon));
  const moonDist = 384400 / 149597870.7; // ~0.00257 AU
  const moonTimes = riseSetForBody(jdNoon, latitudeDeg, eastLongitudeDeg, {
    ...moonEq,
    distance: moonDist,
  });

  return {
    jd,
    tithiIndex,
    tithiName: TITHI_NAMES[tithiIndex],
    paksha,
    varaIndex: vara,
    varaName: VARA_NAMES[vara],
    nakshatraIndex: nak.nakshatraIndex,
    nakshatra: nak.nakshatra,
    yogaIndex,
    yogaName: YOGA_NAMES[yogaIndex],
    karanaIndex,
    karanaName: karanaName(karanaIndex),
    sunriseJd: sunTimes.riseJd,
    sunsetJd: sunTimes.setJd,
    moonriseJd: moonTimes.riseJd,
  };
}