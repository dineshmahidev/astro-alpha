import type { ChartSnapshot, DelayAssessment } from './types';

/**
 * DELAY / NEGATIVE INDICATORS
 * ---------------------------
 * Distinguishes delay ≠ difficulty ≠ late marriage ≠ marriage denial.
 * Saturn/Rahu influence alone never means "no marriage".
 */
export function assessDelay(chart: ChartSnapshot): DelayAssessment {
  let pressure = 0;
  const factors: string[] = [];

  const sl = chart.seventhLord;
  if (sl.planet === 'Saturn' || sl.house === 10) {
    pressure += 15;
    factors.push('Saturn-linked 7th lord → deliberate, later but stable marriage');
  }
  if ([6, 8, 12].includes(sl.house)) {
    pressure += 20;
    factors.push(`7th lord in house ${sl.house} — obstacles requiring patience`);
  }
  const harshOn7 = chart.aspectsOnSeventhHouseSign.filter((a) =>
    ['Saturn', 'Mars', 'Rahu', 'Ketu'].includes(a.fromPlanet),
  );
  pressure += harshOn7.length * 8;
  if (harshOn7.length)
    factors.push(`7th house under ${harshOn7.map((a) => a.fromPlanet).join('/')} aspect`);

  if (chart.venus.combust) {
    pressure += 10;
    factors.push('Venus combust — relationship idealism tested');
  }
  if (chart.venus.retrograde || sl.retrograde) {
    pressure += 6;
    factors.push('Venus/7th-lord retrograde — on-off phases before settling');
  }
  if (chart.seventhHouse.planets.includes('Ketu')) {
    pressure += 12;
    factors.push('Ketu in 7th — detachment phase in partnerships');
  }

  // classification
  pressure = Math.min(100, pressure);
  let category: DelayAssessment['category'] = 'no-significant-delay';
  if (pressure >= 55 && harshOn7.some((a) => a.fromPlanet === 'Rahu') && chart.venus.combust)
    category = 'relationship-instability';
  else if (pressure >= 60 && sl.dignity === 'debilitated') category = 'difficulty';
  else if (pressure >= 50) category = 'delay';
  else if (pressure >= 30) category = 'late-marriage';
  return { category, score: pressure, factors };
}
