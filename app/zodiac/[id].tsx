import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getZodiacSign } from '@/constants/zodiac';

const ACCENT = '#B09C66';

const REPORTS = [
  'The stars favor bold action today. Move forward with confidence and your efforts will be rewarded.',
  'A quiet moment of reflection brings clarity. Trust your intuition over external noise.',
  'Communication opens new doors. Speak your truth and listen closely to what returns.',
  'Focus on what energizes you. Let go of distractions and channel your passion into one clear goal.',
  'A promising connection blooms today. Nurture it with honesty and patience.',
  'Your resilience shines. A challenge today turns into tomorrow\'s strength.',
];

export default function ZodiacReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const sign = getZodiacSign(id ?? '');
  const report = REPORTS[Math.floor(Math.random() * REPORTS.length)];

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Today's Report</ThemedText>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <View style={styles.circle}>
              <Image source={sign?.image} style={styles.emoji} />
            </View>
            <ThemedText style={styles.signName}>{sign?.name ?? 'Unknown'}</ThemedText>
            <ThemedText style={styles.date}>Today's Horoscope</ThemedText>
            <ThemedText style={styles.report}>{report}</ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  topHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#EEEDE0', marginLeft: 4 },
  content: { padding: 16 },
  card: {
    backgroundColor: '#1D1D1C',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: { width: 56, height: 56 },
  signName: { fontSize: 24, fontWeight: 'bold', color: '#EEEDE0' },
  date: { fontSize: 14, color: '#7E7E78', marginTop: 4, marginBottom: 16 },
  report: { fontSize: 16, color: '#EEEDE0', lineHeight: 24, textAlign: 'center' },
});
