/**
 * KUNDLI ENGINE
 * -------------
 * Deterministic birth chart computation reusing existing astronomy modules.
 * Same DOB + TOB + POB always produces identical results.
 *
 * DATA FLOW:
 *   Birth Data → Julian Day → Planetary Longitudes + Ascendant
 *   → Rashi/Nakshatra/Pada per planet → Houses → Dasha → Navamsa
 *   → Doshas → Yogas → Full KundliResult
 */

import { gregorianToJulianDay, julianDayToLocalString } from '../astronomy/julian-day';
import { getPlanetLongitudes, type PlanetKey, type PlanetLongitude } from '../astronomy/planetary-positions';
import { computeAscendant, type Lagna } from '../astronomy/ascendant';
import { computeHouses, type House, SIGN_RULERS } from '../astronomy/houses';
import { computeVimshottari, type VimshottariResult, antardashasFor, type DashaPeriod } from '../astronomy/dasha';
import { computeNavamsaChart, type NavamsaChart, navamsaFromSidereal } from '../astronomy/navamsa';
import { rashiFromSidereal, nakshatraFromSidereal } from './rasi-nakshatra';
import { RASHIS, NAKSHATRAS } from '../../constants/birth';
import { ZODIAC_SIGNS } from '@/constants/zodiac';

// ─── Types ──────────────────────────────────────────────────────

export type KundliInput = {
  name: string;
  date: Date;
  time: Date;
  place: string;
  lat: number;
  lon: number;
  utcOffset: number; // hours
};

export type PlanetDetail = {
  key: PlanetKey;
  symbol: string;
  nameTa: string;
  siderealLongitude: number;
  rashiIndex: number;
  rashi: string;
  rashiTa: string;
  degreeInRashi: number;
  degreeStr: string;
  nakshatraIndex: number;
  nakshatra: string;
  nakshatraTa: string;
  pada: number;
  house: number;
  retrograde: boolean;
  combustion: boolean;
  dignity: string; // Exalted / Own / Friendly / Neutral / Enemy / Debilitated
  dignityTa: string;
};

export type HouseDetail = {
  house: number;
  nameTa: string;
  rashiIndex: number;
  rashi: string;
  rashiTa: string;
  lord: PlanetKey;
  lordTa: string;
  planets: PlanetKey[];
  aspects: string[];
};

export type DashaDetail = {
  lord: PlanetKey;
  lordTa: string;
  symbol: string;
  startDate: string;
  endDate: string;
  years: number;
  isCurrent: boolean;
  isPast: boolean;
  progress: number;
  antardashas: DashaDetail[];
};

export type DoshaDetail = {
  name: string;
  nameTa: string;
  status: 'Clear' | 'Mild' | 'Present' | 'Needs Attention';
  severity: string;
  detail: string;
};

export type KundliResult = {
  input: KundliInput;
  lagna: Lagna;
  planets: PlanetDetail[];
  houses: HouseDetail[];
  navamsa: NavamsaChart;
  dasha: VimshottariResult;
  currentDasha: { maha: DashaPeriod; antar: DashaPeriod };
  pratyantardasha: DashaDetail[];
  doshas: DoshaDetail[];
  yogaCount: number;
};

// ─── Constants ──────────────────────────────────────────────────

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const PLANET_TA: Record<string, string> = {
  Sun: 'சூரியன்', Moon: 'சந்திரன்', Mars: 'செவ்வாய்', Mercury: 'புதன்',
  Jupiter: 'குரு', Venus: 'சுக்கிரன்', Saturn: 'சனி', Rahu: 'ராகு', Ketu: 'கேது',
};

const RASHI_TA = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்',
];

const NAKSHATRA_TA = [
  'அசுவினி', 'பரணி', 'கிருத்திகை', 'ரோகிணி', 'மிருகசீரிடம்', 'திருவாதிரை',
  'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்',
  'அஸ்தம்', 'சித்திரை', 'சுவாதி', 'விசாகம்', 'அனுஷம்', 'கேட்டை',
  'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்',
  'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி',
];

const HOUSE_NAMES_TA = [
  '', 'லக்னம்', 'குடும்பம்', 'பாக்கியம்', 'சுகம்', 'சித்தி',
  'சத்ரு', 'கல்யாணம்', 'ஆயுள்', 'பாக்கியம்', 'தொழில்',
  'லாபம்', 'விரயம்',
];

const LORD_TA: Record<string, string> = {
  Sun: 'சூரியன்', Moon: 'சந்திரன்', Mars: 'செவ்வாய்', Mercury: 'புதன்',
  Jupiter: 'குரு', Venus: 'சுக்கிரன்', Saturn: 'சனி',
};

// Dignity rules: sign -> dignity
const EXALTATION: Record<string, PlanetKey> = { 'Aries': 'Sun', 'Taurus': 'Moon', 'Cancer': 'Jupiter', 'Capricorn': 'Mars', 'Pisces': 'Venus' };
const DEBILITATION: Record<string, PlanetKey> = { 'Libra': 'Sun', 'Scorpio': 'Moon', 'Capricorn': 'Jupiter', 'Cancer': 'Mars', 'Virgo': 'Venus' };
const OWN_SIGNS: Record<PlanetKey, string[]> = {
  Sun: ['Leo'], Moon: ['Cancer'], Mars: ['Aries', 'Scorpio'],
  Mercury: ['Gemini', 'Virgo'], Jupiter: ['Sagittarius', 'Pisces'],
  Venus: ['Taurus', 'Libra'], Saturn: ['Capricorn', 'Aquarius'],
  Rahu: [], Ketu: [],
};

// ─── Helpers ────────────────────────────────────────────────────

function formatDMS(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}° ${m.toString().padStart(2, '0')}'`;
}

function getDignity(planet: PlanetKey, signName: string): { en: string; ta: string } {
  if (OWN_SIGNS[planet]?.includes(signName)) return { en: 'Own Sign', ta: 'சுய ராசி' };
  if (EXALTATION[signName] === planet) return { en: 'Exalted', ta: 'உச்சம்' };
  if (DEBILITATION[signName] === planet) return { en: 'Debilitated', ta: 'நீசம்' };
  return { en: 'Neutral', ta: 'சாதாரணம்' };
}

// ─── Main Engine ────────────────────────────────────────────────

export function computeKundli(input: KundliInput): KundliResult {
  const jd = gregorianToJulianDay(input.date);

  // Combine date + time for astronomical calculations
  const combined = new Date(input.date);
  combined.setHours(input.time.getHours(), input.time.getMinutes(), 0, 0);
  const combinedJd = gregorianToJulianDay(combined);

  // 1. Planetary longitudes (all 9 grahas)
  const planetLongitudes = getPlanetLongitudes(combinedJd);

  // 2. Ascendant / Lagna
  const lagna = computeAscendant(combinedJd, input.lat, input.lon);

  // 3. Houses (equal house system from ascendant)
  const houses = computeHouses({
    siderealAscendant: lagna.siderealAscendant,
    planets: planetLongitudes.map((p) => ({ key: p.key, siderealLongitude: p.siderealLongitude })),
  });

  // 4. Build planet details
  const planets: PlanetDetail[] = planetLongitudes.map((pl) => {
    const r = rashiFromSidereal(pl.siderealLongitude);
    const nak = nakshatraFromSidereal(pl.siderealLongitude);
    const signName = ZODIAC_SIGNS[r.rashiIndex]?.name ?? RASHIS[r.rashiIndex]?.name ?? '';
    const dignity = getDignity(pl.key, signName);

    // Find house
    const house = houses.find((h) => h.rashiIndex === r.rashiIndex);

    // Combustion check (simplified: planet within 10° of Sun)
    const sunLon = planetLongitudes.find((p) => p.key === 'Sun')?.siderealLongitude ?? 0;
    const diff = Math.abs(pl.siderealLongitude - sunLon);
    const angularDiff = Math.min(diff, 360 - diff);
    const combustion = pl.key !== 'Sun' && pl.key !== 'Moon' && angularDiff < 10;

    return {
      key: pl.key,
      symbol: PLANET_SYMBOLS[pl.key],
      nameTa: PLANET_TA[pl.key],
      siderealLongitude: pl.siderealLongitude,
      rashiIndex: r.rashiIndex,
      rashi: signName,
      rashiTa: RASHI_TA[r.rashiIndex],
      degreeInRashi: r.degreeInRashi,
      degreeStr: formatDMS(r.degreeInRashi),
      nakshatraIndex: nak.nakshatraIndex,
      nakshatra: nak.nakshatra,
      nakshatraTa: NAKSHATRA_TA[nak.nakshatraIndex],
      pada: nak.pada,
      house: house?.houseNumber ?? 0,
      retrograde: pl.retrograde,
      combustion,
      dignity: dignity.en,
      dignityTa: dignity.ta,
    };
  });

  // 5. Build house details
  const houseDetails: HouseDetail[] = houses.map((h) => {
    const rashiIdx = h.rashiIndex;
    const planetsInHouse = planets.filter((p) => p.rashiIndex === rashiIdx).map((p) => p.key);

    return {
      house: h.houseNumber,
      nameTa: HOUSE_NAMES_TA[h.houseNumber] || `பாவம் ${h.houseNumber}`,
      rashiIndex: rashiIdx,
      rashi: ZODIAC_SIGNS[rashiIdx]?.name ?? RASHIS[rashiIdx]?.name ?? '',
      rashiTa: RASHI_TA[rashiIdx],
      lord: h.lord,
      lordTa: LORD_TA[h.lord] || h.lord,
      planets: planetsInHouse,
      aspects: [], // aspects calculated on demand
    };
  });

  // 6. Navamsa
  const navamsa = computeNavamsaChart(planetLongitudes, lagna.siderealAscendant);

  // 7. Vimshottari Dasha (uses Moon's sidereal longitude, NOT lagna)
  const moonLon = planetLongitudes.find((p) => p.key === 'Moon')?.siderealLongitude ?? lagna.siderealLongitude;
  const dasha = computeVimshottari(combinedJd, moonLon, input.utcOffset);
  const currentDasha = computeCurrentDasha(dasha);

  // 8. Doshas
  const doshas = computeDoshas(planets, houses, lagna);

  // 9. Pratyantardasha (3rd level) within current antardasha
  const pratyantardasha = computePratyantardasha(currentDasha.antar, combinedJd);

  return {
    input,
    lagna,
    planets,
    houses: houseDetails,
    navamsa,
    dasha,
    currentDasha,
    pratyantardasha,
    doshas,
    yogaCount: 0,
  };
}

function computeCurrentDasha(dasha: VimshottariResult): { maha: DashaPeriod; antar: DashaPeriod } {
  const now = Date.now();
  // Find current mahadasha
  const maha = dasha.mahadashas.find((m) => {
    const start = new Date(m.startDate).getTime();
    const end = new Date(m.endDate).getTime();
    return now >= start && now < end;
  }) ?? dasha.birthMahadasha;

  // Find current antardasha within mahadasha
  const antars = antardashasFor(maha);
  const antar = antars.find((a) => {
    const start = new Date(a.startDate).getTime();
    const end = new Date(a.endDate).getTime();
    return now >= start && now < end;
  }) ?? antars[0];

  return { maha, antar };
}

function computePratyantardasha(antar: DashaPeriod, currentJd: number): DashaDetail[] {
  const DASHA_YEARS: Record<string, number> = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
    Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
  };
  const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const YEARS_TO_DAYS = 365.25;
  const startIdx = DASHA_ORDER.indexOf(antar.lord);
  if (startIdx === -1) return [];

  const result: DashaDetail[] = [];
  let cursor = antar.startJd;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9] as PlanetKey;
    const years = (antar.years * (DASHA_YEARS[lord] ?? 16)) / 120;
    const endJd = cursor + years * YEARS_TO_DAYS;
    const isCurrent = currentJd >= cursor && currentJd < endJd;
    const isPast = currentJd >= endJd;
    const progress = isCurrent ? ((currentJd - cursor) / (endJd - cursor)) * 100 : isPast ? 100 : 0;
    result.push({
      lord,
      lordTa: PLANET_TA[lord] ?? lord,
      symbol: PLANET_SYMBOLS[lord] ?? lord,
      startDate: julianDayToLocalString(cursor, 5.5),
      endDate: julianDayToLocalString(endJd, 5.5),
      years,
      isCurrent,
      isPast,
      progress,
      antardashas: [],
    });
    cursor = endJd;
  }
  return result;
}

function computeDoshas(planets: PlanetDetail[], houses: HouseDetail[], lagna: Lagna): DoshaDetail[] {
  const doshas: DoshaDetail[] = [];

  // 1. Sevvai Dosham (Manglik)
  const mars = planets.find((p) => p.key === 'Mars');
  const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12];
  const marsInDosha = mars && MANGAL_HOUSES.includes(mars.house);
  const marsOwnSign = mars && ['Aries', 'Scorpio'].includes(mars.rashi);
  const jupiter = planets.find((p) => p.key === 'Jupiter');
  const jupiterAspectMars = jupiter && mars && Math.abs(jupiter.house - mars.house) <= 2;

  let sevvaiStatus: DoshaDetail['status'] = 'Clear';
  let sevvaiDetail = 'Mars not in dosha houses';
  if (marsInDosha && !marsOwnSign && !jupiterAspectMars) {
    sevvaiStatus = [1, 7, 8, 12].includes(mars!.house) ? 'Needs Attention' : 'Mild';
    sevvaiDetail = `Mars in house ${mars!.house} — ${mars!.rashiTa}`;
  } else if (marsInDosha && (marsOwnSign || jupiterAspectMars)) {
    sevvaiStatus = 'Mild';
    sevvaiDetail = `Mars in house ${mars!.house} but cancelled`;
  }
  doshas.push({ name: 'Sevvai Dosham', nameTa: 'செவ்வாய் தோஷம்', status: sevvaiStatus, severity: marsOwnSign ? 'Cancelled' : marsInDosha ? 'Moderate' : 'None', detail: sevvaiDetail });

  // 2. Sani Dosham
  const saturn = planets.find((p) => p.key === 'Saturn');
  const saturnDosha = saturn && [1, 7, 8, 12].includes(saturn.house);
  doshas.push({
    name: 'Sani Dosham', nameTa: 'சனி தோஷம்',
    status: saturnDosha ? 'Present' : 'Clear',
    severity: saturnDosha ? 'Moderate' : 'None',
    detail: saturnDosha ? `Saturn in house ${saturn.house} — ${saturn.rashiTa}` : 'Saturn not in dosha houses',
  });

  // 3. Kaal Sarpa
  const rahu = planets.find((p) => p.key === 'Rahu');
  const ketu = planets.find((p) => p.key === 'Ketu');
  if (rahu && ketu) {
    const visiblePlanets = planets.filter((p) => !['Rahu', 'Ketu'].includes(p.key));
    const rahuIdx = rahu.rashiIndex;
    const ketuIdx = ketu.rashiIndex;
    let allBetween = true;
    for (const p of visiblePlanets) {
      if (rahuIdx < ketuIdx) {
        if (p.rashiIndex <= rahuIdx || p.rashiIndex >= ketuIdx) allBetween = false;
      } else {
        if (p.rashiIndex <= rahuIdx && p.rashiIndex >= ketuIdx) allBetween = false;
      }
    }
    doshas.push({
      name: 'Kaal Sarpa', nameTa: 'கால சர்ப்ப தோஷம்',
      status: allBetween ? 'Present' : 'Clear',
      severity: allBetween ? 'Full' : 'None',
      detail: allBetween ? 'All planets between Rahu-Ketu axis' : 'No Kaal Sarpa formation',
    });
  }

  // 4. Puthra Dosham
  const jupiterDebilitated = jupiter?.dignity === 'Debilitated';
  const fifthHouse = houses.find((h) => h.house === 5);
  const fifthAfflicted = fifthHouse?.planets.some((p) => ['Saturn', 'Rahu', 'Ketu'].includes(p));
  doshas.push({
    name: 'Puthra Dosham', nameTa: 'புத்ர தோஷம்',
    status: jupiterDebilitated || fifthAfflicted ? 'Present' : 'Clear',
    severity: jupiterDebilitated ? 'Strong' : fifthAfflicted ? 'Moderate' : 'None',
    detail: jupiterDebilitated ? 'Jupiter debilitated — progeny delays' : fifthAfflicted ? '5th house afflicted' : '5th house and Jupiter strong',
  });

  // 5. Rajju
  const moon = planets.find((p) => p.key === 'Moon');
  doshas.push({
    name: 'Rajju Dosham', nameTa: 'ரஜ்ஜு தோஷம்',
    status: 'Clear', severity: 'Info',
    detail: `Moon Nakshatra: ${moon?.nakshatraTa ?? ''} (Pada ${moon?.pada ?? 0})`,
  });

  return doshas;
}
