import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { computeMarriageReport } from '@/lib/marriage/calculator';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * ASTROLOGY CALCULATION DEBUG
 * ---------------------------
 * Audit screen: shows every intermediate value so any AI narration can be
 * traced back to its calculated source. Uses the bundled test birth data.
 */
export default function AstrologyDebugScreen() {
  const report = useMemo(
    () =>
      computeMarriageReport({
        date: '2003-05-24',
        time: '16:00',
        placeName: 'Erode, Tamil Nadu, India',
        latitude: 11.341,
        longitude: 77.7172,
        timezoneOffsetHours: 5.5,
        timeAccuracy: 'exact',
      }),
    [],
  );

  const Line = ({ k, v }: { k: string; v: string }) => (
    <ThemedText style={styles.line}>
      <ThemedText style={styles.k}>{k}: </ThemedText>
      {v}
    </ThemedText>
  );

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText style={styles.title}>ASTROLOGY CALCULATION DEBUG</ThemedText>

          <Section title="Birth / Epoch">
            <Line k="Birth UTC Julian Day" v={String(report.debug.jdUT)} />
            <Line k="Ayanamsa" v={(report.debug.ayanamsa as number).toFixed(4)} />
            <Line k="Place" v={report.birthData.placeName} />
          </Section>

          <Section title="Lagna & Moon">
            <Line
              k="Lagna"
              v={`${report.chart.lagna.rashiNameEnglish} ${report.chart.lagna.dms.degrees}°${report.chart.lagna.dms.minutes}′ ${report.chart.lagna.nakshatra} P${report.chart.lagna.pada}`}
            />
            <Line k="Moon sidereal" v={report.chart.moon.longitude.toFixed(3)} />
            <Line k="Moon rashi" v={report.chart.moon.rashi} />
            <Line k="Moon nakshatra" v={`${report.chart.moon.nakshatra} pada ${report.chart.moon.pada}`} />
          </Section>

          <Section title="Planets (sidereal | rashi | house)">
            {report.chart.planets.map((p) => (
              <Line
                key={p.planet}
                k={p.planet}
                v={`${p.longitude.toFixed(2)}° ${p.rashi} H${p.house} ${p.nakshatra}-P${p.pada}${p.combust ? ' combust' : ''}${p.retrograde ? ' Rx' : ''}`}
              />
            ))}
          </Section>

          <Section title="Dasha">
            <Line k="Birth star lord" v={report.dasha.birthNakshatraLord} />
            <Line k="Balance at birth" v={`${report.dasha.balanceAtBirthYears} y`} />
            <Line k="Current Maha" v={report.dasha.currentMaha.lord} />
            <Line k="Current Antar" v={report.dasha.currentAntar.lord} />
            <Line k="Current Pratyantar" v={report.dasha.currentPratyantar.lord} />
          </Section>

          <Section title="Marriage score components">
            {Object.entries({
              '7th house': report.marriageIndicators.baseStrength.seventhHouseStrength,
              '7th lord': report.marriageIndicators.baseStrength.seventhLordStrength,
              Venus: report.marriageIndicators.baseStrength.venusSupport,
              '2nd/11th': report.marriageIndicators.baseStrength.secondEleventhSupport,
              '5th house': report.marriageIndicators.baseStrength.fifthHouseSupport,
            }).map(([k, v]) => (
              <Line key={k} k={k} v={String(v)} />
            ))}
          </Section>

          <Section title="Transit scan (yearly scores)">
            {report.marriageWindows.yearlyScores.map((y) => (
              <Line key={y.year} k={String(y.year)} v={String(y.score)} />
            ))}
          </Section>

          <Section title="Primary window">
            <Line
              k="Window"
              v={report.marriageWindows.primary?.label ?? 'none above threshold'}
            />
            <Line k="Score" v={String(report.marriageWindows.primary?.score ?? '-') } />
          </Section>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0', marginBottom: 12 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#B09C66', marginBottom: 6 },
  line: { fontSize: 12, color: '#EEEDE0', lineHeight: 18 },
  k: { color: '#7E7E78' },
});
