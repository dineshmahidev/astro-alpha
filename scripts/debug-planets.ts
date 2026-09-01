import { gregorianToJulianDay } from '../lib/astronomy/julian-day';
import { getPlanetLongitudes } from '../lib/astronomy/planetary-positions';
import { lahariAyanamsa } from '../lib/astronomy/sidereal';

// Today
const now = new Date();
const jd = gregorianToJulianDay(now, 5.5);
console.log('now:', now.toISOString(), 'jd:', jd.toFixed(4));
console.log('ayanamsa:', lahariAyanamsa(jd).toFixed(4));
for (const p of getPlanetLongitudes(jd)) {
  if (['Sun', 'Moon', 'Jupiter', 'Saturn', 'Mercury'].includes(p.key)) {
    console.log(
      `${p.key.padEnd(8)} tropical=${p.tropicalLongitude.toFixed(2)} sidereal=${p.siderealLongitude.toFixed(2)} ${p.retrograde ? 'Rx' : ''}`,
    );
  }
}
