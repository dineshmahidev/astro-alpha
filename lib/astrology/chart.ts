import { computeHouses, House, SIGN_RULERS } from '../astronomy/houses';
import { nakshatraFromSidereal, rashiFromSidereal } from './rasi-nakshatra';
import { PlanetKey, PlanetLongitude } from '../astronomy/planetary-positions';

/**
 * CHART
 * -----
 * Assembles a full birth-chart structure: per-planet sign/nakshatra/pada,
 * house placements and house lords.
 */

export type ChartPlanet = {
  key: PlanetKey;
  tropicalLongitude: number;
  siderealLongitude: number;
  rashiIndex: number;
  rashi: string;
  degreeInRashi: number;
  nakshatraIndex: number;
  nakshatra: string;
  pada: number;
  retrograde: boolean;
  houseNumber: number;
};

export type Chart = {
  planets: ChartPlanet[];
  houses: House[];
  lagnaRashiIndex: number;
};

export function buildChart(
  planets: PlanetLongitude[],
  siderealAscendant: number,
): Chart {
  const houses = computeHouses({
    siderealAscendant,
    planets: planets.map((p) => ({ key: p.key, siderealLongitude: p.siderealLongitude })),
  });

  const planetMap = new Map<number, number>(); // rashiIndex -> house
  for (const h of houses) planetMap.set(h.rashiIndex, h.houseNumber);

  const chartPlanets: ChartPlanet[] = planets.map((p) => {
    const r = rashiFromSidereal(p.siderealLongitude);
    const nak = nakshatraFromSidereal(p.siderealLongitude);
    return {
      key: p.key,
      tropicalLongitude: p.tropicalLongitude,
      siderealLongitude: p.siderealLongitude,
      rashiIndex: r.rashiIndex,
      rashi: r.rashi,
      degreeInRashi: r.degreeInRashi,
      nakshatraIndex: nak.nakshatraIndex,
      nakshatra: nak.nakshatra,
      pada: nak.pada,
      retrograde: p.retrograde,
      houseNumber: planetMap.get(r.rashiIndex) ?? 1,
    };
  });

  const lagnaRashiIndex = rashiFromSidereal(siderealAscendant).rashiIndex;
  return { planets: chartPlanets, houses, lagnaRashiIndex };
}

export { SIGN_RULERS };