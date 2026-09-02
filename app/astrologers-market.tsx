import { Ionicons } from '@expo/vector-icons';
import { Image, ImageBackground } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAstrologers } from '@/hooks/use-astrologers';
import { useAuth } from '@/contexts/auth-context';
import { Avatar } from '@/components/avatar';
import { listAstrologerChats, type Chat } from '@/lib/chat';

const ACCENT = '#B09C66';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const TEXT_DIM = '#999999';
const GREEN = '#7BD88F';

const FILTERS = ['All', 'Vedic', 'Tarot', 'Palm Reading'];
const SESSION_FILTERS = ['All', 'Active', 'Completed'];

export default function AstrologerMarketScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { astrologers } = useAstrologers();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'astrologers' | 'sessions'>('astrologers');
  const [showFilter, setShowFilter] = useState(false);
  const [sessionFilter, setSessionFilter] = useState('All');
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    (async () => {
      const c = await listAstrologerChats(user.id);
      if (active) setChats(c);
    })();
    return () => { active = false; };
  }, [user?.id]);

  const filteredAstros = useMemo(() => {
    let list = astrologers;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.specialization?.some((s) => s.toLowerCase().includes(q)));
    }
    if (activeFilter !== 'All') {
      list = list.filter((a) => a.specialization?.some((s) => s.toLowerCase().includes(activeFilter.toLowerCase())));
    }
    return list;
  }, [astrologers, search, activeFilter]);

  const filteredChats = useMemo(() => {
    if (sessionFilter === 'All') return chats;
    if (sessionFilter === 'Active') return chats.filter((c) => c.status === 'active');
    return chats.filter((c) => c.status !== 'active');
  }, [chats, sessionFilter]);

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safeTop} edges={['top']}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Astrologers</Text>
          <TouchableOpacity style={s.filterBtn} onPress={() => setShowFilter(true)}>
            <Ionicons name="options-outline" size={20} color={TEXT_DARK} />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={s.bannerWrap}>
          <ImageBackground
            source={require('../assets/astrologer-eranings.png')}
            style={s.banner}
            imageStyle={s.bannerImage}
            resizeMode="cover"
          >
            <View style={s.bannerOverlay}>
              <Image source={require('../assets/Koshmira_text.png')} style={s.bannerLogo} contentFit="contain" />
              <Text style={s.bannerTitle}>Astrologers</Text>
              <Text style={s.bannerSub}>Connect with verified Vedic astrologers</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          <TouchableOpacity
            style={[s.tab, activeTab === 'astrologers' && s.tabActive]}
            onPress={() => setActiveTab('astrologers')}
          >
            <Text style={[s.tabTxt, activeTab === 'astrologers' && s.tabTxtActive]}>Astrologers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, activeTab === 'sessions' && s.tabActive]}
            onPress={() => setActiveTab('sessions')}
          >
            <Text style={[s.tabTxt, activeTab === 'sessions' && s.tabTxtActive]}>My Sessions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Filter Popup */}
      <Modal visible={showFilter} transparent animationType="fade" onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowFilter(false)}>
          <View style={s.filterPopup}>
            <Text style={s.filterTitle}>Filter</Text>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[s.filterOpt, activeFilter === f && s.filterOptActive]}
                onPress={() => { setActiveFilter(f); setShowFilter(false); }}
              >
                <Text style={[s.filterOptTxt, activeFilter === f && s.filterOptTxtActive]}>{f}</Text>
                {activeFilter === f && <Ionicons name="checkmark" size={16} color={ACCENT} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {activeTab === 'astrologers' ? (
        <FlatList
          data={filteredAstros}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <>
              {/* Search */}
              <View style={s.searchWrap}>
                <Ionicons name="search" size={18} color="#888888" />
                <TextInput
                  style={s.searchInput}
                  placeholder="Search astrologer..."
                  placeholderTextColor="#AAAAAA"
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={18} color="#CCCCCC" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Chips */}
              <FlatList
                horizontal
                data={FILTERS}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterRow}
                renderItem={({ item: f }) => (
                  <TouchableOpacity
                    style={[s.filterChip, activeFilter === f && s.filterActive]}
                    onPress={() => setActiveFilter(f)}
                  >
                    <Text style={[s.filterTxt, activeFilter === f && s.filterTxtActive]}>{f}</Text>
                  </TouchableOpacity>
                )}
              />

              <Text style={s.resultCount}>{filteredAstros.length} astrologers found</Text>
            </>
          )}
          ListEmptyComponent={() => (
            <View style={s.empty}>
              <Ionicons name="search" size={40} color="#CCCCCC" />
              <Text style={s.emptyTxt}>No astrologers found</Text>
            </View>
          )}
          renderItem={({ item: astro }) => (
            <TouchableOpacity
              style={s.astroCard}
              onPress={() => router.push(`/astrologer/${astro.id}` as any)}
            >
              <View style={s.astroTop}>
                <Avatar uri={astro.avatar ?? ''} name={astro.name} size={52} color={ACCENT} />
                <View style={s.astroInfo}>
                  <Text style={s.astroName}>{astro.name}</Text>
                  <Text style={s.astroSpec}>{astro.specialization?.join(', ') ?? 'Vedic Astrology'}</Text>
                  <Text style={s.astroLang}>{astro.languages?.join(', ') ?? 'English, Hindi'}</Text>
                </View>
                <View style={s.astroRating}>
                  <Ionicons name="star" size={14} color={ACCENT} />
                  <Text style={s.ratingTxt}>4.{Math.floor(Math.random() * 9) + 1}</Text>
                </View>
              </View>
              <View style={s.astroBottom}>
                <View style={s.astroStats}>
                  <Text style={s.statNum}>{Math.floor(Math.random() * 500) + 100}</Text>
                  <Text style={s.statLabel}>Sessions</Text>
                </View>
                <View style={s.astroStats}>
                  <Text style={s.statNum}>{Math.floor(Math.random() * 10) + 1}yr</Text>
                  <Text style={s.statLabel}>Exp</Text>
                </View>
                <View style={s.astroStats}>
                  <Text style={s.statNum}>₹{Math.floor(Math.random() * 3 + 1) * 10}/min</Text>
                  <Text style={s.statLabel}>Rate</Text>
                </View>
                <View style={s.statusDot} />
                <Text style={s.statusText}>Online</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={s.sessionFilterRow}>
              {SESSION_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[s.sessionChip, sessionFilter === f && s.sessionChipActive]}
                  onPress={() => setSessionFilter(f)}
                >
                  <Text style={[s.sessionChipTxt, sessionFilter === f && s.sessionChipTxtActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={s.empty}>
              <Ionicons name="chatbubbles-outline" size={40} color="#CCCCCC" />
              <Text style={s.emptyTxt}>No sessions found</Text>
            </View>
          )}
          renderItem={({ item: chat }) => {
            const isActive = chat.status === 'active';
            return (
              <TouchableOpacity style={s.sessionCard} onPress={() => router.push(`/chat-room/${chat.id}`)}>
                <Avatar uri="" name={chat.user_email.split('@')[0]} size={44} color={ACCENT} />
                <View style={s.sessionInfo}>
                  <Text style={s.sessionName}>{chat.user_email.split('@')[0]}</Text>
                  <Text style={s.sessionMsg} numberOfLines={1}>{chat.last_message ?? 'Tap to open'}</Text>
                </View>
                {isActive ? (
                  <View style={s.liveTag}>
                    <View style={s.liveDot} />
                    <Text style={s.liveTxt}>LIVE</Text>
                  </View>
                ) : (
                  <Text style={s.sessionDate}>{new Date(chat.created_at ?? Date.now()).toLocaleDateString()}</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safeTop: { backgroundColor: '#FFFFFF' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },
  filterBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center' },

  bannerWrap: { marginHorizontal: 16, marginBottom: 12 },
  banner: { borderRadius: 14, overflow: 'hidden', minHeight: 140 },
  bannerImage: { borderRadius: 14 },
  bannerOverlay: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 16 },
  bannerLogo: { width: 100, height: 24, marginBottom: 6 },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  bannerSub: { fontSize: 12, color: ACCENT, marginTop: 4 },

  // Tabs
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8' },
  tab: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: ACCENT },
  tabTxt: { fontSize: 14, fontWeight: '500', color: TEXT_DIM },
  tabTxtActive: { color: ACCENT, fontWeight: '700' },

  // Filter Popup
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 100, paddingRight: 16 },
  filterPopup: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 8, width: 180, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
  filterTitle: { fontSize: 12, fontWeight: '600', color: TEXT_DIM, paddingHorizontal: 12, paddingVertical: 8 },
  filterOpt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  filterOptActive: { backgroundColor: ACCENT + '10' },
  filterOptTxt: { fontSize: 14, color: TEXT_DARK },
  filterOptTxtActive: { color: ACCENT, fontWeight: '600' },

  // List
  listContent: { padding: 16, paddingBottom: 30 },

  // Search
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: CARD_BG, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: BORDER, marginBottom: 4 },
  searchInput: { flex: 1, fontSize: 14, color: TEXT_DARK },

  filterRow: { gap: 8, paddingVertical: 10 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER },
  filterActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  filterTxt: { fontSize: 12, fontWeight: '500', color: TEXT_MID },
  filterTxtActive: { color: '#FFFFFF' },

  resultCount: { fontSize: 12, color: TEXT_MID, marginBottom: 10 },

  // Astrologer Card
  astroCard: { marginBottom: 12, backgroundColor: CARD_BG, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: BORDER },
  astroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  astroInfo: { flex: 1, gap: 2 },
  astroName: { fontSize: 15, fontWeight: 'bold', color: TEXT_DARK },
  astroSpec: { fontSize: 12, color: ACCENT },
  astroLang: { fontSize: 11, color: TEXT_MID },
  astroRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingTxt: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  astroBottom: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12, borderTopWidth: 1, borderTopColor: '#E8E8E8', paddingTop: 10 },
  astroStats: { alignItems: 'center' },
  statNum: { fontSize: 13, fontWeight: '700', color: TEXT_DARK },
  statLabel: { fontSize: 10, color: TEXT_MID },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN },
  statusText: { fontSize: 11, color: GREEN, fontWeight: '500' },

  // Session Filter
  sessionFilterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  sessionChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER },
  sessionChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  sessionChipTxt: { fontSize: 12, fontWeight: '500', color: TEXT_MID },
  sessionChipTxtActive: { color: '#fff', fontWeight: '600' },

  // Session Card
  sessionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD_BG, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 8 },
  sessionInfo: { flex: 1 },
  sessionName: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  sessionMsg: { fontSize: 12, color: TEXT_MID, marginTop: 2 },
  sessionDate: { fontSize: 11, color: TEXT_DIM },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GREEN + '15', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
  liveTxt: { fontSize: 10, fontWeight: '700', color: GREEN },

  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTxt: { fontSize: 14, color: TEXT_MID },
});
