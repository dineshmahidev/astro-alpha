import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { gregorianToJulianDay } from '../lib/astronomy/julian-day';
import { computeVimshottari } from '../lib/astronomy/dasha';
import { moonLongitude } from '../lib/astronomy/moon';
import { lahariAyanamsa } from '../lib/astronomy/sidereal';
import { nakshatraFromSidereal, rashiFromSidereal } from '../lib/astrology/rasi-nakshatra';

const PLACE_COORDS: Record<string, { latitude: number; longitude: number }> = {
  'Erode': { latitude: 11.3410, longitude: 77.7172 },
  'Chennai': { latitude: 13.0827, longitude: 80.2707 },
  'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
  'Delhi': { latitude: 28.6139, longitude: 77.2090 },
  'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
  'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
  'Kolkata': { latitude: 22.5726, longitude: 88.3639 },
  'Pune': { latitude: 18.5204, longitude: 73.8567 },
};

function resolveCoords(place: string): { latitude: number; longitude: number } {
  const normalized = place.charAt(0).toUpperCase() + place.slice(1).toLowerCase();
  if (PLACE_COORDS[normalized]) return PLACE_COORDS[normalized];
  // Default Chennai
  return { latitude: 13.0827, longitude: 80.2707 };
}

/**
 * COMPARE AGAINST HOSURONLINE.COM (reference implementation)
 * ----------------------------------------------------------
 * Posts a birth date/time/place to https://horoscope.hosuronline.com/horoscope.php
 * (the English "Birth Chart / Kundali / Jathakam" form), scrapes the rashi,
 * nakshatra and dasha dates from the returned HTML, and compares them with our
 * local engine.
 *
 * Usage: npx tsx scripts/compare-hosuronline.ts "Monster" 24 5 2003 16 0 "Erode"
 *
 * Note: requires curl.exe and an internet connection. Timeout is generous
 * because the reference site is slow.
 */

type Args = {
  name: string;
  day: number;
  month: number;
  year: number;
  hour: number; // 1-12
  minute: number;
  isPM: boolean;
  place: string;
};

function parseArgs(argv: string[]): Args | null {
  if (argv.length < 8) return null;
  const isPM = argv[6] === 'PM' || argv[6].toLowerCase() === 'pm' || argv[6] === '1';
  const hour12 = Number(argv[4]);
  if (Number.isNaN(hour12) || hour12 < 1 || hour12 > 12) return null;
  return {
    name: argv[0],
    day: Number(argv[1]),
    month: Number(argv[2]),
    year: Number(argv[3]),
    hour: hour12,
    minute: Number(argv[5]),
    isPM,
    place: argv[7] ?? 'Erode',
  };
}

function scrape(html: string): { rashi?: string; nakshatra?: string; dashaDates?: string[] } {
  const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  const rashiMatch = text.match(/Your birth rashi predictions:\s*([A-Za-z]+)/i);
  const nakMatch = text.match(/Your birth star predictions:\s*([A-Za-z]+)/i);
  const dashaDates = Array.from(text.matchAll(/(\d{2})-(\d{2})-(\d{4})/g)).map((m) => m[0]);
  return {
    rashi: rashiMatch?.[1],
    nakshatra: nakMatch?.[1],
    dashaDates,
  };
}

async function fetchSite(a: Args): Promise<string> {
  const tmp = join(tmpdir(), 'compare_jh');
  rmSync(tmp, { recursive: true, force: true });
  const cookie = `${tmp}_cookies.txt`;
  const form = `${tmp}_form.html`;

  const hour24 = a.isPM ? (a.hour % 12) + 12 : a.hour % 12;

  // GET the form first (cookie + referer)
  execSync(`curl.exe -s -c "${cookie}" -o "${form}" -L "https://horoscope.hosuronline.com/horoscope.php"`, { stdio: 'pipe' });

  const { latitude, longitude } = resolveCoords(a.place);
  const lonDeg = Math.floor(Math.abs(longitude));
  const lonMin = Math.round((Math.abs(longitude) - lonDeg) * 60);
  const latDeg = Math.floor(Math.abs(latitude));
  const latMin = Math.round((Math.abs(latitude) - latDeg) * 60);

  const args = [
    'name=' + a.name,
    'day=' + a.day,
    'month=' + a.month,
    'year=' + a.year,
    'hour=' + (hour24 === 0 ? 12 : hour24 % 12 || 12),
    'minute=' + a.minute,
    'AMPM=' + (a.isPM ? 1 : 0),
    'birthcity=' + a.place,
    'timezone=5.30',
    'long_deg=' + lonDeg,
    'ew=1',
    'long_min=' + lonMin,
    'lat_deg=' + latDeg,
    'ns=1',
    'lat_min=' + latMin,
    'ChartStyle=southEnglish',
    'submitted=TRUE',
  ];
  const data = args.join('&');
  const result = `${tmp}_result.html`;
  execSync(
    `curl.exe -s -b "${cookie}" -c "${cookie}" -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0" -e "https://horoscope.hosuronline.com/horoscope.php" -X POST "https://horoscope.hosuronline.com/horoscope.php" --data "${data}" -o "${result}"`,
    { stdio: 'pipe' },
  );
  return readFileSync(result, 'utf-8');
}

function runLocal(a: Args) {
  const utc = 5.5;
  const date = new Date(a.year, a.month - 1, a.day, a.hour % 12 + (a.isPM ? 12 : 0), a.minute, 0);
  const jd = gregorianToJulianDay(date, utc);
  const moon = moonLongitude(jd);
  const aya = lahariAyanamsa(jd);
  const sid = ((moon - aya) % 360 + 360) % 360;
  const rashi = rashiFromSidereal(sid);
  const nak = nakshatraFromSidereal(sid);
  const dasha = computeVimshottari(jd, sid, utc);
  return {
    rashi: rashi.rashi,
    nakshatra: nak.nakshatra,
    balanceYears: dasha.balanceYears,
    birthLord: dasha.birthNakshatraLord,
    saturnStart: dasha.mahadashas.find((m) => m.lord === 'Saturn')?.startDate,
  };
}

const RASHI_MAP: Record<string, string> = {
  Mesham: 'Mesha', Mesha: 'Mesha', Aries: 'Mesha',
  Rishabam: 'Vrishabha', Rishaba: 'Vrishabha', Taurus: 'Vrishabha',
  Midhunam: 'Mithuna', Mithuna: 'Mithuna', Gemini: 'Mithuna',
  Kadakam: 'Karka', Karkata: 'Karka', Cancer: 'Karka',
  Simmam: 'Simha', Simha: 'Simha', Leo: 'Simha',
  Kanni: 'Kanya', Kanya: 'Kanya', Virgo: 'Kanya',
  Thulam: 'Tula', Tula: 'Tula', Libra: 'Tula',
  Vrischikam: 'Vrishchika', Vrishchika: 'Vrishchika', Scorpio: 'Vrishchika',
  Dhanusu: 'Dhanu', Dhanus: 'Dhanu', Thanush: 'Dhanu', Thanusu: 'Dhanu', Sagittarius: 'Dhanu',
  Makaram: 'Makara', Makara: 'Makara', Capricorn: 'Makara',
  Kumbam: 'Kumbha', Kumba: 'Kumbha', Aquarius: 'Kumbha',
  Meenam: 'Meena', Meena: 'Meena', Pisces: 'Meena',
};

const NAK_MAP: Record<string, string> = {
  Ashwini: 'Ashwini', Aswini: 'Ashwini',
  Bharani: 'Bharani',
  Krithika: 'Krittika', Karthigai: 'Krittika', Karthikai: 'Krittika',
  Rohini: 'Rohini',
  Mirugashirsham: 'Mrigashira', Mrigashira: 'Mrigashira', Mrigasheersham: 'Mrigashira',
  Thiruvadhirai: 'Ardra', Arudra: 'Ardra', Ardra: 'Ardra',
  Punarpoosam: 'Punarvasu', Punarvasu: 'Punarvasu', Punarvasoo: 'Punarvasu',
  Poosam: 'Pushya', Pushya: 'Pushya', Pusya: 'Pushya',
  Ayilyam: 'Ashlesha', Aayilyam: 'Ashlesha', Ashlesha: 'Ashlesha', Aashlesha: 'Ashlesha',
  Makam: 'Magha', Magha: 'Magha',
  Pooram: 'Purva Phalguni', 'Poorva Phalguni': 'Purva Phalguni', 'Purva Phalguni': 'Purva Phalguni',
  Uthiram: 'Uttara Phalguni', 'Uttara Phalguni': 'Uttara Phalguni', Uthiradam: 'Uttara Phalguni',
  Hastham: 'Hasta', Hastha: 'Hasta', Hasta: 'Hasta',
  Chithirai: 'Chitra', Chitra: 'Chitra', Chithra: 'Chitra',
  Swathi: 'Swati', Swati: 'Swati', Swathy: 'Swati',
  Visakam: 'Vishakha', Vishakha: 'Vishakha', Visaka: 'Vishakha',
  Anusham: 'Anuradha', Anuradha: 'Anuradha', Anuradham: 'Anuradha',
  Kettai: 'Jyeshtha', Jyeshtha: 'Jyeshtha', Jyestha: 'Jyeshtha',
  Moolam: 'Mula', Moola: 'Mula', Mula: 'Mula',
  Pooradam: 'Purva Ashadha', 'Purva Ashadha': 'Purva Ashadha',
  Uthradam: 'Uttara Ashadha', 'Uttara Ashadha': 'Uttara Ashadha', Utharadam: 'Uttara Ashadha',
  Thiruvonam: 'Shravana', Shravana: 'Shravana', Sravana: 'Shravana',
  Avittam: 'Dhanishta', Dhanishta: 'Dhanishta', Dhanista: 'Dhanishta',
  Sadayam: 'Shatabhisha', Shatabhisha: 'Shatabhisha', Sadhabisham: 'Shatabhisha', Sathabhisham: 'Shatabhisha',
  Pooratathi: 'Purva Bhadrapada', 'Purva Bhadrapada': 'Purva Bhadrapada', Poorabadrapada: 'Purva Bhadrapada',
  Uthirattathi: 'Uttara Bhadrapada', 'Uttara Bhadrapada': 'Uttara Bhadrapada', Uthirabadrapada: 'Uttara Bhadrapada',
  Revathi: 'Revati', Revati: 'Revati', Revathy: 'Revati',
};

function mapRashi(site: string | undefined): string | undefined {
  if (!site) return undefined;
  const key = site.trim().toLowerCase();
  const direct = RASHI_MAP[key];
  if (direct) return direct;
  let best: { len: number; ours: string } | undefined;
  for (const [tamil, ours] of Object.entries(RASHI_MAP)) {
    const full = tamil.toLowerCase();
    for (const base of [full, full.slice(0, 4)]) {
      if (base.length >= 3 && key.startsWith(base) && (!best || base.length > best.len)) {
        best = { len: base.length, ours };
      }
    }
  }
  return best?.ours;
}

function mapNakshatra(site: string | undefined): string | undefined {
  if (!site) return undefined;
  const key = site.trim().toLowerCase();
  const direct = NAK_MAP[key];
  if (direct) return direct;
  let best: { len: number; ours: string } | undefined;
  for (const [tamil, ours] of Object.entries(NAK_MAP)) {
    const full = tamil.toLowerCase();
    for (const base of [full, full.slice(0, 5), full.slice(0, 4)]) {
      if (base.length >= 3 && key.startsWith(base) && (!best || base.length > best.len)) {
        best = { len: base.length, ours };
      }
    }
  }
  return best?.ours;
}

export { mapRashi, mapNakshatra };

function main() {
  const a = parseArgs(process.argv.slice(2));
  if (!a) {
    console.log('Usage: npx tsx scripts/compare-hosuronline.ts "<name>" <day> <month> <year> <hour12> <minute> [AM|PM] [place]');
    console.log('Example: npx tsx scripts/compare-hosuronline.ts "Monster" 24 5 2003 4 0 PM Erode');
    return;
  }
  const local = runLocal(a);
  console.log('--- Local engine ---');
  console.log('Rashi:', local.rashi);
  console.log('Nakshatra:', local.nakshatra);
  console.log('Birth lord:', local.birthLord, `(balance ${local.balanceYears.toFixed(2)} yr)`);
  console.log('Saturn dasha starts:', local.saturnStart);
  console.log('\nFetching reference site (can take ~10-30s)...');
  fetchSite(a).then((html) => {
    const site = scrape(html);
    console.log('\n--- HosurOnline.com ---');
    console.log('Rashi:', site.rashi);
    console.log('Nakshatra:', site.nakshatra);
    console.log('Dates found:', site.dashaDates?.slice(0, 8).join(', '));
    console.log('\n--- Match ---');
    const rashiMatch = mapRashi(site.rashi) === local.rashi;
    console.log('Rashi match:', rashiMatch, `(${site.rashi} vs ${local.rashi})`);
    const nakMatch = mapNakshatra(site.nakshatra) === local.nakshatra;
    console.log('Nakshatra match:', nakMatch, `(${site.nakshatra} vs ${local.nakshatra})`);
  });
}

main();