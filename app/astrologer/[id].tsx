import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ASTROLOGERS } from '@/constants/astrologers';

const ACCENT = '#B09C66';

export default function AstrologerPortfolioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const astro = ASTROLOGERS.find((a) => a.id === id);

  const paidCall = () => {
    Alert.alert('Paid Call', 'This is a paid consultation. Pay ₹100/min to continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Pay & Call',
        onPress: () => {
          const digits = (astro?.mobile ?? '').replace(/[^0-9]/g, '');
          Linking.openURL(`tel:${digits}`);
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}>
          <View style={styles.hero}>
            <Image source={{ uri: astro?.avatar }} style={styles.heroAvatar} />
            <ThemedText style={styles.name}>{astro?.name}</ThemedText>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <ThemedText style={styles.rating}>{astro?.rating} Rating</ThemedText>
            </View>
            <ThemedText style={styles.specialty}>{astro?.specialty}</ThemedText>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={16} color={ACCENT} />
                <ThemedText style={styles.metaText}>{astro?.location}</ThemedText>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="briefcase" size={16} color={ACCENT} />
                <ThemedText style={styles.metaText}>{astro?.experience}</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>About</ThemedText>
            <ThemedText style={styles.bio}>{astro?.bio}</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Services</ThemedText>
            <View style={styles.chips}>
              {astro?.specialty.split(', ').map((s) => (
                <View key={s} style={styles.chip}>
                  <ThemedText style={styles.chipText}>{s}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={[styles.btn, styles.chatBtn]}
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: astro?.id ?? '' } })}>
            <Ionicons name="chatbubble" size={20} color="#ffffff" />
            <ThemedText style={styles.btnText}>Chat</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.callBtn]} onPress={paidCall}>
            <Ionicons name="call" size={20} color="#ffffff" />
            <ThemedText style={styles.btnText}>Call</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0', marginLeft: 4 },
  content: { padding: 16 },
  hero: { alignItems: 'center', paddingVertical: 16 },
  heroAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1D1D1C',
    borderWidth: 3,
    borderColor: ACCENT,
  },
  name: { fontSize: 22, fontWeight: 'bold', color: '#EEEDE0', marginTop: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 14, color: '#7E7E78' },
  specialty: { fontSize: 14, color: ACCENT, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: 20, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, color: '#7E7E78' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#EEEDE0', marginBottom: 8 },
  bio: { fontSize: 14, color: '#7E7E78', lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#292723',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipText: { fontSize: 13, color: '#EEEDE0' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#1D1D1C',
    borderTopWidth: 1,
    borderTopColor: '#444039',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  chatBtn: { backgroundColor: '#292723' },
  callBtn: { backgroundColor: ACCENT },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
