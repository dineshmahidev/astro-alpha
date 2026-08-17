import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ZODIAC_SIGNS } from '@/constants/zodiac';

const ACCENT = '#B09C66';

const REPORTS = [
  'The stars favor bold action today. Move forward with confidence and your efforts will be rewarded.',
  'A quiet moment of reflection brings clarity. Trust your intuition over external noise.',
  'Communication opens new doors. Speak your truth and listen closely to what returns.',
  'Focus on what energizes you. Let go of distractions and channel your passion into one clear goal.',
  'A promising connection blooms today. Nurture it with honesty and patience.',
  'Your resilience shines. A challenge today turns into tomorrow\'s strength.',
];

const todayLabel = (() => {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
})();

export default function HoroscopeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  const pick = (id: string) => {
    setSelected(id);
    setReport(REPORTS[Math.floor(Math.random() * REPORTS.length)]);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <ThemedText style={styles.title}>Daily Horoscope</ThemedText>
            <ThemedText style={styles.dateText}>
              {todayLabel}
            </ThemedText>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Image source={ZODIAC_SIGNS[4].image} style={styles.heroImage} />
              <ThemedText style={styles.heroSign}>Sun in Leo</ThemedText>
              <ThemedText style={styles.heroUser}>Your Rashi</ThemedText>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroRight}>
              <View style={styles.heroTitleRow}>
                <Ionicons name="sunny" size={18} color={ACCENT} />
                <ThemedText style={styles.heroTitle}>Today's Horoscope</ThemedText>
              </View>
              <ThemedText style={styles.heroText}>
                A day of confident energy. Bold moves pay off and recognition comes your way.
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.hint}>Select your zodiac sign</ThemedText>
          <View style={styles.grid}>
            {ZODIAC_SIGNS.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.item, selected === s.id && styles.itemActive]}
                onPress={() => pick(s.id)}>
                <Image source={s.image} style={styles.image} />
                <ThemedText
                  style={[styles.name, selected === s.id && styles.nameActive]}>
                  {s.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          {report && (
            <View style={styles.reportCard}>
              <ThemedText style={styles.reportTitle}>
                {ZODIAC_SIGNS.find((s) => s.id === selected)?.name} Today
              </ThemedText>
              <ThemedText style={styles.reportText}>{report}</ThemedText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  backBtn: { padding: 8 },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#EEEDE0' },
  dateText: { fontSize: 12, color: '#7E7E78', marginTop: 1 },
  content: { padding: 16 },
  heroCard: {
    backgroundColor: ACCENT,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLeft: { alignItems: 'center', width: 100 },
  heroImage: { width: 64, height: 64 },
  heroSign: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginTop: 6 },
  heroUser: { color: '#ffe9d4', fontSize: 11, marginTop: 2 },
  heroDivider: { width: 1, height: 84, backgroundColor: '#ffd9b8', marginHorizontal: 14 },
  heroRight: { flex: 1 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroTitle: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  heroText: { color: '#fff6ed', fontSize: 13, lineHeight: 19, marginTop: 6 },
  hint: { fontSize: 14, color: '#7E7E78', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  item: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#1D1D1C',
  },
  itemActive: { backgroundColor: ACCENT },
  image: { width: 44, height: 44 },
  name: { fontSize: 12, color: '#EEEDE0', marginTop: 4 },
  nameActive: { color: '#ffffff' },
  reportCard: {
    backgroundColor: '#1D1D1C',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  reportTitle: { fontSize: 16, fontWeight: 'bold', color: '#EEEDE0', marginBottom: 8 },
  reportText: { fontSize: 15, color: '#7E7E78', lineHeight: 23 },
});
