import { computeDailyHoroscope } from '../lib/pipeline';

/** Verify today's horoscope calculation against public astrology websites. */
const birthDate = new Date(2003, 4, 24, 16, 0); // 24 May 2003 16:00 IST
const { report, panchanga, horoscope } = computeDailyHoroscope(
  { birthDate, place: 'Erode' },
  new Date(),
);

console.log('=== TODAY HOROSCOPE ENGINE CHECK ===');
console.log('Janma rashi (moon sign):', report.moonRashi);
console.log('Birth nakshatra:', report.moonNakshatra);
console.log('Today tithi:', panchanga.tithiName, '| paksha:', panchanga.paksha);
console.log('Today nakshatra:', panchanga.nakshatra);
console.log('Positive factors:', horoscope.positiveFactors.length ? '' : '');
horoscope.positiveFactors.forEach((f) => console.log('  [+] ' + f));
horoscope.cautionFactors.forEach((f) => console.log('  [!] ' + f));
