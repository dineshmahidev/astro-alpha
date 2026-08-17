import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { KundliChartData } from '@/components/kundli-chart';

const ACCENT = '#B09C66';

// East Indian (Lahiri/Bengali) chart: 4 columns x 3 rows, spiral layout.
// Row0: 4 3 2 1 | Row1: 5 10 11 12 | Row2: 6 7 8 9
const LAYOUT: Record<number, { col: number; row: number }> = {
  1: { col: 3, row: 0 },
  2: { col: 2, row: 0 },
  3: { col: 1, row: 0 },
  4: { col: 0, row: 0 },
  5: { col: 0, row: 1 },
  6: { col: 0, row: 2 },
  7: { col: 1, row: 2 },
  8: { col: 2, row: 2 },
  9: { col: 3, row: 2 },
  10: { col: 3, row: 1 },
  11: { col: 2, row: 1 },
  12: { col: 1, row: 1 },
};

export function EastIndianChart({ data }: { data: KundliChartData[] }) {
  const map = Object.fromEntries(data.map((d) => [d.n, d]));

  const cells = Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 4 }, (_, col) => {
      const entry = Object.entries(LAYOUT).find(
        ([n, p]) => p.row === row && p.col === col,
      );
      return entry ? Number(entry[0]) : null;
    }),
  );

  return (
    <View style={styles.grid}>
      {cells.map((rowArr, row) =>
        rowArr.map((n, col) => {
          if (!n) return <View key={`${row}-${col}`} style={[styles.cell, styles.emptyCell]} />;
          const d = map[n];
          const isLagna = n === 1;
          return (
            <View
              key={`${row}-${col}`}
              style={[styles.cell, isLagna && { backgroundColor: '#fbe9d8' }]}>
              <View style={styles.cellTop}>
                <ThemedText style={styles.houseNum}>{n}</ThemedText>
                {isLagna && <ThemedText style={styles.lagnaTag}>Lg</ThemedText>}
              </View>
              <ThemedText style={styles.sign}>{d?.sign.slice(0, 3)}</ThemedText>
              <ThemedText style={styles.planets}>{d?.planets.join(' ')}</ThemedText>
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
    aspectRatio: 4 / 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1.5,
    borderColor: ACCENT,
  },
  cell: {
    width: '25%',
    height: '33.33%',
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
