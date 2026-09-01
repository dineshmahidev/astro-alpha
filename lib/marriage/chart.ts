import { RASHIS } from '../../constants/birth';
import { gregorianToJulianDay } from '../astronomy/julian-day';
import { getPlanetLongitudes, type PlanetKey } from '../astronomy/planetary-positions';
import { computeAscendant } from '../astronomy/ascendant';
import { computeHouses } from '../astronomy/houses';
import {
  nakshatraFromSidereal,
  rashiFromSidereal,
} from '../astrology/rasi-nakshatra';
import { navamsaFromSidereal } from '../astronomy/navamsa';
import type { BirthInput, ChartSnapshot, Dms, HouseData, NavamsaData, PlanetPlacement } from './types';
import { aspectsOnHouse, dignityOf, isCombust } from './strength';
import { HOUSE_SYSTEM, SIGN_LORDS } from './marriageRules';

/** degrees -> deg/min/sec */
export function toDms(deg: number): Dms {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return { degrees: d, minutes: m, seconds: s };
}

export function parseBirthUTC(birth: BirthInput): number {
  const [y, mo, d] = birth.date.split('-').map(Number);
  const [hh, mm] = birth.time.split(':').map(Number);
  const local = new Date(y, mo - 1, d, hh || 0, mm || 0, 0);
  return gregorianToJulianDay(local, birth.timezoneOffsetHours);
}

function placement(
  key: PlanetKey,
  sidereal: number,
  retrograde: boolean,
  houseOfSign: (signIndex: number) => number,
  sunSidereal: number,
): PlanetPlacement {
  const rashi = rashiFromSidereal(sidereal);
  const nak = nakshatraFromSidereal(sidereal);
  return {
    planet: key,
    longitude: sidereal,
    rashiIndex: rashi.rashiIndex,
    rashi: RASHIS[rashi.rashiIndex].name,
    dms: toDms(rashi.degreeInRashi),
    nakshatra: nak.nakshatra,
    pada: nak.pada,
    house: houseOfSign(rashi.rashiIndex),
    dignity: dignityOf(key, rashi.rashiIndex),
    combust: isCombust(key, sidereal, sunSidereal),
    retrograde,
  };
}

/** Build the full D1 snapshot (planets, lagna, whole-sign houses, key aspects). */
export function buildChart(birth: BirthInput): ChartSnapshot {
  const jdUT = parseBirthUTC(birth);

  // planets
  const longs = getPlanetLongitudes(jdUT);
  const sunLon = longs.find((p) => p.key === 'Sun')!.siderealLongitude;

  // lagna
  const lagna = computeAscendant(jdUT, birth.latitude, birth.longitude);
  const ascSign = Math.floor(lagna.siderealAscendant / 30) % 12;

  // WHOLE-SIGN houses: house n occupies sign (ascSign + n - 1) % 12
  const houseOfSign = (signIndex: number) => ((signIndex - ascSign + 12) % 12) + 1;

  const planets: PlanetPlacement[] = longs.map((p) =>
    placement(p.key, p.siderealLongitude, p.retrograde, houseOfSign, sunLon),
  );

  const houses: HouseData[] = [];
  for (let h = 1; h <= 12; h++) {
    const signIndex = (ascSign + h - 1) % 12;
    houses.push({
      house: h,
      rashiIndex: signIndex,
      rashi: RASHIS[signIndex].name,
      lord: SIGN_LORDS[signIndex],
      planets: planets.filter((p) => p.house === h).map((p) => p.planet),
    });
  }

  const seventhHouse = houses[6];
  const seventhLordPlacement =
    planets.find((p) => p.planet === seventhHouse.lord)!;
  const venus = planets.find((p) => p.planet === 'Venus')!;
  const jupiter = planets.find((p) => p.planet === 'Jupiter')!;
  const moon = planets.find((p) => p.planet === 'Moon')!;
  const sun = planets.find((p) => p.planet === 'Sun')!;

  return {
    birth,
    jdUT,
    ayanamsa: lagna.ayanamsa,
    lagna: {
      rashiIndex: ascSign,
      rashiNameEnglish: RASHIS[ascSign].name,
      degreeInRashi: lagna.degreeInRashi,
      dms: toDms(lagna.degreeInRashi),
      nakshatra: lagna.nakshatra,
      pada: lagna.pada,
    },
    moon,
    sun,
    planets,
    houses,
    seventhHouse,
    seventhLord: seventhLordPlacement,
    venus,
    jupiter,
    aspectsOnSeventhHouseSign: aspectsOnHouse(
      planets.map((p) => ({ planet: p.planet, house: p.house })),
      7,
    ),
    aspectsOnSeventhLord: aspectsOnHouse(
      planets.map((p) => ({ planet: p.planet, house: p.house })),
      seventhLordPlacement.house,
    ),
  };
}

/** Build the D9 layer with houses counted from the navamsa lagna. */
export function buildNavamsa(chart: ChartSnapshot): NavamsaData {
  const ascN = navamsaFromSidereal(
    (chart.lagna.rashiIndex * 30 + chart.lagna.degreeInRashi),
  );
  const ascSign = ascN.navamsaSignIndex;
  const planets = chart.planets.map((p) => {
    const n = navamsaFromSidereal(p.longitude);
    return {
      planet: p.planet,
      navamsaRashi: n.navamsaSign,
      navamsaRashiIndex: n.navamsaSignIndex,
      houseFromNavamsaLagna: ((n.navamsaSignIndex - ascSign + 12) % 12) + 1,
      dignity: dignityOf(p.planet, n.navamsaSignIndex),
    };
  });
  const venusD9 = planets.find((p) => p.planet === 'Venus')!;
  const note =
    venusD9.dignity === 'exalted' || venusD9.dignity === 'own'
      ? 'Venus strong in D9 — marital happiness supported'
      : venusD9.dignity === 'debilitated' || venusD9.dignity === 'enemy'
        ? 'Venus weak in D9 — marital harmony needs care'
        : 'Venus neutral in D9';
  return {
    lagnaNavamsa: { rashiIndex: ascSign, rashi: RASHIS[ascSign].name },
    planets,
    venusNavamsaStrengthNote: note,
  };
}
