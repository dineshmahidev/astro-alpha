import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { useAstrologers } from '@/hooks/use-astrologers';
import { useAuth } from '@/contexts/auth-context';
import { listAstrologerChats, type Chat } from '@/lib/chat';

const ACCENT = '#B09C66';
const GREEN = '#7BD88F';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';

type Tab = 'upcoming' | 'completed';

export default function AstrologerSessionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { astrologers } = useAstrologers();
  const [chats, setChats] = useState<Chat[]>([]);
  const [tab, setTab] = useState<Tab>('upcoming');

  const myAstro = useMemo(() =>
    astrologers.find((a) => a.email.toLowerCase() === (user?.email ?? '').toLowerCase()),
    [astrologers, user?.email],
  );

  useEffect(() => {
    if (!myAstro?.id) return;
    let active = true;
    (async () => {
      const c = await listAstrologerChats(myAstro.id);
      if (active) setChats(c);
    })();
    return () => { active = false; };
  }, [myAstro?.id]);

  const activeChats = chats.filter((c) => c.status === 'active');
  const completedChats = chats.filter((c) => c.status !== 'active');
  const data = tab === 'upcoming' ? activeChats : completedChats;

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safeTop} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>My Sessions</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.tabRow}>
          <TouchableOpacity style={[s.tab, tab === 'upcoming' && s.tabActive]} onPress={() => setTab('upcoming')}>
            <Text style={[s.tabTxt, tab === 'upcoming' && s.tabTxtActive]}>Upcoming ({activeChats.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab, tab === 'completed' && s.tabActive]} onPress={() => setTab('completed')}>
            <Text style={[s.tabTxt, tab === 'completed' && s.tabTxtActive]}>Completed ({completedChats.length})</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={s.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={28} color={ACCENT} />
            <Text style={s.emptyTxt}>No {tab} sessions</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isActive = item.status === 'active';
          return (
            <TouchableOpacity style={s.sessionCard} onPress={() => router.push(`/chat-room/${item.id}`)}>
              <View style={s.sessionLeft}>
                <Avatar uri="" name={item.user_email.split('@')[0]} size={44} color={ACCENT} />
                <View style={s.sessionInfo}>
                  <Text style={s.sessionName}>{item.user_email.split('@')[0]}</Text>
                  <Text style={s.sessionMsg} numberOfLines={1}>{item.last_message ?? 'Tap to open'}</Text>
                </View>
              </View>
              {isActive ? (
                <View style={s.liveTag}>
                  <View style={s.liveDot} />
                  <Text style={s.liveTxt}>LIVE</Text>
                </View>
              ) : (
                <Text style={s.sessionTime}>{new Date(item.created_at ?? Date.now()).toLocaleDateString()}</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safeTop: { backgroundColor: '#FFFFFF' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },

  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8' },
  tab: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: ACCENT },
  tabTxt: { fontSize: 14, fontWeight: '500', color: '#999' },
  tabTxtActive: { color: ACCENT, fontWeight: '700' },

  listContent: { padding: 16, paddingBottom: 30 },

  sessionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: CARD_BG, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 10,
  },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  sessionInfo: { flex: 1 },
  sessionName: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  sessionMsg: { fontSize: 12, color: TEXT_MID, marginTop: 2 },
  sessionTime: { fontSize: 11, color: '#999' },

  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GREEN + '15', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
  liveTxt: { fontSize: 10, fontWeight: '700', color: GREEN },

  emptyCard: { backgroundColor: CARD_BG, borderRadius: 12, padding: 32, borderWidth: 1, borderColor: BORDER, alignItems: 'center', gap: 8, marginTop: 30 },
  emptyTxt: { fontSize: 13, color: TEXT_MID },
});
