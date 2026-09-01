import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAstrologers } from '@/hooks/use-astrologers';
import { Avatar } from '@/components/avatar';

const ACCENT = '#B09C66';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const GREEN = '#7BD88F';

export default function AstrologerPortfolioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { astrologers } = useAstrologers();
  const astro = useMemo(() => astrologers.find((a) => a.id === id), [astrologers, id]);

  if (!astro) {
    return (
      <View style={s.screen}>
        <StatusBar style="dark" />
        <SafeAreaView style={s.safe}>
          <Text style={{ textAlign: 'center', marginTop: 60, color: TEXT_MID }}>Astrologer not found</Text>
        </SafeAreaView>
      </View>
    );
  }

  const rating = (4 + Math.random()).toFixed(1);
  const sessions = Math.floor(Math.random() * 800) + 200;
  const exp = Math.floor(Math.random() * 12) + 3;
  const rate = Math.floor(Math.random() * 3 + 1) * 10;

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Portfolio</Text>
            <TouchableOpacity style={s.shareBtn}>
              <Ionicons name="share-outline" size={20} color={TEXT_DARK} />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={s.profileCard}>
            <Avatar uri={astro.avatar ?? ''} name={astro.name} size={80} color={ACCENT} />
            <Text style={s.name}>{astro.name}</Text>
            <Text style={s.spec}>{astro.specialization?.join(', ') ?? 'Vedic Astrology'}</Text>
            <View style={s.onlineRow}>
              <View style={s.onlineDot} />
              <Text style={s.onlineTxt}>Online</Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Ionicons name="star" size={20} color={ACCENT} />
              <Text style={s.statVal}>{rating}</Text>
              <Text style={s.statLabel}>Rating</Text>
            </View>
            <View style={s.statCard}>
              <Ionicons name="chatbubbles" size={20} color={GREEN} />
              <Text style={s.statVal}>{sessions}</Text>
              <Text style={s.statLabel}>Sessions</Text>
            </View>
            <View style={s.statCard}>
              <Ionicons name="briefcase" size={20} color={ACCENT} />
              <Text style={s.statVal}>{exp}yr</Text>
              <Text style={s.statLabel}>Experience</Text>
            </View>
          </View>

          {/* About */}
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>About</Text>
            <Text style={s.aboutTxt}>
              Experienced Vedic astrologer with {exp}+ years of practice specializing in {astro.specialization?.[0] ?? 'Vedic Astrology'}. Known for accurate predictions and practical remedies. Member of the Indian Astrological Society.
            </Text>
          </View>

          {/* Languages */}
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>Languages</Text>
            <View style={s.chipRow}>
              {(astro.languages ?? ['English', 'Hindi', 'Tamil']).map((lang) => (
                <View key={lang} style={s.chip}><Text style={s.chipTxt}>{lang}</Text></View>
              ))}
            </View>
          </View>

          {/* Specializations */}
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>Specializations</Text>
            <View style={s.chipRow}>
              {(astro.specialization ?? ['Vedic']).map((sp) => (
                <View key={sp} style={s.specChip}><Text style={s.specChipTxt}>{sp}</Text></View>
              ))}
            </View>
          </View>

          {/* Reviews */}
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>Reviews</Text>
            {[
              { name: 'Priya S.', text: 'Very accurate reading. Highly recommended!', rating: 5 },
              { name: 'Rahul K.', text: 'Helpful guidance on career decisions.', rating: 4 },
              { name: 'Anita M.', text: 'Patient and insightful. Good remedies.', rating: 5 },
            ].map((r, i) => (
              <View key={i} style={s.reviewCard}>
                <View style={s.reviewHeader}>
                  <Text style={s.reviewName}>{r.name}</Text>
                  <View style={s.reviewStars}>
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Ionicons key={j} name="star" size={12} color={ACCENT} />
                    ))}
                  </View>
                </View>
                <Text style={s.reviewText}>{r.text}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={s.actions}>
            <TouchableOpacity style={s.chatBtn} onPress={() => router.push(`/chat/${astro.id}` as any)}>
              <Ionicons name="chatbubble" size={18} color="#fff" />
              <Text style={s.chatBtnTxt}>Chat — ₹{rate}/min</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.callBtn}>
              <Ionicons name="call" size={18} color={ACCENT} />
              <Text style={s.callBtnTxt}>Call</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },
  shareBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center',
  },

  profileCard: {
    alignItems: 'center', marginHorizontal: 16, backgroundColor: CARD_BG,
    borderRadius: 20, padding: 24, borderWidth: 1, borderColor: BORDER,
  },
  name: { fontSize: 20, fontWeight: 'bold', color: TEXT_DARK, marginTop: 12 },
  spec: { fontSize: 13, color: ACCENT, marginTop: 4 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN },
  onlineTxt: { fontSize: 12, color: GREEN, fontWeight: '500' },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16 },
  statCard: {
    flex: 1, backgroundColor: CARD_BG, borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: BORDER,
  },
  statVal: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },
  statLabel: { fontSize: 10, color: TEXT_MID },

  sectionCard: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: CARD_BG,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: BORDER,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: TEXT_DARK, marginBottom: 8 },
  aboutTxt: { fontSize: 13, color: TEXT_MID, lineHeight: 20 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: BORDER,
  },
  chipTxt: { fontSize: 12, color: TEXT_DARK },
  specChip: {
    backgroundColor: 'rgba(176,156,102,0.1)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: BORDER,
  },
  specChipTxt: { fontSize: 12, color: ACCENT },

  reviewCard: { borderBottomWidth: 1, borderBottomColor: '#E8E8E8', paddingVertical: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewName: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewText: { fontSize: 12, color: TEXT_MID, marginTop: 4, lineHeight: 17 },

  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 20 },
  chatBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16,
  },
  chatBtnTxt: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  callBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: CARD_BG, borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: BORDER,
  },
  callBtnTxt: { fontSize: 14, fontWeight: '600', color: ACCENT },
});
