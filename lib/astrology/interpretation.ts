import { PlanetKey } from '../astronomy/planetary-positions';
import { Panchanga } from '../astronomy/panchanga';
import { VimshottariResult } from '../astronomy/dasha';
import { TransitPosition } from '../astronomy/transits';
import { Chart } from './chart';

/**
 * INTERPRETATION
 * --------------
 * A deterministic rules/interpretation layer. This module MUST NOT do any
 * astronomical math — it only reads structured data (birthChart + transits +
 * dasha + panchanga) and applies static rules to produce structured output.
 * The rules can be tuned/extended here without touching the calculations.
 */

export type HoroscopeCategory =
  | 'Career'
  | 'Finance'
  | 'Relationship'
  | 'Family'
  | 'Travel'
  | 'General';

export type DailyHoroscope = {
  categories: Record<HoroscopeCategory, string>;
  positiveFactors: string[];
  cautionFactors: string[];
  luckyPeriod: string;
};

type PlanetThemes = Record<PlanetKey, { positive: string; caution: string }>;

const DASHA_THEMES: PlanetThemes = {
  Sun: { positive: 'Confidence, authority and recognition boost your standing.', caution: 'Avoid ego clashes and overworking yourself.' },
  Moon: { positive: 'Emotional clarity helps you connect with family and intuition.', caution: 'Mood swings may cloud decisions; rest well.' },
  Mars: { positive: 'Drive and courage let you tackle tough tasks head-on.', caution: 'Watch out for impatience and conflict.' },
  Mercury: { positive: 'Communication, deals and learning flow smoothly.', caution: 'Misunderstandings possible — double-check details.' },
  Jupiter: { positive: 'Growth, wisdom and good fortune favour expansion.', caution: 'Overindulgence or overpromising could backfire.' },
  Venus: { positive: 'Harmony in relationships and comfort in finances.', caution: 'Lavish spending or romance missteps need care.' },
  Saturn: { positive: 'Discipline and hard work yield lasting results.', caution: 'Delays and fatigue — pace yourself.' },
  Rahu: { positive: 'Ambition and bold moves can bring sudden gains.', caution: 'Confusion or shortcuts may mislead.' },
  Ketu: { positive: 'Detachment brings clarity on what truly matters.', caution: 'Uncertainty or disinterest in routine tasks.' },
};

const TRANSIT_JUPITER_GOOD = [1, 2, 5, 7, 9, 11];
const TRANSIT_SATURN_CAUTION = [8, 12];
const TRANSIT_RAHU_CAUTION = [6, 12];

export function interpretDaily(
  chart: Chart,
  transits: TransitPosition[],
  currentDasha: { mahaLord: PlanetKey; antarLord: PlanetKey },
  panchanga: Panchanga,
): DailyHoroscope {
  const positive: string[] = [];
  const caution: string[] = [];

  const maha = currentDasha.mahaLord;
  const antar = currentDasha.antarLord;
  positive.push(`Active ${maha} Mahadasha with ${antar} Antardasha: ${DASHA_THEMES[maha].positive}`);
  caution.push(`${maha} period: ${DASHA_THEMES[maha].caution}`);

  for (const t of transits) {
    if (t.planet === 'Jupiter') {
      if (TRANSIT_JUPITER_GOOD.includes(t.houseFromJanmaRashi)) {
        positive.push(`Jupiter transits house ${t.houseFromJanmaRashi} from your rashi — expansion and luck.`);
      } else {
        caution.push(`Jupiter in house ${t.houseFromJanmaRashi} from rashi — review major commitments.`);
      }
    }
    if (t.planet === 'Saturn') {
      if (TRANSIT_SATURN_CAUTION.includes(t.houseFromJanmaRashi)) {
        caution.push(`Saturn transits house ${t.houseFromJanmaRashi} — expect some delay, stay disciplined.`);
      } else {
        positive.push(`Saturn transits house ${t.houseFromJanmaRashi} — steady effort brings rewards.`);
      }
    }
    if (t.planet === 'Rahu' && TRANSIT_RAHU_CAUTION.includes(t.houseFromJanmaRashi)) {
      caution.push(`Rahu in house ${t.houseFromJanmaRashi} — avoid shortcuts and unchecked ambition.`);
    }
    if (t.planet === 'Mercury' && t.retrograde) {
      caution.push('Mercury is retrograde — delay contracts and major purchases.');
    }
    if (t.planet === 'Venus' && t.retrograde) {
      caution.push('Venus is retrograde — revisit relationship decisions before acting.');
    }
  }

  if (panchanga.paksha === 'Shukla') {
    positive.push(`Shukla paksha (${panchanga.tithiName}) — waxing Moon favours new beginnings.`);
  } else {
    caution.push(`Krishna paksha (${panchanga.tithiName}) — better to consolidate than start fresh.`);
  }

  const mahaLordThemes: Partial<Record<PlanetKey, HoroscopeCategory>> = {
    Sun: 'Career',
    Moon: 'Family',
    Mars: 'Career',
    Mercury: 'Finance',
    Jupiter: 'Finance',
    Venus: 'Relationship',
    Saturn: 'Career',
    Rahu: 'Finance',
    Ketu: 'General',
  };
  const focus = mahaLordThemes[maha] ?? 'General';

  const categories: Record<HoroscopeCategory, string> = {
    Career:
      focus === 'Career'
        ? `The ${maha} dashas sharpen your professional focus. ${DASHA_THEMES[maha].positive}`
        : `Steady progress at work — ${antar} antardasha supports effort.`,
    Finance:
      focus === 'Finance'
        ? `${DASHA_THEMES[maha].positive} Expect gains from disciplined investments.`
        : 'Keep spending measured; avoid impulsive big purchases.',
    Relationship:
      focus === 'Relationship'
        ? `Venusian harmony is favoured — nurture your bonds today.`
        : 'Listen more, assume less. Small gestures strengthen ties.',
    Family:
      focus === 'Family'
        ? `The Moon favours home and family warmth — spend quality time.`
        : 'Family matters need gentle handling; avoid arguments.',
    Travel:
      transits.find((t) => t.planet === 'Mercury' && t.retrograde)
        ? 'Travel may have hiccups — confirm bookings and plans.'
        : 'Short trips look favourable; plan ahead for long ones.',
    General:
      positive.length > caution.length
        ? 'A broadly positive day — energy is with you.'
        : 'A mixed day — pace yourself and avoid hasty calls.',
  };

  // Lucky period based on vara + paksha
  const lucky = luckyPeriod(panchanga);
  return { categories, positiveFactors: positive, cautionFactors: caution, luckyPeriod: lucky };
}

function luckyPeriod(panchanga: Panchanga): string {
  const morning = '7:00 – 11:00';
  const midday = '11:00 – 14:00';
  const evening = '16:00 – 19:00';
  const jupiterVaras = [3, 6]; // Guruvar, Shanivar
  const venusVaras = [4, 5]; // Shukravar + ... (mapped by index)
  if (panchanga.varaIndex === 3) return midday;
  if (panchanga.varaIndex === 4) return evening;
  if (panchanga.varaIndex === 5) return midday;
  if (jupiterVaras.includes(panchanga.varaIndex)) return morning;
  if (venusVaras.includes(panchanga.varaIndex)) return evening;
  return panchanga.paksha === 'Shukla' ? morning : midday;
}

export function dashaPeriodSummary(dasha: VimshottariResult): string {
  return `Birth Mahadasha: ${dasha.birthMahadasha.lord} (${dasha.balanceYears.toFixed(2)} yrs balance). Mahadasha runs ${dasha.birthMahadasha.startDate} → ${dasha.birthMahadasha.endDate}.`;
}