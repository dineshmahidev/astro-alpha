import { atan2D, asinD, cosD, normalize360, sinD } from './angles';
import { meanObliquity } from './moon';

/**
 * Geocentric apparent ecliptic longitude of the Sun in degrees.
 * Meeus "Astronomical Algorithms" ch. 25 — good to ~0.01° over 1800–2100.
 */
export function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sinD(M) +
    (0.019993 - 0.000101 * T) * sinD(2 * M) +
    0.000289 * sinD(3 * M);
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const apparentLong = trueLong - 0.00569 - 0.00478 * sinD(omega);
  return normalize360(apparentLong);
}

export type EquatorialPosition = {
  rightAscension: number;
  declination: number;
};

/** Right ascension (0–360°) and declination of the Sun from its ecliptic longitude. */
export function sunEquatorial(jd: number): EquatorialPosition {
  const lambda = sunLongitude(jd);
  const eps = meanObliquity(jd);
  return eclipticToEquatorial(lambda, eps);
}

/** Convert ecliptic longitude (tropical) to RA/Dec given obliquity. */
export function eclipticToEquatorial(
  eclipticLongitude: number,
  obliquity: number,
): EquatorialPosition {
  const ra = atan2D(sinD(eclipticLongitude) * cosD(obliquity), cosD(eclipticLongitude));
  const dec = asinD(sinD(obliquity) * sinD(eclipticLongitude));
  return { rightAscension: normalize360(ra), declination: dec };
}