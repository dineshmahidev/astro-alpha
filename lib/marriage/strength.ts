import type { PlanetKey } from '../astronomy/planetary-positions';
import type { AspectHit, Dignity } from './types';
import {
  COMBUSTION_ORB,
  DEBILITATION,
  EXALTATION,
  FRIENDSHIP,
  MOOLTRIKONA,
  SIGN_LORDS,
  NODE_ASPECT_CONVENTION,
} from './marriageRules';

/**
 * VEDIC ASPECTS (Drishti)
 * -----------------------
 * Every graha casts its 7th aspect. Special aspects:
 *   Mars 4th & 8th, Jupiter 5th & 9th, Saturn 3rd & 10th.
 * Rahu/Ketu convention is configurable (marriageRules.NODE_ASPECT_CONVENTION)
 * because traditions differ; default 'none'.
 */
export function aspectsFrom(
  planet: PlanetKey,
  fromHouse: number,
): AspectHit[] {
  const hits: AspectHit[] = [];
  if (planet === 'Rahu' || planet === 'Ketu') {
    if (NODE_ASPECT_CONVENTION === 'none') return hits;
    const conv = NODE_ASPECT_CONVENTION === 'jupiterLike' ? [5, 7, 9] : [3, 7, 10];
    for (const off of conv) {
      hits.push({
        fromPlanet: planet,
        fromHouse,
        toHouse: ((fromHouse - 1 + off - 1) % 12) + 1,
        kind: (off === 5 ? 'fifth' : off === 9 ? 'ninth' : off === 3 ? 'third' : 'seventh') as AspectHit['kind'],
      });
    }
    return hits;
  }
  const offsets: { off: number; kind: AspectHit['kind'] }[] = [{ off: 7, kind: 'seventh' }];
  if (planet === 'Mars') offsets.push({ off: 4, kind: 'fourth' }, { off: 8, kind: 'eighth' });
  if (planet === 'Jupiter') offsets.push({ off: 5, kind: 'fifth' }, { off: 9, kind: 'ninth' });
  if (planet === 'Saturn') offsets.push({ off: 3, kind: 'third' }, { off: 10, kind: 'tenth' });
  for (const { off, kind } of offsets) {
    hits.push({
      fromPlanet: planet,
      fromHouse,
      toHouse: ((fromHouse - 1 + off - 1) % 12) + 1,
      kind,
    });
  }
  return hits;
}

/** All aspect hits landing on a given house number. */
export function aspectsOnHouse(
  placements: { planet: PlanetKey; house: number }[],
  house: number,
): AspectHit[] {
  const all = placements.flatMap((p) => aspectsFrom(p.planet, p.house));
  return all.filter((a) => a.toHouse === house);
}

// ---- DIGNITY --------------------------------------------------------------

export function dignityOf(planet: PlanetKey, rashiIndex: number): Dignity {
  if (EXALTATION[planet] === rashiIndex) return 'exalted';
  if (DEBILITATION[planet] === rashiIndex) return 'debilitated';
  const lord = SIGN_LORDS[rashiIndex];
  if (lord === planet) {
    return MOOLTRIKONA[planet] === rashiIndex ? 'own' : 'own';
  }
  const rel = FRIENDSHIP[planet];
  if (!rel) return 'neutral';
  if (rel.friends.includes(lord)) return 'friend';
  if (rel.enemies.includes(lord)) return 'enemy';
  // neutral-of-friend / neutral-of-enemy refinements
  if (FRIENDSHIP[lord]?.friends.includes(planet)) return 'greatFriend';
  if (FRIENDSHIP[lord]?.enemies.includes(planet)) return 'greatEnemy';
  return 'neutral';
}

export function isCombust(
  planet: PlanetKey,
  planetSidereal: number,
  sunSidereal: number,
): boolean {
  const orb = COMBUSTION_ORB[planet];
  if (!orb) return false;
  let diff = Math.abs(((planetSidereal - sunSidereal + 540) % 360) - 180);
  diff = 180 - diff; // angular separation
  return diff <= orb;
}
