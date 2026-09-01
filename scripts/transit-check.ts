import { computeAstroReport } from '../lib/pipeline';

const r = computeAstroReport(
  { birthDate: new Date(2003, 4, 24, 16, 0), place: 'Erode' },
  new Date(),
);
for (const t of r.transitToday) {
  if (['Jupiter', 'Saturn', 'Rahu', 'Mercury', 'Moon'].includes(t.planet)) {
    console.log(
      `${t.planet.padEnd(8)} ${t.rashi.padEnd(11)} houseFromRashi=${String(t.houseFromJanmaRashi).padEnd(2)} ${t.retrograde ? 'Rx' : ''}`,
    );
  }
}
