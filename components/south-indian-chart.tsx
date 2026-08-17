import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { KundliChartData } from '@/components/kundli-chart';

const ACCENT = '#B09C66';

const SIGNS_CW = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Fixed sign positions in the South Indian 4x4 grid
const GRID: { sign: string; row: number; col: number }[] = [
  { sign: 'Pisces', row: 0, col: 0 },
  { sign: 'Aries', row: 0, col: 1 },
  { sign: 'Taurus', row: 0, col: 2 },
  { sign: 'Gemini', row: 0, col: 3 },
  { sign: 'Aquarius', row: 1, col: 0 },
  { sign: 'Cancer', row: 1, col: 3 },
  { sign: 'Capricorn', row: 2, col: 0 },
  { sign: 'Leo', row: 2, col: 3 },
  { sign: 'Sagittarius', row: 3, col: 0 },
  { sign: 'Scorpio', row: 3, col: 1 },
  { sign: 'Libra', row: 3, col: 2 },
  { sign: 'Virgo', row: 3, col: 3 },
];

export function SouthIndianChart({ data }: { data: KundliChartData[] }) {
  const signOf = Object.fromEntries(data.map((d) => [d.sign, d]));
  const planetsOf = (sign: string) => signOf[sign]?.planets ?? [];
  const lagnaSign = data.find((d) => d.n === 1)?.sign ?? 'Leo';
  const lagnaIdx = SIGNS_CW.indexOf(lagnaSign);
  const houseOf = (sign: string) =>
    ((SIGNS_CW.indexOf(sign) - lagnaIdx + 12) % 12) + 1;

  const cells = Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 4 }, (_, col) => {
      const g = GRID.find((x) => x.row === row && x.col === col);
      return g ? g.sign : null;
    }),
  );

  return (
    <View style={styles.grid}>
      {cells.map((rowArr, row) =>
        rowArr.map((sign, col) => {
          if (!sign) {
            return <View key={`${row}-${col}`} style={[styles.cell, styles.emptyCell]} />;
          }
          const isLagna = sign === lagnaSign;
          const planets = planetsOf(sign);
          return (
            <View
              key={`${row}-${col}`}
              style={[styles.cell, isLagna && { backgroundColor: '#fbe9d8' }]}>
              <View style={styles.cellTop}>
                <ThemedText style={styles.houseNum}>{houseOf(sign)}</ThemedText>
                {isLagna && <ThemedText style={styles.lagnaTag}>Lg</ThemedText>}
              </View>
              <ThemedText style={styles.sign}>{sign.slice(0, 3)}</ThemedText>
              <ThemedText style={styles.planets}>
                {planets.join(' ')}
              </ThemedText>
            </View>
          );
        }),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1.5,
    borderColor: ACCENT,
  },
  cell: {
    width: '25%',
    height: '25%',
    borderWidth: 1,
    borderColor: ACCENT,
    padding: 6,
    justifyContent: 'space-between',
  },
  emptyCell: { backgroundColor: '#faf7f2' },
  cellTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  houseNum: { fontSize: 12, fontWeight: 'bold', color: '#000000' },
  lagnaTag: { fontSize: 10, color: ACCENT, fontWeight: 'bold' },
  sign: { fontSize: 12, color: '#555555', textAlign: 'center' },
  planets: { fontSize: 11, fontWeight: '600', color: '#333333', textAlign: 'center' },
});
