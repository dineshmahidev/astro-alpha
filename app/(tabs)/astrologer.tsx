import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ASTROLOGERS } from '@/constants/astrologers';

const ACCENT = '#B09C66';

const CATEGORIES = ['All', 'Kundli', 'Match Making', 'Vedic', 'Vastu', 'Specialist'];

export default function AstrologerScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('All');

  const filtered =
    category === 'All'
      ? ASTROLOGERS
      : ASTROLOGERS.filter((a) => a.specialty.toLowerCase().includes(category.toLowerCase()));

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <ThemedText style={styles.title}>Astrologers</ThemedText>
          <ThemedText style={styles.subtitle}>
            {ASTROLOGERS.length} experts available for consultation
          </ThemedText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.catChip, category === c && styles.catChipActive]}>
                <ThemedText
                  style={[styles.catText, category === c && styles.catTextActive]}>
                  {c}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filtered.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.card}
              onPress={() =>
                router.push({ pathname: '/astrologer/[id]', params: { id: a.id } })
              }>
              <Image source={{ uri: a.avatar }} style={styles.avatar} />
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <ThemedText style={styles.name}>{a.name}</ThemedText>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#FFB800" />
                    <ThemedText style={styles.rating}>{a.rating}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.specialty}>{a.specialty}</ThemedText>
                <ThemedText style={styles.location}>{a.location}</ThemedText>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={() =>
                      router.push({ pathname: '/chat/[id]', params: { id: a.id } })
                    }>
                    <Ionicons name="chatbubble" size={15} color="#ffffff" />
                    <ThemedText style={styles.chatText}>Chat</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() =>
                      router.push({ pathname: '/astrologer/[id]', params: { id: a.id } })
                    }>
                    <Ionicons name="call" size={15} color={ACCENT} />
                    <ThemedText style={styles.callText}>Call</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  content: { paddingBottom: 120 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#EEEDE0', paddingHorizontal: 16 },
  subtitle: {
    fontSize: 13,
    color: '#7E7E78',
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  catRow: { paddingHorizontal: 16, marginBottom: 16 },
  catChip: {
    backgroundColor: '#292723',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: ACCENT },
  catText: { fontSize: 13, color: '#7E7E78' },
  catTextActive: { color: '#ffffff', fontWeight: '600' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1D1D1C',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ACCENT,
  },
  info: { flex: 1, marginLeft: 12 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#EEEDE0' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 13, color: '#7E7E78' },
  specialty: { fontSize: 13, color: '#7E7E78', marginTop: 3 },
  location: { fontSize: 12, color: '#7E7E78', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  chatText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#292723',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: ACCENT,
  },
  callText: { color: ACCENT, fontSize: 13, fontWeight: '600' },
});
