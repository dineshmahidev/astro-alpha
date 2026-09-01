// ─── Marriage Timing Engine ────────────────────────────────────
// Calculates probable marriage month/year based on Dasha + planetary positions
// Uses Venus (marriage karaka), Jupiter (blessings), and 7th house analysis

import { type KundliResult } from './kundli-engine';

export type MarriageTimingResult = {
  probableMonths: { month: string; year: number; confidence: 'High' | 'Medium' | 'Low' }[];
  currentDasha: string;
  venusStatus: string;
  jupiterStatus: string;
  seventhLord: string;
  recommendations: string[];
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const PLANET_NAME_TA: Record<string, string> = {
  'Sun': 'சூரியன்', 'Moon': 'சந்திரன்', 'Mars': 'செவ்வாய்', 'Mercury': 'புதன்',
  'Jupiter': 'குரு', 'Venus': 'சுக்கிரன்', 'Saturn': 'சனி', 'Rahu': 'ராகு', 'Ketu': 'கேது',
};

export function computeMarriageTiming(kundli: KundliResult): MarriageTimingResult {
  const { planets, houses, currentDasha, doshas } = kundli;

  // Find Venus position
  const venus = planets.find(p => p.planet === 'Venus');
  const jupiter = planets.find(p => p.planet === 'Jupiter');
  const saturn = planets.find(p => p.planet === 'Saturn');
  const mars = planets.find(p => p.planet === 'Mars');

  // Find 7th house lord
  const seventhHouse = houses.find(h => h.house === 7);
  const seventhLord = seventhHouse?.lord ?? 'Unknown';

  // Current Dasha analysis
  const mahaDasha = currentDasha.maha.lord;
  const antarDasha = currentDasha.antar.lord;

  // Venus status
  let venusStatus = '';
  if (venus) {
    if (venus.dignity === 'Exalted') venusStatus = 'Venus Exalted — Strong marriage yoga';
    else if (venus.dignity === 'Own') venusStatus = 'Venus in Own sign — Favorable';
    else if (venus.dignity === 'Debilitated') venusStatus = 'Venus Debilitated — Delay possible';
    else venusStatus = 'Venus Neutral — Normal influence';
  }

  // Jupiter status
  let jupiterStatus = '';
  if (jupiter) {
    if (jupiter.dignity === 'Exalted') jupiterStatus = 'Jupiter Exalted — Strong blessings';
    else if (jupiter.dignity === 'Debilitated') jupiterStatus = 'Jupiter Debilitated — May cause delay';
    else jupiterStatus = 'Jupiter in ' + (jupiter.sign || 'neutral sign');
  }

  // Calculate probable marriage window based on dasha
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const probableMonths: MarriageTimingResult['probableMonths'] = [];
  const recommendations: string[] = [];

  // Check doshas for delay factors
  const hasSevvai = doshas.some(d => d.name.includes('Sevvai') && d.status === 'Present');
  const hasSani = doshas.some(d => d.name.includes('Sani') && d.status === 'Present');
  const hasKaalSarpa = doshas.some(d => d.name.includes('Kaal Sarpa') && d.status === 'Present');

  // Base prediction: Venus/Jupiter dasha periods are best for marriage
  const favorablePlanets = ['Venus', 'Jupiter', 'Moon'];

  // Generate predictions for next 24 months
  for (let m = 0; m < 24; m++) {
    const predMonth = (currentMonth + m) % 12;
    const predYear = currentYear + Math.floor((currentMonth + m) / 12);

    // Simulate favorable periods based on Venus/Jupiter cycle
    // Venus antardasha comes every ~20 years, but sub-periods cycle faster
    const monthNum = predMonth + 1;

    // Venus rules Tula (7) and Vrischika (8) - months Oct-Nov
    // Jupiter rules Dhanus (9) and Meena (12) - months Dec-Mar
    // These are more favorable for marriage
    let confidence: 'High' | 'Medium' | 'Low' = 'Low';

    if ((mahaDasha === 'Venus' || antarDasha === 'Venus') &&
        (predMonth >= 9 && predMonth <= 10)) {
      confidence = 'High';
    } else if ((mahaDasha === 'Jupiter' || antarDasha === 'Jupiter') &&
               (predMonth >= 11 || predMonth <= 2)) {
      confidence = 'High';
    } else if (favorablePlanets.includes(antarDasha) && m <= 12) {
      confidence = 'Medium';
    } else if (m <= 6) {
      confidence = 'Medium';
    }

    // Add delay for doshas
    if (hasSevvai || hasSani) {
      if (confidence === 'High') confidence = 'Medium';
      else if (confidence === 'Medium') confidence = 'Low';
    }

    if (confidence !== 'Low') {
      probableMonths.push({
        month: MONTHS[predMonth],
        year: predYear,
        confidence,
      });
    }

    if (probableMonths.length >= 6) break;
  }

  // If no strong predictions, add nearest months
  if (probableMonths.length === 0) {
    for (let m = 3; m <= 18; m += 3) {
      const predMonth = (currentMonth + m) % 12;
      const predYear = currentYear + Math.floor((currentMonth + m) / 12);
      probableMonths.push({
        month: MONTHS[predMonth],
        year: predYear,
        confidence: 'Medium',
      });
    }
  }

  // Recommendations
  if (hasSevvai) {
    recommendations.push('செவ்வாய் தோஷம் உள்ளது — செவ்வாய் ஹோமம் அல்லது விரதம் பரிந்துரைக்கப்படுகிறது');
    recommendations.push('Sevvai Dosham present — Mars remedies recommended');
  }
  if (hasSani) {
    recommendations.push('சனி தோஷம் உள்ளது — சனி பூஜை அல்லது விரதம் பரிந்துரைக்கப்படுகிறது');
    recommendations.push('Sani Dosham present — Saturn remedies recommended');
  }
  if (hasKaalSarpa) {
    recommendations.push('கால சர்ப்ப தோஷம் — ராகு-கேது பூஜை பரிந்துரைக்கப்படுகிறது');
    recommendations.push('Kaal Sarpa Dosham — Rahu-Ketu pooja recommended');
  }
  if (venus?.dignity === 'Debilitated') {
    recommendations.push('சுக்கிரன் நீசம் — சுக்கிர பூஜை அல்லது வெள்ளி தானம் பரிந்துரைக்கப்படுகிறது');
  }
  if (recommendations.length === 0) {
    recommendations.push('ஜாதகம் சாதகமாக உள்ளது — விரைவில் திருமணம் நடக்கலாம்');
    recommendations.push('Chart is favorable — Marriage likely soon');
  }

  return {
    probableMonths: probableMonths.slice(0, 6),
    currentDasha: `${mahaDasha} / ${antarDasha}`,
    venusStatus,
    jupiterStatus,
    seventhLord,
    recommendations,
  };
}

export { PLANET_NAME_TA };
