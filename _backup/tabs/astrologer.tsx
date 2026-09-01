import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/avatar';
import { useAstrologers } from '@/hooks/use-astrologers';
import { isAstrologer, useAuth } from '@/contexts/auth-context';
import {
  listAstrologerChats,
  listAstrologerPayments,
  getTodayStats,
  type Chat,
  type Payment,
  type DailyStats,
} from '@/lib/chat';

const ACCENT = '#B09C66';
const GOLD = '#97743B';
const GREEN = '#7BD88F';
const CARD_BG = 'rgba(29,29,28,0.7)';
const BORDER = 'rgba(176,156,102,0.35)';

export default function AstrologerScreen() {
  const { role } = useAuth();
  if (isAstrologer(role)) return <AstrologerDashboard />;
  return null;
}

function AstrologerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { astrologers } = useAstrologers();
  const [chats, setChats] = useState<Chat[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStats>({ sessionsToday: 0, revenueToday: 0, minutesToday: 0 });
  const [loading, setLoading] = useState(true);

  const myAstro = useMemo(() =>
    astrologers.find((a) => a.email.toLowerCase() === (user?.email ?? '').toLowerCase()),
    [astrologers, user?.email],
  );

  useEffect(() => {
    if (!myAstro?.id) return;
    let active = true;
    (async () => {
      const [c, p, s] = await Promise.all([
        listAstrologerChats(myAstro.id),
        listAstrologerPayments(myAstro.id),
        getTodayStats(myAstro.id),
      ]);
      if (!active) return;
      setChats(c);
      setPayments(p);
      setTodayStats(s);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [myAstro?.id]);

  const totalEarnings = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalSessions = payments.length;

  const userNameFor = (email: string) => {
    const name = email.split('@')[0].replace(/[._-]+/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  return (
    <ThemedView style={s.screen}>
      <Image
        source={require('@/assets/images/background.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        pointerEvents="none"
      />
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Avatar uri={myAstro?.avatar ?? ''} name={user?.name ?? 'A'} size={48} color={ACCENT} />
              <View style={s.headerInfo}>
                <ThemedText style={s.greeting}>{greeting}</ThemedText>
                <ThemedText style={s.name}>{user?.name ?? 'Astrologer'}</ThemedText>
                <ThemedText style={s.specialty}>{myAstro?.specialty ?? 'Vedic Astrology'}</ThemedText>
              </View>
            </View>
            <TouchableOpacity style={s.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color="#EEEDE0" />
              <View style={s.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Today's Stats */}
          <ThemedText style={s.section}>Today's Overview</ThemedText>
          <View style={s.statsRow}>
            <View style={[s.statCard, { borderColor: 'rgba(123,216,143,0.4)' }]}>
              <View style={[s.statIconWrap, { backgroundColor: 'rgba(123,216,143,0.15)' }]}>
                <Ionicons name="chatbubbles" size={20} color={GREEN} />
              </View>
              <ThemedText style={s.statValue}>{todayStats.sessionsToday}</ThemedText>
              <ThemedText style={s.statLabel}>Sessions</ThemedText>
            </View>
            <View style={[s.statCard, { borderColor: 'rgba(176,156,102,0.4)' }]}>
              <View style={[s.statIconWrap, { backgroundColor: 'rgba(176,156,102,0.15)' }]}>
                <Ionicons name="wallet" size={20} color={ACCENT} />
              </View>
              <ThemedText style={s.statValue}>₹{todayStats.revenueToday}</ThemedText>
              <ThemedText style={s.statLabel}>Revenue</ThemedText>
            </View>
            <View style={[s.statCard, { borderColor: 'rgba(196,178,130,0.4)' }]}>
              <View style={[s.statIconWrap, { backgroundColor: 'rgba(196,178,130,0.15)' }]}>
                <Ionicons name="time" size={20} color="#C4B282" />
              </View>
              <ThemedText style={s.statValue}>{todayStats.minutesToday}m</ThemedText>
              <ThemedText style={s.statLabel}>Minutes</ThemedText>
            </View>
          </View>

          {/* Total Earnings Banner */}
          <TouchableOpacity
            style={s.earningsBanner}
            activeOpacity={0.7}
            onPress={() => router.push('/astrologer-payments')}>
            <View style={s.earningsLeft}>
              <ThemedText style={s.earningsTitle}>Total Earnings</ThemedText>
              <ThemedText style={s.earningsAmount}>₹{totalEarnings}</ThemedText>
              <ThemedText style={s.earningsSub}>{totalSessions} total sessions</ThemedText>
            </View>
            <View style={s.earningsRight}>
              <View style={s.earningsIconWrap}>
                <Ionicons name="trending-up" size={28} color={GREEN} />
              </View>
              <Ionicons name="chevron-forward" size={20} color="#7E7E78" />
            </View>
          </TouchableOpacity>

          {/* Active Consultations */}
          <View style={s.sectionRow}>
            <ThemedText style={s.section}>Active Consultations</ThemedText>
            {chats.length > 0 && (
              <ThemedText style={s.seeAll}>{chats.length} live</ThemedText>
            )}
          </View>
          {loading ? (
            <ThemedText style={s.empty}>Loading…</ThemedText>
          ) : chats.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="chatbubbles-outline" size={40} color="rgba(176,156,102,0.3)" />
              <ThemedText style={s.emptyTitle}>No Active Sessions</ThemedText>
              <ThemedText style={s.emptySub}>When a user starts a chat, it will appear here</ThemedText>
            </View>
          ) : (
            chats.map((c) => {
              const elapsed = c.started_at
                ? Math.round((Date.now() - new Date(c.started_at).getTime()) / 60000)
                : null;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={s.consultCard}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/chat-room/[id]', params: { id: c.id } })}>
                  <View style={s.consultLeft}>
                    <View style={s.consultAvatar}>
                      <Ionicons name="person" size={20} color="#ffffff" />
                    </View>
                    <View style={s.consultInfo}>
                      <ThemedText style={s.consultName}>{userNameFor(c.user_email)}</ThemedText>
                      <ThemedText style={s.consultEmail} numberOfLines={1}>{c.user_email}</ThemedText>
                    </View>
                  </View>
                  <View style={s.consultRight}>
                    {elapsed !== null && (
                      <View style={s.liveBadge}>
                        <View style={s.liveDot} />
                        <ThemedText style={s.liveText}>{elapsed}m</ThemedText>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={18} color="#7E7E78" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {/* Recent Payments */}
          <ThemedText style={s.section}>Recent Payments</ThemedText>
          {payments.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="cash-outline" size={40} color="rgba(176,156,102,0.3)" />
              <ThemedText style={s.emptyTitle}>No Payments Yet</ThemedText>
              <ThemedText style={s.emptySub}>Payment records will show here</ThemedText>
            </View>
          ) : (
            payments.slice(0, 5).map((p) => (
              <View key={p.id} style={s.payCard}>
                <View style={s.payIconWrap}>
                  <Ionicons name="cash" size={18} color={GREEN} />
                </View>
                <View style={s.payInfo}>
                  <ThemedText style={s.payName}>{userNameFor(p.user_email)}</ThemedText>
                  <ThemedText style={s.payDate}>
                    {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </ThemedText>
                </View>
                <ThemedText style={s.payAmount}>+₹{p.amount}</ThemedText>
              </View>
            ))
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  scroll: { paddingBottom: 120 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerInfo: { gap: 2 },
  greeting: { fontSize: 13, color: '#7E7E78' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#EEEDE0' },
  specialty: { fontSize: 12, color: ACCENT },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
    position: 'absolute',
    top: 10,
    right: 12,
  },

  // Section
  section: { fontSize: 16, fontWeight: 'bold', color: '#EEEDE0', paddingHorizontal: 16, marginBottom: 10 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  seeAll: { fontSize: 13, color: GREEN, fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#EEEDE0' },
  statLabel: { fontSize: 11, color: '#7E7E78', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Earnings Banner
  earningsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  earningsLeft: { gap: 4 },
  earningsTitle: { fontSize: 13, color: '#7E7E78' },
  earningsAmount: { fontSize: 30, fontWeight: 'bold', color: GREEN },
  earningsSub: { fontSize: 12, color: '#7E7E78', marginTop: 2 },
  earningsRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  earningsIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(123,216,143,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Consultation Cards
  consultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  consultLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  consultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultInfo: { flex: 1, gap: 2 },
  consultName: { fontSize: 15, fontWeight: '600', color: '#EEEDE0' },
  consultEmail: { fontSize: 12, color: '#7E7E78' },
  consultRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(123,216,143,0.12)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
  liveText: { fontSize: 11, color: GREEN, fontWeight: '600' },

  // Payment Cards
  payCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.2)',
  },
  payIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(123,216,143,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payInfo: { flex: 1, marginLeft: 10, gap: 2 },
  payName: { fontSize: 14, fontWeight: '600', color: '#EEEDE0' },
  payDate: { fontSize: 11, color: '#7E7E78' },
  payAmount: { fontSize: 16, fontWeight: 'bold', color: GREEN },

  // Empty States
  emptyCard: {
    alignItems: 'center',
    padding: 30,
    marginHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 8,
  },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#7E7E78' },
  emptySub: { fontSize: 12, color: '#5A5A54', textAlign: 'center' },
  empty: { fontSize: 14, color: '#7E7E78', textAlign: 'center', paddingVertical: 20 },
});
