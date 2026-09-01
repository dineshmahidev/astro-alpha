import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/avatar';
import { useAstrologers } from '@/hooks/use-astrologers';
import { AI_SPECIALISTS, getLocalizedName } from '@/constants/ai-specialists';
import { uiStrings } from '@/constants/ui-strings';
import { isAstrologer, useAuth } from '@/contexts/auth-context';
import { listAstrologerChats, type Chat } from '@/lib/chat';

const ACCENT = '#B09C66';
const GOLD = '#97743B';
const ROYAL_GOLD = '#C9BE98';

function GoldGlow() {
  const glow = useRef(new Animated.Value(0)).current;
  const glowStyle = useMemo(() => ({ opacity: glow }), [glow]);
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);
  return <Animated.View pointerEvents="none" style={[styles.aiGlow, glowStyle]} />;
}

export default function ChatScreen() {
  const router = useRouter();
  const { role, user, language } = useAuth();
  const isAstro = isAstrologer(role);
  const { astrologers } = useAstrologers();
  const t = uiStrings(language).t;
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'all' | 'available' | 'topRated'>('all');
  const [myChats, setMyChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  const myAstroId = useMemo(() => {
    return astrologers.find(
      (a) => a.email.toLowerCase() === (user?.email ?? '').toLowerCase(),
    )?.id ?? '';
  }, [astrologers, user?.email]);

  useEffect(() => {
    if (!isAstro || !myAstroId) {
      setLoadingChats(false);
      return;
    }
    let active = true;
    (async () => {
      const chats = await listAstrologerChats(myAstroId);
      if (!active) return;
      setMyChats(chats);
      setLoadingChats(false);
    })();
    return () => { active = false; };
  }, [isAstro, myAstroId]);

  const filteredAstrologers = useMemo(() => {
    let list = astrologers.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase()),
    );
    if (sort === 'topRated')
      list = [...list].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    return list;
  }, [search, sort, astrologers]);

  const userNameFor = (email: string) => {
    const name = email.split('@')[0].replace(/[._-]+/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  if (isAstro) {
    return (
      <ThemedView style={styles.screen}>
        <Image
          source={require('@/assets/images/background.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          pointerEvents="none"
        />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Chats</ThemedText>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            {loadingChats ? (
              <ThemedText style={styles.empty}>Loading…</ThemedText>
            ) : myChats.length === 0 ? (
              <ThemedText style={styles.empty}>No active consultations.</ThemedText>
            ) : (
              myChats.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.chatItem}
                  onPress={() => router.push({ pathname: '/chat-room/[id]', params: { id: c.id } })}>
                  <View style={styles.avatarWrap}>
                    <Avatar uri="" name={userNameFor(c.user_email)} size={46} color="#6C5CE7" />
                  </View>
                  <View style={styles.chatInfo}>
                    <ThemedText style={styles.chatName}>{userNameFor(c.user_email)}</ThemedText>
                    <ThemedText style={styles.chatMsg} numberOfLines={1}>
                      {c.user_email}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#7E7E78" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <Image
        source={require('@/assets/images/background.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        pointerEvents="none"
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Chat</ThemedText>
        </View>
        <View style={styles.circleWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.circleRow}>
            <View style={styles.circleRowInner}>
              {astrologers.map((a) => (
                <Link
                  key={a.id}
                  href={{ pathname: '/chat/[id]', params: { id: a.id } }}
                  asChild>
                  <TouchableOpacity activeOpacity={0.7} style={styles.circle}>
                    <Avatar uri={a.avatar} name={a.name} size={60} color={a.avatarColor} />
                    <ThemedText style={styles.circleLabel}>{a.name}</ThemedText>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          </ScrollView>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          overScrollMode="never">
          <View style={styles.aiSection}>
            <ThemedText style={styles.aiSectionTitle}>AI Specialists</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.aiRow}>
              {AI_SPECIALISTS.map((c) => (
                <Link
                  key={c.id}
                  href={{ pathname: '/ai/[id]', params: { id: c.id } }}
                  asChild>
                  <TouchableOpacity activeOpacity={0.7} style={styles.aiCard}>
                    <GoldGlow />
                    <View style={styles.aiImageWrap}>
                      <Image source={c.avatar} style={styles.aiCover} contentFit="cover" />
                      <View style={styles.aiIconBadge}>
                        <Ionicons name={c.icon as any} size={16} color="#ffffff" />
                      </View>
                    </View>
                    <View style={styles.aiCardInfo}>
                      <ThemedText style={styles.aiCardLabel} numberOfLines={1}>
                        {getLocalizedName(c, language)}
                      </ThemedText>
                      <ThemedText style={styles.aiCardTag} numberOfLines={1}>
                        {c.tagline}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Astrologer Chat</ThemedText>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={16} color="#7E7E78" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('chat.search')}
                placeholderTextColor="#7E7E78"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <View style={styles.sortRow}>
              {([
                { key: 'all' as const, label: 'All' },
                { key: 'topRated' as const, label: t('astrologer.sortRating') },
              ]).map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.7}
                  style={[styles.sortPill, sort === opt.key && styles.sortPillActive]}
                  onPress={() => setSort(opt.key)}>
                  <ThemedText
                    style={[styles.sortPillText, sort === opt.key && styles.sortPillTextActive]}>
                    {opt.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            {filteredAstrologers.map((a) => {
              return (
                <Link
                  key={a.id}
                  href={{ pathname: '/chat/[id]', params: { id: a.id } }}
                  asChild>
                  <TouchableOpacity activeOpacity={0.7} style={styles.chatItem}>
                    <View style={styles.avatarWrap}>
                      <Avatar uri={a.avatar} name={a.name} size={46} color={a.avatarColor} />
                    </View>
                    <View style={styles.chatInfo}>
                      <ThemedText style={styles.chatName}>{a.name}</ThemedText>
                      <ThemedText style={styles.chatMsg} numberOfLines={1}>
                        {a.specialty}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.chatTime}>{a.experience}</ThemedText>
                  </TouchableOpacity>
                </Link>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#EEEDE0' },
  empty: { fontSize: 14, color: '#7E7E78', textAlign: 'center', marginTop: 40 },
  circleWrap: { paddingBottom: 12 },
  circleRow: { paddingHorizontal: 16 },
  circleRowInner: { flexDirection: 'row', gap: 16 },
  circle: { alignItems: 'center', gap: 6 },
  circleAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1D1D1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCircle: { backgroundColor: GOLD, borderWidth: 2, borderColor: ROYAL_GOLD },
  circleLabel: { fontSize: 12, color: '#EEEDE0' },
  content: { paddingBottom: 120 },
  aiSection: { marginTop: 20 },
  aiSectionTitle: { paddingHorizontal: 16, marginBottom: 12, color: '#EEEDE0' },
  aiRow: { paddingHorizontal: 16 },
  aiCard: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B09C66',
    overflow: 'hidden',
    backgroundColor: '#1D1D1C',
    marginRight: 10,
    shadowColor: '#B09C66',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  aiGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  aiImageWrap: { position: 'relative' },
  aiCover: { width: '100%', aspectRatio: 0.78, backgroundColor: GOLD },
  aiIconBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: GOLD,
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ROYAL_GOLD,
  },
  aiCardInfo: { padding: 8 },
  aiCardLabel: { fontSize: 14, fontWeight: 'bold', color: '#EEEDE0' },
  aiCardTag: { fontSize: 12, color: '#C9BE98', marginTop: 3, lineHeight: 16 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0', marginBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1D1C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.3)',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, color: '#EEEDE0', fontSize: 14 },
  sortRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  sortPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1D1D1C',
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.3)',
  },
  sortPillActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  sortPillText: { fontSize: 12, color: '#7E7E78' },
  sortPillTextActive: { color: '#1D1D1C', fontWeight: '600' },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1D1D1C',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  onlineDotOn: { backgroundColor: '#2ECC71' },
  onlineDotOff: { backgroundColor: '#7E7E78' },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(68,64,57,0.4)',
  },
  chatInfo: { flex: 1, marginLeft: 12 },
  chatName: { fontSize: 15, fontWeight: '600', color: '#EEEDE0' },
  chatMsg: { fontSize: 13, color: '#7E7E78', marginTop: 2 },
  chatTime: { fontSize: 12, color: '#7E7E78' },
});
