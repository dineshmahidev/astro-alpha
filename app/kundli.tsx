import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { KundliChart, KundliChartData } from '@/components/kundli-chart';
import { SouthIndianChart } from '@/components/south-indian-chart';
import { EastIndianChart } from '@/components/east-indian-chart';

const ACCENT = '#B09C66';

const CHART_STYLES = ['North', 'South', 'East'] as const;

const SAMPLE_CHART: KundliChartData[] = [
  { n: 1, sign: 'Leo', planets: ['Lg', 'Su'] },
  { n: 2, sign: 'Virgo', planets: [] },
  { n: 3, sign: 'Libra', planets: ['Me'] },
  { n: 4, sign: 'Scorpio', planets: ['Mo'] },
  { n: 5, sign: 'Sagittarius', planets: ['Ma'] },
  { n: 6, sign: 'Capricorn', planets: [] },
  { n: 7, sign: 'Aquarius', planets: ['Ve'] },
  { n: 8, sign: 'Pisces', planets: ['Sa', 'Ra'] },
  { n: 9, sign: 'Aries', planets: ['Ju'] },
  { n: 10, sign: 'Taurus', planets: [] },
  { n: 11, sign: 'Gemini', planets: [] },
  { n: 12, sign: 'Cancer', planets: ['Ke'] },
];

const DASHA = [
  { planet: 'Sun', years: 6, age: '0 – 6' },
  { planet: 'Moon', years: 10, age: '6 – 16' },
  { planet: 'Mars', years: 7, age: '16 – 23' },
  { planet: 'Rahu', years: 18, age: '23 – 41' },
  { planet: 'Jupiter', years: 16, age: '41 – 57' },
  { planet: 'Saturn', years: 19, age: '57 – 76' },
  { planet: 'Mercury', years: 17, age: '76 – 93' },
  { planet: 'Ketu', years: 7, age: '93 – 100' },
  { planet: 'Venus', years: 20, age: '100 – 120' },
];

const REPORT = [
  'Your Lagna (Ascendant) is Leo, making the Sun your first house lord. You are confident, warm and naturally take on leadership roles.',
  'Moon in the 4th house brings a strong emotional bond with home and family, with a caring and intuitive nature.',
  'Jupiter in the 9th house indicates strong fortune, wisdom and a deep interest in higher learning and spirituality.',
  'Saturn with Rahu in the 8th house suggests deep transformation and a keen interest in research and the hidden sciences.',
];

export default function KundliScreen() {
  const router = useRouter();
  const [style, setStyle] = useState<(typeof CHART_STYLES)[number]>('North');
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Kundli</ThemedText>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.reportCard}>
            <View style={styles.avatarRow}>
              <Ionicons name="person-circle" size={44} color={ACCENT} />
              <View>
                <ThemedText style={styles.name}>Aarav Sharma</ThemedText>
                <ThemedText style={styles.details}>15/08/1996 · 09:45 · Mumbai</ThemedText>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>Lagna</ThemedText>
                <ThemedText style={styles.statValue}>Leo</ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>Moon Sign</ThemedText>
                <ThemedText style={styles.statValue}>Scorpio</ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>Nakshatra</ThemedText>
                <ThemedText style={styles.statValue}>Magha</ThemedText>
              </View>
            </View>
          </View>

          <SectionTitle icon="grid-outline" text="Kundli Chart" />
          <View style={styles.switcher}>
            {CHART_STYLES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.switchBtn, style === s && styles.switchBtnActive]}
                onPress={() => setStyle(s)}>
                <ThemedText
                  style={[styles.switchText, style === s && styles.switchTextActive]}>
                  {s} Indian
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.card}>
            {style === 'North' && <KundliChart data={SAMPLE_CHART} />}
            {style === 'South' && <SouthIndianChart data={SAMPLE_CHART} />}
            {style === 'East' && <EastIndianChart data={SAMPLE_CHART} />}
            <ThemedText style={styles.legend}>
              Lg: Lagna · Su: Sun · Mo: Moon · Ma: Mars · Me: Mercury · Ju: Jupiter · Ve: Venus ·
              Sa: Saturn · Ra: Rahu · Ke: Ketu
            </ThemedText>
          </View>

          <SectionTitle icon="time-outline" text="Mahadasha (Vimshottari)" />
          <View style={styles.card}>
            {DASHA.map((d, i) => (
              <View key={d.planet} style={styles.dashaRow}>
                <View style={styles.dashaLeft}>
                  <View style={styles.dashaDot} />
                  <View>
                    <ThemedText style={styles.dashaPlanet}>{d.planet}</ThemedText>
                    <ThemedText style={styles.dashaAge}>{d.age} years</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.dashaYears}>{d.years} yrs</ThemedText>
              </View>
            ))}
          </View>

          <SectionTitle icon="document-text-outline" text="Kundli Report" />
          <View style={styles.card}>
            {REPORT.map((r, i) => (
              <View key={i} style={styles.reportRow}>
                <Ionicons name="sparkles" size={16} color={ACCENT} />
                <ThemedText style={styles.reportText}>{r}</ThemedText>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function SectionTitle({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={18} color={ACCENT} />
      <ThemedText style={styles.sectionTitle}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#EEEDE0', marginLeft: 4 },
  content: { padding: 16, paddingBottom: 40 },
  reportCard: { backgroundColor: '#1D1D1C', borderRadius: 14, padding: 16, marginBottom: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0' },
  details: { fontSize: 13, color: '#7E7E78', marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#7E7E78' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#EEEDE0', marginTop: 2 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, marginTop: 6 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#EEEDE0' },
  switcher: {
    flexDirection: 'row',
    backgroundColor: '#1D1D1C',
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
  },
  switchBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 9,
  },
  switchBtnActive: { backgroundColor: ACCENT },
  switchText: { fontSize: 13, color: '#7E7E78', fontWeight: '600' },
  switchTextActive: { color: '#ffffff' },
  card: { backgroundColor: '#1D1D1C', borderRadius: 14, padding: 16, marginBottom: 20 },
  legend: { fontSize: 11, color: '#7E7E78', textAlign: 'center', marginTop: 10, lineHeight: 16 },
  dashaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
  },
  dashaLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dashaDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT },
  dashaPlanet: { fontSize: 15, fontWeight: '600', color: '#EEEDE0' },
  dashaAge: { fontSize: 12, color: '#7E7E78', marginTop: 1 },
  dashaYears: { fontSize: 15, fontWeight: 'bold', color: ACCENT },
  reportRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  reportText: { flex: 1, fontSize: 14, color: '#7E7E78', lineHeight: 20 },
});
