import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import AstrologerDrawer from '@/components/astrologer-drawer';
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
const GREEN = '#7BD88F';
const CARD_BG = 'rgba(245,245,245,1)';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const TEXT_LIGHT = '#888888';

const QUICK_ACTIONS = [
  { icon: 'chatbubbles' as const, label: 'Sessions', color: '#E57373', route: '/astrologer-sessions' },
  { icon: 'document-text' as const, label: 'Kundli', color: '#4FC3F7', route: '/astrologer-kundli' },
  { icon: 'heart' as const, label: 'Match', color: '#BA68C8', route: '/astrologer-match' },
  { icon: 'wallet' as const, label: 'Earnings', color: GREEN, route: '/astrologer-payments' },
];

export default function AstrologerHome() {
  const { role } = useAuth();
  if (!isAstrologer(role)) return null;
  return <AstroDashboard />;
}

function AstroDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { astrologers } = useAstrologers();
  const [chats, setChats] = useState<Chat[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStats>({ sessionsToday: 0, revenueToday: 0, minutesToday: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    })();
    return () => { active = false; };
  }, [myAstro?.id]);

  const totalEarnings = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const activeChats = chats.filter((c) => c.status === 'active');

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <AstrologerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {drawerOpen && <View style={s.blurOverlay} />}

      <SafeAreaView style={s.safeTop} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <TouchableOpacity style={s.hamburger} onPress={() => setDrawerOpen(true)}>
                <View style={s.hamLine1} />
                <View style={s.hamLine2} />
                <View style={s.hamLine3} />
              </TouchableOpacity>
              <View>
                <Text style={s.greeting}>Hi, {user?.name?.split(' ')[0] ?? 'Astrologer'} 👋</Text>
              </View>
            </View>
            <View style={s.headerRight}>
              <TouchableOpacity style={s.notifBtn} onPress={() => router.push('/astrologer-notifications')}>
                <Ionicons name="notifications" size={20} color={ACCENT} />
                <View style={s.notifDot} />
              </TouchableOpacity>
              <Avatar uri="" name={user?.name ?? 'A'} size={36} color={ACCENT} />
            </View>
          </View>

          {/* Earnings Banner */}
          <TouchableOpacity style={s.bannerWrap} activeOpacity={0.85} onPress={() => router.push('/astrologer-payments')}>
            <ImageBackground
              source={require('../../assets/astrologer-eranings.png')}
              style={s.banner}
              imageStyle={s.bannerImage}
              resizeMode="cover"
            >
              <View style={s.bannerLeft}>
                <Text style={s.bannerTitle}>Total Earnings</Text>
                <Text style={s.bannerAmt}>₹{totalEarnings}</Text>
                <Text style={s.bannerSub}>Keep up the great work!</Text>
                <View style={s.bannerBtn}>
                  <Text style={s.bannerBtnText}>View Details</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Stats Row */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <View style={[s.statIcon, { backgroundColor: GREEN + '20' }]}>
                <Ionicons name="chatbubbles" size={20} color={GREEN} />
              </View>
              <View style={s.statInfo}>
                <Text style={s.statLabel}>Sessions</Text>
                <Text style={s.statVal}>{todayStats.sessionsToday}</Text>
              </View>
            </View>
            <View style={s.statCard}>
              <View style={[s.statIcon, { backgroundColor: ACCENT + '20' }]}>
                <Ionicons name="wallet" size={20} color={ACCENT} />
              </View>
              <View style={s.statInfo}>
                <Text style={s.statLabel}>Revenue</Text>
                <Text style={s.statVal}>₹{todayStats.revenueToday}</Text>
              </View>
            </View>
          </View>

          {/* Tools */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Tools</Text>
          </View>
          <View style={s.actionsRow}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity key={action.label} style={s.actionCard} onPress={() => router.push(action.route as any)}>
                <View style={[s.actionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={s.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Upcoming Sessions */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Upcoming Sessions</Text>
            <TouchableOpacity onPress={() => router.push('/astrologer-sessions')}>
              <Text style={s.viewAll}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>
          {activeChats.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="chatbubbles" size={28} color={ACCENT} />
              <Text style={s.emptyTxt}>No upcoming sessions</Text>
            </View>
          ) : (
            activeChats.slice(0, 3).map((item) => (
              <TouchableOpacity key={item.id} style={s.sessionCard} onPress={() => router.push(`/chat-room/${item.id}`)}>
                <View style={s.sessionLeft}>
                  <Avatar uri="" name={item.user_email.split('@')[0]} size={44} color={ACCENT} />
                  <View style={s.sessionInfo}>
                    <Text style={s.sessionName}>{item.user_email.split('@')[0]}</Text>
                    <Text style={s.sessionMsg} numberOfLines={1}>{item.last_message ?? 'Tap to open'}</Text>
                  </View>
                </View>
                <View style={s.liveTag}>
                  <View style={s.liveDot} />
                  <Text style={s.liveTxt}>LIVE</Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safeTop: { flex: 1 },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 5,
  },
  scroll: { paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hamburger: {
    width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 8, gap: 5,
  },
  hamLine1: { width: 24, height: 2, backgroundColor: TEXT_DARK, borderRadius: 1 },
  hamLine2: { width: 18, height: 2, backgroundColor: TEXT_DARK, borderRadius: 1 },
  hamLine3: { width: 12, height: 2, backgroundColor: TEXT_DARK, borderRadius: 1 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: TEXT_DARK },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: '#E57373' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 8 },
  statCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: CARD_BG, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BORDER, gap: 12 },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statInfo: { flex: 1 },
  statLabel: { fontSize: 12, color: TEXT_MID, fontWeight: '500' },
  statVal: { fontSize: 20, fontWeight: 'bold', color: TEXT_DARK, marginTop: 2 },

  // Earnings Banner (tarot-style)
  bannerWrap: { marginTop: 16, marginHorizontal: 16 },
  banner: {
    flexDirection: 'row',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 20,
    overflow: 'hidden',
    minHeight: 130,
  },
  bannerImage: { borderRadius: 14 },
  bannerLeft: { flex: 1, gap: 2 },
  bannerTitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  bannerAmt: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginVertical: 4 },
  bannerSub: { fontSize: 12, color: ACCENT, marginBottom: 8 },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: ACCENT,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  bannerBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },

  // Quick Actions
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  viewAll: { fontSize: 12, fontWeight: '600', color: ACCENT },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  actionCard: { flex: 1, alignItems: 'center', padding: 14 },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: TEXT_DARK },

  // Session Card
  sessionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, backgroundColor: CARD_BG, borderRadius: 12, padding: 14, marginBottom: 8,
  },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  sessionInfo: { flex: 1 },
  sessionName: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  sessionMsg: { fontSize: 12, color: TEXT_MID, marginTop: 2 },
  sessionTime: { fontSize: 11, color: TEXT_LIGHT },

  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GREEN + '15', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
  liveTxt: { fontSize: 10, fontWeight: '700', color: GREEN },

  emptyCard: { marginHorizontal: 16, backgroundColor: CARD_BG, borderRadius: 12, padding: 28, alignItems: 'center', gap: 8, marginTop: 4 },
  emptyTxt: { fontSize: 13, color: TEXT_MID },
});
