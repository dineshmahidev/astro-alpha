import { gregorianToJulianDay } from '../lib/astronomy/julian-day';
import { sunLongitude } from '../lib/astronomy/sun';
import { atan2D, cosD, normalize360, sinD } from '../lib/astronomy/angles';

const JUP = {
  N0: 100.4542, N1: 2.76854e-5,
  i0: 1.303, i1: -1.557e-7,
  w0: 273.8777, w1: 1.64505e-5,
  a: 5.20256,
  e0: 0.048498, e1: 4.469e-9,
  L0: 19.895, L1: 0.0830853001,
};

const jd = gregorianToJulianDay(new Date(), 5.5);
const d = jd - 2451543.5;
const N = JUP.N0 + JUP.N1 * d;
const i = JUP.i0 + JUP.i1 * d;
const w = JUP.w0 + JUP.w1 * d;
const e = JUP.e0 + JUP.e1 * d;
const M = normalize360(JUP.L0 + JUP.L1 * d);

let E = M;
for (let k = 0; k < 12; k++) {
  const dE = (M - (E - e * sinD(E))) / (1 - e * cosD(E));
  E += dE;
  if (Math.abs(dE) < 1e-9) break;
}
const v = 2 * Math.atan2(Math.sqrt(1 + e) * sinD(E / 2), Math.sqrt(1 - e) * cosD(E / 2));
const r = JUP.a * (1 - e * cosD(E));
const u = v + w;
console.log({ d, N, i, w, e, M, E, v, u, r });
const xh = r * (cosD(N) * cosD(u) - sinD(N) * sinD(u) * cosD(i));
const yh = r * (sinD(N) * cosD(u) + cosD(N) * sinD(u) * cosD(i));
const lonecl = normalize360(atan2D(yh, xh));
console.log('Jupiter heliocentric:', lonecl.toFixed(2));

const earthLon = normalize360(sunLongitude(jd) + 180);
console.log('Earth helio:', earthLon.toFixed(2));
const ex = cosD(earthLon), ey = sinD(earthLon);
const xg = xh - ex, yg = yh - ey;
console.log('Jupiter GEOCENTIC tropical:', normalize360(atan2D(yg, xg)).toFixed(2));
