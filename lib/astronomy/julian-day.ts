/**
 * Gregorian date (JS Date whose LOCAL fields hold birth wall-clock time)
 * -> Julian Day in UT.
 *
 * The app stores birth date/time as Indian wall-clock (all birth places are
 * Indian cities). Astronomical algorithms require UT, so the IST offset
 * (UTC+05:30) is subtracted here. A US/UK user would pass their own offset.
 */
export function gregorianToJulianDay(date: Date, utcOffsetHours = 5.5): number {
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  const localHours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const utcHours = localHours - utcOffsetHours;
  let day = date.getDate() + utcHours / 24;
  if (day < 1) {
    const prev = new Date(y, m - 1, 0);
    day += prev.getDate();
    m -= 1;
    if (m <= 0) {
      m += 12;
      y -= 1;
    }
  }
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jdn = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  return jdn;
}

/** Julian Day -> JS Date (in UTC). Inverse of gregorianToJulianDay with offset 0. */
export function julianDayToDate(jd: number): Date {
  let a = Math.floor(jd + 0.5);
  const frac = jd + 0.5 - a;
  if (a >= 2299161) {
    const alpha = Math.floor((a - 1867216.25) / 36524.25);
    a = a + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e) + frac;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  const dayFloor = Math.floor(day);
  const hours = Math.floor((day - dayFloor) * 24);
  const minutes = Math.floor(((day - dayFloor) * 24 - hours) * 60);
  const seconds = Math.floor((((day - dayFloor) * 24 - hours) * 60 - minutes) * 60);
  return new Date(Date.UTC(year, month - 1, dayFloor, hours, minutes, seconds));
}

/** Format a JD as local wall-clock for a given UTC offset (e.g. 5.5 for IST). */
export function julianDayToLocalString(jd: number, utcOffsetHours = 5.5): string {
  const date = julianDayToDate(jd + utcOffsetHours / 24);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

/** Number of whole days between two Julian days (floor). */
export function daysBetween(jd1: number, jd2: number): number {
  return Math.floor(jd2) - Math.floor(jd1);
}