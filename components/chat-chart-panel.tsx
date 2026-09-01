import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getRashiName, getNakshatraName } from '@/constants/i18n';
import { rashiFromSidereal } from '@/lib/astrology/rasi-nakshatra';
import type { AstroReport } from '@/lib/pipeline';

const ACCENT = '#B09C66';

const PLANET_KEYS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

/** Compact birth-chart + dasha summary shown to the astrologer above the chat. */
export function ChatChartPanel({ report, language }: { report: AstroReport; language: 'en' | 'ta' | 'hi' }) {
  const lagnaRashi = report.lagna?.rashiIndex ?? report.moonRashiIndex;
  const rashiName = getRashiName(language, report.moonRashiIndex);
  const nakshatraName = getNakshatraName(language, report.moonNakshatraIndex);
  const todayKey = (() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${dd}`;
  })();
  const currentDasha = report.dasha.mahadashas.find((m) => {
    const s = m.startDate.slice(0, 10);
    const e = m.endDate.slice(0, 10);
    return s <= todayKey && todayKey <= e;
  });

  // South Indian style: place planets in the 4x4 grid by rashi, with lagna marker.
  const grid: (string | null)[] = [null, null, null, null];
  const cellSigns = [
    'Pisces', 'Aries', 'Taurus', 'Gemini',
    'Aquarius', null, null, 'Cancer',
    'Capricorn', null, null, 'Leo',
    'Sagittarius', 'Scorpio', 'Libra', 'Virgo',
  ];

  const planetsByRashi = new Map<number, string[]>();
  for (const p of report.planets) {
    if (!PLANET_KEYS.includes(p.key)) continue;
    const idx = rashiFromSidereal(p.siderealLongitude).rashiIndex;
    const arr = planetsByRashi.get(idx) ?? [];
    arr.push(p.key === 'Rahu' ? 'Ra' : p.key === 'Ketu' ? 'Ke' : p.key.slice(0, 3));
    planetsByRashi.set(idx, arr);
  }

  const lagnaSignName = getRashiName(language, lagnaRashi);
  const cellToSignIndex = (sign: string) =>
    ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].indexOf(sign);

  const isLagnaCell = (sign: string) => sign === lagnaSignName || cellToSignIndex(sign) === lagnaRashi;

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {cellSigns.map((sign, i) => {
          if (!sign) return <View key={i} style={[styles.cell, styles.emptyCell]} />;
          const idx = cellToSignIndex(sign);
          const planets = planetsByRashi.get(idx) ?? [];
          const lagna = isLagnaCell(sign);
          return (
            <View key={i} style={[styles.cell, lagna && styles.lagnaCell]}>
              <View style={styles.cellTop}>
                <ThemedText style={styles.houseNum}>{getRashiName('en', idx)}</ThemedText>
                {lagna && <ThemedText style={styles.lagnaTag}>Lg</ThemedText>}
              </View>
              <ThemedText style={styles.sign}>{sign.slice(0, 4)}</ThemedText>
              <ThemedText style={styles.planets} numberOfLines={2}>
                {planets.join(' ')}
              </ThemedText>
            </View>
          );
        })}
      </View>

      <View style={styles.summary}>
        <View style={styles.sumRow}>
          <ThemedText style={styles.sumLabel}>Rashi</ThemedText>
          <ThemedText style={styles.sumValue}>{rashiName}</ThemedText>
        </View>
        <View style={styles.sumRow}>
          <ThemedText style={styles.sumLabel}>Lagna</ThemedText>
          <ThemedText style={styles.sumValue}>{getRashiName(language, lagnaRashi)}</ThemedText>
        </View>
        <View style={styles.sumRow}>
          <ThemedText style={styles.sumLabel}>Nakshatra</ThemedText>
          <ThemedText style={styles.sumValue}>{nakshatraName} · Pada {report.moonPada}</ThemedText>
        </View>
        <View style={styles.sumRow}>
          <ThemedText style={styles.sumLabel}>Mahadasha</ThemedText>
          <ThemedText style={styles.sumValue}>
            {currentDasha ? `${currentDasha.lord} (till ${currentDasha.endDate.slice(0, 10)})` : '—'}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  grid: {
    width: '100%',
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cell: {
    width: '25%',
    height: '25%',
    borderWidth: 1,
    borderColor: ACCENT,
    padding: 6,
    justifyContent: 'space-between',
  },
  emptyCell: { backgroundColor: 'rgba(255,255,255,0.04)' },
  lagnaCell: { backgroundColor: 'rgba(176,156,102,0.25)' },
  cellTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  houseNum: { fontSize: 10, fontWeight: 'bold', color: '#C9BE98' },
  lagnaTag: { fontSize: 9, color: '#ffffff', fontWeight: 'bold', backgroundColor: ACCENT, borderRadius: 4, paddingHorizontal: 3 },
  sign: { fontSize: 10, color: '#8a8577', textAlign: 'center' },
  planets: { fontSize: 9, fontWeight: '600', color: '#EEEDE0', textAlign: 'center' },
  summary: {
    backgroundColor: '#1D1D1C',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,240,200,0.35)',
  },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sumLabel: { fontSize: 12, color: '#7E7E78' },
  sumValue: { fontSize: 13, fontWeight: '600', color: '#EEEDE0', flexShrink: 1, marginLeft: 12, textAlign: 'right' },
});