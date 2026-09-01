import { atan2D, cosD, normalize360, sinD, tanD } from './angles';
import { meanObliquity } from './moon';
import { lahariAyanamsa, tropicalToSidereal } from './sidereal';
import { nakshatraFromSidereal, rashiFromSidereal } from '../astrology/rasi-nakshatra';

/**
 * ASCENDANT / LAGNA
 * -----------------
 * GMST from Meeus ch. 12, Local Sidereal Time = GMST + east longitude.
 * The ascendant is the ecliptic point rising on the eastern horizon:
 *   λ_asc = atan2( cos(LST), -( sin(LST)·cos(ε) + tan(φ)·sin(ε) ) )
 * (verified: equator φ=0, LST=0 → Cancer 90° rising).
 * Tropical ascendant → sidereal via Lahiri ayanamsa → lagna rashi/nakshatra/pada.
 */

export function greenwichMeanSiderealTime(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return normalize360(
    280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000,
  );
}

/** Local Sidereal Time in degrees (east longitude positive). */
export function localSiderealTime(jd: number, eastLongitudeDeg: number): number {
  return normalize360(greenwichMeanSiderealTime(jd) + eastLongitudeDeg);
}

/** Tropical ascendant longitude in degrees. */
export function ascendantTropical(jd: number, latitudeDeg: number, eastLongitudeDeg: number): number {
  const theta = localSiderealTime(jd, eastLongitudeDeg);
  const eps = meanObliquity(jd);
  const y = cosD(theta);
  const x = -(sinD(theta) * cosD(eps) + tanD(latitudeDeg) * sinD(eps));
  return normalize360(atan2D(y, x));
}

export type Lagna = {
  jd: number;
  latitude: number;
  longitude: number;
  gmst: number;
  lst: number;
  tropicalAscendant: number;
  ayanamsa: number;
  siderealAscendant: number;
  rashiIndex: number;
  rashi: string;
  degreeInRashi: number;
  nakshatraIndex: number;
  nakshatra: string;
  pada: number;
};

/** Full sidereal Lagna computation for a birth JD + place. */
export function computeAscendant(
  jd: number,
  latitudeDeg: number,
  eastLongitudeDeg: number,
): Lagna {
  const gmst = greenwichMeanSiderealTime(jd);
  const lst = localSiderealTime(jd, eastLongitudeDeg);
  const tropical = ascendantTropical(jd, latitudeDeg, eastLongitudeDeg);
  const ayanamsa = lahariAyanamsa(jd);
  const sidereal = tropicalToSidereal(tropical, ayanamsa);
  const rashi = rashiFromSidereal(sidereal);
  const nak = nakshatraFromSidereal(sidereal);
  return {
    jd,
    latitude: latitudeDeg,
    longitude: eastLongitudeDeg,
    gmst,
    lst,
    tropicalAscendant: tropical,
    ayanamsa,
    siderealAscendant: sidereal,
    rashiIndex: rashi.rashiIndex,
    rashi: rashi.rashi,
    degreeInRashi: rashi.degreeInRashi,
    nakshatraIndex: nak.nakshatraIndex,
    nakshatra: nak.nakshatra,
    pada: nak.pada,
  };
}