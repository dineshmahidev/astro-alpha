import { gregorianToJulianDay } from './astronomy/julian-day';
import { moonLongitude } from './astronomy/moon';
import { lahariAyanamsa, tropicalToSidereal } from './astronomy/sidereal';
import { nakshatraFromSidereal, NAKSHATRA_LORDS, rashiFromSidereal } from './astrology/rasi-nakshatra';
import { ZODIAC_SIGNS } from '@/constants/zodiac';

export type VedicChart = {
  julianDay: number;
  moonLongitude: number;
  siderealLongitude: number;
  ayanamsa: number;
  rashiIndex: number;
  rashi: string;
  nakshatraIndex: number;
  nakshatra: string;
  nakshatraLord: string;
  pada: number;
};

export { gregorianToJulianDay, moonLongitude, lahariAyanamsa };

/**
 * Full Vedic birth chart computation from date+time.
 * Uses the South Indian system: Lahiri ayanamsa, sidereal rashi (Moon sign)
 * and nakshatra with 1-4 pada.
 */
export function computeVedicChart(date: Date): VedicChart {
  const jd = gregorianToJulianDay(date);
  const moonLong = moonLongitude(jd);
  const ayanamsa = lahariAyanamsa(jd);
  const sidereal = tropicalToSidereal(moonLong, ayanamsa);

  const rashi = rashiFromSidereal(sidereal);
  const nak = nakshatraFromSidereal(sidereal);

  return {
    julianDay: jd,
    moonLongitude: moonLong,
    siderealLongitude: sidereal,
    ayanamsa,
    rashiIndex: rashi.rashiIndex,
    rashi: rashi.rashi,
    nakshatraIndex: nak.nakshatraIndex,
    nakshatra: nak.nakshatra,
    nakshatraLord: NAKSHATRA_LORDS[nak.nakshatraIndex],
    pada: nak.pada,
  };
}

/**
 * Vedic rashi (Moon sign) with the matching zodiac asset + display name.
 * Rashi index order (Mesha..Meena) aligns 1:1 with ZODIAC_SIGNS (Aries..Pisces).
 */
export function getVedicSignFromDate(date: Date) {
  const chart = computeVedicChart(date);
  const sign = ZODIAC_SIGNS[chart.rashiIndex];
  return {
    ...chart,
    name: sign.name,
    id: sign.id,
    image: sign.image,
  };
}

/**
 * Builds kundli chart data centred on the given rashi (house 1 = Lagna = rashi).
 * Rashi index order (Mesha..Meena) aligns 1:1 with ZODIAC_SIGNS (Aries..Pisces).
 */
export function buildKundliChartData(rashiIndex: number) {
  return Array.from({ length: 12 }, (_, i) => {
    const house = i + 1;
    const sign = ZODIAC_SIGNS[(rashiIndex + i) % 12].name;
    const planets = house === 1 ? ['Lg', 'Mo'] : [];
    return { n: house, sign, planets };
  });
}