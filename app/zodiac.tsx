import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ZODIAC_SIGNS } from '@/constants/zodiac';

export default function ZodiacScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Zodiac Signs</ThemedText>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.grid}>
            {ZODIAC_SIGNS.map((s) => (
              <Link key={s.id} href={{ pathname: '/zodiac/[id]', params: { id: s.id } }} asChild>
                <TouchableOpacity style={styles.item}>
                  <Image source={s.image} style={styles.image} />
                  <ThemedText style={styles.name}>{s.name}</ThemedText>
                </TouchableOpacity>
              </Link>
            ))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '30%',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#1D1D1C',
  },
  image: { width: 48, height: 48 },
  name: {
    fontSize: 13,
    color: '#EEEDE0',
  },
});
