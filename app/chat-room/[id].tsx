import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChatChartPanel } from '@/components/chat-chart-panel';

import { isAstrologer, useAuth } from '@/contexts/auth-context';
import {
  getUserByEmail,
  listMessages,
  sendMessage,
  subscribeChat,
  startSession,
  closeSession,
  type Message,
} from '@/lib/chat';
import { supabase } from '@/lib/supabase';
import { computeAstroReport } from '@/lib/pipeline';

const ACCENT = '#B09C66';

function chartFromRow(row: { dob?: string | null; tob?: string | null; tob_known?: boolean | null; place?: string | null } | null) {
  if (!row?.dob) return null;
  const [d, m, y] = row.dob.split('/').map(Number);
  let birthDate = new Date(y, m - 1, d);
  if (row.tob_known && row.tob) {
    const [hh, mm] = row.tob.split(':').map(Number);
    birthDate = new Date(y, m - 1, d, hh, mm);
  }
  return computeAstroReport({ birthDate, place: row.place ?? undefined });
}

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role, language } = useAuth();
  const isAstro = isAstrologer(role);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const chatId = id ?? '';
  const [chartData, setChartData] = useState<ReturnType<typeof chartFromRow>>(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    if (!isAstro || !chatId) return;
    (async () => {
      try {
        const { data: chat } = await supabase
          .from('chats')
          .select('user_email')
          .eq('id', chatId)
          .maybeSingle();
        const row = await getUserByEmail(chat?.user_email ?? '');
        const r = chartFromRow(row);
        if (r) setChartData(r);
      } catch (e) {
        console.warn('[ChatRoom] failed to load user chart', e);
      }
    })();
  }, [isAstro, chatId]);

  useEffect(() => {
    return () => {
      if (chatId) closeSession(chatId);
    };
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    let active = true;
    (async () => {
      const msgs = await listMessages(chatId);
      if (!active) return;
      setMessages(msgs);
      setLoaded(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 150);
    })();
    const sub = subscribeChat(chatId, (m) => {
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => {
      active = false;
      sub.unsubscribe();
    };
  }, [chatId]);

  const handleSend = async () => {
    const t = text.trim();
    if (!t || sending || !chatId) return;
    setSending(true);
    setText('');
    if (!sessionStarted) {
      await startSession(chatId);
      setSessionStarted(true);
    }
    const sender = isAstro ? 'astrologer' : 'user';
    const sent = await sendMessage(chatId, sender, t);
    if (sent) {
      setMessages((prev) => (prev.some((x) => x.id === sent.id) ? prev : [...prev, sent]));
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
    setSending(false);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <ThemedText style={styles.headerName}>
                {isAstro ? 'Consultation' : 'Astrologer Chat'}
              </ThemedText>
              <ThemedText style={styles.headerSub}>
                {isAstro ? 'Live consultation' : 'Vedic guidance'}
              </ThemedText>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {isAstro && chartData && (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Ionicons name="planet" size={16} color={ACCENT} />
                  <ThemedText style={styles.chartTitle}>User Birth Chart</ThemedText>
                </View>
                <ChatChartPanel report={chartData} language={language} />
              </View>
            )}
            {!isAstro && (
              <View style={styles.infoBanner}>
                <Ionicons name="shield-checkmark" size={16} color={ACCENT} />
                <ThemedText style={styles.infoText}>
                  Your birth details have been shared with the astrologer for an accurate reading.
                </ThemedText>
              </View>
            )}

            {!loaded ? (
              <ThemedText style={styles.loading}>Loading…</ThemedText>
            ) : messages.length === 0 ? (
              <ThemedText style={styles.loading}>
                {isAstro ? 'No messages yet. Say hello to start.' : 'Send a message to begin.'}
              </ThemedText>
            ) : (
              messages.map((m) => {
                const mine = m.sender === (isAstro ? 'astrologer' : 'user');
                return (
                  <View key={m.id} style={[styles.msgWrap, mine ? styles.msgWrapMine : styles.msgWrapTheirs]}>
                    <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                      <ThemedText style={mine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>
                        {m.text}
                      </ThemedText>
                      <ThemedText style={styles.msgTime}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </ThemedText>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder={isAstro ? 'Reply to the user…' : 'Type a message…'}
              placeholderTextColor="#7E7E78"
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sending}>
              <Ionicons name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
  },
  backBtn: { padding: 8 },
  headerInfo: { flex: 1, marginLeft: 4 },
  headerName: { fontSize: 17, fontWeight: 'bold', color: '#EEEDE0' },
  headerSub: { fontSize: 12, color: '#7E7E78', marginTop: 1 },
  scrollContent: { padding: 16, paddingBottom: 24, gap: 10 },
  chartCard: {
    backgroundColor: '#1D1D1C',
    borderRadius: 16,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,240,200,0.35)',
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  chartTitle: { fontSize: 15, fontWeight: 'bold', color: '#EEEDE0' },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(176,156,102,0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  infoText: { flex: 1, fontSize: 13, color: '#C9BE98', lineHeight: 19 },
  loading: { color: '#7E7E78', textAlign: 'center', marginTop: 20 },
  msgWrap: { flexDirection: 'row', marginBottom: 2 },
  msgWrapMine: { justifyContent: 'flex-end' },
  msgWrapTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: '#97743B',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#292723',
    borderBottomLeftRadius: 4,
  },
  bubbleTextMine: { color: '#ffffff', fontSize: 15, lineHeight: 21 },
  bubbleTextTheirs: { color: '#EEEDE0', fontSize: 15, lineHeight: 21 },
  msgTime: { fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 4, alignSelf: 'flex-end' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#444039',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1D1D1C',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#EEEDE0',
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});